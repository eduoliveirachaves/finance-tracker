import typing
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, _now, _uuid

if typing.TYPE_CHECKING:
    from app.auth.model import User
    from app.estimates.model import MonthlyEstimate
    from app.recurring.model import RecurringTransaction
    from app.transactions.model import Transaction


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    archived_at: Mapped[datetime | None] = mapped_column(nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    user: Mapped["User"] = relationship(back_populates="categories")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="category")
    recurring_transactions: Mapped[list["RecurringTransaction"]] = relationship(back_populates="category")
    monthly_estimates: Mapped[list["MonthlyEstimate"]] = relationship(back_populates="category")

    __table_args__ = (
        Index("idx_categories_user_active", "user_id", postgresql_where=func.text("archived_at IS NULL")),
    )


class CategoryCreate(BaseModel):
    name: str


class CategoryUpdate(BaseModel):
    name: str


class CategoryResponse(BaseModel):
    id: str
    name: str
    archived_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
