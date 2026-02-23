# Deployment Guide

Deploy BlackRoad OS across Railway, Vercel, Cloudflare, and Pi fleet.

---

## Quick Deploy (Single Command)

```bash
# Deploy everything from blackroad-infra
gh workflow run "Deploy All Services" \
  --repo BlackRoad-OS-Inc/blackroad-infra \
  -f target=all
```

---

## Railway — Backend Services

### Prerequisites

```bash
npm install -g @railway/cli
railway login
railway link  # Link to your project
```

### Deploy Gateway

```bash
cd blackroad-gateway
railway up --service blackroad-gateway
railway logs --service blackroad-gateway --tail
```

### Environment Variables (Railway Dashboard)

```
NODE_ENV=production
BLACKROAD_GATEWAY_BIND=0.0.0.0
BLACKROAD_GATEWAY_PORT=8787
BLACKROAD_ANTHROPIC_API_KEY=sk-ant-...
BLACKROAD_OLLAMA_URL=https://ollama.your-pi.ngrok.io
```

### Railway `railway.toml`

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5
```

---

## Vercel — Web Frontend

```bash
cd blackroad-os-web
npm install
vercel --prod

# Set env vars
vercel env add NEXT_PUBLIC_GATEWAY_URL
# Enter: https://gateway.blackroad.ai
```

### `vercel.json`

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_GATEWAY_URL": "https://gateway.blackroad.ai"
  }
}
```

---

## Cloudflare Workers

### Deploy a Single Worker

```bash
cd workers/agents-api
wrangler deploy
```

### Deploy All Workers

```bash
# Uses the infra workflow
bash scripts/deploy-cloudflare-all.sh
```

### Worker `wrangler.toml` Template

```toml
name = "blackroad-worker"
main = "src/index.ts"
compatibility_date = "2024-12-01"
account_id = "848cf0b18d51e0170e0d1537aec3505a"

[vars]
BLACKROAD_GATEWAY_URL = "http://127.0.0.1:8787"

[[kv_namespaces]]
binding = "CACHE"
id = "<namespace-id>"
```

---

## Raspberry Pi Fleet

### Initial Setup (One-Time)

```bash
# Copy setup script to Pi
scp scripts/pi-setup.sh pi@192.168.4.38:~/

# Run on Pi
ssh pi@192.168.4.38 'bash ~/pi-setup.sh'
```

### Continuous Deployment (via GitHub Actions)

The `deploy-all.yml` workflow handles Pi updates automatically on push:

```yaml
- name: Deploy to Pi fleet
  run: |
    for pi in pi@192.168.4.38 pi@192.168.4.64; do
      ssh $pi 'cd ~/blackroad && git pull && systemctl --user restart blackroad-agents'
    done
```

### Ansible (Full Fleet Management)

```bash
cd blackroad-infra
ansible-playbook -i ansible/inventory.yaml ansible/pi-fleet.yaml
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `BLACKROAD_GATEWAY_URL` | Agents only | Gateway endpoint |
| `BLACKROAD_ANTHROPIC_API_KEY` | Gateway only | Anthropic key |
| `BLACKROAD_OPENAI_API_KEY` | Gateway only | OpenAI key |
| `BLACKROAD_OLLAMA_URL` | Gateway only | Ollama endpoint |
| `RAILWAY_TOKEN` | CI/CD | Railway deploy token |
| `VERCEL_TOKEN` | CI/CD | Vercel deploy token |
| `CLOUDFLARE_API_TOKEN` | CI/CD | Cloudflare token |

---

## Rollback

```bash
# Railway
railway rollback --service blackroad-gateway

# Vercel
vercel rollback

# Cloudflare
wrangler rollback

# Pi fleet
ssh pi@192.168.4.38 'cd ~/blackroad && git checkout HEAD~1 && systemctl --user restart blackroad-agents'
```
