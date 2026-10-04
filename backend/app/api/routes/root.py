from fastapi import APIRouter

router = APIRouter(tags=["Root"])


@router.get("/")
def root():
    return {"message": "Laboratório distribuído funcionando!"}
