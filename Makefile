.PHONY: docker-up docker-down dev-db migrate dev-backend dev-frontend

docker-up:
	docker compose up --build

docker-down:
	docker compose down

dev-db:
	docker compose up postgres -d

migrate:
	docker compose run --rm backend alembic upgrade head

dev-backend:
	cd backend && POSTGRES_HOST=localhost POSTGRES_PORT=5435 uvicorn main:app --reload

dev-frontend:
	cd frontend && npm run dev
