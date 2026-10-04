from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.item import ItemCreate, ItemPatch, ItemRead, ItemUpdate
from app.services.item import ItemNotFoundError, ItemService, get_item_service

router = APIRouter(prefix="/items", tags=["Items"])

ItemServiceDep = Annotated[ItemService, Depends(get_item_service)]


@router.get("", response_model=list[ItemRead])
def list_items(
    service: ItemServiceDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return service.list_items(limit=limit, offset=offset)


@router.get("/{item_id}", response_model=ItemRead)
def get_item(item_id: int, service: ItemServiceDep):
    try:
        return service.get_item(item_id)
    except ItemNotFoundError as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(data: ItemCreate, service: ItemServiceDep):
    return service.create_item(data)


@router.put("/{item_id}", response_model=ItemRead)
def replace_item(item_id: int, data: ItemUpdate, service: ItemServiceDep):
    try:
        return service.replace_item(item_id, data)
    except ItemNotFoundError as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error


@router.patch("/{item_id}", response_model=ItemRead)
def update_item(item_id: int, data: ItemPatch, service: ItemServiceDep):
    try:
        return service.update_item(item_id, data)
    except ItemNotFoundError as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, service: ItemServiceDep):
    try:
        service.delete_item(item_id)
    except ItemNotFoundError as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
