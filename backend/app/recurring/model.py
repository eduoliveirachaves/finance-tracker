import typing
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Numeric, SmallInteger, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, _now, _uuid

if typing.TYPE_CHECKING:
    from app.accounts.model import BankAccount, Card
    from app.auth.model import User
    from app.categories.model import Category
    from app.transactions.model import Transaction


class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"
    __table_args__ = (
        CheckConstraint("amount > 0", name="recurring_amount_positive"),
        CheckConstraint("type IN ('expense', 'income')", name="recurring_type_check"),
        CheckConstraint("modality IN ('dinheiro','debito','credito','pix','transferencia')", name="recurring_modality_check"),
        CheckConstraint("due_day BETWEEN 1 AND 31", name="recurring_due_day_check"),
        Index("idx_recurring_user_active", "user_id", "active"),
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    category_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("categories.id"), nullable=False)
    modality: Mapped[str] = mapped_column(String(20), nullable=False)
    bank_account_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("bank_accounts.id"), nullable=True)
    card_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("cards.id"), nullable=True)
    due_day: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    user: Mapped["User"] = relationship(back_populates="recurring_transactions")
    category: Mapped["Category"] = relationship(back_populates="recurring_transactions")
    bank_account: Mapped["BankAccount | None"] = relationship(back_populates="recurring_transactions")
    card: Mapped["Card | None"] = relationship(back_populates="recurring_transactions")
    generated_transactions: Mapped[list["Transaction"]] = relationship(back_populates="recurring")


class _CategoryMin(BaseModel):
    id: str
    name: str
    model_config = {"from_attributes": True}


class _AccountMin(BaseModel):
    id: str
    name: str
    model_config = {"from_attributes": True}


class _CardMin(BaseModel):
    id: str
    name: str
    model_config = {"from_attributes": True}


class RecurringCreate(BaseModel):
    name: str
    amount: str
    type: str
    category_id: str
    modality: str
    bank_account_id: str | None = None
    card_id: str | None = None
    due_day: int


class RecurringUpdate(BaseModel):
    name: str | None = None
    amount: str | None = None
    type: str | None = None
    category_id: str | None = None
    modality: str | None = None
    bank_account_id: str | None = None
    card_id: str | None = None
    due_day: int | None = None
    active: bool | None = None


class RecurringResponse(BaseModel):
    id: str
    name: str
    amount: str
    type: str
    category: _CategoryMin
    modality: str
    bank_account: _AccountMin | None
    card: _CardMin | None
    due_day: int
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
