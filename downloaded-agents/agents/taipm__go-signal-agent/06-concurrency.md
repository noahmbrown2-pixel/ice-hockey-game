# Concurrency Patterns

> "Talk is cheap. Show me the code." — Linus Torvalds

---

## TL;DR - Safe Concurrency Rules

```go
// 1. ALWAYS use context for cancellation
ctx, cancel := context.WithCancel(parentCtx)
defer cancel()

// 2. ALWAYS use WaitGroup for goroutine synchronization
var wg sync.WaitGroup
wg.Add(1)
go func() {
    defer wg.Done()
    // work
}()
wg.Wait()

// 3. ALWAYS protect shared state
var mu sync.Mutex
mu.Lock()
sharedState++
mu.Unlock()

// 4. NEVER send on closed channel
// Only sender closes, receiver just reads
```

---

## Goroutine Lifecycle

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Goroutine                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  ctx, cancel := context.WithCancel(...)                 ││
│  │  defer cancel()                                          ││
│  │                                                          ││
│  │  var wg sync.WaitGroup                                  ││
│  │  for i := 0; i < workers; i++ {                         ││
│  │      wg.Add(1)                                          ││
│  │      go worker(ctx, &wg)  ────────────────────┐         ││
│  │  }                                             │         ││
│  │                                                ▼         ││
│  │  wg.Wait()  ◄────────────────────── Worker Goroutines   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### ❌ BROKEN: Fire and Forget

```go
// 🔴 THẢM HỌA — Goroutine orphaned, no cleanup
func handler(r *Request) {
    go processAsync(r)  // WHO WAITS FOR THIS?
    return              // Handler returns, goroutine still running
}
// If server shuts down, processAsync is killed mid-execution
```

### ✅ ĐÚNG: Tracked Goroutines

```go
type Server struct {
    wg sync.WaitGroup
}

func (s *Server) handler(ctx context.Context, r *Request) {
    s.wg.Add(1)
    go func() {
        defer s.wg.Done()
        processAsync(ctx, r)
    }()
}

func (s *Server) Shutdown() {
    // Wait for all goroutines to finish
    s.wg.Wait()
}
```

---

## Worker Pool Pattern

### ❌ BROKEN: Unbounded Goroutines

```go
// 🔴 THẢM HỌA — 1 million requests = 1 million goroutines = OOM
func process(requests []Request) {
    for _, r := range requests {
        go handle(r)  // No limit!
    }
}
```

### ✅ ĐÚNG: Bounded Worker Pool

```go
func ProcessWithPool(ctx context.Context, jobs <-chan Job, workers int) <-chan Result {
    results := make(chan Result, workers)

    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func(workerID int) {
            defer wg.Done()
            for {
                select {
                case <-ctx.Done():
                    return
                case job, ok := <-jobs:
                    if !ok {
                        return  // Channel closed
                    }
                    result := process(ctx, job)
                    select {
                    case results <- result:
                    case <-ctx.Done():
                        return
                    }
                }
            }
        }(i)
    }

    // Close results when all workers done
    go func() {
        wg.Wait()
        close(results)
    }()

    return results
}
```

---

## Mutex Patterns

### ❌ BROKEN: Forgetting to Unlock

```go
// 🔴 THẢM HỌA — DEADLOCK khi có error
func (c *Cache) Get(key string) (string, error) {
    c.mu.Lock()

    val, ok := c.data[key]
    if !ok {
        return "", ErrNotFound  // FORGOT TO UNLOCK!
    }

    c.mu.Unlock()
    return val, nil
}
```

### ✅ ĐÚNG: Always defer Unlock

```go
func (c *Cache) Get(key string) (string, error) {
    c.mu.Lock()
    defer c.mu.Unlock()  // ALWAYS unlocks

    val, ok := c.data[key]
    if !ok {
        return "", ErrNotFound
    }
    return val, nil
}
```

### ❌ BROKEN: Lock Ordering Violation

```go
// 🔴 THẢM HỌA — DEADLOCK
// Goroutine 1: Lock(A) -> Lock(B)
// Goroutine 2: Lock(B) -> Lock(A)

func transfer(from, to *Account, amount int) {
    from.mu.Lock()
    defer from.mu.Unlock()

    to.mu.Lock()  // DEADLOCK if another goroutine locks in opposite order
    defer to.mu.Unlock()

    from.balance -= amount
    to.balance += amount
}
```

### ✅ ĐÚNG: Consistent Lock Ordering

```go
func transfer(from, to *Account, amount int) {
    // Always lock in consistent order (by address)
    first, second := from, to
    if uintptr(unsafe.Pointer(from)) > uintptr(unsafe.Pointer(to)) {
        first, second = to, from
    }

    first.mu.Lock()
    defer first.mu.Unlock()
    second.mu.Lock()
    defer second.mu.Unlock()

    from.balance -= amount
    to.balance += amount
}
```

---

## RWMutex for Read-Heavy Workloads

```go
type Cache struct {
    mu   sync.RWMutex
    data map[string]string
}

// Multiple readers can hold RLock simultaneously
func (c *Cache) Get(key string) (string, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    val, ok := c.data[key]
    return val, ok
}

// Only one writer, blocks all readers
func (c *Cache) Set(key, value string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.data[key] = value
}
```

---

## Channel Patterns

### ❌ BROKEN: Sending on Closed Channel

```go
// 🔴 THẢM HỌA — PANIC
ch := make(chan int)
close(ch)
ch <- 1  // panic: send on closed channel
```

### ✅ ĐÚNG: Only Sender Closes

```go
func producer(ch chan<- int) {
    defer close(ch)  // Sender owns closing
    for i := 0; i < 10; i++ {
        ch <- i
    }
}

func consumer(ch <-chan int) {
    for v := range ch {  // Exits when closed
        process(v)
    }
}
```

### ❌ BROKEN: Nil Channel

```go
// 🔴 THẢM HỌA — Blocks forever
var ch chan int
<-ch   // blocks forever
ch<-1  // blocks forever
```

### ✅ ĐÚNG: Disable Channel in Select

```go
// Nil channel is useful to disable a case in select
func process(input <-chan int, done <-chan struct{}) {
    for {
        select {
        case v, ok := <-input:
            if !ok {
                input = nil  // Disable this case
                continue
            }
            handle(v)
        case <-done:
            return
        }
    }
}
```

---

## Context Cancellation

### ❌ BROKEN: Ignoring Context

```go
// 🔴 BROKEN — Runs forever even when cancelled
func work(ctx context.Context) {
    for {
        doExpensiveOperation()  // Never checks ctx
    }
}
```

### ✅ ĐÚNG: Check Context Regularly

```go
func work(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
        }

        if err := doExpensiveOperation(ctx); err != nil {
            return err
        }
    }
}
```

### Context Timeout Pattern

```go
func callExternalService(ctx context.Context) (*Response, error) {
    // Create timeout from parent context
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return nil, err
    }

    resp, err := client.Do(req)
    if err != nil {
        if errors.Is(err, context.DeadlineExceeded) {
            return nil, fmt.Errorf("service timeout: %w", err)
        }
        return nil, err
    }

    return resp, nil
}
```

---

## Atomic Operations

### When to Use Atomic vs Mutex

| Use Case | Solution |
|----------|----------|
| Simple counter | atomic.Int64 |
| Flag (bool) | atomic.Bool |
| Pointer swap | atomic.Pointer[T] |
| Complex state | sync.Mutex |
| Multiple fields | sync.Mutex |

### Atomic Counter

```go
type Metrics struct {
    requests atomic.Int64
    errors   atomic.Int64
}

func (m *Metrics) IncRequests() {
    m.requests.Add(1)
}

func (m *Metrics) IncErrors() {
    m.errors.Add(1)
}

func (m *Metrics) Stats() (requests, errors int64) {
    return m.requests.Load(), m.errors.Load()
}
```

### Atomic Pointer for Config Reload

```go
type Config struct {
    Feature1 bool
    Feature2 string
}

var currentConfig atomic.Pointer[Config]

func init() {
    currentConfig.Store(&Config{})
}

func GetConfig() *Config {
    return currentConfig.Load()
}

func ReloadConfig() error {
    newConfig, err := loadFromFile()
    if err != nil {
        return err
    }
    currentConfig.Store(newConfig)  // Atomic swap
    return nil
}
```

---

## errgroup for Parallel Tasks

```go
import "golang.org/x/sync/errgroup"

func fetchAll(ctx context.Context, urls []string) ([]Response, error) {
    g, ctx := errgroup.WithContext(ctx)
    responses := make([]Response, len(urls))

    for i, url := range urls {
        i, url := i, url  // Capture loop variables
        g.Go(func() error {
            resp, err := fetch(ctx, url)
            if err != nil {
                return err  // Cancels other goroutines
            }
            responses[i] = resp
            return nil
        })
    }

    if err := g.Wait(); err != nil {
        return nil, err
    }
    return responses, nil
}
```

### With Limit

```go
func fetchAllLimited(ctx context.Context, urls []string) ([]Response, error) {
    g, ctx := errgroup.WithContext(ctx)
    g.SetLimit(10)  // Max 10 concurrent fetches

    responses := make([]Response, len(urls))

    for i, url := range urls {
        i, url := i, url
        g.Go(func() error {
            resp, err := fetch(ctx, url)
            if err != nil {
                return err
            }
            responses[i] = resp
            return nil
        })
    }

    return responses, g.Wait()
}
```

---

## Semaphore Pattern

```go
type Semaphore struct {
    sem chan struct{}
}

func NewSemaphore(n int) *Semaphore {
    return &Semaphore{sem: make(chan struct{}, n)}
}

func (s *Semaphore) Acquire(ctx context.Context) error {
    select {
    case s.sem <- struct{}{}:
        return nil
    case <-ctx.Done():
        return ctx.Err()
    }
}

func (s *Semaphore) Release() {
    <-s.sem
}

// Usage
sem := NewSemaphore(10)

for _, task := range tasks {
    task := task
    go func() {
        if err := sem.Acquire(ctx); err != nil {
            return
        }
        defer sem.Release()

        process(task)
    }()
}
```

---

## Once Pattern

```go
var (
    instance *Database
    once     sync.Once
)

func GetDB() *Database {
    once.Do(func() {
        instance = connectToDatabase()
    })
    return instance
}
```

### With Error Handling

```go
type singleton struct {
    once     sync.Once
    instance *Database
    err      error
}

var db singleton

func GetDB() (*Database, error) {
    db.once.Do(func() {
        db.instance, db.err = connectToDatabase()
    })
    return db.instance, db.err
}
```

---

## sync.Pool for Object Reuse

```go
var bufferPool = sync.Pool{
    New: func() interface{} {
        return make([]byte, 0, 4096)
    },
}

func process(data []byte) []byte {
    buf := bufferPool.Get().([]byte)
    defer func() {
        buf = buf[:0]  // Reset length
        bufferPool.Put(buf)
    }()

    // Use buf...
    buf = append(buf, data...)
    return buf
}
```

---

## Race Condition Detection

```bash
# ALWAYS run tests with race detector
go test -race ./...

# Run binary with race detector
go run -race main.go

# Build with race detector
go build -race -o myapp
```

---

## Checklist

- [ ] Every goroutine có exit path (context, done channel)
- [ ] WaitGroup.Add() called BEFORE goroutine starts
- [ ] Mutex always unlocked via defer
- [ ] No lock ordering violations
- [ ] Context propagated to all operations
- [ ] Only sender closes channel
- [ ] `go test -race ./...` passes
- [ ] Worker pool for unbounded work
- [ ] errgroup for parallel tasks with cancellation

---

## Quick Reference

| Pattern | Use Case |
|---------|----------|
| sync.WaitGroup | Wait for goroutines to finish |
| sync.Mutex | Protect shared state |
| sync.RWMutex | Read-heavy shared state |
| sync.Once | One-time initialization |
| sync.Pool | Object reuse |
| atomic.* | Simple counters/flags |
| errgroup | Parallel tasks with error handling |
| Semaphore | Rate limiting |
| context.WithCancel | Cancellation propagation |
| context.WithTimeout | Deadline propagation |

---

**Talk is cheap. Show me the code.**
