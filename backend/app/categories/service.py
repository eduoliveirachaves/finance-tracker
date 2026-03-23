from datetime import UTC, datetime

from app.categories.model import Category
from fastapi import HTTPException, status
from sqlalchemy.orm import Session


def list_categories(db: Session, user_id: str, include_archived: bool = False) -> list[Category]:
    query = db.query(Category).filter(Category.user_id == user_id)
    if not include_archived:
        query = query.filter(Category.archived_at.is_(None))
    return query.order_by(Category.name).all()


def create_category(db: Session, user_id: str, name: str) -> Category:
    existing = (
        db.query(Category)
        .filter(Category.user_id == user_id, Category.name == name, Category.archived_at.is_(None))
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already in use")

    category = Category(user_id=user_id, name=name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def rename_category(db: Session, user_id: str, category_id: str, name: str) -> Category:
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    conflict = (
        db.query(Category)
        .filter(
            Category.user_id == user_id,
            Category.name == name,
            Category.archived_at.is_(None),
            Category.id != category_id,
        )
        .first()
    )
    if conflict:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already in use")

    category.name = name
    db.commit()
    db.refresh(category)
    return category


def remove_category(db: Session, user_id: str, category_id: str) -> dict:
    from app.transactions.model import Transaction

    category = db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    has_transactions = db.query(Transaction).filter(Transaction.category_id == category_id).first()
    if has_transactions:
        category.archived_at = datetime.now(UTC)
        db.commit()
        return {"archived": True}
    else:
        db.delete(category)
        db.commit()
        return {"deleted": True}
