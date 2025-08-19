dev:
	npm run dev

db-up:
	supabase start

db-stop:
	supabase stop

db-studio:
	open http://127.0.0.1:54323

migrate:
	npx prisma migrate dev

migrate-reset:
	npx prisma migrate reset

migrate-reset-force:
	npx prisma migrate reset --force

tunnel:
	cloudflared tunnel --url http://localhost:3000
