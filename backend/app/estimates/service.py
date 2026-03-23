from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.core.models import MonthlyEstimate


def _serialize(e: MonthlyEstimate) -> dict:
    return {
        "id": e.id,
        "category": {"id": e.category_id, "name": e.category.name},
        "type": e.type,
        "amount": f"{Decimal(str(e.amount)):.2f}",
        "year": e.year,
        "month": e.month,
    }


def _load_opts():
    return [selectinload(MonthlyEstimate.category)]


def get_estimates_for_month(db: Session, user_id: str, year: int, month: int) -> list[MonthlyEstimate]:
    estimates = (
        db.query(MonthlyEstimate)
        .options(*_load_opts())
        .filter(MonthlyEstimate.user_id == user_id, MonthlyEstimate.year == year, MonthlyEstimate.month == month)
        .all()
    )
    if estimates:
        return estimates

    # Lazy carryover: copy from previous month
    prev_year, prev_month = (year - 1, 12) if month == 1 else (year, month - 1)
    prev_estimates = (
        db.query(MonthlyEstimate)
        .filter(MonthlyEstimate.user_id == user_id, MonthlyEstimate.year == prev_year, MonthlyEstimate.month == prev_month)
        .all()
    )
    if prev_estimates:
        new_estimates = []
        for e in prev_estimates:
            copy = MonthlyEstimate(
                user_id=user_id,
                category_id=e.category_id,
                year=year,
                month=month,
                type=e.type,
                amount=e.amount,
            )
            db.add(copy)
            new_estimates.append(copy)
        db.commit()
        for ne in new_estimates:
            db.refresh(ne)
        return (
            db.query(MonthlyEstimate)
            .options(*_load_opts())
            .filter(MonthlyEstimate.user_id == user_id, MonthlyEstimate.year == year, MonthlyEstimate.month == month)
            .all()
        )
    return []


def list_estimates(db: Session, user_id: str, year: int, month: int) -> list[dict]:
    rows = get_estimates_for_month(db, user_id, year, month)
    return [_serialize(e) for e in rows]


def create_estimate(db: Session, user_id: str, data: dict) -> dict:
    existing = (
        db.query(MonthlyEstimate)
        .filter(
            MonthlyEstimate.user_id == user_id,
            MonthlyEstimate.category_id == data["category_id"],
            MonthlyEstimate.year == data["year"],
            MonthlyEstimate.month == data["month"],
            MonthlyEstimate.type == data["type"],
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Estimate already exists for this category/month/type")

    est = MonthlyEstimate(
        user_id=user_id,
        category_id=data["category_id"],
        year=data["year"],
        month=data["month"],
        type=data["type"],
        amount=Decimal(str(data["amount"])),
    )
    db.add(est)
    db.commit()
    est = db.query(MonthlyEstimate).options(*_load_opts()).filter(MonthlyEstimate.id == est.id).one()
    return _serialize(est)


def update_estimate(db: Session, user_id: str, est_id: str, amount: str) -> dict:
    est = db.query(MonthlyEstimate).filter(MonthlyEstimate.id == est_id, MonthlyEstimate.user_id == user_id).first()
    if not est:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estimate not found")
    est.amount = Decimal(str(amount))
    db.commit()
    est = db.query(MonthlyEstimate).options(*_load_opts()).filter(MonthlyEstimate.id == est_id).one()
    return _serialize(est)


def delete_estimate(db: Session, user_id: str, est_id: str) -> None:
    est = db.query(MonthlyEstimate).filter(MonthlyEstimate.id == est_id, MonthlyEstimate.user_id == user_id).first()
    if not est:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estimate not found")
    db.delete(est)
    db.commit()
