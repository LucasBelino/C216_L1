# C216_L1 — Laboratório de Sistemas Distribuídos

Laboratório contínuo da disciplina C216. O backend é uma API FastAPI
organizada em camadas, empacotada em container, acompanhada de um PostgreSQL
orquestrado por Docker Compose e de uma esteira de integração contínua no
GitHub Actions.

## Estrutura

```
.
├── .github/workflows/ci-backend.yml   # integração contínua
├── backend/
│   ├── app/
│   │   ├── main.py                    # inicialização da aplicação
│   │   ├── api/routes/                # endpoints (camada HTTP)
│   │   ├── schemas/                   # modelos Pydantic
│   │   └── services/                  # regras de negócio
│   ├── tests/
│   │   ├── unit/                      # testes sem HTTP
│   │   └── integration/               # testes via TestClient
│   ├── Dockerfile
│   └── pyproject.toml
├── compose.yaml                       # api + banco de dados
├── Makefile                           # interface de operação
└── .env.example
```

Cada requisição segue o fluxo `rota → service → armazenamento`. As rotas só
lidam com HTTP (parâmetros, status e erros); as regras ficam no service, que
não conhece nada de HTTP e por isso pode ser testado isoladamente.

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

A aplicação responde em `http://localhost:8000` e a documentação interativa
fica em `http://localhost:8000/docs`.

## API

| Método | Caminho | Descrição | Sucesso |
| --- | --- | --- | --- |
| `GET` | `/` | verificação de funcionamento | `200` |
| `GET` | `/items` | lista itens — query `limit` (1–100) e `offset` (≥ 0) | `200` |
| `GET` | `/items/{item_id}` | busca um item | `200` |
| `POST` | `/items` | cria um item | `201` |
| `PUT` | `/items/{item_id}` | substitui um item inteiro | `200` |
| `PATCH` | `/items/{item_id}` | atualiza apenas os campos enviados | `200` |
| `DELETE` | `/items/{item_id}` | remove um item | `204` |

Item inexistente devolve `404`; dados ou parâmetros inválidos devolvem `422`.

Corpo aceito em `POST` e `PUT`:

```json
{
  "name": "Teclado",
  "description": "Mecânico"
}
```

`name` é obrigatório (1 a 100 caracteres) e `description` é opcional (até 500).
No `PATCH`, ambos são opcionais.

Os itens ficam em memória nesta etapa; a persistência no PostgreSQL entra na
próxima prática.

## Testes

Os testes ficam em `backend/tests`, separados em dois níveis:

- **Unitários** (`tests/unit`) — testam o service e os modelos Pydantic
  diretamente, sem HTTP. São rápidos e apontam exatamente qual regra quebrou.
- **Integração** (`tests/integration`) — exercitam todos os endpoints pelo
  `TestClient`, passando por rota, validação, service e resposta.

| Comando | Executa |
| --- | --- |
| `make test` | toda a suíte |
| `make test-unit` | apenas os unitários |
| `make test-integration` | apenas os de integração |
| `make test-v` | toda a suíte, com saída detalhada |
| `make ci` | formatação, lint e testes — o mesmo que o CI |

Para rodar um teste específico, use o Pytest direto:

```bash
cd backend
poetry run pytest tests/unit/test_item_service.py
poetry run pytest -k "404"
```

Cada teste recebe, pela fixture `item_service`, um service novo e vazio. Nos
testes de integração, esse service substitui o da aplicação por
`dependency_overrides`, então nenhum teste enxerga itens criados por outro.

## Integração contínua

O workflow `.github/workflows/ci-backend.yml` roda em `push` e em
`pull_request`, sempre que algo dentro de `backend/` ou o próprio workflow
mudar. Ele tem dois jobs:

- **Formatacao e lint** — `ruff format --check` e `ruff check`
- **Pytest** — testes unitários e de integração, em passos separados

Os dois usam Python 3.13 e instalam as dependências com Poetry. A branch
`aulas` exige os dois jobs aprovados e uma revisão antes do merge.

## Comandos disponíveis

```bash
make help
```
