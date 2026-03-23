# Personal Finance Manager

A full-stack web application for comprehensive personal financial management, built with modern technologies and designed for intuitive tracking of accounts, transactions, budgets, and financial reports.

## Features

- **User Authentication**: Secure registration and login with JWT-based authentication using HTTP-only cookies
- **Account Management**: Create and manage multiple bank accounts and credit/debit cards
- **Transaction Tracking**: Record income and expense transactions with detailed categorization, payment method, and optional notes
- **Budget Estimates**: Set monthly budget estimates for different expense and income categories
- **Recurring Transactions**: Define recurring payments and income with automatic tracking
- **Financial Reports**: Generate monthly reports comparing estimated vs. actual spending
- **Dashboard**: Get a quick overview of your financial status with summary cards and budget alerts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn/ui |
| **Backend** | FastAPI, SQLAlchemy 2.x, Pydantic v2, Python-Jose |
| **Database** | PostgreSQL |
| **Deployment** | Docker & Docker Compose |
| **State Management** | TanStack React Query |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20 LTS (for local frontend development)
- Python 3.12 (for local backend development)

### Setup with Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd personal-financial-management

# Start all services (PostgreSQL, Backend, Frontend)
docker compose up

# Access the application
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Local Development Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
make migrate
make dev-backend

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
personal-financial-management/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── core/             # Core config, auth, database setup
│   │   ├── auth/             # Authentication module (MVC)
│   │   ├── accounts/         # Bank accounts & cards module (MVC)
│   │   ├── categories/       # Categories module (MVC)
│   │   ├── transactions/     # Transactions module (MVC)
│   │   ├── recurring/        # Recurring transactions module (MVC)
│   │   ├── estimates/        # Budget estimates module (MVC)
│   │   └── reports/          # Financial reports module (MVC)
│   ├── alembic/              # Database migrations
│   ├── main.py               # FastAPI application entry point
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── (auth)/           # Public routes (login, register)
│   │   ├── (app)/            # Protected routes (dashboard, pages)
│   │   ├── components/       # React components
│   │   └── lib/              # Utilities and API client
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Tailwind CSS config
│
├── docker-compose.yml        # Docker services configuration
├── Makefile                  # Development commands
└── README.md                 # This file
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  [Pages] → [Components] → [TanStack Query] → [API Client]   │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/REST
                              │
┌─────────────────────────────────────────────────────────────┐
│              Backend (FastAPI)                              │
│  [Routes] → [Controllers] → [Services] → [Database]         │
│  Auth • Accounts • Transactions • Categories                 │
│  Recurring • Estimates • Reports                             │
└─────────────────────────────────────────────────────────────┘
                              │
                         SQL/Alembic
                              │
┌─────────────────────────────────────────────────────────────┐
│          PostgreSQL Database                                 │
│  Users • Accounts • Cards • Transactions • Categories        │
│  Recurring • Estimates                                       │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### MVC Architecture
Both backend modules and frontend pages follow a Model-View-Controller pattern:
- **Model**: Data structures and database schemas
- **View**: UI components (frontend) or response schemas (backend)
- **Controller**: Route handlers and page components
- **Service**: Business logic for data operations

### Authentication
- Uses JWT tokens stored in HTTP-only cookies
- Access tokens expire after 30 minutes
- Refresh tokens expire after 7 days
- Automatic redirect to login on unauthorized access

### Database Design
- User isolation: All data belongs to authenticated users via FK constraints
- Soft deletes: Categories use `archived_at` instead of hard deletion
- Cascade deletes: User deletion removes all associated data
- Check constraints: Type and modality fields validated at database level

## Common Development Tasks

See detailed documentation in:
- **Backend**: [backend/README.md](./backend/README.md) - API routes, modules, database
- **Frontend**: [frontend/README.md](./frontend/README.md) - Pages, components, state management

## Available Commands

```bash
# Makefile commands (from root or backend directory)
make build              # Build Docker images
make up                 # Start all services with docker compose
make down               # Stop all services
make migrate            # Run database migrations
make dev-backend        # Run backend development server
make dev-frontend       # Run frontend development server
```

## API Documentation

The backend API has interactive documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

All API endpoints require authentication (except `/auth/register` and `/auth/login`).

## Environment Configuration

Create a `.env.local` file in the frontend directory and `.env` in the backend directory for local development:

```bash
# Backend .env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=finance
POSTGRES_USER=finance
POSTGRES_PASSWORD=finance
SECRET_KEY=your-secret-key-here

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Contributing

To contribute to this project:
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes with clear commit messages
3. Test your changes thoroughly
4. Submit a pull request with a clear description

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests (if applicable)
cd frontend
npm test
```

## Support

For issues, questions, or feature requests, please open an issue in the repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
