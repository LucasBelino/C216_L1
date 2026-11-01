.DEFAULT_GOAL := help
.PHONY: help install test test-v test-unit test-integration lint format \
        format-check ci run clean \
        db-upgrade db-migration db-current \
        up up-build build down logs logs-api ps shell \
        frontend-install frontend-dev frontend-lint frontend-format \
        frontend-check frontend-test frontend-test-e2e frontend-build check-all

-include .env

BACKEND_DIR := backend
POETRY := poetry -C $(BACKEND_DIR)

RUFF := $(POETRY) run ruff

DATABASE_URL_LOCAL := $(subst @db:,@localhost:,$(DATABASE_URL))
ALEMBIC := cd $(BACKEND_DIR) && DATABASE_URL="$(DATABASE_URL_LOCAL)" poetry run alembic

FRONTEND := npm --prefix frontend

help:
	@echo "Comandos disponíveis:"
	@echo ""
	@echo "  Desenvolvimento local:"
	@echo "    make install       - instala dependências"
	@echo "    make run           - inicia o servidor"
	@echo "    make clean         - remove arquivos temporários"
	@echo ""
	@echo "  Qualidade e testes:"
	@echo "    make test          - executa os testes"
	@echo "    make test-v        - executa os testes com saída detalhada"
	@echo "    make test-unit     - executa apenas os testes unitários"
	@echo "    make test-integration - executa apenas os testes de integração"
	@echo "    make lint          - verifica o código"
	@echo "    make format        - formata o código"
	@echo "    make format-check  - confere a formatação sem alterar arquivos"
	@echo "    make ci            - roda formatação, lint e testes (igual ao CI)"
	@echo ""
	@echo "  Banco de dados:"
	@echo "    make db-upgrade    - aplica as migrations pendentes"
	@echo "    make db-migration msg=\"descricao\" - gera uma migration pelos modelos"
	@echo "    make db-current    - mostra a versão atual do banco"
	@echo ""
	@echo "  Frontend:"
	@echo "    make frontend-install  - instala as dependências (npm ci)"
	@echo "    make frontend-dev      - inicia o servidor de desenvolvimento (Vite)"
	@echo "    make frontend-lint     - verifica o código (Biome)"
	@echo "    make frontend-format   - formata o código (Biome)"
	@echo "    make frontend-check    - lint e formatação sem alterar arquivos"
	@echo "    make frontend-test     - executa os testes unitários e de integração (Vitest)"
	@echo "    make frontend-test-e2e - executa os testes E2E (Playwright)"
	@echo "    make frontend-build    - gera o build de produção"
	@echo "    make check-all         - valida backend e frontend"
	@echo ""
	@echo "  Docker:"
	@echo "    make up            - sobe os serviços"
	@echo "    make up-build      - reconstrói as imagens e sobe os serviços"
	@echo "    make build         - apenas reconstrói as imagens"
	@echo "    make down          - para e remove os containers"
	@echo "    make logs          - acompanha os logs de todos os serviços"
	@echo "    make logs-api      - acompanha os logs da API"
	@echo "    make ps            - mostra o estado dos serviços"
	@echo "    make shell         - abre um shell no container da API"

install:
	$(POETRY) install

test:
	cd $(BACKEND_DIR) && poetry run pytest

test-v:
	cd $(BACKEND_DIR) && poetry run pytest -v

test-unit:
	cd $(BACKEND_DIR) && poetry run pytest tests/unit

test-integration:
	cd $(BACKEND_DIR) && poetry run pytest tests/integration

lint:
	$(RUFF) check .

format:
	$(RUFF) format .

format-check:
	$(RUFF) format --check .

ci: format-check lint test

run:
	cd $(BACKEND_DIR) && DATABASE_URL="$(DATABASE_URL_LOCAL)" poetry run uvicorn app.main:app --reload

db-upgrade:
	$(ALEMBIC) upgrade head

db-migration:
	$(ALEMBIC) revision --autogenerate -m "$(msg)"

db-current:
	$(ALEMBIC) current

clean: 
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name '*.pyc' -delete
	rm -rf .pytest_cache .ruff_cache

up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

ps:
	docker compose ps

shell:
	docker compose exec api sh

frontend-install:
	$(FRONTEND) ci

frontend-dev:
	$(FRONTEND) run dev

frontend-lint:
	$(FRONTEND) run lint

frontend-format:
	$(FRONTEND) run format

frontend-check:
	$(FRONTEND) run check

frontend-test:
	$(FRONTEND) run test

frontend-test-e2e:
	$(FRONTEND) run test:e2e

frontend-build:
	$(FRONTEND) run build

check-all: ci frontend-check frontend-test frontend-build frontend-test-e2e
