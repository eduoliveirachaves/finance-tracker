from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.auth.model import User
from app.transactions import service
from app.transactions.model import TransactionCreate, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("")
def list_transactions(
    year: int,
    month: int,
    type: str | None = None,
    category_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.list_transactions(db, current_user.id, year, month, type, category_id)


@router.post("", status_code=201)
def create_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.create_transaction(db, current_user.id, payload.model_dump())


@router.put("/{txn_id}")
def update_transaction(
    txn_id: str,
    payload: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.update_transaction(db, current_user.id, txn_id, payload.model_dump(exclude_none=True))


@router.delete("/{txn_id}", status_code=204)
def delete_transaction(
    txn_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.delete_transaction(db, current_user.id, txn_id)
