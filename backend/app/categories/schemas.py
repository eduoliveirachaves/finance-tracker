from datetime import datetime

from pydantic import BaseModel


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
