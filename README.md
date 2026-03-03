# blackroad-docs

> Architecture documentation, governance, brand system, roadmap, and technical specifications for BlackRoad OS.

[![CI](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/ci.yml)
[![Validate](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/validate.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/validate.yml)
[![Pages](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/pages.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/pages.yml)

**📖 Docs site:** [https://blackroad-os-inc.github.io/blackroad-docs/](https://blackroad-os-inc.github.io/blackroad-docs/)

## Overview

The single source of truth for all BlackRoad OS documentation. Pure markdown — no build artifacts committed.

## Structure

```
blackroad-docs/
├── architecture/     # System architecture & design decisions
├── ai/               # AI/ML systems, agents, models
├── api/              # REST API reference (OpenAPI specs)
├── brand/            # Brand tokens, colors, typography, guidelines
├── business/         # Business strategy, financials
├── docs/             # GitHub Pages site (served at /blackroad-docs)
├── governance/       # IP policy, compliance, legal
├── guides/           # Developer & operator how-to guides
├── integrations/     # Cloud provider integration docs
├── marketing/        # Marketing copy, launch materials
├── operations/       # Runbooks, incident response
├── reference/        # Quick reference, glossary, FAQ
├── roadmap/          # Product roadmap & planning
├── runbooks/         # Step-by-step operational runbooks
├── strategy/         # Strategic planning docs
├── technology/       # Technology stack specs
└── whitepapers/      # Research whitepapers
```

## Key Documentation

| Document | Description |
|----------|-------------|
| [Architecture Overview](docs/architecture/OVERVIEW.md) | Full system architecture with Mermaid diagrams |
| [Gateway API Reference](docs/api/gateway-api.md) | REST API endpoints, request/response examples |
| [Agent System Guide](ai/AGENTS.md) | 6 core agents, waking, coordination patterns |
| [Pi Fleet Runbook](docs/operations/PI_FLEET.md) | Fleet inventory, WireGuard, Ollama management |
| [Brand Design System](docs/brand/DESIGN_SYSTEM.md) | Colors, typography, spacing, logo rules |
| [OpenAPI — Gateway](api/gateway.yaml) | Machine-readable gateway spec |
| [OpenAPI — Agents](api/agents.yaml) | Machine-readable agents registry spec |
| [Deployment Guide](docs/guides/deployment.md) | Deploy to Railway, Vercel, Pi fleet |

## Local Ollama Execution

BlackRoad OS is **locality-first**: Ollama runs on-device on Raspberry Pi or your local machine. Cloud providers are fallbacks.

### Quick Start

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull a model
ollama pull llama3.2

# 3. Start the BlackRoad gateway pointing at local Ollama
BLACKROAD_OLLAMA_URL=http://127.0.0.1:11434 \
BLACKROAD_GATEWAY_PORT=8787 \
node dist/index.js

# 4. Chat via gateway (OpenAI-compatible)
curl http://127.0.0.1:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2",
    "messages": [{"role": "user", "content": "Hello from BlackRoad OS"}]
  }'
```

### Model Routing

| Model prefix | Provider |
|---|---|
| `llama*`, `qwen*`, `mistral*`, `deepseek*` | Ollama (local Pi or Mac) |
| `claude-*` | Anthropic |
| `gpt-*`, `o1-*` | OpenAI |

### Pi Fleet Ollama

Lucidia Pi (192.168.4.81) runs Ollama on port `11434` with `llama3.2` pre-loaded. To route the gateway to it:

```bash
# By LAN IP (always works)
export BLACKROAD_OLLAMA_URL=http://192.168.4.81:11434
# By mDNS hostname (.local requires mDNS/Bonjour on the same LAN)
export BLACKROAD_OLLAMA_URL=http://lucidia.local:11434
# Via Tailscale mesh (works from anywhere in the mesh):
export BLACKROAD_OLLAMA_URL=http://100.66.235.47:11434
```

See [Pi Fleet Runbook](docs/operations/PI_FLEET.md) for full fleet management.

## GitHub Pages

The `docs/` directory is published at [https://blackroad-os-inc.github.io/blackroad-docs/](https://blackroad-os-inc.github.io/blackroad-docs/) via the [Deploy to GitHub Pages](.github/workflows/pages.yml) workflow. It triggers automatically on every push to `main`.

> **Note:** Enable GitHub Pages in repository Settings → Pages → Source: GitHub Actions.

## Contributing

Docs-only PRs welcome. All docs are markdown.

```bash
# Lint markdown locally
npx markdownlint-cli2 "**/*.md"

# Check links locally
npx markdown-link-check --config .markdown-link-check.json **/*.md
```

> ⚠️ Never commit build output (`out/`, `dist/`, `.next/`) — they are gitignored.

See [CONTRIBUTING.md](CONTRIBUTING.md)

---

© BlackRoad OS, Inc. — All rights reserved. Proprietary.
