# RFC-001: Tokenless Gateway Architecture

| Field | Value |
|-------|-------|
| RFC Number | 001 |
| Status | Accepted |
| Author | BlackRoad OS Core Team |
| Created | 2025-01-15 |
| Last Updated | 2026-01-10 |

---

## Abstract

All AI provider credentials (API keys, tokens) are held exclusively by a central gateway
service. Agents, CLI tools, and applications never embed or access provider secrets directly.
This creates a single, auditable trust boundary for all external AI communication.

---

## Motivation

### Problem Statement

Early BlackRoad prototypes embedded Anthropic, OpenAI, and Ollama credentials in individual
agent scripts and config files. This led to:

1. Secrets sprawl across dozens of files
2. No unified audit trail for AI usage
3. Token rotation requiring changes in many places
4. Risk of accidental credential exposure in logs or repos

### Goals

- [ ] Single location for all provider credentials
- [ ] Unified audit log for all AI calls
- [ ] Agents work identically whether using Claude, GPT, or Ollama
- [ ] Token rotation without touching agent code
- [ ] Localhost-only default binding for security

---

## Proposal

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     AGENT ENVIRONMENT                    │
│                                                         │
│  Agent CLI  →  BLACKROAD_GATEWAY_URL env var           │
│                         │                               │
│                         ▼                               │
│              http://127.0.0.1:8787                     │
│                         │                               │
└─────────────────────────│───────────────────────────────┘
                          │ (gateway boundary)
┌─────────────────────────│───────────────────────────────┐
│                  GATEWAY SERVICE                         │
│                         │                               │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │              Route + Auth + Log                    │  │
│  └──────┬──────────────────────────────┬─────────────┘  │
│         │                              │                 │
│   Anthropic API              OpenAI / Ollama            │
│   (BLACKROAD_ANTHROPIC_KEY)  (BLACKROAD_OPENAI_KEY)     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Environment Variables

**Agent environment (no secrets):**
```bash
BLACKROAD_GATEWAY_URL=http://127.0.0.1:8787
```

**Gateway environment only:**
```bash
BLACKROAD_GATEWAY_BIND=127.0.0.1
BLACKROAD_GATEWAY_PORT=8787
BLACKROAD_ANTHROPIC_API_KEY=sk-ant-...
BLACKROAD_OPENAI_API_KEY=sk-...
BLACKROAD_OLLAMA_URL=http://localhost:11434
```

### Verification

The `verify-tokenless-agents.sh` script scans all agent files for forbidden strings:
- `sk-ant-`
- `sk-`
- `Bearer `
- `Authorization:`

CI fails if any agent file contains provider credentials.

---

## Security Considerations

- Gateway binds to `127.0.0.1` by default — not exposed to network
- For multi-machine setups, use Cloudflare Tunnel or Tailscale
- All AI calls logged with agent ID, model, token count, timestamp
- Gateway itself should run with minimal filesystem permissions

---

## Decision Record

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01-15 | Accepted | Eliminates secrets sprawl, enables unified audit |
| 2025-06-01 | Reaffirmed | Scaled to 30K agents — central gateway essential |
