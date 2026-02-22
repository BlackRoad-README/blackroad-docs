# blackroad-docs

> Architecture documentation, governance, brand system, roadmap, and technical specifications for BlackRoad OS.

[![CI](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-docs/actions/workflows/ci.yml)

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

---

© BlackRoad OS, Inc. — All rights reserved. Proprietary.
