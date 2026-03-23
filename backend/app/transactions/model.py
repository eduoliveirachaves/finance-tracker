import typing
from datetime import date as Date
from datetime import datetime

from app.core.database import Base, _now, _uuid
from pydantic import BaseModel
from sqlalchemy import CheckConstraint, ForeignKey, Index, Numeric, String, Text
from sqlalchemy import Date as SqlDate
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if typing.TYPE_CHECKING:
    from app.accounts.model import BankAccount, Card
    from app.auth.model import User
    from app.categories.model import Category
    from app.recurring.model import RecurringTransaction


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint("amount > 0", name="transaction_amount_positive"),
        CheckConstraint("type IN ('expense', 'income')", name="transaction_type_check"),
        CheckConstraint(
            "modality IN ('dinheiro','debito','credito','pix','transferencia')", name="transaction_modality_check"
        ),
        Index("idx_transactions_user_date", "user_id", "date"),
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[datetime] = mapped_column(SqlDate, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    category_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("categories.id"), nullable=False)
    modality: Mapped[str] = mapped_column(String(20), nullable=False)
    bank_account_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("bank_accounts.id"), nullable=True
    )
    card_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("cards.id"), nullable=True)
    recurring_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("recurring_transactions.id", ondelete="SET NULL"), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    user: Mapped["User"] = relationship(back_populates="transactions")
    category: Mapped["Category"] = relationship(back_populates="transactions")
    bank_account: Mapped["BankAccount | None"] = relationship(back_populates="transactions")
    card: Mapped["Card | None"] = relationship(back_populates="transactions")
    recurring: Mapped["RecurringTransaction | None"] = relationship(back_populates="generated_transactions")


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


class TransactionCreate(BaseModel):
    date: Date
    amount: str
    type: str
    category_id: str
    modality: str
    bank_account_id: str | None = None
    card_id: str | None = None
    notes: str | None = None


class TransactionUpdate(BaseModel):
    date: Date | None = None  # type: ignore[assignment]
    amount: str | None = None
    type: str | None = None
    category_id: str | None = None
    modality: str | None = None
    bank_account_id: str | None = None
    card_id: str | None = None
    notes: str | None = None


class TransactionResponse(BaseModel):
    id: str
    date: Date
    amount: str
    type: str
    category: _CategoryMin
    modality: str
    bank_account: _AccountMin | None
    card: _CardMin | None
    recurring_id: str | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
