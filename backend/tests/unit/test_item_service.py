import pytest

from app.schemas.item import ItemCreate, ItemPatch, ItemUpdate
from app.services.item import ItemNotFoundError, ItemService


@pytest.fixture
def service_com_itens(item_service: ItemService) -> ItemService:
    """Serviço já populado com três itens (ids 1, 2 e 3)."""
    for nome in ["Teclado", "Mouse", "Monitor"]:
        item_service.create_item(ItemCreate(name=nome))
    return item_service


def test_listagem_comeca_vazia(item_service):
    assert item_service.list_items() == []


def test_criar_item_atribui_ids_sequenciais(item_service):
    primeiro = item_service.create_item(ItemCreate(name="Teclado"))
    segundo = item_service.create_item(ItemCreate(name="Mouse"))

    assert primeiro.id == 1
    assert segundo.id == 2


def test_buscar_item_existente(service_com_itens):
    item = service_com_itens.get_item(2)

    assert item.name == "Mouse"


@pytest.mark.parametrize(
    ("limit", "offset", "nomes_esperados"),
    [
        (10, 0, ["Teclado", "Mouse", "Monitor"]),
        (2, 0, ["Teclado", "Mouse"]),
        (2, 1, ["Mouse", "Monitor"]),
        (10, 3, []),
    ],
)
def test_listagem_respeita_limit_e_offset(
    service_com_itens, limit, offset, nomes_esperados
):
    itens = service_com_itens.list_items(limit=limit, offset=offset)

    assert [item.name for item in itens] == nomes_esperados


def test_substituir_item_troca_todos_os_campos(item_service):
    item_service.create_item(ItemCreate(name="Teclado", description="Antigo"))

    item = item_service.replace_item(1, ItemUpdate(name="Teclado sem fio"))

    assert item.name == "Teclado sem fio"
    assert item.description is None


def test_atualizar_parcialmente_mantem_campos_nao_enviados(item_service):
    item_service.create_item(ItemCreate(name="Teclado", description="Mecânico"))

    item = item_service.update_item(1, ItemPatch(name="Teclado ABNT2"))

    assert item.name == "Teclado ABNT2"
    assert item.description == "Mecânico"


def test_remover_item(service_com_itens):
    service_com_itens.delete_item(1)

    assert [item.id for item in service_com_itens.list_items()] == [2, 3]


@pytest.mark.parametrize(
    "operacao",
    [
        lambda service: service.get_item(99),
        lambda service: service.replace_item(99, ItemUpdate(name="X")),
        lambda service: service.update_item(99, ItemPatch(name="X")),
        lambda service: service.delete_item(99),
    ],
    ids=["get", "replace", "update", "delete"],
)
def test_operacoes_em_item_inexistente_levantam_erro(item_service, operacao):
    with pytest.raises(ItemNotFoundError):
        operacao(item_service)
