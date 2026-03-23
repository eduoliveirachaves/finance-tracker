from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.recurring import service
from app.recurring.schemas import RecurringCreate, RecurringUpdate

router = APIRouter(prefix="/recurring", tags=["recurring"])


@router.get("")
def list_recurring(
    active_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.list_recurring(db, current_user.id, active_only)


@router.post("", status_code=201)
def create_recurring(
    payload: RecurringCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.create_recurring(db, current_user.id, payload.model_dump())


@router.put("/{rec_id}")
def update_recurring(
    rec_id: str,
    payload: RecurringUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.update_recurring(db, current_user.id, rec_id, payload.model_dump(exclude_none=True))


@router.delete("/{rec_id}", status_code=204)
def delete_recurring(
    rec_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.delete_recurring(db, current_user.id, rec_id)
