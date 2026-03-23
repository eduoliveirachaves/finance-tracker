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
