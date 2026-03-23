from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.accounts.router import router as accounts_router
from app.auth.router import router as auth_router
from app.categories.router import router as categories_router
from app.core.config import get_settings
from app.estimates.router import router as estimates_router
from app.recurring.router import router as recurring_router
from app.reports.router import router as reports_router
from app.transactions.router import router as transactions_router

settings = get_settings()

app = FastAPI(title="Personal Finance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(accounts_router)
app.include_router(categories_router)
app.include_router(transactions_router)
app.include_router(recurring_router)
app.include_router(estimates_router)
app.include_router(reports_router)
