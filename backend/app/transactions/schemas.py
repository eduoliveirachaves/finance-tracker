from datetime import date as Date
from datetime import datetime

from pydantic import BaseModel


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
