import pytest
from fastapi import status

MENSAGEM_ESPERADA = "Laboratório distribuído funcionando!"


def test_raiz_responde_com_sucesso(client):
    response = client.get("/")

    assert response.status_code == status.HTTP_200_OK


def test_raiz_retorna_a_mensagem_esperada(client):
    response = client.get("/")

    assert response.json() == {"message": MENSAGEM_ESPERADA}


def test_raiz_responde_em_json(client):
    response = client.get("/")

    assert response.headers["content-type"].startswith("application/json")


def test_rota_inexistente_retorna_404(client):
    response = client.get("/nao-existe")

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.parametrize("caminho", ["/health", "/api", "/usuarios", "/root"])
def test_caminhos_nao_mapeados_retornam_404(client, caminho):
    response = client.get(caminho)

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.parametrize("metodo", ["post", "put", "patch", "delete"])
def test_metodos_nao_permitidos_na_raiz(client, metodo):
    response = getattr(client, metodo)("/")

    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
