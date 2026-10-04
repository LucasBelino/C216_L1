import pytest
from pydantic import ValidationError

from app.schemas.item import ItemCreate, ItemPatch


def test_item_create_aceita_dados_validos():
    item = ItemCreate(name="Teclado", description="Mecânico")

    assert item.name == "Teclado"
    assert item.description == "Mecânico"


def test_item_create_descricao_e_opcional():
    item = ItemCreate(name="Mouse")

    assert item.description is None


@pytest.mark.parametrize(
    "dados",
    [
        {},
        {"name": ""},
        {"name": "x" * 101},
        {"name": "Monitor", "description": "x" * 501},
    ],
)
def test_item_create_rejeita_dados_invalidos(dados):
    with pytest.raises(ValidationError):
        ItemCreate(**dados)


def test_item_patch_registra_apenas_campos_enviados():
    patch = ItemPatch(name="Novo nome")

    assert patch.model_dump(exclude_unset=True) == {"name": "Novo nome"}
