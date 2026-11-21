# Mode: Security - FORJA

> Use este modo para análise de segurança, auditoria de código e implementação de controles de segurança.

---

## Antes de Analisar

1. **Ler a fonte de verdade:**

   - `docs/ESTADO_ATUAL_DO_SISTEMA.md`
   - `.github/SECURITY_RBAC_POLICY.md`
   - `.github/MULTI_TENANT_ENFORCEMENT.md`
   - `docs/06-seguranca/ARQUITETURA_SEGURANCA.md`

2. **Entender o contexto:**
   - Multi-tenancy (tenant_id do JWT)
   - RBAC (roles e permissões)
   - Auth flow (JWT + refresh token)
   - Logs de auditoria

---

## Autenticação e Autorização

### JWT Configuration

```go
// ✅ CORRETO - HS256 com JWT_SECRET
type JWTConfig struct {
    Secret     string `env:"JWT_SECRET,required"`
    Expiration int    `env:"JWT_EXPIRATION,default=3600"` // 1 hora
}

// Token Claims
type Claims struct {
    UserID   string   `json:"user_id"`
    TenantID string   `json:"tenant_id"`
    Email    string   `json:"email"`
    Role     string   `json:"role"`
    jwt.RegisteredClaims
}
```

```go
// ❌ ERRADO - Chaves pública/privada não são usadas
// O sistema usa HS256, não RS256
```

### Refresh Token

```go
// ✅ CORRETO - Cookie HttpOnly + DB
type RefreshToken struct {
    ID        string    `json:"id"`
    UserID    string    `json:"user_id"`
    TenantID  string    `json:"tenant_id"`
    TokenHash string    `json:"token_hash"`
    ExpiresAt time.Time `json:"expires_at"`
    CreatedAt time.Time `json:"created_at"`
}

// Cookie HttpOnly
http.SetCookie(w, &http.Cookie{
    Name:     "refresh_token",
    Value:    refreshToken,
    HttpOnly: true,
    Secure:   true, // HTTPS em produção
    SameSite: http.SameSiteStrictMode,
    Path:     "/",
})
```

---

## Multi-tenancy Security

### Tenant Isolation

```go
// ✅ CORRETO - tenant_id do JWT context
func getTenantIDFromContext(ctx context.Context) (string, error) {
    tenantID, ok := ctx.Value("tenant_id").(string)
    if !ok || tenantID == "" {
        return "", ErrUnauthorized
    }
    return tenantID, nil
}

// ❌ ERRADO - NÃO existe X-Tenant-ID no runtime
func getTenantIDFromHeader(c echo.Context) string {
    return c.Request().Header.Get("X-Tenant-ID") // NÃO USAR!
}
```

### SQL Queries

```sql
-- ✅ CORRETO - Sempre filtra por tenant_id
-- name: GetAppointments :many
SELECT * FROM appointments
WHERE tenant_id = $1
  AND professional_id = $2
  AND date BETWEEN $3 AND $4;

-- ❌ ERRADO - Sem filtro de tenant_id
-- name: GetAppointments :many
SELECT * FROM appointments
WHERE professional_id = $2
  AND date BETWEEN $3 AND $4;

-- ❌ ERRADO - JOIN entre tenants
SELECT a.*, u.*
FROM appointments a
JOIN users u ON u.id = a.customer_id
WHERE a.date = $1; -- Falta tenant_id no JOIN
```

---

## RBAC (Role-Based Access Control)

### Roles Aceitas

| Role           | Descrição              | Acesso                     |
| -------------- | ---------------------- | -------------------------- |
| `OWNER`        | Proprietário do tenant | Acesso total ao tenant     |
| `MANAGER`      | Gerente                | Acesso total ao tenant     |
| `BARBER`       | Barbeiro               | Apenas seus próprios dados |
| `RECEPTIONIST` | Recepcionista          | Acesso total ao tenant     |

⚠️ **IMPORTANTE:** A role `ACCOUNTANT` é normalizada de `contador`, mas **não é suportada** pelo middleware RBAC atual.

### Middleware RBAC

```go
// ✅ CORRETO - RequireAnyRole
func RequireAnyRole(roles ...string) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            userRole := c.Get("role").(string)

            for _, role := range roles {
                if userRole == role {
                    return next(c)
                }
            }

            return echo.NewHTTPError(http.StatusForbidden, "Insufficient permissions")
        }
    }
}

// ✅ CORRETO - RequireAdminAccess
func RequireAdminAccess() echo.MiddlewareFunc {
    return RequireAnyRole(OWNER, MANAGER, RECEPTIONIST)
}

// ✅ CORRETO - RequireBarberAccess
func RequireBarberAccess() echo.MiddlewareFunc {
    return RequireAnyRole(BARBER, OWNER, MANAGER, RECEPTIONIST)
}
```

### Use Case RBAC Validation

```go
// ✅ CORRETO - Validar RBAC no use case
func (uc *CreateAppointmentUseCase) Execute(ctx context.Context, req CreateAppointmentRequest) (*Appointment, error) {
    tenantID := getTenantIDFromContext(ctx)
    userID := getUserIDFromContext(ctx)
    role := getRoleFromContext(ctx)

    // Validar RBAC
    if !uc.rbac.CanCreateAppointment(ctx, tenantID, userID, role, req.ProfessionalID) {
        return nil, ErrForbidden
    }

    // Executar lógica
    return uc.repository.Create(ctx, req)
}

// ✅ CORRETO - Barbeiro só cria para si mesmo
func (r *RBACService) CanCreateAppointment(ctx context.Context, tenantID, userID, role, professionalID string) bool {
    if role == OWNER || role == MANAGER || role == RECEPTIONIST {
        return true
    }

    if role == BARBER {
        return userID == professionalID
    }

    return false
}
```

---

## Logs de Auditoria

```go
// ✅ CORRETO - Log de auditoria
type AuditLog struct {
    ID        string    `json:"id"`
    UserID    string    `json:"user_id"`
    TenantID  string    `json:"tenant_id"`
    Action    string    `json:"action"`
    Resource  string    `json:"resource"`
    Details   string    `json:"details"`
    IPAddress string    `json:"ip_address"`
    UserAgent string    `json:"user_agent"`
    CreatedAt time.Time `json:"created_at"`
}

// Log no use case
func (uc *CreateAppointmentUseCase) Execute(ctx context.Context, req CreateAppointmentRequest) (*Appointment, error) {
    // ... lógica ...

    // Log de auditoria
    uc.auditLog.Log(ctx, AuditLog{
        UserID:   userID,
        TenantID: tenantID,
        Action:   "appointment.created",
        Resource: fmt.Sprintf("appointment:%s", appointment.ID),
        Details:  fmt.Sprintf("Created appointment for customer %s", req.CustomerID),
    })

    return appointment, nil
}
```

---

## Checklist de Segurança

### Autenticação

- [ ] JWT usa HS256 com JWT_SECRET
- [ ] Refresh token em cookie HttpOnly
- [ ] Refresh token persistido em DB
- [ ] Tokens têm expiração configurada
- [ ] Tokens são validados em cada request

### Multi-tenancy

- [ ] tenant_id vem do JWT, nunca do payload
- [ ] NÃO usa X-Tenant-ID
- [ ] Toda query SQL filtra por tenant_id
- [ ] Nenhum JOIN mistura dados entre tenants
- [ ] Tenant isolation é garantido em todos os níveis

### RBAC

- [ ] Roles: OWNER, MANAGER, BARBER, RECEPTIONIST
- [ ] Barbeiro só acessa seus próprios dados
- [ ] Gerentes acessam todo o tenant
- [ ] Middleware RBAC aplicado em endpoints sensíveis
- [ ] Use cases validam RBAC
- [ ] Violações retornam 403

### Logs de Auditoria

- [ ] Logs contêm: user_id, tenant_id, ação, timestamp
- [ ] Logs de ações sensíveis (criação, atualização, exclusão)
- [ ] Logs incluem IP e User-Agent
- [ ] Logs são persistidos em DB

### Dados Sensíveis

- [ ] Senhas hashadas (bcrypt)
- [ ] Dados PII protegidos (LGPD)
- [ ] Tokens não expostos em logs
- [ ] Erros não expõem informações sensíveis

### Frontend

- [ ] Tokens armazenados em HttpOnly cookies
- [ ] Tokens não no localStorage
- [ ] CSRF protection implementado
- [ ] Content Security Policy configurado
- [ ] HTTPS em produção

---

## Vulnerabilidades Comuns a Verificar

### 1. SQL Injection

```sql
-- ❌ VULNERÁVEL - SQL dinâmico
fmt.Sprintf("SELECT * FROM appointments WHERE id = '%s'", id)

-- ✅ SEGURO - SQLC parametrizado
-- name: GetAppointment :one
SELECT * FROM appointments WHERE id = $1;
```

### 2. Tenant Bypass

```go
// ❌ VULNERÁVEL - Sem validação de tenant
func (h *Handler) GetAppointment(c echo.Context) error {
    id := c.Param("id")
    appointment, err := h.useCase.GetByID(id) // Falta tenant_id!
}

// ✅ SEGURO - Valida tenant
func (h *Handler) GetAppointment(c echo.Context) error {
    tenantID := getTenantIDFromContext(c.Request().Context())
    id := c.Param("id")
    appointment, err := h.useCase.GetByID(tenantID, id)
}
```

### 3. RBAC Bypass

```go
// ❌ VULNERÁVEL - Sem validação de role
func (h *Handler) DeleteAppointment(c echo.Context) error {
    // Qualquer usuário pode deletar
}

// ✅ SEGURO - Valida role
func (h *Handler) DeleteAppointment(c echo.Context) error {
    role := getRoleFromContext(c.Request().Context())
    if role != OWNER && role != MANAGER {
        return echo.NewHTTPError(http.StatusForbidden)
    }
    // ...
}
```

### 4. Information Disclosure

```go
// ❌ VULNERÁVEL - Expõe erro interno
return echo.NewHTTPError(http.StatusInternalServerError, err.Error())

// ✅ SEGURO - Mensagem genérica
return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
```

---

## Antes de Aprovar Código

- [ ] Validação de tenant em todas as queries
- [ ] Validação de RBAC em endpoints sensíveis
- [ ] Logs de auditoria implementados
- [ ] Tokens não expostos em logs/respostas
- [ ] Erros não expõem informações sensíveis
- [ ] SQLC usado para todas as queries
- [ ] Sem SQL dinâmico
- [ ] Sem bypass de tenant isolation
- [ ] Sem bypass de RBAC
