# サーバー
dev:
	npm run dev

# データベース起動
db-up:
	supabase start

db-stop:
	supabase stop

db-studio:
	open http://127.0.0.1:54323

# マイグレーション
migrate:
	npx prisma migrate dev

migrate-reset:
	npx prisma migrate reset

migrate-reset-force:
	npx prisma migrate reset --force

# ネットワーク
tunnel:
	cloudflared tunnel --url http://localhost:3000
