# Kilas — Agent Prompts

> **Stack:** `kilas/backend` (Go + Gin + GORM + MySQL, module `github.com/joenathan-15`) · `kilas/frontend` (React 19 + TypeScript + Vite + Tailwind)
>
> **Team:** 2 people. One leans backend, one leans frontend. You don't need to be in sync — just check the **⚡ Needs** line on each task so you know what the other side has to ship before you can wire things up live. Frontend can build with mock data in the meantime.

---

## How to use this file

1. Pick a task from your track.
2. Copy the prompt block and paste it into your agent/AI.
3. Check the box when done.
4. `⚡ Needs` = what must exist on the other side before you can fully connect it (you can still build + mock it before then).

---

## 🤝 Do This Together First

### S1 — Agree on the API contract

- [ ] Done

```
Both people sit down and confirm the following API shapes before starting. These are the shared interfaces that backend will implement and frontend will consume.

Base URL: http://localhost:8080/api
Auth header: Authorization: Bearer <access_token>

ENDPOINTS LIST:

POST   /auth/register          body: { email, username, password }           -> { user, access_token, refresh_token }
POST   /auth/login             body: { email, password }                     -> { user, access_token, refresh_token }
POST   /auth/refresh           body: { refresh_token }                       -> { access_token }
GET    /auth/me                (auth)                                        -> { id, email, username, avatar_url }

GET    /decks                  (auth)  -> { data: Deck[] }
POST   /decks                  (auth)  body: { title, description, is_public, tags: string[] } -> Deck
GET    /decks/:id              (auth or public) -> Deck & { cards: Card[] }
PUT    /decks/:id              (auth, owner only) -> Deck
DELETE /decks/:id              (auth, owner only) -> 204

POST   /decks/:deck_id/cards   (auth, owner) body: { front, back, front_image_url?, back_image_url? } -> Card
GET    /decks/:deck_id/cards   (auth or public deck) -> { data: Card[] }
GET    /decks/:deck_id/study/due (auth) -> { data: Card[], total_due: number }
PUT    /cards/:id              (auth, owner) -> Card
DELETE /cards/:id              (auth, owner) -> 204

POST   /study/sessions                        body: { deck_id } -> { session_id }
POST   /study/sessions/:id/review             body: { card_id, quality: 0|1|2|3 } -> { card: Card, next_due: string }
POST   /study/sessions/:id/end               body: { duration: number (seconds) } -> 200

GET    /stats/overview         (auth) -> { total_decks, total_cards, cards_due_today, cards_mastered, total_sessions, total_study_time }
GET    /stats/activity         (auth) -> { data: [{ date: "YYYY-MM-DD", count: number }] }  // 30 days, zero-filled
GET    /stats/deck/:deck_id    (auth) -> { deck_id, total_cards, due_today, mastered, new_cards, learning }

GET    /library                (public) ?search=&tags=&page=&limit=12 -> { data: LibraryDeck[], total, page, limit }
POST   /library/:deck_id/clone (auth) -> { deck: Deck }

SHARED TYPES:
User:        { id, email, username, avatar_url, provider }
Deck:        { id, user_id, title, description, is_public, tags: string[], card_count, created_at, updated_at }
Card:        { id, deck_id, front, back, front_image_url, back_image_url, interval, repetitions, ease_factor, due_date, created_at }
LibraryDeck: { id, title, description, tags: string[], card_count, author: { id, username } }

quality ratings: 0=Again, 1=Hard, 2=Good, 3=Easy
```

---

### S2 — Project infrastructure

- [ ] Done

```
Working in the root kilas/ directory. Set up shared infrastructure.

1. Copy .env.example to .env and fill in real values. Add .env to backend/.gitignore if not already there.

2. Create kilas/Makefile:

.PHONY: db backend frontend

backend:
	cd backend && go run .

frontend:
	cd frontend && npm run dev
```

---

## 🔧 Backend Track

Work top to bottom. Each task builds on the previous ones.

---

### B1 — Folder structure + all models

- [ ] Done

```
Working in kilas/backend. Stack: Go + Gin + GORM + MySQL, module github.com/joenathan-15. Currently has: main.go, database/connection.go, model/user.go, router/api.go.

Create the following folder structure with placeholder files that compile cleanly:

FOLDERS TO CREATE:
- handler/     (auth.go, deck.go, card.go, study.go, stats.go, library.go)
- service/     (auth.go, deck.go, card.go, study.go, stats.go, library.go)
- repository/  (user.go, deck.go, card.go, study.go)
- middleware/  (auth.go, cors.go)
- dto/         (auth.go, deck.go, card.go, study.go)

Each handler file: exported struct + empty method stubs returning c.JSON(200, gin.H{"message": "todo"}).
Each service file: exported struct + empty method stubs.
Each repository file: exported struct with *gorm.DB field + empty method stubs.
middleware/auth.go: stub AuthMiddleware() that just calls c.Next().
middleware/cors.go: stub CORSMiddleware() that just calls c.Next().

MODELS — replace/create in model/:

model/user.go:
type User struct {
    ID        uint      `gorm:"primaryKey"`
    Email     string    `gorm:"uniqueIndex;not null"`
    Username  string    `gorm:"not null"`
    Password  string
    Provider  string    `gorm:"default:'local'"`
    AvatarURL string
    CreatedAt time.Time
    UpdatedAt time.Time
}

model/deck.go:
type Deck struct {
    ID          uint      `gorm:"primaryKey"`
    UserID      uint      `gorm:"not null;index"`
    Title       string    `gorm:"not null"`
    Description string
    IsPublic    bool      `gorm:"default:false"`
    Tags        string    // comma-separated e.g. "math,science"
    CreatedAt   time.Time
    UpdatedAt   time.Time
    User        User   `gorm:"foreignKey:UserID"`
    Cards       []Card `gorm:"foreignKey:DeckID"`
}

model/card.go:
type Card struct {
    ID            uint      `gorm:"primaryKey"`
    DeckID        uint      `gorm:"not null;index"`
    Front         string    `gorm:"type:text;not null"`
    Back          string    `gorm:"type:text;not null"`
    FrontImageURL string
    BackImageURL  string
    Interval      int       `gorm:"default:0"`
    Repetitions   int       `gorm:"default:0"`
    EaseFactor    float64   `gorm:"default:2.5"`
    DueDate       time.Time
    CreatedAt     time.Time
    UpdatedAt     time.Time
    Deck          Deck `gorm:"foreignKey:DeckID"`
}

model/study_session.go:
type StudySession struct {
    ID           uint       `gorm:"primaryKey"`
    UserID       uint       `gorm:"not null;index"`
    DeckID       uint       `gorm:"not null;index"`
    CardsStudied int        `gorm:"default:0"`
    Duration     int
    StartedAt    time.Time
    EndedAt      *time.Time
    Reviews      []CardReview `gorm:"foreignKey:SessionID"`
}

type CardReview struct {
    ID        uint      `gorm:"primaryKey"`
    SessionID uint      `gorm:"not null;index"`
    CardID    uint      `gorm:"not null;index"`
    Quality   int
    CreatedAt time.Time
}

Update database/connection.go autoMigrate() to include all models: User, Deck, Card, StudySession, CardReview.
Update main.go to still compile after the new structure exists.
Verify: go build ./...
```

---

### B2 — CORS middleware + JWT middleware

- [ ] Done
- ⚡ Needs: B1 done

```
Working in kilas/backend. Module github.com/joenathan-15. B1 structure exists.

Run: go get github.com/golang-jwt/jwt/v5

--- middleware/cors.go ---
Implement CORSMiddleware() gin.HandlerFunc:
1. Read os.Getenv("CORS_ORIGIN"), split by comma, default "http://localhost:5173" if empty.
2. On every request:
   - Match request Origin header against the allowed list. If match, echo it back as Access-Control-Allow-Origin. If no match, use the first allowed origin.
   - Set: Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
   - Set: Access-Control-Allow-Headers: Content-Type, Authorization
   - Set: Access-Control-Allow-Credentials: true
3. If method is OPTIONS: c.AbortWithStatus(204) and return.
4. Otherwise: c.Next().

--- middleware/auth.go ---
Implement AuthMiddleware() gin.HandlerFunc:
1. Read Authorization header, expect "Bearer <token>". Missing or wrong format -> 401 { "error": "unauthorized" }, c.Abort().
2. Parse JWT with os.Getenv("ACCESS_TOKEN_SECRET") using golang-jwt/jwt/v5, algorithm HS256.
3. Validate: not expired, claim "type" == "access". Invalid -> 401, c.Abort().
4. Valid: c.Set("userID", uint(claims["sub"].(float64))), then c.Next().

Also add helper in middleware/auth.go:
func GetUserID(c *gin.Context) (uint, bool) {
    val, exists := c.Get("userID")
    if !exists { return 0, false }
    id, ok := val.(uint)
    return id, ok
}

--- main.go ---
Apply r.Use(middleware.CORSMiddleware()) as the FIRST middleware before any routes.

Verify: go build ./...
```

---

### B3 — Auth endpoints

- [ ] Done
- ⚡ Needs: B1, B2 done

```
Working in kilas/backend. Module github.com/joenathan-15. B1+B2 done.

Run: go get golang.org/x/crypto

--- repository/user.go ---
Methods:
- FindByEmail(email string) (*model.User, error)
- FindByID(id uint) (*model.User, error)
- Create(user *model.User) error

--- dto/auth.go ---
type RegisterRequest struct {
    Email    string `json:"email"    binding:"required,email"`
    Username string `json:"username" binding:"required,min=3,max=20"`
    Password string `json:"password" binding:"required,min=8"`
}
type LoginRequest struct {
    Email    string `json:"email"    binding:"required,email"`
    Password string `json:"password" binding:"required"`
}
type RefreshRequest struct {
    RefreshToken string `json:"refresh_token" binding:"required"`
}
type UserResponse struct {
    ID        uint   `json:"id"`
    Email     string `json:"email"`
    Username  string `json:"username"`
    AvatarURL string `json:"avatar_url"`
}
type AuthResponse struct {
    User         UserResponse `json:"user"`
    AccessToken  string       `json:"access_token"`
    RefreshToken string       `json:"refresh_token"`
}

--- service/auth.go ---
Private helper generateTokens(userID uint) (accessToken, refreshToken string, err error):
  Access token:  HS256, secret=ACCESS_TOKEN_SECRET, exp=15min, claims: sub=userID, type="access"
  Refresh token: HS256, secret=REFRESH_TOKEN_SECRET, exp=7days,  claims: sub=userID, type="refresh"

Methods:
- Register(email, username, password string) (*model.User, string, string, error)
  Validate fields. Hash password bcrypt cost 12. Create user. Generate tokens. Return user + tokens.
  Return 409 error if email already taken.
- Login(email, password string) (*model.User, string, string, error)
  Find user by email. Compare bcrypt hash. Generate tokens.
- RefreshToken(refreshToken string) (string, error)
  Parse and validate refresh token (type must be "refresh"). Return new access token.
- GetByID(id uint) (*model.User, error)

--- handler/auth.go ---
- Register -> POST /api/auth/register  -> 201 AuthResponse, or 400/409
- Login    -> POST /api/auth/login     -> 200 AuthResponse, or 401
- Refresh  -> POST /api/auth/refresh   -> 200 { "access_token": "..." }, or 401
- Logout   -> POST /api/auth/logout    -> 200 { "message": "logged out" } (stateless, client drops tokens)
- Me       -> GET  /api/auth/me        -> 200 UserResponse (reads userID from context set by auth middleware)

--- router/api.go ---
auth := api.Group("/auth")
auth.POST("/register", authHandler.Register)
auth.POST("/login",    authHandler.Login)
auth.POST("/refresh",  authHandler.Refresh)
auth.POST("/logout",   authHandler.Logout)
auth.GET("/me",        middleware.AuthMiddleware(), authHandler.Me)

Wire handler -> service -> repository in main.go.
Verify: go build ./... then test with curl:
  curl -X POST localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","username":"testuser","password":"password123"}'
```

---

### B4 — Deck + Card CRUD

- [ ] Done
- ⚡ Needs: B1, B2, B3 done

```
Working in kilas/backend. Module github.com/joenathan-15. Auth middleware and User model exist.

--- dto/deck.go ---
type DeckRequest struct {
    Title       string   `json:"title"       binding:"required,min=1,max=255"`
    Description string   `json:"description"`
    IsPublic    bool     `json:"is_public"`
    Tags        []string `json:"tags"`
}

--- repository/deck.go ---
- FindByUserID(userID uint) ([]model.Deck, error)
  Include card count per deck:
  SELECT decks.*, COUNT(cards.id) as card_count
  FROM decks LEFT JOIN cards ON cards.deck_id = decks.id
  WHERE decks.user_id = ?
  GROUP BY decks.id ORDER BY decks.created_at DESC
- FindByID(id uint) (*model.Deck, error)  // Preload("Cards")
- Create(deck *model.Deck) error
- Update(deck *model.Deck) error
- Delete(id, userID uint) error  // also DELETE FROM cards WHERE deck_id = id

--- service/deck.go ---
Tag helpers:
  tagsToString(tags []string) string  -> strings.Join(tags, ",")
  stringToTags(s string) []string     -> filter(strings.Split(s, ","), nonEmpty)
Ownership check: load deck, if deck.UserID != currentUserID return error "forbidden".

--- dto/card.go ---
type CardRequest struct {
    Front         string `json:"front"          binding:"required"`
    Back          string `json:"back"           binding:"required"`
    FrontImageURL string `json:"front_image_url"`
    BackImageURL  string `json:"back_image_url"`
}

--- repository/card.go ---
- FindByDeckID(deckID uint) ([]model.Card, error)
- FindByID(id uint) (*model.Card, error)
- Create(card *model.Card) error
- Update(card *model.Card) error
- Delete(id uint) error
- FindDueCards(deckID uint, limit int) ([]model.Card, error)
  WHERE deck_id=? AND due_date <= NOW() ORDER BY due_date ASC LIMIT ?

--- service/card.go ---
Verify ownership by loading the parent deck and checking deck.UserID == currentUserID.
On Create: DueDate=time.Now(), Interval=0, Repetitions=0, EaseFactor=2.5.
On Update: only update Front, Back, FrontImageURL, BackImageURL — never touch SM-2 fields here.

--- handlers ---
handler/deck.go:
  List(c)    GET    /decks         -> { "data": []deck }
  Create(c)  POST   /decks         -> 201 deck
  Get(c)     GET    /decks/:id     -> deck + cards. Allow if owner OR is_public. 403 if private + not owner.
  Update(c)  PUT    /decks/:id     -> deck. 403 if not owner.
  Delete(c)  DELETE /decks/:id     -> 204. 403 if not owner.

handler/card.go:
  Create(c)  POST   /decks/:deck_id/cards  -> 201 card
  List(c)    GET    /decks/:deck_id/cards  -> { "data": []card } (allow if owner or public)
  Update(c)  PUT    /cards/:id            -> card. 403 if not owner of parent deck.
  Delete(c)  DELETE /cards/:id            -> 204.

--- router/api.go ---
decks := api.Group("/decks", middleware.AuthMiddleware())
decks.GET("",     deckHandler.List)
decks.POST("",    deckHandler.Create)
decks.GET("/:id", deckHandler.Get)
decks.PUT("/:id", deckHandler.Update)
decks.DELETE("/:id", deckHandler.Delete)
decks.POST("/:deck_id/cards", cardHandler.Create)
decks.GET("/:deck_id/cards",  cardHandler.List)

cards := api.Group("/cards", middleware.AuthMiddleware())
cards.PUT("/:id",    cardHandler.Update)
cards.DELETE("/:id", cardHandler.Delete)

Verify: go build ./...
```

---

### B5 — Spaced repetition + study sessions

- [ ] Done
- ⚡ Needs: B4 done

```
Working in kilas/backend. Module github.com/joenathan-15. Card model with SM-2 fields exists.

--- service/study.go ---
Implement ApplySM2(card *model.Card, quality int) (pure function, no DB):
  // quality: 0=Again, 1=Hard, 2=Good, 3=Easy
  // Map to SM-2 q: 0->1, 1->2, 2->4, 3->5
  q := map[int]float64{0:1, 1:2, 2:4, 3:5}[quality]

  if q >= 3 {
      if card.Repetitions == 0       { card.Interval = 1 }
      else if card.Repetitions == 1  { card.Interval = 6 }
      else { card.Interval = int(math.Round(float64(card.Interval) * card.EaseFactor)) }
      card.Repetitions++
      card.EaseFactor += 0.1 - (5-q)*(0.08+(5-q)*0.02)
      if card.EaseFactor < 1.3 { card.EaseFactor = 1.3 }
  } else {
      card.Repetitions = 0
      card.Interval = 1
  }
  card.DueDate = time.Now().Add(time.Duration(card.Interval) * 24 * time.Hour)

--- repository/study.go ---
- CreateSession(s *model.StudySession) error
- FindSessionByID(id uint) (*model.StudySession, error)
- UpdateSession(s *model.StudySession) error
- CreateReview(r *model.CardReview) error

--- dto/study.go ---
type StartSessionRequest  struct { DeckID  uint `json:"deck_id"  binding:"required"` }
type ReviewRequest        struct { CardID  uint `json:"card_id"  binding:"required"`; Quality int `json:"quality" binding:"required,min=0,max=3"` }
type EndSessionRequest    struct { Duration int `json:"duration"` }

--- handler/study.go ---
GetDueCards(c)  GET  /decks/:deck_id/study/due
  Verify deck belongs to user or is public.
  Response: { "data": []card, "total_due": int }

StartSession(c) POST /study/sessions
  Create StudySession {UserID, DeckID, StartedAt: time.Now()}.
  Response: { "session_id": uint }

SubmitReview(c) POST /study/sessions/:id/review
  Load card. Verify card's deck belongs to current user. Apply ApplySM2. Save card.
  Create CardReview record. Increment session.CardsStudied. Save session.
  Response: { "card": card, "next_due": card.DueDate }

EndSession(c)   POST /study/sessions/:id/end
  Set EndedAt = &now, Duration = body.Duration. Save.
  Response: { "message": "ok" }

--- router/api.go ---
decks.GET("/:deck_id/study/due", studyHandler.GetDueCards)

study := api.Group("/study", middleware.AuthMiddleware())
study.POST("/sessions",             studyHandler.StartSession)
study.POST("/sessions/:id/review",  studyHandler.SubmitReview)
study.POST("/sessions/:id/end",     studyHandler.EndSession)

Verify: go build ./...
```

---

### B6 — Stats + Public library

- [ ] Done
- ⚡ Needs: B4, B5 done

```
Working in kilas/backend. Module github.com/joenathan-15. All models and previous routes exist.

--- handler/stats.go + service/stats.go ---

GET /api/stats/overview (auth):
Run these DB queries for current userID, return as JSON object:
{
  "total_decks":      COUNT(*) FROM decks WHERE user_id=?
  "total_cards":      COUNT(*) FROM cards JOIN decks ON cards.deck_id=decks.id WHERE decks.user_id=?
  "cards_due_today":  same join + WHERE due_date <= NOW()
  "cards_mastered":   same join + WHERE repetitions >= 3
  "total_sessions":   COUNT(*) FROM study_sessions WHERE user_id=?
  "total_study_time": COALESCE(SUM(duration), 0) FROM study_sessions WHERE user_id=? AND ended_at IS NOT NULL
}

GET /api/stats/activity (auth):
Get daily CardReview counts for current user over last 30 days:
  SELECT DATE(cr.created_at) as date, COUNT(*) as count
  FROM card_reviews cr
  JOIN study_sessions ss ON cr.session_id = ss.id
  WHERE ss.user_id = ? AND cr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY DATE(cr.created_at)
Zero-fill: generate all 30 dates from today-29 to today, merge with DB results (missing = 0).
Return: { "data": [{ "date": "2025-01-01", "count": 5 }, ...] } sorted ASC.

GET /api/stats/deck/:deck_id (auth):
Verify deck belongs to user. Return:
{
  "deck_id", "total_cards", "due_today", "mastered",
  "new_cards"  // repetitions == 0
  "learning"   // repetitions > 0 AND repetitions < 3
}

--- handler/library.go + service/library.go ---

GET /api/library (no auth needed):
Query params: search, tags (comma-separated), page (default 1), limit (default 12, max 50).
Query:
  SELECT decks.*, users.username, COUNT(cards.id) as card_count
  FROM decks JOIN users ON decks.user_id = users.id
  LEFT JOIN cards ON cards.deck_id = decks.id
  WHERE decks.is_public = true
  [+ AND (decks.title LIKE '%?%' OR decks.description LIKE '%?%') if search]
  [+ AND decks.tags LIKE '%tag%' per tag if tags given]
  GROUP BY decks.id ORDER BY decks.created_at DESC
  LIMIT ? OFFSET ?
Also run COUNT query for total. Paginate.
Response: { "data": [{ id, title, description, tags: string[], card_count, author: { id, username } }], total, page, limit }

POST /api/library/:deck_id/clone (auth):
Load source deck. Must be is_public=true, else 404.
Duplicate: new Deck { UserID=currentUser, Title="Copy of <title>", IsPublic=false, same Description+Tags }.
Bulk-copy all cards with reset SM-2 fields (Interval=0, Repetitions=0, EaseFactor=2.5, DueDate=time.Now()).
Response: { "deck": cloned deck }

--- router/api.go ---
stats := api.Group("/stats", middleware.AuthMiddleware())
stats.GET("/overview",      statsHandler.Overview)
stats.GET("/activity",      statsHandler.Activity)
stats.GET("/deck/:deck_id", statsHandler.DeckStats)

library := api.Group("/library")
library.GET("",                                              libraryHandler.Browse)
library.POST("/:deck_id/clone", middleware.AuthMiddleware(), libraryHandler.Clone)

Verify: go build ./...
```

---

### B7 — AI card generator endpoint

- [ ] Done
- ⚡ Needs: B4 done. Needs OPENAI_API_KEY in .env.

```
Working in kilas/backend. Module github.com/joenathan-15.

Run: go get github.com/sashabaranov/go-openai

--- dto/ai.go ---
type GenerateCardsRequest struct {
    Text   string `json:"text"    binding:"required,min=10,max=3000"`
    Count  int    `json:"count"   binding:"required,min=1,max=20"`
    DeckID uint   `json:"deck_id" binding:"required"`
}
type GeneratedCard struct {
    Front string `json:"front"`
    Back  string `json:"back"`
}

--- service/ai.go ---
func (s *AIService) GenerateCards(text string, count int) ([]dto.GeneratedCard, error):
1. apiKey := os.Getenv("OPENAI_API_KEY"). If empty: return error "AI not configured".
2. client := openai.NewClient(apiKey)
3. systemPrompt := fmt.Sprintf("You are an expert educator creating flashcards for Indonesian students. Generate exactly %d high-quality flashcard pairs from the study material. Return ONLY a valid JSON array, no other text: [{\"front\": \"question\", \"back\": \"answer\"}]. Keep answers concise. Use $LaTeX$ for math formulas.", count)
4. Call CreateChatCompletion: model=gpt-4o-mini, max_tokens=2000, temperature=0.7.
5. Unmarshal response content as []GeneratedCard.
6. If len == 0: return error "AI returned no cards, try again".
7. Return cards.

--- handler/ai.go ---
GenerateCards(c *gin.Context):
1. Bind GenerateCardsRequest. 400 on error.
2. Load deck by DeckID. Verify deck.UserID == currentUserID. 403 if not owner.
3. Call service.GenerateCards. 500 on error (include error message in response).
4. Return 200 { "cards": []GeneratedCard }
Note: does NOT save to DB. Returns cards for user to review first.

--- router/api.go ---
ai := api.Group("/ai", middleware.AuthMiddleware())
ai.POST("/generate-cards", aiHandler.GenerateCards)

Verify: go build ./...
```

---

### B8 — Google OAuth

- [ ] Done
- ⚡ Needs: B3 done. Needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env (from Google Cloud Console).

```
Working in kilas/backend. Module github.com/joenathan-15. Auth service and user repo exist.

Run:
  go get golang.org/x/oauth2
  go get golang.org/x/oauth2/google

--- handler/oauth.go ---
Build oauth2.Config:
{
  ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
  ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
  RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
  Scopes:       ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
  Endpoint:     google.Endpoint,
}

GoogleLogin(c *gin.Context):
1. Generate random state: 16 bytes from crypto/rand, base64url encoded.
2. Set httpOnly cookie "oauth_state", maxAge=300, sameSite=Lax.
3. c.Redirect(302, config.AuthCodeURL(state, oauth2.AccessTypeOnline))

GoogleCallback(c *gin.Context):
1. Compare c.Query("state") with "oauth_state" cookie. Mismatch -> 400 "invalid state".
2. Exchange c.Query("code") for token. Error -> 400.
3. GET https://www.googleapis.com/oauth2/v2/userinfo with Bearer token.
   Parse: { id, email, name, picture }
4. Upsert user:
   - Find by email.
   - Not found: create User { Email, Username: sanitize(name), Provider:"google", AvatarURL:picture }.
     sanitize: strip non-alphanumeric, lowercase, max 20 chars. If username taken: append random 4 digits.
   - Found + Provider=="local": just update AvatarURL, keep existing.
   - Found + Provider=="google": update AvatarURL.
5. Generate access + refresh tokens (use auth service generateTokens).
6. Delete oauth_state cookie.
7. Redirect to: FRONTEND_URL + "/auth/callback?access_token=" + at + "&refresh_token=" + rt

--- router/api.go ---
api.GET("/auth/google",          oauthHandler.GoogleLogin)
api.GET("/auth/google/callback", oauthHandler.GoogleCallback)

Verify: go build ./...
```

---

## 🎨 Frontend Track

Work top to bottom. You can mock API responses for any task where the backend isn't ready yet.

---

### F1 — Install deps + base setup

- [ ] Done

```
Working in kilas/frontend. Stack: React 19 + TypeScript + Vite.

1. Install:
   npm install react-router-dom axios zustand @tanstack/react-query react-hot-toast lucide-react
   npm install -D tailwindcss @tailwindcss/vite tailwindcss-animate

2. vite.config.ts — add @tailwindcss/vite plugin and dev proxy:
   import tailwindcss from '@tailwindcss/vite'
   plugins: [react(), tailwindcss()]
   server: { proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } } }

3. src/index.css — replace all content with:
   @import "tailwindcss";

4. src/types/index.ts — create:
   export interface User          { id: number; email: string; username: string; avatar_url: string; provider: string }
   export interface Deck          { id: number; user_id: number; title: string; description: string; is_public: boolean; tags: string[]; card_count: number; created_at: string; updated_at: string }
   export interface Card          { id: number; deck_id: number; front: string; back: string; front_image_url: string; back_image_url: string; interval: number; repetitions: number; ease_factor: number; due_date: string; created_at: string }
   export interface OverviewStats { total_decks: number; total_cards: number; cards_due_today: number; cards_mastered: number; total_sessions: number; total_study_time: number }
   export interface ActivityData  { date: string; count: number }
   export interface DeckStats     { deck_id: number; total_cards: number; due_today: number; mastered: number; new_cards: number; learning: number }
   export interface LibraryDeck   { id: number; title: string; description: string; tags: string[]; card_count: number; author: { id: number; username: string } }

5. src/lib/api.ts — create:
   import axios from 'axios'
   const api = axios.create({ baseURL: '/api' })

   Request interceptor: read localStorage.getItem('access_token'), set Authorization: Bearer <token>.

   Response interceptor:
     On 401: try POST /auth/refresh with { refresh_token: localStorage.getItem('refresh_token') }.
       Success: save new access_token to localStorage, retry original request.
       Failure: clear localStorage ('access_token', 'refresh_token'), window.location.href = '/login'.

   export default api

6. src/main.tsx — wrap App:
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
   import { BrowserRouter } from 'react-router-dom'
   import { Toaster } from 'react-hot-toast'
   const qc = new QueryClient()
   <QueryClientProvider client={qc}><BrowserRouter><App /><Toaster position="top-right" /></BrowserRouter></QueryClientProvider>

7. Clear src/App.tsx to just: export default function App() { return <div /> }
   Clear src/App.css.

Verify: npm run build
```

---

### F2 — Auth: store + login + register pages

- [ ] Done
- ⚡ Needs: F1 done. Wire to real API after B3 is done (mock in the meantime).

```
Working in kilas/frontend. F1 is done. API client at src/lib/api.ts. Types at src/types/index.ts.

--- src/stores/authStore.ts (Zustand) ---
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

- login(): POST /auth/login, save access_token + refresh_token to localStorage, set user + isAuthenticated=true.
- register(): POST /auth/register, same.
- logout(): clear localStorage, reset state, window.location.href = '/login'.
- fetchMe(): GET /auth/me, set user. On any error: call logout().
- On store creation: if localStorage has access_token, set isLoading=true, call fetchMe(), then isLoading=false.

--- src/pages/LoginPage.tsx ---
Full-screen centered layout. Max-w-md card with shadow.
- App name "Kilas" at top with 🃏 emoji.
- Email input (Mail icon from lucide).
- Password input (Lock icon) with Eye/EyeOff toggle for show/hide.
- Submit button, full width, shows spinner while loading.
- Error: toast.error(err?.response?.data?.error || 'Login failed').
- Success: navigate to /dashboard.
- "Don't have an account? Register" link -> /register.
- If already authenticated on mount: navigate to /dashboard.
- Divider "or" + "Continue with Google" button (onClick: window.location.href = '/api/auth/google').
  Google button: border, white bg, flex row with a simple "G" text or google colors inline SVG.

--- src/pages/RegisterPage.tsx ---
Same layout.
- Username field (hint: "3–20 characters").
- Email, Password (show/hide), Confirm Password (client-side match check, show inline error if mismatch).
- Submit + Google button same as login.
- "Already have an account? Login" link.

Verify: npm run build
```

---

### F3 — App shell: router + layout + protected routes

- [ ] Done
- ⚡ Needs: F2 done.

```
Working in kilas/frontend. F1 + F2 done. Auth store at src/stores/authStore.ts.

--- src/components/ProtectedRoute.tsx ---
Read isAuthenticated, isLoading from authStore.
- isLoading: full screen centered <Loader2 className="animate-spin" /> from lucide.
- !isAuthenticated: <Navigate to="/login" replace />.
- Otherwise: <Outlet />.

--- src/components/layout/AppLayout.tsx ---
Layout: sidebar on md+ screens, bottom tab bar on mobile.

Sidebar (hidden below md, w-60, bg-white, border-r, fixed left, full height):
  Top: "Kilas" text (font-bold text-indigo-600) + small subtitle "spaced repetition".
  Nav links (array, use NavLink from react-router-dom):
    Dashboard  -> /dashboard  (LayoutDashboard icon)
    My Decks   -> /decks      (Layers icon)
    Library    -> /library    (BookOpen icon)
    Stats      -> /stats      (BarChart2 icon)
  Active:   bg-indigo-50 text-indigo-600 font-medium rounded-lg
  Inactive: text-gray-600 hover:bg-gray-50 rounded-lg
  Bottom: user avatar (circle, first letter of username, bg-indigo-500 text-white), username, LogOut button (red on hover).

Bottom tab bar (md:hidden, fixed bottom-0, full width, bg-white border-t, z-50):
  Same 4 links, icon + small label. Active = text-indigo-600.

Mobile top bar (md:hidden, sticky top-0, bg-white border-b, z-40):
  "Kilas" text left, user avatar circle right.

Main content: <main className="md:ml-60 min-h-screen p-4 md:p-8 pb-20 md:pb-8"><Outlet /></main>

--- src/App.tsx ---
<Routes>
  <Route path="/login"         element={<LoginPage />} />
  <Route path="/register"      element={<RegisterPage />} />
  <Route path="/auth/callback" element={<AuthCallbackPage />} />
  <Route element={<ProtectedRoute />}>
    <Route element={<AppLayout />}>
      <Route index                   element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"       element={<DashboardPage />} />
      <Route path="/decks"           element={<DecksPage />} />
      <Route path="/decks/:id"       element={<DeckDetailPage />} />
      <Route path="/decks/:id/study" element={<StudyPage />} />
      <Route path="/library"         element={<LibraryPage />} />
      <Route path="/stats"           element={<StatsPage />} />
    </Route>
  </Route>
  <Route path="*" element={<Navigate to="/dashboard" replace />} />
</Routes>

Create stub page components for all pages (just return <div className="p-8"><h1>Page</h1></div>).

Verify: npm run build
```

---

### F4 — Decks page + deck modal

- [ ] Done
- ⚡ Needs: F3 done. Wire to real API after B4 is done.

```
Working in kilas/frontend. F1–F3 done. API at src/lib/api.ts.

--- src/pages/DecksPage.tsx ---
Fetch GET /decks with useQuery({ queryKey: ['decks'], queryFn: () => api.get('/decks').then(r => r.data.data) }).

Header: "My Decks" + deck count badge + "New Deck" button (Plus icon).

Grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4). Each deck card (bg-white border rounded-xl shadow-sm hover:shadow-md p-5):
  - Title (font-semibold text-lg)
  - Description (text-sm text-gray-500 line-clamp-2 mt-1)
  - Tag pills (mt-2, small, bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5 text-xs). Show max 3, "+N more" if extra.
  - Bottom row: "{card_count} cards" gray text + "Study →" button (text-sm text-indigo-600) links to /decks/:id/study.
  - On hover: show Edit (Pencil) + Delete (Trash2) icon buttons top-right.
  - Clicking card body: navigate to /decks/:id.

Loading state: 6 skeleton cards (animate-pulse gray rounded-xl h-40).
Empty state: centered Layers icon + "No decks yet" + "Create your first deck" CTA button.

Delete (inline, no modal): clicking trash replaces deck card footer with "Delete this deck?" [Yes — DELETE /decks/:id] [Cancel]. On success: invalidate ['decks'], toast.success.

--- src/components/DeckModal.tsx ---
Props: { open: boolean; onClose: () => void; deck?: Deck }
Modal: fixed inset-0 bg-black/50 z-50. Centered card max-w-md bg-white rounded-2xl shadow-xl p-6.

Title: "Create Deck" or "Edit Deck". X close button top-right.

Fields:
  - Title input (required, autofocused)
  - Description textarea (3 rows)
  - Tags: text input + Enter/comma to add tags as pills (bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm with × to remove). Store as string[].
  - "Public Deck" toggle switch (label: "Share with the community").

Submit:
  Create: POST /decks { title, description, is_public, tags }
  Edit:   PUT  /decks/:id same body
  On success: queryClient.invalidateQueries({ queryKey: ['decks'] }), toast.success, onClose().
  On error: toast.error. Show spinner on button while submitting.

Verify: npm run build
```

---

### F5 — Deck detail page + card management

- [ ] Done
- ⚡ Needs: F4 done. Wire to real API after B4 is done.

```
Working in kilas/frontend. F1–F4 done.

--- src/pages/DeckDetailPage.tsx ---
const { id } = useParams()
Fetch GET /decks/:id with useQuery({ queryKey: ['deck', id] }).
Returns deck + deck.cards array.

Header:
  - ChevronLeft button -> /decks
  - Deck title (font-bold text-2xl) + Pencil icon to open DeckModal pre-filled
  - Description + tag pills
  - Right: "{card_count} cards" badge + "Study Deck" button (bg-green-600 text-white, Play icon) -> /decks/:id/study
  - Study button disabled + tooltip "Add some cards first" if card_count === 0

Toolbar:
  - Search input (Search icon, filters cards client-side instantly by front+back text)
  - List/Grid toggle (List + Grid icons from lucide)
  - "Add Card" button (Plus icon, bg-indigo-600)
  - "✨ AI Generate" button (Sparkles icon, bg-purple-50 text-purple-700 border border-purple-200) — placeholder for now, just opens a toast "Coming soon"

Table view (default):
  Columns: # | Front (truncated 80 chars) | Back (truncated 80 chars) | Due Date (red if overdue) | Reps | Actions (Pencil + Trash2)
  even:bg-gray-50 rows. Hover: bg-indigo-50/50.

Grid view (2–3 cols):
  Card: white bg, border, rounded-xl, p-4.
  Front text (font-medium) / divider / Back (text-gray-500 text-sm).
  On hover: overlay with Edit + Delete buttons.

Empty state: CreditCard icon + "No cards yet — add your first one".

--- src/components/CardModal.tsx ---
Props: { open: boolean; onClose: () => void; deckId: number; card?: Card }
Fields:
  - Front textarea (4 rows). Placeholder: "Question or term. Supports **bold**, $LaTeX$"
  - Back textarea (4 rows). Placeholder: "Answer or definition."
  - Collapsible "Image URLs ▾" section: Front Image URL input + Back Image URL input.

Submit:
  Create: POST /decks/:deckId/cards { front, back, front_image_url, back_image_url }
  Edit:   PUT  /cards/:id same body
  Success: invalidate ['deck', deckId], toast.success, onClose().

Delete card: same inline "Delete?" / "Yes" / "Cancel" pattern.
DELETE /cards/:id -> invalidate ['deck', id] -> toast.success.

Verify: npm run build
```

---

### F6 — Study mode

- [ ] Done
- ⚡ Needs: F5 done. Wire to real API after B5 is done. Can mock with static card data.

```
Working in kilas/frontend. F1–F5 done. Route: /decks/:id/study.

Create src/pages/StudyPage.tsx and src/components/Flashcard.tsx.

--- SESSION INIT ---
On mount (useEffect):
  1. POST /study/sessions { deck_id: id } -> save session_id in state.
  2. GET /decks/:id/study/due -> save cards[] in state.
  3. If 0 cards: show "Nothing due today 🎉" with "Back to Deck" button.

--- STUDY STATE (useState, local only) ---
cards, currentIndex, isFlipped, sessionId, startTime (Date.now()),
results: { again:0, hard:0, good:0, easy:0 }, isComplete

--- src/components/Flashcard.tsx ---
Props: { card: Card; isFlipped: boolean; onFlip: () => void }

Outer: div w-full max-w-2xl mx-auto h-72, cursor-pointer, style={{perspective:'1000px'}}, onClick=onFlip
Inner: div with transition-transform duration-500, style={{transformStyle:'preserve-3d', transform: isFlipped?'rotateY(180deg)':'rotateY(0)'}}

Front face (backface-hidden, bg-white rounded-2xl border-2 flex items-center justify-center flex-col gap-4 p-8 absolute inset-0):
  If card.front_image_url: <img src={} className="max-h-32 rounded-lg object-cover" />
  card.front text (text-2xl text-center font-medium)
  Bottom hint: RotateCcw icon + "Click to reveal" (text-gray-400 text-sm)

Back face (same layout, bg-indigo-50 border-indigo-200, absolute inset-0, backface-hidden, style={{transform:'rotateY(180deg)'}}):
  card.back text + optional image.

--- RATING BUTTONS (only when isFlipped) ---
4 buttons below card:
  Again  (red,   quality=0, key "1")
  Hard   (amber, quality=1, key "2")
  Good   (blue,  quality=2, key "3")
  Easy   (green, quality=3, key "4")

On rate:
  POST /study/sessions/:sessionId/review { card_id: cards[currentIndex].id, quality }
  Increment results. If more cards: currentIndex++, isFlipped=false. Else: isComplete=true.

--- KEYBOARD SHORTCUTS (useEffect, cleanup on unmount) ---
Space -> flip (if !isFlipped)
1/2/3/4 -> rate (if isFlipped)
Escape -> show exit confirm dialog

--- PROGRESS BAR (top) ---
"Card {currentIndex+1} of {cards.length}" + progress bar div.

--- EXIT BUTTON ---
X icon top-right. On click: show confirm overlay "Quit session?" [Keep Studying] [Quit -> navigate(/decks/:id)].

--- SESSION COMPLETE ---
When isComplete=true:
  On mount: POST /study/sessions/:sessionId/end { duration: Math.floor((Date.now()-startTime)/1000) }
  Show: "Session Complete! 🎉", time formatted "Xm Ys", cards reviewed, colored result squares (Again/Hard/Good/Easy).
  Buttons: "Study Again" (reset state + re-fetch) | "Back to Deck" -> /decks/:id

Verify: npm run build
```

---

### F7 — Dashboard + stats page

- [ ] Done
- ⚡ Needs: F3 done. Wire to real API after B6 is done. Can hardcode mock data until then.

```
Working in kilas/frontend. F1–F3 done.

--- src/pages/DashboardPage.tsx ---

1. Greeting: "Good morning/afternoon/evening, [username]! 👋"
   Hours: 5–11 morning, 12–17 afternoon, else evening. Username from authStore.

2. Stats cards (fetch GET /stats/overview, useQuery key ['stats-overview']):
   4-card grid (grid-cols-2 md:grid-cols-4):
   - Total Decks   (Layers icon, blue)
   - Total Cards   (CreditCard icon, purple)
   - Due Today     (Clock icon, orange — add red ring if > 0)
   - Mastered      (Trophy icon, green)
   Loading: 4 skeleton blocks.

3. Due today banner (from overview data):
   - cards_due_today > 0: amber banner "📚 You have N cards due" + "Go to My Decks" button -> /decks
   - cards_due_today == 0: green banner "✅ All caught up today!"

4. Activity chart (fetch GET /stats/activity, useQuery key ['stats-activity']):
   Title "Last 30 Days".
   Simple bar chart: flex items-end gap-0.5 h-10.
   Each of 30 divs: flex-1, rounded-t-sm, min-h of 2px if count>0.
   Color: 0=bg-gray-100, 1-2=bg-green-300, 3-5=bg-green-500, 6+=bg-green-700.
   title attr = "{date}: {count} reviews".

5. Recent decks (fetch GET /decks, first 4):
   2-col compact grid. Each: title + card count + "Study →" link to /decks/:id/study.
   "View All →" link to /decks.

--- src/pages/StatsPage.tsx ---

1. Streak (from /stats/activity data):
   Count consecutive days from today backwards where count > 0.
   Show "🔥 {N} day streak" hero or "Start your streak today!".

2. Overview cards (from /stats/overview):
   6 cards: Total Decks, Total Cards, Mastered, Sessions, Study Time (format: "Xh Ym"), Due Today.

3. Activity heatmap (from /stats/activity):
   grid grid-cols-7 gap-1. Each cell w-3 h-3 rounded-sm.
   Color same as above. title attr for tooltip.
   Legend: "Less □□□□□ More".

4. Per-deck table (GET /decks then useQueries for GET /stats/deck/:id per deck):
   Columns: Deck | Cards | Mastered | Learning | New | Due | Progress bar.
   Progress: (mastered/total*100)% green fill bar.
   Click deck name -> /decks/:id.

Verify: npm run build
```

---

### F8 — Library page

- [ ] Done
- ⚡ Needs: F3 done. Wire to real API after B6 is done.

```
Working in kilas/frontend. F1–F3 done.

--- src/pages/LibraryPage.tsx ---

State: search (string), selectedTag (string | null), page (number, default 1).

1. Header: "Community Library" h1 + subtitle "Discover and clone decks from other students".

2. Search bar (Search icon, debounced 400ms):
   useRef for timeout: clear on each keystroke, update search state after 400ms. Reset page to 1 on change.

3. Tag filter pills (flex gap-2 overflow-x-auto pb-2):
   ["All", "Mathematics", "Science", "Language", "History", "Programming", "Biology", "Chemistry", "Physics", "Geography"]
   Active: bg-indigo-600 text-white. Inactive: border text-gray-700.
   "All" clears selectedTag. Others: single select. Reset page to 1 on change.

4. Deck grid (fetch GET /library?search=&tags=&page=&limit=12):
   useQuery({ queryKey: ['library', search, selectedTag, page] })
   grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.
   Each card: title, description (line-clamp-2), tags, "{N} cards", "by @username" (text-gray-400 text-sm).
   "Clone Deck" button (Copy icon):
     Not logged in: disabled, title attr "Login to clone".
     Logged in: POST /library/:id/clone -> success: toast.success("Added to your decks!"), button -> "✓ Cloned" (green, disabled).
     Track cloned IDs in local Set state.
   Loading: 6 skeleton cards.
   Empty: Search icon + "No decks found" + "Try different keywords".

5. Pagination (from response total/page/limit):
   [Prev] [1] [2] ... [N] [Next].
   Disabled Prev on page 1, Next on last page.
   On change: scroll grid into view.

Verify: npm run build
```

---

### F9 — LaTeX + markdown rendering

- [ ] Done
- ⚡ Needs: F5 done.

```
Working in kilas/frontend. F5 done (CardModal and DeckDetailPage exist).

Install:
  npm install katex react-katex
  npm install -D @types/katex

Add to src/index.css (after @import "tailwindcss";):
  @import 'katex/dist/katex.min.css';

--- src/components/CardContent.tsx ---
Props: { content: string; className?: string }

Parse content into segments and render. Processing order:
1. Split by $$...$$ (block LaTeX) via /\$\$([^$]+)\$\$/g
2. Within text segments, split by $...$ (inline LaTeX) via /\$([^$]+)\$/g
3. Within text segments, apply inline markdown:
   **text** -> <strong>
   *text* or _text_ -> <em>
   `code` -> <code className="bg-gray-100 px-1 rounded font-mono text-sm">
   \n -> <br />
4. $$...$$ -> <BlockMath> centered, my-2
5. $...$ -> <InlineMath>
6. Wrap everything in <div className={cn("leading-relaxed break-words", className)}>

Error handling: wrap every KaTeX render in try/catch. On error, render raw $formula$ as <code> instead of crashing.

Update:
- src/components/Flashcard.tsx: replace card.front and card.back text with <CardContent content={card.front} />
- src/pages/DeckDetailPage.tsx: use <CardContent> in table and grid card views
- src/components/CardModal.tsx: below each textarea add a live preview:
    <div className="mt-1 text-xs text-gray-400">Preview:</div>
    <div className="p-2 bg-gray-50 border rounded min-h-8 text-sm">
      <CardContent content={watchedValue} />
    </div>

Verify: npm run build
```

---

### F10 — Dark mode

- [ ] Done
- ⚡ Needs: F3 done (layout exists).

```
Working in kilas/frontend. All pages and components exist.

1. src/stores/themeStore.ts (Zustand):
interface ThemeState { isDark: boolean; toggle: () => void }

Init:
  const saved = localStorage.getItem('theme')
  isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  Apply immediately: document.documentElement.classList.toggle('dark', isDark)

toggle():
  Flip isDark. Save to localStorage. Update document.documentElement.classList.

2. src/index.css — add after @import "tailwindcss";:
   @variant dark (&:where(.dark, .dark *));

3. AppLayout.tsx — add Moon/Sun icon toggle button:
   In sidebar bottom section + mobile top bar.
   onClick: themeStore.toggle()

4. Add dark: variants throughout. Key patterns to apply everywhere:
   Backgrounds:  bg-white -> bg-white dark:bg-gray-900
                 bg-gray-50 -> bg-gray-50 dark:bg-gray-800
                 bg-gray-100 -> bg-gray-100 dark:bg-gray-700
   Text:         text-gray-900 -> dark:text-gray-100
                 text-gray-600 -> dark:text-gray-400
                 text-gray-500 -> dark:text-gray-400
   Borders:      border-gray-200 -> dark:border-gray-700
   Inputs:       add dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
   Cards/modals: bg-white -> dark:bg-gray-800
   Table:        even:bg-gray-50 -> dark:even:bg-gray-800/50
                 hover:bg-gray-50 -> dark:hover:bg-gray-700

Files: AppLayout, LoginPage, RegisterPage, DashboardPage, DecksPage, DeckDetailPage, StudyPage, StatsPage, LibraryPage, DeckModal, CardModal, Flashcard.

Verify: npm run build
```

---

### F11 — AI generator UI

- [ ] Done
- ⚡ Needs: F5 done + B7 deployed with a working OPENAI_API_KEY.

```
Working in kilas/frontend. F5 done (DeckDetailPage exists).

--- src/components/AIGeneratorModal.tsx ---
Props: { open: boolean; onClose: () => void; deckId: number; onSuccess: () => void }

Step state: 1 (input) or 2 (review).
generatedCards: Array<{ front: string; back: string; selected: boolean }>

STEP 1 — INPUT:
Header: "✨ Generate Cards with AI" (Sparkles icon, purple).
Textarea min-h-48 max 3000 chars. Char counter bottom-right, red when > 2800.
"How many cards?" row of preset buttons: [5] [10] [15] [20], single select, default 10.
"Generate" button (full width, bg-purple-600):
  POST /ai/generate-cards { text, count, deck_id }
  Loading: spinner + "Generating..."
  Success: setGeneratedCards(cards.map(c => ({ ...c, selected: true }))), go to step 2.
  Error: toast.error. If error includes "not configured": show "AI not available — add OPENAI_API_KEY to backend .env".

STEP 2 — REVIEW:
Header "Review {N} Generated Cards" + back arrow.
"Select All" / "Deselect All" buttons.
Card list: each row (border rounded-lg p-3 mb-2 flex gap-3):
  Checkbox (left). Front textarea (2 rows, editable). Back textarea (2 rows, editable).
  Editing updates generatedCards[index].front or .back.
"Save {selectedCount} Cards" button (bg-green-600):
  Promise.allSettled(selected.map(card => api.post(`/decks/${deckId}/cards`, card)))
  Show "Saving {done}/{total}..." progress.
  When done: toast.success(`Added ${saved} cards!`), onSuccess(), onClose().

Update src/pages/DeckDetailPage.tsx:
  Replace "Coming soon" toast on "✨ AI Generate" button with opening AIGeneratorModal.
  onSuccess: queryClient.invalidateQueries({ queryKey: ['deck', id] }).

Verify: npm run build
```

---

### F12 — PWA + offline banner

- [ ] Done
- ⚡ Needs: F1 done.

```
Working in kilas/frontend.

Install: npm install -D vite-plugin-pwa

1. vite.config.ts — add VitePWA plugin:
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Kilas - Spaced Repetition',
    short_name: 'Kilas',
    description: 'Flashcard app with spaced repetition for students',
    theme_color: '#6366f1',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https?.*\/api\/(decks|cards|stats)/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
          networkTimeoutSeconds: 3
        }
      }
    ]
  }
})

2. Create placeholder icon files. You can create a simple script or manually place any 192x192 and 512x512 PNG at public/icon-192.png and public/icon-512.png. Even a solid indigo square works for now.

3. src/components/OfflineBanner.tsx:
useState isOnline = navigator.onLine.
useEffect: window.addEventListener('online', ...) and 'offline'.
  On online: setIsOnline(true), toast.success("✅ Back online!")
  On offline: setIsOnline(false)
If !isOnline: <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-white text-sm text-center py-2 px-4">
  📶 You're offline — showing cached content
</div>
Else: null.

4. Add <OfflineBanner /> as first child in AppLayout's root div.

5. src/lib/api.ts response interceptor — add before the 401 handler:
If !navigator.onLine and the error has no response (network error):
  toast.error("You're offline. This action requires internet.")
  return Promise.reject(error)

Verify: npm run build, check that dist/sw.js is generated.
```

---

### F13 — Google OAuth callback page

- [ ] Done
- ⚡ Needs: F2 done + B8 deployed.

```
Working in kilas/frontend. F2 done (authStore.fetchMe exists).

--- src/pages/AuthCallbackPage.tsx ---
This page handles the redirect from Google OAuth at route /auth/callback.

On mount (useEffect):
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')

  if (accessToken && refreshToken):
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    await authStore.fetchMe()
    navigate('/dashboard', { replace: true })
  else:
    setError(true)

While processing: full screen centered spinner (Loader2 animate-spin from lucide) + "Signing you in..." text.

If error state:
  Centered card: "Authentication failed" heading, "Something went wrong with Google login." subtext.
  "Try Again" button -> /login.

This route is already in App.tsx outside ProtectedRoute from F3.

Verify: npm run build
```

---

## 🔁 Sync Points

These are the moments to check in with each other:

| When             | What to sync on                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------- |
| After S1         | Make sure both agree on all API shapes before writing any code                           |
| After B3 + F2    | Test login end-to-end. Confirm tokens save, /auth/me works, 401 refresh flow works.      |
| After B4 + F4/F5 | Test deck + card create/edit/delete end-to-end. Check CORS is working.                   |
| After B5 + F6    | Test full study session: start -> flip -> rate -> SM-2 updates card -> session end.      |
| After B6 + F7    | Test stats and library page with real data. Confirm zero-filled activity response shape. |
| Before deploying | Align on env vars, domain (kilas.my.id), and any CORS origin updates.                    |
