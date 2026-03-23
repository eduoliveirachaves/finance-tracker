from app.accounts.controller import router as accounts_router
from app.auth.controller import router as auth_router
from app.categories.controller import router as categories_router
from app.core.config import get_settings
from app.estimates.controller import router as estimates_router
from app.recurring.controller import router as recurring_router
from app.reports.controller import router as reports_router
from app.transactions.controller import router as transactions_router
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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


@app.exception_handler(Exception)
async def _unhandled_exception(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
