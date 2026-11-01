import os


def get_database_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("A variável de ambiente DATABASE_URL não está definida.")
    return url
