from pydantic import BaseModel


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
