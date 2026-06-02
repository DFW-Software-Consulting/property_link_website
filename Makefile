# PropertyLink NYC — common developer tasks.
# Run `make` or `make help` to see available targets.

.DEFAULT_GOAL := help
.PHONY: help install dev up build start lint typecheck check \
        db-up db-down db-push db-migrate db-generate db-seed db-studio \
        setup clean

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "} {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install npm dependencies
	npm install

dev: ## Launch the app in development (http://localhost:3000)
	npm run dev

up: db-up dev ## Start Postgres, then launch the dev server

build: ## Create a production build
	npm run build

start: ## Run the production server (after `make build`)
	npm run start

lint: ## Run ESLint
	npm run lint

typecheck: ## Type-check without emitting
	npx tsc --noEmit

check: lint typecheck ## Run lint + typecheck

db-up: ## Start the local Postgres container
	docker compose up -d

db-down: ## Stop the local Postgres container
	docker compose down

db-push: ## Sync the Prisma schema to the database
	npm run db:push

db-migrate: ## Create/apply a dev migration
	npm run db:migrate

db-generate: ## Regenerate the Prisma client
	npm run db:generate

db-seed: ## Seed sample contact inquiries
	npm run db:seed

db-studio: ## Open Prisma Studio
	npm run db:studio

setup: install db-up db-push ## One-shot local bootstrap (deps + db + schema)
	@echo "Setup complete. Run 'make dev' to launch the app."

clean: ## Remove the Next.js build cache
	rm -rf .next
