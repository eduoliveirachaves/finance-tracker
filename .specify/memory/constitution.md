<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Modified principles: None
Added sections:
  - Principle VI: Backend Architecture (MVC Pattern)
Removed sections: N/A
Templates checked:
  ✅ .specify/templates/plan-template.md — Technical Context section aligns with stack
  ✅ .specify/templates/spec-template.md — No principle-driven sections require changes
  ✅ .specify/templates/tasks-template.md — No structural changes needed
  ⚠ No command files found at .specify/templates/commands/ — no updates needed
Deferred TODOs: None
-->

# Personal Financial Management Constitution

## Core Principles

### I. Simplicity & Clarity

Code MUST be simple, readable, and maintainable above all else. Clean Code principles
apply at all times: functions do one thing, names are descriptive, abstractions earn
their existence. Complexity MUST be justified — if a simpler approach exists, it MUST
be used. YAGNI (You Aren't Gonna Need It) is enforced: do not build for hypothetical
future requirements.

### II. Technology Stack Adherence

All implementations MUST use the approved stack and LTS versions only:

- **Backend**: Python 3.12 with FastAPI
- **Database**: PostgreSQL (LTS)
- **Frontend**: Next.js (LTS)
- **Infrastructure**: Docker (all services containerized)

Deviations from this stack require explicit amendment to this constitution before
any work begins.

### III. Containerization

Every service (backend, frontend, database) MUST run inside a Docker container.
A single `docker-compose.yml` at the repository root MUST be sufficient to spin up
the full application. No service may rely on host-installed dependencies at runtime.

### IV. Tests Deferred

Automated tests are explicitly deferred for this phase. The codebase MUST NOT include
test files or testing infrastructure until explicitly re-enabled by amending this
constitution. However, code structure MUST remain testable: pure functions over
side-effectful ones, dependencies injectable, business logic decoupled from framework
code.

### V. Backend/Frontend Separation

Backend and frontend are distinct services with a clean API boundary. The backend
exposes a REST API (FastAPI); the frontend (Next.js) consumes it. No server-side
rendering of business logic is permitted in the frontend — it is a UI layer only.
Shared types or contracts are defined in the API layer, not duplicated.

### VI. Backend Architecture: MVC Pattern

The backend MUST follow the Model-View-Controller (MVC) pattern. Each Python module
(feature domain) MUST be organized into exactly three layers:

- **`model.py`** — SQLAlchemy ORM models and Pydantic schemas for that domain.
  Data shape and persistence concerns live here exclusively.
- **`controller.py`** — FastAPI route definitions (the "View" in API context).
  Controllers handle HTTP request/response, input validation, and call into the
  service layer. No business logic is permitted here.
- **`service.py`** — Business logic and orchestration. Services interact with
  models/repositories and are framework-agnostic (no FastAPI imports).

The naming convention `router.py` / `schemas.py` is **prohibited**. Modules MUST
use `controller.py` and `model.py` instead. This ensures a consistent, navigable
structure across all feature domains and keeps concerns cleanly separated.

**Rationale**: A uniform MVC layout makes onboarding, code review, and feature
addition predictable. Renaming `router` → `controller` and collapsing `schemas`
into `model` reduces file count and aligns naming with the architectural intent.

## Technology Stack

- **Python**: 3.12
- **FastAPI**: latest LTS-compatible release
- **PostgreSQL**: latest LTS release
- **Next.js**: 16
- **Docker** / **Docker Compose**: latest stable

All dependency versions MUST be pinned in their respective lock files
(`requirements.txt` / `pyproject.toml` for backend; `package-lock.json` for frontend).

## Development Workflow

- All services are started via `docker compose up`
- Backend lives under `backend/`, frontend under `frontend/`
- Each backend feature module MUST contain exactly: `model.py`, `controller.py`,
  `service.py`. No `router.py` or standalone `schemas.py` are permitted.
- Database migrations are managed by the backend service
- Environment variables are provided via `.env` files (never committed)
- Code MUST pass a linter before being considered complete (e.g., `ruff` for Python,
  `eslint` for Next.js)

## Governance

This constitution supersedes all other practices and preferences. Any amendment
requires updating this file with an incremented version, updated `LAST_AMENDED_DATE`,
and a corresponding entry in the Sync Impact Report.

- **Versioning policy**: MAJOR for principle removals/redefinitions; MINOR for new
  principles or sections; PATCH for clarifications and wording fixes.
- **Compliance**: Every plan and task list MUST be checked against this constitution
  before implementation begins.
- **Re-enabling tests**: When tests are re-enabled, Principle IV MUST be amended and
  tasks-template.md test sections promoted from OPTIONAL to REQUIRED.

**Version**: 1.1.0 | **Ratified**: 2026-03-22 | **Last Amended**: 2026-03-22
