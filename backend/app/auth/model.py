import typing
from datetime import datetime
from pydantic import BaseModel, EmailStr
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, _now, _uuid

if typing.TYPE_CHECKING:
    from app.accounts.model import BankAccount
    from app.categories.model import Category
    from app.estimates.model import MonthlyEstimate
    from app.recurring.model import RecurringTransaction
    from app.transactions.model import Transaction


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


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str

    model_config = {"from_attributes": True}
