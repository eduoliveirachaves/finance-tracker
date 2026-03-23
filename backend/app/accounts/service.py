from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.core.models import BankAccount, Card, Transaction


def list_accounts(db: Session, user_id: str) -> list[BankAccount]:
    return (
        db.query(BankAccount)
        .options(selectinload(BankAccount.cards))
        .filter(BankAccount.user_id == user_id)
        .order_by(BankAccount.name)
        .all()
    )


def create_account(db: Session, user_id: str, name: str) -> BankAccount:
    if db.query(BankAccount).filter(BankAccount.user_id == user_id, BankAccount.name == name).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account name already in use")
    account = BankAccount(user_id=user_id, name=name)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def update_account(db: Session, user_id: str, account_id: str, name: str) -> BankAccount:
    account = db.query(BankAccount).filter(BankAccount.id == account_id, BankAccount.user_id == user_id).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    if db.query(BankAccount).filter(BankAccount.user_id == user_id, BankAccount.name == name, BankAccount.id != account_id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account name already in use")
    account.name = name
    db.commit()
    db.refresh(account)
    return account


def delete_account(db: Session, user_id: str, account_id: str) -> None:
    account = db.query(BankAccount).filter(BankAccount.id == account_id, BankAccount.user_id == user_id).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    has_txns = db.query(Transaction).filter(Transaction.bank_account_id == account_id).first()
    has_cards = db.query(Card).filter(Card.bank_account_id == account_id).first()
    if has_txns or has_cards:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account has linked transactions or cards")
    db.delete(account)
    db.commit()


def create_card(db: Session, user_id: str, account_id: str, name: str, card_type: str) -> Card:
    account = db.query(BankAccount).filter(BankAccount.id == account_id, BankAccount.user_id == user_id).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    if card_type not in ("credit", "debit"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Card type must be 'credit' or 'debit'")
    card = Card(bank_account_id=account_id, name=name, type=card_type)
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def update_card(db: Session, user_id: str, card_id: str, name: str | None, card_type: str | None) -> Card:
    card = (
        db.query(Card)
        .join(BankAccount, Card.bank_account_id == BankAccount.id)
        .filter(Card.id == card_id, BankAccount.user_id == user_id)
        .first()
    )
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    if name is not None:
        card.name = name
    if card_type is not None:
        if card_type not in ("credit", "debit"):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid card type")
        card.type = card_type
    db.commit()
    db.refresh(card)
    return card


def delete_card(db: Session, user_id: str, card_id: str) -> None:
    card = (
        db.query(Card)
        .join(BankAccount, Card.bank_account_id == BankAccount.id)
        .filter(Card.id == card_id, BankAccount.user_id == user_id)
        .first()
    )
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    if db.query(Transaction).filter(Transaction.card_id == card_id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Card has linked transactions")
    db.delete(card)
    db.commit()
