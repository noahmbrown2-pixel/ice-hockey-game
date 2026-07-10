# Mode: Debug - FORJA

> Use este modo para troubleshooting, investigação de erros e diagnóstico de problemas.

---

## Antes de Debugar

1. **Ler a fonte de verdade:**

   - `docs/ESTADO_ATUAL_DO_SISTEMA.md`
   - Documentos `.github/*.md` relevantes
   - Logs de auditoria e observabilidade

2. **Entender o contexto:**

   - Módulo ou feature com problema
   - Stack trace ou mensagem de erro
   - Passos para reproduzir
   - Ambiente (dev, staging, produção)

3. **Verificar arquitetura:**
   - Clean Architecture
   - Multi-tenancy (tenant_id)
   - RBAC (roles e permissões)

---

## Processo de Debugging

### 1. Análise Inicial

```bash
# Verificar logs do backend
tail -f backend/logs/app.log

# Verificar logs do frontend (browser console)
# F12 > Console

# Verificar logs de auditoria
SELECT * FROM audit_logs
WHERE tenant_id = $1
ORDER BY created_at DESC
LIMIT 100;
```

### 2. Identificar a Camada

| Sintoma            | Camada Provável     | Ação                              |
| ------------------ | ------------------- | --------------------------------- |
| 404 Not Found      | Presentation/Router | Verificar rota registrada         |
| 400 Bad Request    | Handler/Validation  | Verificar binding e validação     |
| 403 Forbidden      | RBAC/Security       | Verificar role e permissões       |
| 409 Conflict       | Use Case/Domain     | Verificar invariantes e conflitos |
| 500 Internal Error | Infrastructure/DB   | Verificar logs e queries          |

### 3. Debug por Camada

#### Presentation (Handler)

```go
// ✅ Adicionar logs de debug
func (h *Handler) CreateAppointment(c echo.Context) error {
    h.logger.Debug("CreateAppointment called",
        zap.String("path", c.Path()),
        zap.String("method", c.Request().Method),
    )

    var req CreateAppointmentRequest
    if err := c.Bind(&req); err != nil {
        h.logger.Error("Failed to bind request", zap.Error(err))
        return err
    }

    h.logger.Debug("Request bound successfully",
        zap.Any("request", req),
    )

    // ...
}
```

#### Application (Use Case)

```go
// ✅ Adicionar logs de debug
func (uc *CreateAppointmentUseCase) Execute(ctx context.Context, req CreateAppointmentRequest) (*Appointment, error) {
    tenantID := getTenantIDFromContext(ctx)
    userID := getUserIDFromContext(ctx)
    role := getRoleFromContext(ctx)

    uc.logger.Debug("CreateAppointment use case",
        zap.String("tenant_id", tenantID),
        zap.String("user_id", userID),
        zap.String("role", role),
        zap.Any("request", req),
    )

    // Validar RBAC
    if !uc.rbac.CanCreateAppointment(ctx, tenantID, userID, role, req.ProfessionalID) {
        uc.logger.Warn("RBAC violation",
            zap.String("user_id", userID),
            zap.String("role", role),
            zap.String("professional_id", req.ProfessionalID),
        )
        return nil, ErrForbidden
    }

    // ...
}
```

#### Infrastructure (Repository)

```go
// ✅ Adicionar logs de debug
func (r *AppointmentRepository) Create(ctx context.Context, req CreateAppointmentRequest) (*Appointment, error) {
    r.logger.Debug("Creating appointment",
        zap.String("tenant_id", req.TenantID),
        zap.String("professional_id", req.ProfessionalID),
        zap.String("customer_id", req.CustomerID),
    )

    appointment, err := r.queries.CreateAppointment(ctx, CreateAppointmentParams{
        TenantID:      req.TenantID,
        ProfessionalID: req.ProfessionalID,
        CustomerID:    req.CustomerID,
        // ...
    })

    if err != nil {
        r.logger.Error("Failed to create appointment",
            zap.Error(err),
            zap.String("tenant_id", req.TenantID),
        )
        return nil, err
    }

    return appointment, nil
}
```

#### Frontend (TanStack Query)

```typescript
// ✅ Adicionar logs de debug
export function useAppointments(date: Date) {
  return useQuery({
    queryKey: ["appointments", date],
    queryFn: async () => {
      console.log("Fetching appointments for date:", date);
      const data = await appointmentService.getByDate(date);
      console.log("Appointments fetched:", data);
      return data;
    },
    onError: (error) => {
      console.error("Failed to fetch appointments:", error);
    },
  });
}
```

---

## Problemas Comuns

### 1. 403 Forbidden

**Sintoma:** Usuário recebe erro 403 ao acessar recurso

**Possíveis causas:**

- Role não tem permissão
- Barbeiro tentando acessar dados de outro barbeiro
- Middleware RBAC não configurado
- Use Case não valida RBAC

**Debug:**

```go
// Verificar role no contexto
role := c.Get("role").(string)
fmt.Printf("User role: %s\n", role)

// Verificar se role está na lista permitida
allowedRoles := []string{OWNER, MANAGER, BARBER, RECEPTIONIST}
for _, allowed := range allowedRoles {
    if role == allowed {
        fmt.Printf("Role %s is allowed\n", role)
    }
}
```

**Referência:** `.github/SECURITY_RBAC_POLICY.md`

### 2. Tenant Bypass

**Sintoma:** Usuário vê dados de outro tenant

**Possíveis causas:**

- Query SQL sem filtro de tenant_id
- tenant_id não extraído do JWT
- tenant_id vindo do payload

**Debug:**

```sql
-- Verificar se query tem filtro de tenant_id
SELECT * FROM appointments WHERE tenant_id = $1;

-- Verificar dados com tenant_id incorreto
SELECT * FROM appointments WHERE tenant_id != current_tenant_id();
```

**Referência:** `.github/MULTI_TENANT_ENFORCEMENT.md`

### 3. SQL Injection

**Sintoma:** Erro de SQL ou comportamento inesperado

**Possíveis causas:**

- SQL dinâmico sem parametrização
- Concatenação de strings em queries

**Debug:**

```go
// Verificar se usa SQLC
// ❌ ERRADO
query := fmt.Sprintf("SELECT * FROM appointments WHERE id = '%s'", id)

// ✅ CORRETO
// name: GetAppointment :one
SELECT * FROM appointments WHERE id = $1;
```

**Referência:** `.github/DATA_LAYER_RULES_SQLC.md`

### 4. Float para Valores Financeiros

**Sintoma:** Arredondamento incorreto em valores monetários

**Possíveis causas:**

- Usando float64 para dinheiro
- Perda de precisão em cálculos

**Debug:**

```go
// Verificar se usa Money Value Object
// ❌ ERRADO
type Price float64

// ✅ CORRETO
type Money struct {
    value int64 // centavos
}
```

**Referência:** `.github/BACKEND_STANDARDS_GO.md`

### 5. Frontend - TanStack Query

**Sintoma:** Dados não atualizados ou em cache

**Possíveis causas:**

- Query não invalidada após mutation
- Stale time muito longo
- Query key incorreta

**Debug:**

```typescript
// Verificar se invalida queries após mutation
const { mutate } = useCreateAppointment();

mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
  },
});
```

**Referência:** `.github/FRONTEND_ARCHITECTURE_NEXTJS.md`

---

## Logs de Auditoria

### Consultar Logs

```sql
-- Logs de um usuário específico
SELECT * FROM audit_logs
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 50;

-- Logs de um tenant específico
SELECT * FROM audit_logs
WHERE tenant_id = $1
ORDER BY created_at DESC
LIMIT 50;

-- Logs de uma ação específica
SELECT * FROM audit_logs
WHERE action = $1
ORDER BY created_at DESC
LIMIT 50;
```

### Analisar Logs

```go
// Verificar logs de uma ação específica
logs, err := auditLogRepository.GetByAction(ctx, "appointment.created")
if err != nil {
    return err
}

for _, log := range logs {
    fmt.Printf("User: %s, Tenant: %s, Action: %s, Details: %s\n",
        log.UserID, log.TenantID, log.Action, log.Details)
}
```

---

## Checklist de Debugging

### Backend

- [ ] Logs de debug adicionados
- [ ] Stack trace analisado
- [ ] Camada identificada (Handler, Use Case, Repository)
- [ ] tenant_id verificado
- [ ] RBAC verificado
- [ ] SQL queries verificadas
- [ ] Logs de auditoria consultados

### Frontend

- [ ] Console do navegador verificado
- [ ] Network tab verificada
- [ ] TanStack Query logs verificados
- [ ] API responses verificadas
- [ ] Errors handling verificado

### Multi-tenancy

- [ ] tenant_id extraído do JWT
- [ ] Queries filtram por tenant_id
- [ ] Nenhum JOIN entre tenants

### RBAC

- [ ] Role verificada no contexto
- [ ] Middleware RBAC aplicado
- [ ] Use Case valida RBAC
- [ ] Logs de auditoria gerados

---

## Ferramentas de Debug

### Backend

```bash
# Logs em tempo real
tail -f backend/logs/app.log

# Logs com filtro
grep "ERROR" backend/logs/app.log

# Logs de um tenant específico
grep "tenant_id=abc123" backend/logs/app.log
```

### Frontend

```javascript
// Console do navegador
console.log("Debug:", data);

// Network tab
// Verificar requests/responses

// React DevTools
// Verificar estado de componentes
```

### Database

```sql
-- Verificar dados
SELECT * FROM appointments WHERE id = $1;

-- Verificar índices
EXPLAIN ANALYZE SELECT * FROM appointments WHERE tenant_id = $1;

-- Verificar locks
SELECT * FROM pg_stat_activity WHERE datname = 'nexo';
```

---

## Antes de Propor Solução

- [ ] Raiz do problema identificada
- [ ] Camada afetada identificada
- [ ] Logs analisados
- [ ] Arquitetura respeitada
- [ ] Solução não quebra regras do FORJA
- [ ] Solução documentada com evidências
