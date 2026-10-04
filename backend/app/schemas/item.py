from pydantic import BaseModel, Field


class ItemBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)


class ItemCreate(ItemBase):
    """Dados para criar um item (POST)."""


class ItemUpdate(ItemBase):
    """Dados para substituir um item inteiro (PUT)."""


class ItemPatch(BaseModel):
    """Dados para atualizar parte de um item (PATCH)."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)


class ItemRead(ItemBase):
    """Representação de um item devolvida pela API."""

    id: int
