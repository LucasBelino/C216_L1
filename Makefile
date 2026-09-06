.DEFAULT_GOAL := help
.PHONY: help install test lint format run clean

BACKEND_DIR := backend
POETRY := poetry -C $(BACKEND_DIR)

PYTEST := $(POETRY) run pytest
UVICORN := $(POETRY) run uvicorn
RUFF := $(POETRY) run ruff

help:
	@echo "Comandos disponíveis:"
	@echo "  make install  - instala dependências"
	@echo "  make test     - executa testes"
	@echo "  make lint     - verifica o código"
	@echo "  make format   - formata o código"
	@echo "  make run      - inicia o servidor"
	@echo "  make clean    - remove arquivos temporários"

install:
	$(POETRY) install

test:
	$(PYTEST)

lint:
	$(RUFF) check .

format:
	$(RUFF) format .

run:
	$(UVICORN) app.main:app --reload

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
