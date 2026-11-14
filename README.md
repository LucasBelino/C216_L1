# C216_L1 — Laboratório de Sistemas Distribuídos

Laboratório contínuo da disciplina C216. O backend é uma API FastAPI organizada
em camadas, que persiste dados no PostgreSQL por meio do SQLAlchemy, com a
estrutura do banco versionada pelo Alembic. O frontend em React consome essa
API, e os três serviços (`db`, `api` e `frontend`) sobem juntos pelo Docker
Compose.

## Estrutura

```
.
├── .github/workflows/                 # CI do backend e do frontend
├── backend/
│   ├── app/
│   │   ├── main.py                    # inicialização da aplicação
│   │   ├── api/routes/                # endpoints (HTTP)
│   │   ├── schemas/                   # entrada e saída da API (Pydantic)
│   │   ├── services/                  # regras de negócio
│   │   ├── repositories/              # acesso aos dados
│   │   ├── models/                    # modelos SQLAlchemy
│   │   ├── database/                  # conexão e sessão
│   │   └── core/                      # configuração
│   ├── alembic/versions/              # migrations
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── alembic.ini
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # tela principal
│   │   ├── components/                # formulário e lista
│   │   ├── services/items.js          # chamadas HTTP à API
│   │   └── validation.js              # validação do formulário
│   ├── tests/                         # unit, integration e e2e
│   └── Dockerfile
├── compose.yaml                       # db + api + frontend
├── Makefile
└── .env.example
```

Fluxo de uma requisição: `Frontend (fetch) → Route → Service → Repository → SQLAlchemy → PostgreSQL`.

## Configuração

```bash
cp .env.example .env
make install
make frontend-install
```

A `DATABASE_URL` aponta para o host `db`, nome do serviço no Compose. Os
comandos do Makefile que rodam fora do Docker trocam `db` por `localhost`.

## Executando

```bash
make up-build
make db-upgrade
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000` e documentação em `http://localhost:8000/docs`

`make ps` deve mostrar `db`, `api` e `frontend` como `healthy`. Como o código é
copiado para as imagens, use `make up-build` depois de alterar o código.

O navegador chama a API em `http://localhost:8000` (`VITE_API_URL`). Como o
frontend roda em outra porta, a API libera apenas as origens definidas em
`CORS_ORIGINS`.

## API

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/items` | lista itens (query `limit` e `offset`) |
| `GET` | `/items/{item_id}` | busca um item |
| `POST` | `/items` | cria um item |
| `PUT` | `/items/{item_id}` | substitui um item |
| `PATCH` | `/items/{item_id}` | atualiza parte de um item |
| `DELETE` | `/items/{item_id}` | remove um item |

O nome do item é único: cadastrar ou editar com um nome que já existe retorna
`409` com a mensagem `Já existe um item com esse nome`.

## Migrations

| Comando | Ação |
| --- | --- |
| `make db-upgrade` | aplica as migrations |
| `make db-migration msg="descricao"` | gera uma migration a partir dos modelos |
| `make db-current` | mostra a versão atual do banco |

Depois de gerar uma migration, revise o arquivo em `backend/alembic/versions/`
antes de aplicar.

## Validando a persistência

1. `make up-build` e `make db-upgrade`
2. Criar um item em `/docs` (`POST /items`)
3. `docker compose restart api`
4. Listar de novo (`GET /items`) — o item continua lá
5. Conferir no banco:

```bash
docker compose exec db psql -U app -d app
```

```sql
SELECT * FROM items;
```

## Testes

| Comando | Executa |
| --- | --- |
| `make test` | toda a suíte |
| `make test-unit` | testes unitários |
| `make test-integration` | testes de integração |
| `make lint` | verificação do código |
| `make frontend-test` | testes unitários e de integração do frontend (Vitest) |
| `make e2e` | testes E2E com Playwright em uma stack isolada |
| `make check-all` | todas as verificações (exige Docker) |

Os testes de integração do backend usam um banco SQLite em memória, então
rodam sem Docker. As tabelas são esvaziadas ao final de cada teste. No
frontend, o `fetch` é simulado nos testes do Vitest.

O `make e2e` sobe uma stack separada (projeto `lab-e2e`, API na porta `8001` e
frontend na `5174`), aplica as migrations, roda o Playwright e remove tudo ao
final com `down -v`, sem tocar no banco de desenvolvimento.

## Comandos disponíveis

```bash
make help
```
