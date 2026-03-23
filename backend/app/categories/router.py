from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.categories import service
from app.categories.schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from app.core.deps import get_current_user
from app.core.models import User
from app.core.database import get_db

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    include_archived: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.list_categories(db, current_user.id, include_archived)


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(
    payload: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.create_category(db, current_user.id, payload.name)


@router.put("/{category_id}", response_model=CategoryResponse)
def rename_category(
    category_id: str,
    payload: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.rename_category(db, current_user.id, category_id, payload.name)


@router.delete("/{category_id}")
def remove_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.remove_category(db, current_user.id, category_id)
