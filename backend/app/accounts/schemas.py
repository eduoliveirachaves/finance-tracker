from datetime import datetime

from pydantic import BaseModel


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
