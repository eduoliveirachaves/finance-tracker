import typing
from datetime import datetime

from app.core.database import Base, _now, _uuid
from pydantic import BaseModel
from sqlalchemy import CheckConstraint, ForeignKey, Index, Numeric, SmallInteger, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if typing.TYPE_CHECKING:
    from app.auth.model import User
    from app.categories.model import Category


class MonthlyEstimate(Base):
    __tablename__ = "monthly_estimates"
    __table_args__ = (
        CheckConstraint("month BETWEEN 1 AND 12", name="estimate_month_check"),
        CheckConstraint("amount >= 0", name="estimate_amount_non_negative"),
        CheckConstraint("type IN ('expense', 'income')", name="estimate_type_check"),
        UniqueConstraint("user_id", "category_id", "year", "month", "type", name="uq_estimate_per_category_month"),
        Index("idx_estimates_user_month", "user_id", "year", "month"),
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("categories.id"), nullable=False)
    year: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    month: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    user: Mapped["User"] = relationship(back_populates="monthly_estimates")
    category: Mapped["Category"] = relationship(back_populates="monthly_estimates")


class _CategoryMin(BaseModel):
    id: str
    name: str
    model_config = {"from_attributes": True}


class EstimateCreate(BaseModel):
    category_id: str
    type: str
    amount: str
    year: int
    month: int


class EstimateUpdate(BaseModel):
    amount: str


class EstimateResponse(BaseModel):
    id: str
    category: _CategoryMin
    type: str
    amount: str
    year: int
    month: int

    model_config = {"from_attributes": True}
