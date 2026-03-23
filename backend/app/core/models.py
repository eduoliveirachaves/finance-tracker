import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    ForeignKey,
    Index,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    accounts: Mapped[list["BankAccount"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    categories: Mapped[list["Category"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    recurring_transactions: Mapped[list["RecurringTransaction"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    monthly_estimates: Mapped[list["MonthlyEstimate"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    user: Mapped["User"] = relationship(back_populates="accounts")
    cards: Mapped[list["Card"]] = relationship(back_populates="account", cascade="all, delete-orphan")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="bank_account")
    recurring_transactions: Mapped[list["RecurringTransaction"]] = relationship(back_populates="bank_account")


class Card(Base):
    __tablename__ = "cards"
    __table_args__ = (
        CheckConstraint("type IN ('credit', 'debit')", name="card_type_check"),
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    bank_account_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("bank_accounts.id", ondelete="RESTRICT"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    account: Mapped["BankAccount"] = relationship(back_populates="cards")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="card")
    recurring_transactions: Mapped[list["RecurringTransaction"]] = relationship(back_populates="card")


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


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint("amount > 0", name="transaction_amount_positive"),
        CheckConstraint("type IN ('expense', 'income')", name="transaction_type_check"),
        CheckConstraint("modality IN ('dinheiro','debito','credito','pix','transferencia')", name="transaction_modality_check"),
        Index("idx_transactions_user_date", "user_id", "date"),
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[datetime] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    category_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("categories.id"), nullable=False)
    modality: Mapped[str] = mapped_column(String(20), nullable=False)
    bank_account_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("bank_accounts.id"), nullable=True)
    card_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("cards.id"), nullable=True)
    recurring_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("recurring_transactions.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    user: Mapped["User"] = relationship(back_populates="transactions")
    category: Mapped["Category"] = relationship(back_populates="transactions")
    bank_account: Mapped["BankAccount | None"] = relationship(back_populates="transactions")
    card: Mapped["Card | None"] = relationship(back_populates="transactions")
    recurring: Mapped["RecurringTransaction | None"] = relationship(back_populates="generated_transactions")


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
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("categories.id"), nullable=False)
    year: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    month: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    user: Mapped["User"] = relationship(back_populates="monthly_estimates")
    category: Mapped["Category"] = relationship(back_populates="monthly_estimates")
