from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.item import ItemService, get_item_service


@pytest.fixture
def item_service() -> ItemService:
    """Serviço de itens novo e vazio para cada teste."""
    return ItemService()


@pytest.fixture
def client(item_service: ItemService) -> Iterator[TestClient]:
    """Cliente HTTP de teste usando o serviço isolado do teste."""
    app.dependency_overrides[get_item_service] = lambda: item_service
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
