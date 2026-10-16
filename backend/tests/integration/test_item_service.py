import pytest
from sqlalchemy.orm import Session

from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemPatch, ItemUpdate
from app.services.item import ItemNotFoundError, ItemService

ID_INEXISTENTE = 999_999


@pytest.fixture
def item_service(db_session: Session) -> ItemService:
    """Service usando o repositório real sobre a sessão de banco do teste."""
    return ItemService(ItemRepository(db_session))


@pytest.fixture
def service_com_itens(item_service: ItemService) -> ItemService:
    """Service com três itens já gravados no banco."""
    for nome in ["Teclado", "Mouse", "Monitor"]:
        item_service.create_item(ItemCreate(name=nome))
    return item_service


def test_listagem_comeca_vazia(item_service):
    assert item_service.list_items() == []


def test_criar_item_gera_id(item_service):
    item = item_service.create_item(ItemCreate(name="Teclado"))

    assert item.id is not None


def test_buscar_item_existente(item_service):
    criado = item_service.create_item(ItemCreate(name="Mouse"))

    item = item_service.get_item(criado.id)

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
    criado = item_service.create_item(ItemCreate(name="Teclado", description="Antigo"))

    item = item_service.replace_item(criado.id, ItemUpdate(name="Teclado sem fio"))

    assert item.name == "Teclado sem fio"
    assert item.description is None


def test_atualizar_parcialmente_mantem_campos_nao_enviados(item_service):
    criado = item_service.create_item(
        ItemCreate(name="Teclado", description="Mecânico")
    )

    item = item_service.update_item(criado.id, ItemPatch(name="Teclado ABNT2"))

    assert item.name == "Teclado ABNT2"
    assert item.description == "Mecânico"


def test_remover_item(service_com_itens):
    primeiro = service_com_itens.list_items()[0]

    service_com_itens.delete_item(primeiro.id)

    assert [item.name for item in service_com_itens.list_items()] == [
        "Mouse",
        "Monitor",
    ]


@pytest.mark.parametrize(
    "operacao",
    [
        lambda service: service.get_item(ID_INEXISTENTE),
        lambda service: service.replace_item(ID_INEXISTENTE, ItemUpdate(name="X")),
        lambda service: service.update_item(ID_INEXISTENTE, ItemPatch(name="X")),
        lambda service: service.delete_item(ID_INEXISTENTE),
    ],
    ids=["get", "replace", "update", "delete"],
)
def test_operacoes_em_item_inexistente_levantam_erro(item_service, operacao):
    with pytest.raises(ItemNotFoundError):
        operacao(item_service)
