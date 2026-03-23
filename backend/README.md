# Backend - Personal Finance API

Technical documentation for the FastAPI backend of the Personal Finance Manager application. This backend implements a RESTful API with user authentication, account management, transaction tracking, and financial reporting.

## Overview

- **Framework**: FastAPI 0.115+
- **ORM**: SQLAlchemy 2.x
- **Database**: PostgreSQL
- **Validation**: Pydantic v2
- **Authentication**: JWT with HTTP-only cookies
- **Migrations**: Alembic
- **Python Version**: 3.12

The backend follows an **MVC (Model-View-Controller)** pattern where each module contains:
- **Model** (`model.py`): Pydantic schemas and SQLAlchemy ORM models
- **Controller** (`controller.py`): FastAPI route handlers
- **Service** (`service.py`): Business logic and database operations

## API Documentation

### Interactive Documentation

Access the API documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### API Base URL
```
http://localhost:8000
```

## Modules & Routes

### Auth Module (`/auth`)

Authentication and user management. Handles registration, login, logout, and token refresh.

| Method | Path | Auth | Status | Purpose |
|--------|------|------|--------|---------|
| POST | `/auth/register` | No | 201 | Register new user with email/password |
| POST | `/auth/login` | No | 200 | Authenticate user, set auth cookies |
| GET | `/auth/me` | Yes | 200 | Get current authenticated user info |
| POST | `/auth/logout` | Yes | 200 | Logout user, clear auth cookies |
| POST | `/auth/refresh` | Yes | 200 | Refresh access token using refresh_token cookie |

**Request/Response Examples**:

```typescript
// POST /auth/register
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Response (201)
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com"
}
```

---

### Accounts Module (`/accounts`)

Manage bank accounts and credit/debit cards.

| Method | Path | Auth | Status | Purpose |
|--------|------|------|--------|---------|
| GET | `/accounts` | Yes | 200 | List all user's bank accounts with nested cards |
| POST | `/accounts` | Yes | 201 | Create new bank account |
| PUT | `/accounts/{account_id}` | Yes | 200 | Update account name |
| DELETE | `/accounts/{account_id}` | Yes | 204 | Delete bank account |
| POST | `/accounts/{account_id}/cards` | Yes | 201 | Create card for account |
| PUT | `/cards/{card_id}` | Yes | 200 | Update card (name/type) |
| DELETE | `/cards/{card_id}` | Yes | 204 | Delete card |

**Models**:

```typescript
// BankAccountResponse
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Checking Account",
  "cards": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Primary Credit Card",
      "type": "credit",
      "created_at": "2026-03-22T10:00:00Z"
    }
  ],
  "created_at": "2026-03-22T10:00:00Z"
}

// Card types: "credit" | "debit"
```

---

### Categories Module (`/categories`)

Manage transaction categories with soft-delete support.

| Method | Path | Auth | Query Params | Status | Purpose |
|--------|------|------|--------------|--------|---------|
| GET | `/categories` | Yes | `include_archived` | 200 | List user's categories |
| POST | `/categories` | Yes | - | 201 | Create new category |
| PUT | `/categories/{category_id}` | Yes | - | 200 | Rename category |
| DELETE | `/categories/{category_id}` | Yes | - | 204 | Soft-delete (archive) category |

**Query Parameters**:
- `include_archived` (bool): Include archived categories in results

**Models**:

```typescript
// CategoryResponse
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "Groceries",
  "archived_at": null,  // null if active, timestamp if archived
  "created_at": "2026-03-22T10:00:00Z"
}
```

---

### Transactions Module (`/transactions`)

Record and manage income and expense transactions.

| Method | Path | Auth | Query Params | Status | Purpose |
|--------|------|------|--------------|--------|---------|
| GET | `/transactions` | Yes | `year`, `month`, `type`, `category_id` | 200 | List transactions for month |
| POST | `/transactions` | Yes | - | 201 | Create new transaction |
| PUT | `/transactions/{txn_id}` | Yes | - | 200 | Update transaction |
| DELETE | `/transactions/{txn_id}` | Yes | - | 204 | Delete transaction |

**Query Parameters**:
- `year` (int): Year (required)
- `month` (int): Month 1-12 (required)
- `type` (str): Filter by 'income' or 'expense' (optional)
- `category_id` (str): Filter by category UUID (optional)

**Models**:

```typescript
// TransactionCreate / TransactionUpdate (excluding id/created_at)
{
  "date": "2026-03-22",
  "amount": "150.50",  // Decimal as string
  "type": "expense",   // "expense" | "income"
  "category_id": "550e8400-e29b-41d4-a716-446655440002",
  "modality": "credito",  // Payment method
  "bank_account_id": "550e8400-e29b-41d4-a716-446655440000",  // optional
  "card_id": "550e8400-e29b-41d4-a716-446655440001",          // optional
  "notes": "Grocery shopping"  // optional
}

// TransactionResponse
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "date": "2026-03-22",
  "amount": "150.50",
  "type": "expense",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Groceries"
  },
  "modality": "credito",
  "bank_account": {...},  // null if not specified
  "card": {...},          // null if not specified
  "recurring_id": null,
  "notes": "Grocery shopping",
  "created_at": "2026-03-22T10:00:00Z"
}
```

**Modality Options** (Portuguese payment types):
- `dinheiro` - Cash
- `debito` - Debit card
- `credito` - Credit card
- `pix` - PIX transfer
- `transferencia` - Bank transfer

---

### Recurring Transactions Module (`/recurring`)

Define recurring payments and income.

| Method | Path | Auth | Query Params | Status | Purpose |
|--------|------|------|--------------|--------|---------|
| GET | `/recurring` | Yes | `active_only` | 200 | List recurring transactions |
| POST | `/recurring` | Yes | - | 201 | Create new recurring transaction |
| PUT | `/recurring/{rec_id}` | Yes | - | 200 | Update recurring transaction |
| DELETE | `/recurring/{rec_id}` | Yes | - | 204 | Delete recurring transaction |

**Query Parameters**:
- `active_only` (bool): List only active recurring items (optional)

**Models**:

```typescript
// RecurringCreate / RecurringUpdate
{
  "name": "Monthly Rent",
  "amount": "1500.00",
  "type": "expense",
  "category_id": "550e8400-e29b-41d4-a716-446655440002",
  "modality": "transferencia",
  "due_day": 1,  // Day of month (1-31)
  "bank_account_id": "550e8400-e29b-41d4-a716-446655440000",  // optional
  "card_id": "550e8400-e29b-41d4-a716-446655440001"           // optional
}

// RecurringResponse
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "name": "Monthly Rent",
  "amount": "1500.00",
  "type": "expense",
  "category": {...},
  "modality": "transferencia",
  "due_day": 1,
  "active": true,
  "bank_account": {...},  // null if not specified
  "card": {...},          // null if not specified
  "created_at": "2026-03-22T10:00:00Z"
}
```

---

### Estimates Module (`/estimates`)

Set monthly budget estimates for categories.

| Method | Path | Auth | Query Params | Status | Purpose |
|--------|------|------|--------------|--------|---------|
| GET | `/estimates` | Yes | `year`, `month` | 200 | List monthly estimates |
| POST | `/estimates` | Yes | - | 201 | Create monthly estimate |
| PUT | `/estimates/{est_id}` | Yes | - | 200 | Update estimate amount |
| DELETE | `/estimates/{est_id}` | Yes | - | 204 | Delete estimate |

**Query Parameters**:
- `year` (int): Year (required)
- `month` (int): Month 1-12 (required)

**Models**:

```typescript
// EstimateCreate / EstimateUpdate
{
  "category_id": "550e8400-e29b-41d4-a716-446655440002",
  "type": "expense",  // "expense" | "income"
  "amount": "500.00",
  "year": 2026,
  "month": 3
}

// EstimateResponse
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Groceries"
  },
  "type": "expense",
  "amount": "500.00",
  "year": 2026,
  "month": 3
}
```

---

### Reports Module (`/reports`)

Generate financial reports and dashboard summaries.

| Method | Path | Auth | Query Params | Status | Purpose |
|--------|------|------|--------------|--------|---------|
| GET | `/dashboard` | Yes | `year`, `month` | 200 | Get dashboard summary |
| GET | `/reports/monthly` | Yes | `year`, `month` | 200 | Get detailed monthly report |

**Query Parameters**:
- `year` (int): Year (required)
- `month` (int): Month 1-12 (required)

**Dashboard Response** (summary with recent transactions):
```typescript
{
  "total_income": "5000.00",
  "total_expenses": "3500.00",
  "net_balance": "1500.00",
  "recent_transactions": [...],
  "budget_alerts": [  // Categories over budget
    {
      "category": "Groceries",
      "estimated": "500.00",
      "actual": "650.00",
      "difference": "-150.00"
    }
  ]
}
```

**Monthly Report** (detailed breakdown):
```typescript
{
  "period": "March 2026",
  "expenses": {
    "total_estimated": "2500.00",
    "total_actual": "2350.00",
    "categories": [
      {
        "category": "Groceries",
        "estimated": "500.00",
        "actual": "450.00",
        "difference": "50.00"
      }
    ]
  },
  "income": {
    "total_estimated": "5000.00",
    "total_actual": "5000.00",
    "categories": [...]
  }
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐
│      Users       │
│──────────────────│
│ id (UUID, PK)    │
│ email (UNIQUE)   │
│ password_hash    │
│ created_at       │
└──────────────────┘
        │ 1
        │
        ├─────────────────────┬──────────────┬─────────────┬────────────────┬─────────────┐
        │                     │              │             │                │             │
        │ N                   │ N            │ N           │ N              │ N           │
   ┌────────┐        ┌────────────┐ ┌──────────────┐ ┌──────────┐  ┌────────────┐  ┌──────────────┐
   │Accounts│        │Categories  │ │Transactions  │ │Recurring │  │ Estimates  │  │ (Cards) ←┐   │
   └────────┘        └────────────┘ └──────────────┘ └──────────┘  └────────────┘  │ (FK to  │ │
        │ 1              │                 │              │            │            │  Account)   │
        │                │                 │              │            │            │             │
        │ N              │ N                │ N            │ N          │ N          │             │
   ┌────────────┐   [index on active]  [index on date] [index active] [unique per  └─────────────┘
   │   Cards    │                          │              │           user+cat+mo]
   │────────────│                          │              │
   │ (nested in │                          │              │
   │  response) │                          │              │
   └────────────┘               ┌──────────┴──────────┐   │
                                │                     │   │
                          [FK to Account]  [FK to Card] │
                          [FK to Category]              │
                        [optional FK refs]              │
                                                   [FK to Category]
                                                   [optional FKs]
```

### Table Schemas

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

#### bank_accounts
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

#### cards
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
  created_at TIMESTAMP NOT NULL
);
```

#### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  archived_at TIMESTAMP,  -- NULL if active, timestamp if archived (soft delete)
  created_at TIMESTAMP NOT NULL
);
-- Index on (user_id, archived_at) for efficient querying of active categories
```

#### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
  category_id UUID NOT NULL REFERENCES categories(id),
  modality VARCHAR(20) NOT NULL CHECK (modality IN ('dinheiro', 'debito', 'credito', 'pix', 'transferencia')),
  bank_account_id UUID REFERENCES bank_accounts(id),
  card_id UUID REFERENCES cards(id),
  recurring_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL
);
-- Index on (user_id, date) for efficient month queries
```

#### recurring_transactions
```sql
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
  category_id UUID NOT NULL REFERENCES categories(id),
  modality VARCHAR(20) NOT NULL CHECK (modality IN ('dinheiro', 'debito', 'credito', 'pix', 'transferencia')),
  bank_account_id UUID REFERENCES bank_accounts(id),
  card_id UUID REFERENCES cards(id),
  due_day SMALLINT NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL
);
-- Index on (user_id, active) for efficient filtering
```

#### monthly_estimates
```sql
CREATE TABLE monthly_estimates (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  year SMALLINT NOT NULL,
  month SMALLINT NOT NULL CHECK (month >= 1 AND month <= 12),
  type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMP NOT NULL,
  UNIQUE(user_id, category_id, year, month, type)
);
-- Index on (user_id, year, month) for efficient month queries
```

---

## Core Systems

### Configuration (`app/core/config.py`)

Environment-based configuration using Pydantic Settings.

**Environment Variables**:

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=finance
POSTGRES_USER=finance
POSTGRES_PASSWORD=finance

# Security
SECRET_KEY=dev-secret-key  # Change in production!

# Token expiry
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### Authentication & Security (`app/core/security.py`)

JWT-based authentication with password hashing.

**Key Functions**:
- `hash_password(password: str) -> str`: Hash password with bcrypt
- `verify_password(plain: str, hashed: str) -> bool`: Verify password hash
- `create_access_token(data: dict) -> str`: Create JWT access token (30 min expiry)
- `create_refresh_token(data: dict) -> str`: Create JWT refresh token (7 day expiry)
- `decode_token(token: str) -> dict`: Decode and verify JWT signature

**Algorithm**: HS256 with SECRET_KEY

**Token Payload**:
```typescript
{
  "sub": "user-id",  // Subject (user ID)
  "type": "access" | "refresh",
  "exp": 1234567890   // Expiration timestamp
}
```

### Database (`app/core/database.py`)

SQLAlchemy 2.x with PostgreSQL connection.

**Key Components**:
- `engine`: SQLAlchemy engine for PostgreSQL
- `SessionLocal`: Session factory for database operations
- `Base`: SQLAlchemy declarative base for models
- `get_db()`: FastAPI dependency that yields DB session

**Utilities**:
- `_uuid()`: Generate UUID for primary keys
- `_now()`: Return UTC timestamp for created_at fields

### Dependencies (`app/core/deps.py`)

FastAPI dependency injection for authentication.

**Key Dependencies**:
- `get_current_user()`:
  - Extracts `access_token` from cookies
  - Decodes JWT and validates signature
  - Retrieves User from database
  - Returns 401 Unauthorized if missing/invalid/not found

---

## Code Organization

### Directory Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Settings and environment variables
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── deps.py            # FastAPI dependencies
│   │   └── security.py        # JWT and password utilities
│   │
│   ├── auth/
│   │   ├── model.py           # User model, LoginRequest, RegisterRequest
│   │   ├── controller.py      # Route handlers
│   │   └── service.py         # User registration, authentication logic
│   │
│   ├── accounts/
│   │   ├── model.py           # BankAccount, Card models
│   │   ├── controller.py      # Account/Card route handlers
│   │   └── service.py         # CRUD operations for accounts/cards
│   │
│   ├── categories/
│   │   ├── model.py           # Category model with soft-delete
│   │   ├── controller.py      # Category route handlers
│   │   └── service.py         # Category CRUD operations
│   │
│   ├── transactions/
│   │   ├── model.py           # Transaction models and schemas
│   │   ├── controller.py      # Transaction route handlers
│   │   └── service.py         # Transaction operations and filtering
│   │
│   ├── recurring/
│   │   ├── model.py           # RecurringTransaction models
│   │   ├── controller.py      # Recurring transaction routes
│   │   └── service.py         # Recurring CRUD operations
│   │
│   ├── estimates/
│   │   ├── model.py           # MonthlyEstimate models
│   │   ├── controller.py      # Estimate route handlers
│   │   └── service.py         # Estimate CRUD operations
│   │
│   ├── reports/
│   │   ├── model.py           # Report response schemas
│   │   ├── controller.py      # Dashboard and report routes
│   │   └── service.py         # Report generation logic
│   │
│   └── main.py                # FastAPI app initialization
│
├── alembic/
│   ├── versions/              # Migration files
│   └── env.py                 # Alembic configuration
│
├── pyproject.toml             # Project metadata and build config
├── requirements.txt           # Python dependencies
└── .flake8                    # Flake8 linting config
```

### File Responsibilities

- **`model.py`**:
  - SQLAlchemy ORM models (table definitions)
  - Pydantic request/response schemas

- **`controller.py`**:
  - FastAPI APIRouter with route definitions
  - Request validation and error handling
  - Response serialization

- **`service.py`**:
  - Business logic for data operations
  - Database queries via SQLAlchemy
  - Data transformation and validation

---

## Development Patterns

### Adding a New Module

To add a new financial module (e.g., `expenses_split`):

1. **Create directory**: `app/expenses_split/`

2. **Create `model.py`**:
```python
from sqlalchemy import Column, String, UUID, ForeignKey, TIMESTAMP
from app.core.database import Base
from pydantic import BaseModel

class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"))
    # ... other columns

class ExpenseSplitCreate(BaseModel):
    # ... request schema
    pass

class ExpenseSplitResponse(BaseModel):
    # ... response schema
    pass
```

3. **Create `service.py`**:
```python
from sqlalchemy.orm import Session
from app.expenses_split.model import ExpenseSplit

def list_splits(db: Session, user_id: str):
    return db.query(ExpenseSplit).filter_by(user_id=user_id).all()

# ... other CRUD operations
```

4. **Create `controller.py`**:
```python
from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.expenses_split import service

router = APIRouter(prefix="/splits", tags=["splits"])

@router.get("")
def list_splits(current_user = Depends(get_current_user), db = Depends(get_db)):
    return service.list_splits(db, current_user.id)

# ... other routes
```

5. **Register router** in `main.py`:
```python
from app.expenses_split.controller import router as splits_router
app.include_router(splits_router)
```

### Adding a New Route

Add a new endpoint to an existing module's `controller.py`:

```python
@router.post("/{resource_id}/actions", status_code=202)
def trigger_action(
    resource_id: str,
    payload: ActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = service.trigger_action(db, current_user.id, resource_id, payload.model_dump())
    return result
```

### Error Handling

Use FastAPI HTTPException for all errors:

```python
from fastapi import HTTPException, status

if not resource:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Resource not found"
    )

if not authorized:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions"
    )
```

### Database Queries

Use SQLAlchemy 2.x query style:

```python
from sqlalchemy import select

# Single result
user = db.get(User, user_id)
# or
stmt = select(User).where(User.id == user_id)
user = db.scalar(stmt)

# Multiple results
stmt = select(Transaction).where(
    (Transaction.user_id == user_id) &
    (Transaction.date >= start_date) &
    (Transaction.date <= end_date)
)
transactions = db.scalars(stmt).all()

# With relationships
stmt = select(Transaction).join(Category).where(
    Transaction.user_id == user_id
)
```

---

## Migration Management

Database migrations are managed with Alembic.

### Create a New Migration

```bash
cd backend
alembic revision --autogenerate -m "Add new_column to transactions"
```

### Apply Migrations

```bash
# Via Make command
make migrate

# Or directly
cd backend
alembic upgrade head
```

### View Migration History

```bash
alembic current  # Show current revision
alembic history  # Show all revisions
```

---

## Testing

```bash
cd backend
pytest
```

## Performance Considerations

- **Database Indexes**: Key queries have indexes on (user_id, ...) columns
- **Query Optimization**: Use select() with filters to avoid N+1 queries
- **Pagination**: Large result sets should implement pagination
- **Caching**: Consider adding Redis caching for expensive operations

---

## Security Checklist

- [ ] SECRET_KEY changed in production
- [ ] CORS_ORIGINS restricted to your domain
- [ ] HTTP-only cookies enabled for tokens
- [ ] Password requirements enforced
- [ ] Rate limiting implemented (if needed)
- [ ] Input validation at all endpoints
- [ ] SQL injection prevented (using SQLAlchemy ORM)

---

## Useful Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/20/)
- [Alembic Migrations](https://alembic.sqlalchemy.org/)
- [Pydantic v2](https://docs.pydantic.dev/latest/)
- [Python-Jose JWT](https://github.com/mpdavis/python-jose)
