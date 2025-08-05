dev:
	npm run dev

db-up:
	docker compose up -d

db-down:
	docker compose down

db-studio:
	npx prisma studio

tunnel:
	cloudflared tunnel --url http://localhost:3000
