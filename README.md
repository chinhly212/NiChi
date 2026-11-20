# NiChi

Cloudflare Worker gateway for user authentication and multi-user video metadata mapped to Telegram storage and Supabase.

## Secrets Required
Set these in Cloudflare Workers before deploying:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_CHANNEL_ID`

## Commands
- Local dev: `npx wrangler dev`
- Deploy: `npx wrangler deploy`
- 
