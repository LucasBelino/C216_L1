import pytest
from fastapi import status


@pytest.fixture
def item_criado(client) -> dict:
    """Cria um item pela API e devolve o JSON da resposta."""
    response = client.post(
        "/items", json={"name": "Teclado", "description": "Mecânico"}
    )
    return response.json()


def test_listar_itens_vazio(client):
    response = client.get("/items")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_criar_item(client):
    response = client.post("/items", json={"name": "Mouse"})

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() == {"id": 1, "name": "Mouse", "description": None}


@pytest.mark.parametrize(
    "payload",
    [{}, {"name": ""}, {"name": 123}, {"description": "sem nome"}],
)
def test_criar_item_com_payload_invalido_retorna_422(client, payload):
    response = client.post("/items", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_buscar_item_por_id(client, item_criado):
    response = client.get(f"/items/{item_criado['id']}")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == item_criado


def test_listar_itens_com_query_parameters(client):
    for nome in ["Teclado", "Mouse", "Monitor"]:
        client.post("/items", json={"name": nome})

    response = client.get("/items", params={"limit": 2, "offset": 1})

    assert response.status_code == status.HTTP_200_OK
    assert [item["name"] for item in response.json()] == ["Mouse", "Monitor"]


@pytest.mark.parametrize("params", [{"limit": 0}, {"limit": 101}, {"offset": -1}])
def test_listar_itens_com_query_invalida_retorna_422(client, params):
    response = client.get("/items", params=params)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_buscar_item_com_id_nao_numerico_retorna_422(client):
    response = client.get("/items/abc")

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_substituir_item(client, item_criado):
    response = client.put(f"/items/{item_criado['id']}", json={"name": "Teclado"})

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["description"] is None


def test_atualizar_item_parcialmente(client, item_criado):
    response = client.patch(
        f"/items/{item_criado['id']}", json={"name": "Teclado ABNT2"}
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Teclado ABNT2"
    assert response.json()["description"] == "Mecânico"


def test_remover_item(client, item_criado):
    response = client.delete(f"/items/{item_criado['id']}")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert client.get(f"/items/{item_criado['id']}").status_code == 404


@pytest.mark.parametrize(
    ("metodo", "corpo"),
    [
        ("get", None),
        ("put", {"name": "X"}),
        ("patch", {"name": "X"}),
        ("delete", None),
    ],
)
def test_operacoes_em_item_inexistente_retornam_404(client, metodo, corpo):
    response = client.request(metodo.upper(), "/items/99", json=corpo)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": "Item 99 não encontrado"}
