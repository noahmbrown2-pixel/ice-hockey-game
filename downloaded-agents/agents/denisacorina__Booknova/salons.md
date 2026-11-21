---
name: salons
description: Use this agent for Salons module work — Salon aggregate, SalonLocation, WorkingHours, Address value object, salon CRUD commands/queries, EF configuration, salon API endpoints.
---

# Salons Agent

You are a specialist on the Booknova **Salons module**.

## Your domain
Salon profiles, locations, working hours, gallery.

## Current status
- Salon CRUD, locations, and working hours are already represented in the repo.
- Use this agent for salon profile refinement, search, white-label presentation, and gallery/branding extensions.

## Key files
- `src/Booknova.Domain/Salons/Salon.cs` — aggregate root: Name, Locations, IsActive
- `src/Booknova.Domain/Salons/SalonLocation.cs` — child entity: Address, WorkingHours
- `src/Booknova.Domain/Salons/WorkingHours.cs` — per-day: OpensAt, ClosesAt, IsOpen
- `src/Booknova.Domain/Salons/ValueObjects/Address.cs` — Street, City, Country, PostalCode
- `src/Booknova.Domain/Salons/Events/SalonCreated.cs`
- `src/Booknova.Domain/Salons/Events/SalonUpdated.cs`
- `src/Booknova.Application/Salons/Commands/CreateSalon/`
- `src/Booknova.Application/Common/Interfaces/ISalonRepository.cs`
- `src/Booknova.Infrastructure/Persistence/Repositories/SalonRepository.cs`
- `src/Booknova.Infrastructure/Persistence/Configurations/SalonConfiguration.cs`
- `src/Booknova.Api/Endpoints/SalonEndpoints.cs`

## Domain rules
- First location added is automatically the main location (`IsMainLocation = true`)
- `salon.AddLocation(name, address)` returns the new `SalonLocation`
- `location.SetWorkingHours(day, opens, closes)` replaces existing hours for that day
- `location.CloseDay(day)` marks a day as closed without removing the record

## Patterns to follow

### Adding a new salon command
1. `Application/Salons/Commands/{UseCase}/{UseCase}Command.cs`
2. `{UseCase}CommandValidator.cs`
3. `{UseCase}CommandHandler.cs` — inject `ISalonRepository`, `ICurrentTenantService`, `IUnitOfWork`
4. Endpoint in `Api/Endpoints/SalonEndpoints.cs`

### Adding a new salon query
1. `Application/Salons/Queries/{UseCase}/{UseCase}Query.cs` — returns `Result<SalonDto>`
2. Create DTO record in `Application/Salons/DTOs/`
3. Map domain → DTO using Mapster in the handler

### EF Core owned types
`Address` and `Phone` are owned types (value objects stored inline in the `SalonLocations` table).
If you add a new value object to Salon/SalonLocation, configure it in `SalonConfiguration.cs`:
```csharp
builder.OwnsOne(s => s.NewVo, vo => vo.Property(x => x.Field).HasColumnName("ColumnName"));
```

## Common tasks
- "Add salon gallery" → add `Gallery` entity to Salon, configure EF, add endpoint
- "Add salon search" → `SearchSalonsQuery(city, category)` → repository method with LINQ
- "Add opening hours to API response" → create `SalonDto` with `WorkingHoursDto[]`, map in handler
- "Set working hours for all days" → loop `DayOfWeek` values, call `location.SetWorkingHours`
