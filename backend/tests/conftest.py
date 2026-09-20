import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Cliente HTTP de teste reaproveitado por todos os testes."""
    return TestClient(app)
