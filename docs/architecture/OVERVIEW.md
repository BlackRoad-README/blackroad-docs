# BlackRoad OS — Architecture Overview

> Authoritative architecture reference for BlackRoad OS. All services, data flows, hardware topology, and security boundaries.

---

## System Context

BlackRoad OS is a **locality-first, tokenless AI platform**. Agents never hold provider credentials. All AI provider communication is proxied through a single gateway that owns all secrets.

```mermaid
graph TB
    subgraph "Client Layer"
        WEB["blackroad-os-web<br/>(Next.js, Vercel)"]
        CLI["blackroad-cli<br/>(Node.js, br command)"]
        SDK["@blackroad/sdk<br/>(TypeScript / Python)"]
    end

    subgraph "Gateway Layer — Trust Boundary"
        GW["blackroad-gateway<br/>:8787"]
        RL["Rate Limiter"]
        AL["Audit Logger<br/>(PS-SHA∞ chain)"]
    end

    subgraph "AI Provider Layer"
        OL["Ollama :11434<br/>(Pi fleet — local)"]
        AC["Anthropic Claude<br/>(cloud fallback)"]
        OA["OpenAI<br/>(cloud fallback)"]
        GEM["Google Gemini<br/>(cloud fallback)"]
    end

    subgraph "Agent Layer"
        LU["LUCIDIA — Reasoning"]
        ALI["ALICE — Executor"]
        OC["OCTAVIA — DevOps"]
        PR["PRISM — Analyst"]
        EC["ECHO — Memory"]
        CI["CIPHER — Security"]
    end

    subgraph "Hardware Fleet"
        LUPI["lucidia Pi 5<br/>192.168.4.81 / 100.66.235.47"]
        OCTPI["octavia Pi 5<br/>192.168.4.38"]
        ALIPI["alice Pi 400<br/>192.168.4.49"]
        ARPI["aria Pi 5<br/>192.168.4.82"]
    end

    subgraph "Infrastructure"
        CF["Cloudflare (75+ Workers)"]
        RW["Railway (14 projects)"]
        DO["DigitalOcean Droplet"]
        TS["Tailscale Mesh<br/>(10.x.x.x)"]
    end

    WEB -->|HTTPS| GW
    CLI -->|HTTP| GW
    SDK -->|HTTP| GW

    GW --> RL
    GW --> AL
    GW -->|BLACKROAD_OLLAMA_URL| OL
    GW -->|BLACKROAD_ANTHROPIC_API_KEY| AC
    GW -->|BLACKROAD_OPENAI_API_KEY| OA
    GW -->|BLACKROAD_GEMINI_API_KEY| GEM

    LU -->|BLACKROAD_GATEWAY_URL| GW
    ALI -->|BLACKROAD_GATEWAY_URL| GW
    OC -->|BLACKROAD_GATEWAY_URL| GW
    PR -->|BLACKROAD_GATEWAY_URL| GW
    EC -->|BLACKROAD_GATEWAY_URL| GW
    CI -->|BLACKROAD_GATEWAY_URL| GW

    OL --- LUPI
    LUPI --- TS
    OCTPI --- TS
    ALIPI --- TS
    ARPI --- TS

    CF --- GW
    RW --- GW
    DO --- GW
```

---

## Component Descriptions

### Gateway (`blackroad-gateway`)

The single point of trust. All provider API keys live exclusively here, injected via environment variables at runtime.

- **Runtime:** Node.js / Hono on Railway or local
- **Port:** `8787` (binds `127.0.0.1` in dev, `0.0.0.0` in prod)
- **Provider routing:** model name prefix determines provider (see [API Reference](../api/gateway-api.md))
- **Memory:** PS-SHA∞ tamper-evident hash chain (SQLite)
- **Rate limiting:** sliding-window per client ID

### Agents

Six core agents, each with a distinct persona and capability set:

| Agent | Role | Strengths |
|-------|------|-----------|
| LUCIDIA | Reasoning | Deep analysis, philosophy, strategy |
| ALICE | Executor | Task execution, automation, code gen |
| OCTAVIA | DevOps | Infrastructure, deployment, monitoring |
| PRISM | Analyst | Data analysis, pattern recognition |
| ECHO | Memory | Knowledge retrieval, context management |
| CIPHER | Security | Threat detection, access validation |

Agents authenticate to the gateway only — never directly to providers.

### Pi Fleet (Hardware)

Local Ollama inference runs on Raspberry Pi nodes in the WireGuard/Tailscale mesh:

| Node | Hardware | IP (LAN) | IP (Tailscale) | Role |
|------|----------|----------|----------------|------|
| lucidia | Pi 5 8GB | 192.168.4.81 | 100.66.235.47 | Ollama + NATS brain |
| octavia | Pi 5 8GB | 192.168.4.38 | mesh | Storage + agents |
| alice | Pi 400 4GB | 192.168.4.49 | 100.77.210.18 | Auth + billing |
| aria | Pi 5 8GB | 192.168.4.82 | 100.109.14.17 | Web services |

See [Pi Fleet Runbook](../operations/PI_FLEET.md) for management procedures.

---

## Data Flow: Chat Request

```mermaid
sequenceDiagram
    participant App as Client (Web / CLI)
    participant GW as Gateway :8787
    participant RL as Rate Limiter
    participant AL as Audit Log
    participant OL as Ollama :11434 (Pi)
    participant AC as Anthropic (cloud)

    App->>GW: POST /v1/chat/completions {model: "llama3.2", ...}
    GW->>RL: check(clientId)
    alt rate limited
        RL-->>App: 429 Too Many Requests
    else OK
        GW->>AL: log(request, timestamp_ns)
        note over GW: model prefix → Ollama
        GW->>OL: POST /api/chat {model, messages}
        OL-->>GW: stream chunks
        GW-->>App: SSE stream
        GW->>AL: log(response_hash, duration_ms)
    end

    note over GW,AC: If Ollama unreachable, falls back to Anthropic
```

---

## WireGuard / Tailscale Mesh Topology

```mermaid
graph LR
    subgraph "LAN 192.168.4.0/24"
        LUPI["lucidia Pi 5<br/>.81"]
        OCTPI["octavia Pi 5<br/>.38"]
        ALIPI["alice Pi 400<br/>.49"]
        ARPI["aria Pi 5<br/>.82"]
        ROUTER["Router<br/>TP-Link .1"]
    end

    subgraph "Tailscale Mesh (100.x.x.x)"
        TS_L["lucidia<br/>100.66.235.47"]
        TS_A["alice<br/>100.77.210.18"]
        TS_AR["aria<br/>100.109.14.17"]
        TS_DEV["MacBook Pro M1<br/>(dev machine)"]
    end

    subgraph "Cloud"
        CF_TUNNEL["Cloudflare Tunnel"]
        RW["Railway"]
    end

    LUPI --- ROUTER
    OCTPI --- ROUTER
    ALIPI --- ROUTER
    ARPI --- ROUTER

    LUPI --- TS_L
    ALIPI --- TS_A
    ARPI --- TS_AR

    TS_L <-->|encrypted| TS_A
    TS_L <-->|encrypted| TS_AR
    TS_L <-->|encrypted| TS_DEV

    LUPI -->|Cloudflare Tunnel| CF_TUNNEL
    CF_TUNNEL --> RW
```

---

## Security Model

```
[Internet]
    │
    ▼
[Cloudflare WAF + DDoS]
    │
    ▼
[Vercel / Railway] ──→ [Gateway :8787 (127.0.0.1 in dev)]
                                │
                        [Agents (no keys)]
                                │
                     [Ollama on Pi fleet (local)]
```

Key properties:

- **Tokenless agents** — agents hold zero provider credentials
- **Gateway-as-vault** — all `BLACKROAD_*` env vars injected at runtime, never in code
- **PS-SHA∞ audit log** — every request hashed into an append-only chain; entries cannot be deleted or backdated
- **Locality-first** — Ollama runs on Pi, no data leaves the LAN unless explicitly using cloud fallback
- **SSH keys only** on Pi fleet — password auth disabled

---

## Infrastructure Summary

| Layer | Technology | Count |
|-------|-----------|-------|
| CDN / Edge | Cloudflare Workers | 75+ |
| Web | Vercel | 15+ |
| API / Services | Railway | 14 projects |
| AI Inference | Raspberry Pi (Ollama) | 4 nodes |
| Storage | Cloudflare R2 | 135 GB |
| Tunnel | Cloudflare Tunnel | Pi → internet |
| IaC | Terraform + Ansible | blackroad-infra repo |
| Orchestration | Docker Compose | Pi fleet |

---

## Related Documents

- [Gateway API Reference](../api/gateway-api.md)
- [Pi Fleet Runbook](../operations/PI_FLEET.md)
- [Agent System Guide](../../ai/AGENTS.md)
- [Brand Design System](../brand/DESIGN_SYSTEM.md)
- [ADR-001: TypeScript Rewrite](../../architecture/decisions/ADR-001-typescript-rewrite.md)
- [ADR-002: Tokenless Gateway](../../architecture/decisions/ADR-002-tokenless-gateway.md)
