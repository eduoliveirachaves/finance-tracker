from decimal import Decimal

from app.accounts.model import BankAccount, Card
from app.categories.model import Category
from app.transactions.model import Transaction
from fastapi import HTTPException, status
from sqlalchemy import extract
from sqlalchemy.orm import Session, selectinload


def _load_opts():
    return [
        selectinload(Transaction.category),
        selectinload(Transaction.bank_account),
        selectinload(Transaction.card),
    ]


def _serialize(t: Transaction) -> dict:
    return {
        "id": t.id,
        "date": t.date,
        "amount": f"{Decimal(str(t.amount)):.2f}",
        "type": t.type,
        "category": {"id": t.category_id, "name": t.category.name},
        "modality": t.modality,
        "bank_account": {"id": t.bank_account_id, "name": t.bank_account.name} if t.bank_account else None,
        "card": {"id": t.card_id, "name": t.card.name} if t.card else None,
        "recurring_id": t.recurring_id,
        "notes": t.notes,
        "created_at": t.created_at,
    }


def list_transactions(
    db: Session,
    user_id: str,
    year: int,
    month: int,
    type_filter: str | None = None,
    category_id: str | None = None,
) -> list[dict]:
    query = (
        db.query(Transaction)
        .options(*_load_opts())
        .filter(
            Transaction.user_id == user_id,
            extract("year", Transaction.date) == year,
            extract("month", Transaction.date) == month,
        )
    )
    if type_filter:
        query = query.filter(Transaction.type == type_filter)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    rows = query.order_by(Transaction.date.desc(), Transaction.created_at.desc()).all()
    return [_serialize(t) for t in rows]


def create_transaction(db: Session, user_id: str, data: dict) -> dict:
    if not data.get("bank_account_id") and not data.get("card_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Either bank_account_id or card_id is required"
        )

    # Validate ownership
    category = db.query(Category).filter(Category.id == data["category_id"], Category.user_id == user_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    if data.get("bank_account_id"):
        if (
            not db.query(BankAccount)
            .filter(BankAccount.id == data["bank_account_id"], BankAccount.user_id == user_id)
            .first()
        ):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank account not found")

    if data.get("card_id"):
        card = (
            db.query(Card)
            .join(BankAccount, Card.bank_account_id == BankAccount.id)
            .filter(Card.id == data["card_id"], BankAccount.user_id == user_id)
            .first()
        )
        if not card:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

    txn = Transaction(
        user_id=user_id,
        date=data["date"],
        amount=Decimal(str(data["amount"])),
        type=data["type"],
        category_id=data["category_id"],
        modality=data["modality"],
        bank_account_id=data.get("bank_account_id"),
        card_id=data.get("card_id"),
        notes=data.get("notes"),
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    db.expire(txn)
    txn = db.query(Transaction).options(*_load_opts()).filter(Transaction.id == txn.id).one()
    return _serialize(txn)


def update_transaction(db: Session, user_id: str, txn_id: str, data: dict) -> dict:
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    for field in ("date", "type", "modality", "notes", "bank_account_id", "card_id"):
        if field in data and data[field] is not None:
            setattr(txn, field, data[field])
    if "amount" in data and data["amount"] is not None:
        txn.amount = Decimal(str(data["amount"]))
    if "category_id" in data and data["category_id"] is not None:
        txn.category_id = data["category_id"]
    # Note: recurring_id is NOT updated — per spec

    db.commit()
    txn = db.query(Transaction).options(*_load_opts()).filter(Transaction.id == txn_id).one()
    return _serialize(txn)


def delete_transaction(db: Session, user_id: str, txn_id: str) -> None:
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    db.delete(txn)
    db.commit()
