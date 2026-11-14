ORIGEM_PERMITIDA = "http://localhost:5173"
ORIGEM_DESCONHECIDA = "http://site-desconhecido.com"


def test_cors_libera_a_origem_do_frontend(client):
    response = client.options(
        "/items",
        headers={
            "Origin": ORIGEM_PERMITIDA,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ORIGEM_PERMITIDA


def test_cors_nao_libera_origem_desconhecida(client):
    response = client.get("/items", headers={"Origin": ORIGEM_DESCONHECIDA})

    assert "access-control-allow-origin" not in response.headers
