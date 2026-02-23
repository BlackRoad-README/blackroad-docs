---
title: SDK Reference
description: Complete API reference for the BlackRoad OS SDK (Python, TypeScript, Go, Ruby, Rust, Swift)
sidebar_position: 1
---

# BlackRoad OS SDK Reference

**Package:** `blackroad` (Python) · `@blackroad/sdk` (TypeScript) · `github.com/BlackRoad-OS-Inc/blackroad-sdk` (Go)

## Python SDK

### Installation

```bash
pip install blackroad
```

### BlackRoadClient

The main client class. All SDK operations go through this.

```python
from blackroad_sdk import BlackRoadClient

client = BlackRoadClient(
    base_url="http://127.0.0.1:8787",  # Gateway URL
    agent_id="my-agent-001",           # Your agent ID
    timeout=30.0                        # Request timeout (seconds)
)
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `base_url` | `str` | `http://127.0.0.1:8787` | BlackRoad Gateway URL |
| `agent_id` | `str` | Required | Unique agent identifier |
| `timeout` | `float` | `30.0` | HTTP timeout in seconds |

### MemoryClient

PS-SHA∞ hash-chained persistent memory.

```python
from blackroad_sdk import BlackRoadClient
from blackroad_sdk.memory import MemoryClient

client = BlackRoadClient(...)
memory = MemoryClient(client)

# Store a fact
entry = await memory.remember("The Pi fleet has 30,000 agent capacity", key="fleet_capacity")
print(entry["hash"])  # 64-char SHA-256 hex

# Store an observation
await memory.observe("CPU usage spiked to 98% on aria64")

# Store an inference
await memory.infer("aria64 may need model unloading to free RAM")

# Search memories
results = await memory.search("Pi fleet")
for r in results:
    print(r["content"], r["truth_state"])

# Get chain stats
print(memory.chain_length())   # Number of entries
print(memory.head_hash())      # Latest hash
```

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `remember(content, key)` | `Memory` | Store a verified fact (truth=1) |
| `observe(content, key)` | `Memory` | Store an observation (truth=0) |
| `infer(content, key)` | `Memory` | Store an inference (truth=0) |
| `search(query)` | `list[Memory]` | Substring search across all entries |
| `recent(n=20)` | `list[Memory]` | Get most recent N entries |
| `chain_length()` | `int` | Total entries in chain |
| `head_hash()` | `str` | SHA-256 hash of last entry |

### AgentClient

```python
from blackroad_sdk.agents import AgentClient

agents = AgentClient(client)

# List all agents
all_agents = await agents.list()

# Get specific agent
lucidia = await agents.get("lucidia-001")

# Wake an agent
result = await agents.wake("octavia-001")

# Assign a task
task = await agents.assign_task("alice-001", "Deploy to Railway")
```

### CoordinationClient

```python
from blackroad_sdk.coordination import CoordinationClient

coord = CoordinationClient(client)

# Publish an event
await coord.publish("tasks", "created", {"title": "New task"})

# Delegate to best agent
task = await coord.delegate(
    task_type="analysis",
    description="Analyze Pi fleet telemetry",
    required_skills=["python", "data"],
    priority=8
)

# Broadcast to all agents
await coord.broadcast("System maintenance in 5 minutes")

# Find agents by skills
experts = await coord.find_by_skills(["python", "fastapi"])
```

## TypeScript SDK

### Installation

```bash
npm install @blackroad/sdk
```

### Usage

```typescript
import { BlackRoadClient } from '@blackroad/sdk';

const client = new BlackRoadClient({
  baseUrl: 'http://127.0.0.1:8787',
  agentId: 'my-agent-001',
});

// Memory
await client.memory.remember('The Pi fleet has 2 nodes');
const results = await client.memory.search('fleet');

// Agents
const agents = await client.agents.list();
await client.agents.wake('octavia-001');

// Coordination
await client.coordination.broadcast('System update');
```

## Trinary Logic

BlackRoad uses **trinary (three-valued) logic** for epistemic reasoning:

| Value | Symbol | Meaning |
|-------|--------|---------|
| `1` | ✅ True | Verified fact |
| `0` | ❓ Unknown | Uncertain, needs verification |
| `-1` | ❌ False | Verified false |

### Kleene Operations

```python
from blackroad_sdk.trinary import kleene_and, kleene_or, kleene_not, BeliefState

# AND = min(a, b)
kleene_and(1, 0)   # → 0 (unknown)
kleene_and(1, -1)  # → -1 (false wins)

# OR = max(a, b)
kleene_or(-1, 0)   # → 0 (unknown)
kleene_or(0, 1)    # → 1 (true wins)

# NOT = negate
kleene_not(1)   # → -1
kleene_not(0)   # → 0 (unknown stays unknown)

# BeliefState
belief = BeliefState({"fleet_healthy": 1, "gateway_up": 0})
belief.update("gateway_up", 1)
print(belief.query("fleet_healthy"))  # 1
```

## PS-SHA∞ Memory Persistence

BlackRoad memories are stored in append-only, hash-chained journals.

```
SHA256(prev_hash:key:content:timestamp_ns)
```

Genesis entry uses `"GENESIS"` as the previous hash. Tampering at index `N` breaks all subsequent hashes (cascade detection).

```python
# Verify chain integrity
chain = memory.chain
for i in range(1, len(chain)):
    expected_prev = chain[i-1]["hash"]
    assert chain[i]["prev_hash"] == expected_prev, f"Chain broken at index {i}"
```
