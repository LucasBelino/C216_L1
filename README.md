# C216_L1 — Laboratório de Sistemas Distribuídos

Laboratório contínuo da disciplina C216. O backend é uma aplicação FastAPI
empacotada em container, acompanhada de um PostgreSQL orquestrado por Docker
Compose e de uma esteira de integração contínua no GitHub Actions.

## Estrutura

```
.
├── .github/workflows/ci-backend.yml   # integração contínua
├── backend/
│   ├── app/main.py                    # aplicação FastAPI
│   ├── tests/                         # testes automatizados
│   ├── Dockerfile
│   └── pyproject.toml
├── compose.yaml                       # api + banco de dados
├── Makefile                           # interface de operação
└── .env.example
```

## Requisitos

- Python 3.13 ou superior
- Poetry
- Docker e Docker Compose

## Instalação

```bash
make install
```

## Executando a aplicação

Localmente, com recarregamento automático:

```bash
make run
```

Em containers, junto do banco de dados:

```bash
cp .env.example .env
make up-build
```

A aplicação responde em `http://localhost:8000`.

## Testes

Os testes ficam em `backend/tests` e usam Pytest com o `TestClient` do FastAPI.
O Pytest está declarado como dependência de desenvolvimento, portanto não entra
na imagem de produção.

Executar toda a suíte:

```bash
make test
```

Com saída detalhada, mostrando cada caso:

```bash
make test-v
```

Reproduzir localmente exatamente o que o CI executa — formatação, lint e testes:

```bash
make ci
```

Para rodar um arquivo ou um teste específico, use o Pytest direto:

```bash
cd backend
poetry run pytest tests/test_main.py
poetry run pytest -k "404"
```

### O que está coberto

| Teste | Verifica |
| --- | --- |
| `test_raiz_responde_com_sucesso` | a rota `/` devolve 200 |
| `test_raiz_retorna_a_mensagem_esperada` | o corpo da resposta |
| `test_raiz_responde_em_json` | o cabeçalho `content-type` |
| `test_rota_inexistente_retorna_404` | caso de erro em rota não mapeada |
| `test_caminhos_nao_mapeados_retornam_404` | quatro caminhos, por parametrização |
| `test_metodos_nao_permitidos_na_raiz` | quatro métodos HTTP, por parametrização |

A fixture `client`, em `backend/tests/conftest.py`, monta o cliente HTTP uma vez
e é injetada em todos os testes.

## Integração contínua

O workflow `.github/workflows/ci-backend.yml` roda em `push` e em
`pull_request`, sempre que algo dentro de `backend/` ou o próprio arquivo do
workflow mudar. Ele tem dois jobs independentes:

- **Formatação e lint** — `ruff format --check` e `ruff check`
- **Pytest** — a suíte de testes

Os dois usam Python 3.13 e instalam as dependências com Poetry, aproveitando
cache do `poetry.lock` entre execuções.

## Comandos disponíveis

```bash
make help
```
