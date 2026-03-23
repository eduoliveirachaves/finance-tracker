import typing
from datetime import datetime

from app.core.database import Base, _now, _uuid
from pydantic import BaseModel
from sqlalchemy import CheckConstraint, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if typing.TYPE_CHECKING:
    from app.auth.model import User
    from app.recurring.model import RecurringTransaction
    from app.transactions.model import Transaction


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    user: Mapped["User"] = relationship(back_populates="accounts")
    cards: Mapped[list["Card"]] = relationship(back_populates="account", cascade="all, delete-orphan")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="bank_account")
    recurring_transactions: Mapped[list["RecurringTransaction"]] = relationship(back_populates="bank_account")


class Card(Base):
    __tablename__ = "cards"
    __table_args__ = (CheckConstraint("type IN ('credit', 'debit')", name="card_type_check"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    bank_account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("bank_accounts.id", ondelete="RESTRICT"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_now)

    account: Mapped["BankAccount"] = relationship(back_populates="cards")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="card")
    recurring_transactions: Mapped[list["RecurringTransaction"]] = relationship(back_populates="card")


class CardResponse(BaseModel):
    id: str
    bank_account_id: str
    name: str
    type: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BankAccountCreate(BaseModel):
    name: str


class BankAccountUpdate(BaseModel):
    name: str


class BankAccountResponse(BaseModel):
    id: str
    name: str
    cards: list[CardResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class CardCreate(BaseModel):
    name: str
    type: str  # credit | debit


class CardUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
