# C216_L1 — Laboratório de Sistemas Distribuídos

Laboratório contínuo da disciplina C216. O backend é uma API FastAPI organizada
em camadas, que persiste dados no PostgreSQL por meio do SQLAlchemy, com a
estrutura do banco versionada pelo Alembic.

## Estrutura

```
.
├── .github/workflows/ci-backend.yml   # integração contínua
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
├── compose.yaml                       # api + PostgreSQL
├── Makefile
└── .env.example
```

Fluxo de uma requisição: `Route → Service → Repository → SQLAlchemy → PostgreSQL`.

## Configuração

```bash
cp .env.example .env
make install
```

A `DATABASE_URL` aponta para o host `db`, nome do serviço no Compose. Os
comandos do Makefile que rodam fora do Docker trocam `db` por `localhost`.

## Executando

```bash
make up-build
make db-upgrade
```

A aplicação responde em `http://localhost:8000` e a documentação em
`http://localhost:8000/docs`.

## API

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/items` | lista itens (query `limit` e `offset`) |
| `GET` | `/items/{item_id}` | busca um item |
| `POST` | `/items` | cria um item |
| `PUT` | `/items/{item_id}` | substitui um item |
| `PATCH` | `/items/{item_id}` | atualiza parte de um item |
| `DELETE` | `/items/{item_id}` | remove um item |

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

Os testes de integração usam um banco SQLite em memória, então rodam sem
Docker. As tabelas são esvaziadas ao final de cada teste.

## Comandos disponíveis

```bash
make help
```
