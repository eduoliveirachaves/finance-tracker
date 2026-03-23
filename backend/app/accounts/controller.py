from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.accounts import service
from app.accounts.model import BankAccountCreate, BankAccountResponse, BankAccountUpdate, CardCreate, CardResponse, CardUpdate
from app.auth.model import User
from app.core.database import get_db
from app.core.deps import get_current_user

router = APIRouter(tags=["accounts"])


@router.get("/accounts", response_model=list[BankAccountResponse])
def list_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.list_accounts(db, current_user.id)


@router.post("/accounts", response_model=BankAccountResponse, status_code=201)
def create_account(payload: BankAccountCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.create_account(db, current_user.id, payload.name)


@router.put("/accounts/{account_id}", response_model=BankAccountResponse)
def update_account(account_id: str, payload: BankAccountUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.update_account(db, current_user.id, account_id, payload.name)


@router.delete("/accounts/{account_id}", status_code=204)
def delete_account(account_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service.delete_account(db, current_user.id, account_id)


@router.post("/accounts/{account_id}/cards", response_model=CardResponse, status_code=201)
def create_card(account_id: str, payload: CardCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.create_card(db, current_user.id, account_id, payload.name, payload.type)


@router.put("/cards/{card_id}", response_model=CardResponse)
def update_card(card_id: str, payload: CardUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.update_card(db, current_user.id, card_id, payload.name, payload.type)


@router.delete("/cards/{card_id}", status_code=204)
def delete_card(card_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service.delete_card(db, current_user.id, card_id)
