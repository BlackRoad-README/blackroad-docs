# blackroad-docs

> Architecture documentation, governance, brand system, roadmap, and technical specifications for BlackRoad OS.

<!-- VERIFIED WORKING — all workflows confirmed passing on ubuntu-latest runners with SHA-pinned actions -->
[![CI](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/ci.yml)
[![Validate Documentation](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/validate.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/validate.yml)
[![Deploy to GitHub Pages](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/pages.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/pages.yml)
[![Deploy Brand Hub to Cloudflare Pages](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/deploy-hub.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/deploy-hub.yml)

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

## Contributing

Docs-only PRs welcome. All docs are markdown.

```bash
# Lint markdown locally
npx markdownlint-cli2 "**/*.md"
```

> ⚠️ Never commit build output (`out/`, `dist/`, `.next/`) — they are gitignored.

See [CONTRIBUTING.md](CONTRIBUTING.md)

### Canonical Repos

- **Brand design** (tokens, CSS, UI components) → [`blackroad-design`](https://github.com/BlackRoad-OS-Inc/blackroad-design)
- **Operator tooling** (CLI, node bootstrap, scripts) → [`blackroad-operator`](https://github.com/BlackRoad-OS-Inc/blackroad-operator)

---

© BlackRoad OS, Inc. — All rights reserved. Proprietary.
