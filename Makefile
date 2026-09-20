.DEFAULT_GOAL := help
.PHONY: help install test test-v lint format format-check ci run clean \
        up up-build build down logs logs-api ps shell

BACKEND_DIR := backend
POETRY := poetry -C $(BACKEND_DIR)

UVICORN := $(POETRY) run uvicorn
RUFF := $(POETRY) run ruff

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
	@echo "    make lint          - verifica o código"
	@echo "    make format        - formata o código"
	@echo "    make format-check  - confere a formatação sem alterar arquivos"
	@echo "    make ci            - roda formatação, lint e testes (igual ao CI)"
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

lint:
	$(RUFF) check .

format:
	$(RUFF) format .

format-check:
	$(RUFF) format --check .

ci: format-check lint test

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
