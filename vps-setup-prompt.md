# VPS Deployment Prompt — book.mapu.co.il

Paste the prompt below into Claude on your VPS to deploy this project.

---

Deploy the **book-creator** Next.js application to this VPS. Follow every step exactly.

## 1. Clone & install

```bash
cd /opt
git clone https://github.com/FakeMelon/book-creator.git book-creator
cd /opt/book-creator
npm install
```

## 2. Create `.env.local`

Create `/opt/book-creator/.env.local` with the following. For each value marked **GENERATE**, generate a strong random string (32+ chars) and show it to me. For values marked **ASK ME**, stop and ask me for the value.

```env
# Database
DATABASE_URL="ASK ME"

# NextAuth
AUTH_SECRET="GENERATE"
AUTH_GOOGLE_ID="ASK ME"
AUTH_GOOGLE_SECRET="ASK ME"
AUTH_URL="https://book.mapu.co.il"

# OpenRouter — single key for all AI (text + images)
OPENROUTER_API_KEY="ASK ME"
STORY_MODEL="anthropic/claude-sonnet-4.5"
REVIEW_MODEL="anthropic/claude-sonnet-4.5"
IMAGE_MODEL="black-forest-labs/flux.2-pro"
IMAGE_SIZE="4K"

# Cloudflare R2
R2_ACCOUNT_ID="ASK ME"
R2_ACCESS_KEY_ID="ASK ME"
R2_SECRET_ACCESS_KEY="ASK ME"
R2_BUCKET_NAME="book-creator"
R2_PUBLIC_URL="ASK ME"

# Trigger.dev
TRIGGER_SECRET_KEY="ASK ME"

# LemonSqueezy
LEMONSQUEEZY_API_KEY="ASK ME"
LEMONSQUEEZY_STORE_ID="ASK ME"
LEMONSQUEEZY_WEBHOOK_SECRET="ASK ME"
LEMONSQUEEZY_HARDCOVER_VARIANT_ID="ASK ME"
LEMONSQUEEZY_SOFTCOVER_VARIANT_ID="ASK ME"

# Lulu
LULU_API_KEY="ASK ME"
LULU_API_SECRET="ASK ME"
LULU_SANDBOX="false"

# Resend
RESEND_API_KEY="ASK ME"
RESEND_FROM_EMAIL="ASK ME"

# Sentry
NEXT_PUBLIC_SENTRY_DSN="ASK ME"

# App
NEXT_PUBLIC_APP_URL="https://book.mapu.co.il"
```

## 3. Generate Prisma client & build

```bash
cd /opt/book-creator
npx prisma generate
npx prisma db push
npm run build
```

## 4. Install Puppeteer dependencies

This project uses Puppeteer for PDF generation. Install its system dependencies:

```bash
npx puppeteer browsers install chrome
apt-get install -y ca-certificates fonts-liberation libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64 libcups2t64 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0t64 libnspr4 libnss3 libxcomposite1 libxdamage1 libxrandr2 xdg-utils libxkbcommon0 libxshmfence1 --no-install-recommends
```

## 5. Run with pm2

```bash
cd /opt/book-creator
PORT=3007 pm2 start npm --name "book-creator" -- start
pm2 save
```

## 6. Nginx server block

Create `/etc/nginx/sites-available/book.mapu.co.il` with this content:

```nginx
server {
    listen 80;
    server_name book.mapu.co.il;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3007;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket / SSE support (used for generation progress streaming)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/book.mapu.co.il /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 7. SSL with certbot

```bash
certbot --nginx -d book.mapu.co.il
```

## 8. Verify

Run these and show me the output:

```bash
pm2 status
curl -sI https://book.mapu.co.il | head -20
```

Show me any generated secrets (AUTH_SECRET) so I can save them.
