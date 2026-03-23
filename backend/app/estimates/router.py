from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.estimates import service
from app.estimates.schemas import EstimateCreate, EstimateUpdate

router = APIRouter(prefix="/estimates", tags=["estimates"])


@router.get("")
def list_estimates(year: int, month: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.list_estimates(db, current_user.id, year, month)


@router.post("", status_code=201)
def create_estimate(payload: EstimateCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.create_estimate(db, current_user.id, payload.model_dump())


@router.put("/{est_id}")
def update_estimate(est_id: str, payload: EstimateUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.update_estimate(db, current_user.id, est_id, payload.amount)


@router.delete("/{est_id}", status_code=204)
def delete_estimate(est_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service.delete_estimate(db, current_user.id, est_id)
