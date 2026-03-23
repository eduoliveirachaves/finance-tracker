import calendar
from datetime import date
from decimal import Decimal

from app.recurring.model import RecurringTransaction
from app.transactions.model import Transaction
from fastapi import HTTPException, status
from sqlalchemy import extract
from sqlalchemy.orm import Session, selectinload


def _load_opts():
    return [
        selectinload(RecurringTransaction.category),
        selectinload(RecurringTransaction.bank_account),
        selectinload(RecurringTransaction.card),
    ]


def _serialize(r: RecurringTransaction) -> dict:
    return {
        "id": r.id,
        "name": r.name,
        "amount": f"{Decimal(str(r.amount)):.2f}",
        "type": r.type,
        "category": {"id": r.category_id, "name": r.category.name},
        "modality": r.modality,
        "bank_account": {"id": r.bank_account_id, "name": r.bank_account.name} if r.bank_account else None,
        "card": {"id": r.card_id, "name": r.card.name} if r.card else None,
        "due_day": r.due_day,
        "active": r.active,
        "created_at": r.created_at,
    }


def generate_for_month(db: Session, recurring: RecurringTransaction, year: int, month: int) -> None:
    if not recurring.active:
        return
    # Clamp due_day to last day of month
    last_day = calendar.monthrange(year, month)[1]
    effective_day = min(recurring.due_day, last_day)
    txn_date = date(year, month, effective_day)

    # Idempotent: check if already generated
    existing = (
        db.query(Transaction)
        .filter(
            Transaction.recurring_id == recurring.id,
            extract("year", Transaction.date) == year,
            extract("month", Transaction.date) == month,
        )
        .first()
    )
    if existing:
        return

    txn = Transaction(
        user_id=recurring.user_id,
        date=txn_date,
        amount=recurring.amount,
        type=recurring.type,
        category_id=recurring.category_id,
        modality=recurring.modality,
        bank_account_id=recurring.bank_account_id,
        card_id=recurring.card_id,
        recurring_id=recurring.id,
    )
    db.add(txn)
    db.commit()


def list_recurring(db: Session, user_id: str, active_only: bool = False) -> list[dict]:
    query = db.query(RecurringTransaction).options(*_load_opts()).filter(RecurringTransaction.user_id == user_id)
    if active_only:
        query = query.filter(RecurringTransaction.active.is_(True))
    rows = query.order_by(RecurringTransaction.name).all()
    return [_serialize(r) for r in rows]


def create_recurring(db: Session, user_id: str, data: dict) -> dict:
    if not data.get("bank_account_id") and not data.get("card_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Either bank_account_id or card_id is required"
        )

    r = RecurringTransaction(
        user_id=user_id,
        name=data["name"],
        amount=Decimal(str(data["amount"])),
        type=data["type"],
        category_id=data["category_id"],
        modality=data["modality"],
        bank_account_id=data.get("bank_account_id"),
        card_id=data.get("card_id"),
        due_day=data["due_day"],
    )
    db.add(r)
    db.commit()
    db.refresh(r)

    today = date.today()
    generate_for_month(db, r, today.year, today.month)

    r = db.query(RecurringTransaction).options(*_load_opts()).filter(RecurringTransaction.id == r.id).one()
    return _serialize(r)


def update_recurring(db: Session, user_id: str, rec_id: str, data: dict) -> dict:
    r = (
        db.query(RecurringTransaction)
        .filter(RecurringTransaction.id == rec_id, RecurringTransaction.user_id == user_id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring transaction not found")

    for field in ("name", "type", "modality", "bank_account_id", "card_id", "due_day", "active", "category_id"):
        if field in data and data[field] is not None:
            setattr(r, field, data[field])
    if "amount" in data and data["amount"] is not None:
        r.amount = Decimal(str(data["amount"]))

    db.commit()
    r = db.query(RecurringTransaction).options(*_load_opts()).filter(RecurringTransaction.id == rec_id).one()
    return _serialize(r)


def delete_recurring(db: Session, user_id: str, rec_id: str) -> None:
    r = (
        db.query(RecurringTransaction)
        .filter(RecurringTransaction.id == rec_id, RecurringTransaction.user_id == user_id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring transaction not found")
    r.active = False
    db.commit()
    db.delete(r)
    db.commit()
