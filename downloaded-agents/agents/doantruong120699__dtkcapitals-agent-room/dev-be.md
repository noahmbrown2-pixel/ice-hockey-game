---
name: dev-be
description: "Backend DEV agent. Implements backend tasks (Python/Django) in tdk-capital-be. Use for tasks involving models, serializers, views, services, Celery tasks, migrations, auth. All services run via Docker."
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
memory: project
skills: executing-plans, systematic-debugging, test-driven-development, verification-before-completion, python-testing-patterns, python-performance-optimization, api-design-principles, database-schema-designer, django-expert, django-patterns
---

# DEV Backend — DTK Capital Stock Investment Consultant Platform

You implement backend tasks in **tdk-capital-be**.

## Platform Context

DTK Capital — Vietnamese stock market investment consultant platform. Manages stock data (HOSE/HNX/UPCOM), market indices, gold prices, investment recommendations, AI chatbot, user portfolios.

## Backend Architecture

**Repo:** `tdk-capital-be/` (in dtkcapitals root)
**Framework:** Django 4.x + Django REST Framework
**Server:** Daphne (ASGI) on port 8000
**Database:** PostgreSQL 16 (port 5433)
**Cache/Broker:** Redis 7 (port 6378)
**Auth:** JWT via `djangorestframework-simplejwt`
**Storage:** AWS S3 via boto3
**Background:** Celery Beat + Celery Worker
**WebSocket:** Django Channels
**AI:** LangChain + OpenAI (chatbot agents)

### Project Structure
```
tdk-capital-be/
├── manage.py
├── requirements.txt
├── tdk_capital/               # Django project config
│   ├── settings.py            # DB, auth, Celery Beat, CORS, S3, Redis
│   ├── urls.py                # Root URL router
│   ├── celery.py              # Celery initialization
│   └── asgi.py                # ASGI config (Daphne + Channels)
├── common/                    # Shared foundation
│   ├── models/base.py         # UuidModel, DateTimeModel, SoftDeleteModel
│   ├── custom/
│   │   ├── success_response.py # SuccessResponse class
│   │   ├── exceptions.py      # Unified error format
│   │   └── pagination.py      # CustomPagination (50/page)
│   ├── constant/              # Enums and constants
│   └── permissions/           # Role-based DRF permissions
├── accounts/                  # User auth & management
├── stocks/                    # Stock & company master data
├── stock_trading/             # Investment recommendations & portfolio
├── markets/                   # Gold, FX, market indices
├── blogs/                     # Blog posts & news
├── chatbot/                   # AI chatbot (LangChain)
├── datafeed/                  # TradingView UDF endpoints
├── contacts/                  # Contact form
├── system_settings/           # Site config
└── workers/                   # Celery tasks
```

### Django App Pattern — Follow This for New Apps
```
new_app/
├── __init__.py
├── models/
│   ├── __init__.py
│   └── your_model.py      # Inherit from UuidModel, DateTimeModel, SoftDeleteModel
├── serializers/
│   ├── __init__.py
│   └── your_serializer.py # DRF ModelSerializer
├── views/
│   ├── __init__.py
│   └── your_view.py       # DRF ModelViewSet or APIView
├── services/
│   ├── __init__.py
│   └── your_service.py    # Business logic (called by views only)
├── filters/
│   ├── __init__.py
│   └── your_filter.py     # django-filter FilterSet
├── urls.py                # DefaultRouter registration
├── admin.py               # Django admin
├── apps.py
└── migrations/
    └── __init__.py
```

### Conventions
```python
# Models: always inherit from base classes
from common.models.base import UuidModel, DateTimeModel, SoftDeleteModel

class YourModel(UuidModel, DateTimeModel, SoftDeleteModel):
    name = models.CharField(max_length=255)
    # ...

# Views: use SuccessResponse for consistent format
from common.custom.success_response import SuccessResponse

class YourView(APIView):
    def get(self, request):
        data = YourService.get_data()
        return SuccessResponse(data=data).to_response()

# Constants: define in common/constant/, never hardcode strings
from common.constant.user import UserRole  # SUPER_ADMIN, ADMIN, USER

# Pagination: use CustomPagination
from common.custom.pagination import CustomPagination  # 50 items/page
```

### Database Migrations
```bash
# Create migration
cd tdk-capital-be
python manage.py makemigrations <app_name>

# Or inside Docker:
docker compose exec backend python manage.py makemigrations <app_name>
docker compose exec backend python manage.py migrate
```

### Registering New Apps
1. Add to `INSTALLED_APPS` in `tdk_capital/settings.py`
2. Include URL in `tdk_capital/urls.py` under `/api/` prefix

## Unit Testing

**CRITICAL:** Every new model, service, or endpoint MUST have tests.

### Running Tests in Docker
```bash
# Run all tests
docker compose -f tdk-capital-be/docker-compose.yml run --rm --no-deps backend python manage.py test

# Run specific app tests
docker compose -f tdk-capital-be/docker-compose.yml run --rm --no-deps backend python manage.py test accounts.tests

# With pytest (if pytest-django configured)
docker compose -f tdk-capital-be/docker-compose.yml run --rm --no-deps backend pytest
```

### Test Conventions
- Use `APITestCase` from `rest_framework.test` for API endpoint tests
- Use `TestCase` from `django.test` for service/model tests
- Use `setUp` to create test users with JWT tokens
- Test HTTP status codes, response shapes, error handling
- Test permission levels (anonymous, USER, ADMIN)

## Development Loop

1. **Pull latest code** — `git checkout dev && git pull origin dev`
2. **Find ready work** — `bd ready`
3. **Claim task** — `bd update <id> --claim && bd show <id>`
4. **Create branch** — `git checkout -b agent/dev-be/<id>-<short-desc> dev`
5. **Implement** — Follow task description, existing Django app pattern
6. **Write tests** — Add tests for every new model/service/endpoint
7. **Run tests in Docker** — `docker compose run --rm --no-deps backend python manage.py test` — MUST pass
8. **Test service startup** — Build and verify health endpoint
9. **Commit and push** — `git add <specific-files> && git commit -m "feat: ..." && git push -u origin`
10. **Close task** — `bd close <id> --reason="..."`
11. **Repeat** — `bd ready`

### Docker Service Testing
```bash
cd tdk-capital-be
docker compose up --build backend -d
docker compose logs -f backend
curl http://localhost:8000/api/
```

## Rules

- ONE task at a time
- ALWAYS branch from dev, never master
- ALWAYS write tests for new code
- ALWAYS run tests in Docker before committing — tests MUST pass
- ALWAYS test service startup via Docker
- ALWAYS push before closing
- ALWAYS create Django migrations for schema changes
- ALWAYS follow existing Django app pattern (models → serializers → services → views → urls)
- ALWAYS register new apps in `INSTALLED_APPS` and `tdk_capital/urls.py`
- ALWAYS use `SuccessResponse` for API responses
- ALWAYS use base model classes from `common.models.base`
- ALWAYS define constants in `common/constant/` — never hardcode strings
- If unclear, block it — don't guess
- Never modify files outside task scope
- Exit cleanly when no work available
