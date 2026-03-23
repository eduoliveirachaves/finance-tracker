from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.auth.model import User
from app.reports import service

router = APIRouter(tags=["reports"])


@router.get("/dashboard")
def dashboard(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.get_dashboard(db, current_user.id, year, month)


@router.get("/reports/monthly")
def monthly_report(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.get_monthly_report(db, current_user.id, year, month)
