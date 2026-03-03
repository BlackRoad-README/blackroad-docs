# Pi Fleet Operations Runbook

> Operational runbook for the BlackRoad OS Raspberry Pi fleet: inventory, WireGuard/Tailscale mesh, Ollama model management, agent deployment, and onboarding new nodes.

---

## Fleet Inventory

| Node | Hardware | LAN IP | Tailscale IP | Role | Status |
|------|----------|--------|--------------|------|--------|
| **lucidia** | Raspberry Pi 5 8GB | 192.168.4.81 | 100.66.235.47 | Ollama inference + NATS event bus | ✅ Online |
| **octavia** | Raspberry Pi 5 8GB | 192.168.4.38 | mesh | Heavy storage + agent orchestration | ✅ Online |
| **alice** | Raspberry Pi 400 4GB | 192.168.4.49 | 100.77.210.18 | Auth + billing services | ✅ Online |
| **aria** | Raspberry Pi 5 8GB | 192.168.4.82 | 100.109.14.17 | Web services (9 containers) | ✅ Online |

**OS:** Raspberry Pi OS Lite 64-bit (Bookworm) on all nodes.

**Network:** TP-Link router at `192.168.4.1`, gigabit switch. Tailscale VPN mesh for remote access.

---

## SSH Access

```bash
# LAN access
ssh pi@192.168.4.81   # lucidia
ssh pi@192.168.4.38   # octavia
ssh pi@192.168.4.49   # alice
ssh pi@192.168.4.82   # aria

# Remote via Tailscale
ssh pi@100.66.235.47  # lucidia (anywhere in mesh)
ssh pi@100.77.210.18  # alice
ssh pi@100.109.14.17  # aria
```

> SSH key auth only — password auth is disabled. Add your public key to `~/.ssh/authorized_keys` on each node.

---

## Ollama Model Management

Ollama runs on **lucidia** (`192.168.4.81:11434`). All other services that need AI inference point `BLACKROAD_OLLAMA_URL` at lucidia.

### Check Ollama Status

```bash
ssh pi@192.168.4.81
systemctl status ollama
curl http://localhost:11434/api/version
```

### List Loaded Models

```bash
# On lucidia
ollama list

# Remote check
curl http://192.168.4.81:11434/api/tags | jq '.models[].name'
```

### Pull a Model

```bash
ssh pi@192.168.4.81
ollama pull llama3.2           # ~2GB — recommended default
ollama pull qwen2.5:7b         # 4GB — good for code tasks
ollama pull deepseek-r1:8b     # 5GB — strong reasoning
ollama pull nomic-embed-text   # 274MB — embeddings
```

### Remove a Model

```bash
ollama rm llama3.2:latest
```

### Run a Quick Test

```bash
ollama run llama3.2 "Hello from BlackRoad OS fleet"
```

### Remote Inference (from gateway or dev machine)

```bash
# Gateway env var
export BLACKROAD_OLLAMA_URL=http://192.168.4.81:11434

# Or via Tailscale
export BLACKROAD_OLLAMA_URL=http://100.66.235.47:11434

# Direct API test
curl http://100.66.235.47:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.2","messages":[{"role":"user","content":"ping"}]}'
```

### Ollama Service Management

```bash
# Restart Ollama
sudo systemctl restart ollama

# Enable on boot
sudo systemctl enable ollama

# View logs
journalctl -u ollama -f --lines=50

# Check GPU / memory usage
vcgencmd measure_temp          # Pi CPU temperature
free -h                        # RAM usage
```

---

## WireGuard / Tailscale Mesh Setup

Tailscale is the primary VPN mesh. WireGuard underlay is managed by Tailscale.

### Check Mesh Status

```bash
# On any node
tailscale status
tailscale ping 100.66.235.47   # ping lucidia from any node
```

### Add Node to Tailscale Mesh

```bash
# 1. Install Tailscale on new Pi
curl -fsSL https://tailscale.com/install.sh | sh

# 2. Join the BlackRoad network
sudo tailscale up --auth-key=<TAILSCALE_AUTH_KEY>

# 3. Verify it appears in mesh
tailscale status
```

### Troubleshoot Mesh Connectivity

```bash
# Check Tailscale daemon
sudo systemctl status tailscaled

# Re-authenticate if expired
sudo tailscale up

# Force re-key
sudo tailscale logout && sudo tailscale up --auth-key=<KEY>

# Check firewall (Tailscale needs UDP 41641)
sudo ufw status
sudo ufw allow 41641/udp
```

---

## Agent Deployment

Agents run as Docker containers or systemd services on Pi nodes.

### Deploy Agent (Docker)

```bash
ssh pi@192.168.4.81

# Pull latest agent image
docker pull ghcr.io/blackroad-os-inc/blackroad-agents:latest

# Run LUCIDIA agent
docker run -d \
  --name blackroad-lucidia \
  --restart unless-stopped \
  -e BLACKROAD_GATEWAY_URL=http://127.0.0.1:8787 \
  -e AGENT_NAME=LUCIDIA \
  -e AGENT_MODEL=llama3.2 \
  ghcr.io/blackroad-os-inc/blackroad-agents:latest
```

### Update All Agents on a Node

```bash
ssh pi@192.168.4.81
docker-compose pull && docker-compose up -d
```

### Check Agent Status

```bash
docker ps --filter name=blackroad
docker logs blackroad-lucidia --tail=50 -f
```

### Restart All Agents

```bash
docker restart $(docker ps -q --filter name=blackroad)
```

---

## Adding a New Pi to the Fleet

Follow this checklist when onboarding a new Raspberry Pi:

- [ ] Flash Raspberry Pi OS Lite 64-bit to SD card (`rpi-imager`)
- [ ] Enable SSH in `rpi-imager` advanced options (set hostname, user, SSH key)
- [ ] Boot Pi and confirm SSH access: `ssh pi@<ip>`
- [ ] Update packages: `sudo apt update && sudo apt upgrade -y`
- [ ] Install Tailscale: `curl -fsSL https://tailscale.com/install.sh | sh`
- [ ] Join mesh: `sudo tailscale up --auth-key=<KEY>`
- [ ] Confirm Tailscale IP: `tailscale ip -4`
- [ ] Add IP to fleet inventory (this file + `operations/BLACKROAD_HARDWARE_INVENTORY_2026.md`)
- [ ] Install Docker: `curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker pi`
- [ ] If AI inference node: install Ollama and pull default model (see above)
- [ ] Deploy agents via `docker-compose up -d`
- [ ] Confirm node appears in `tailscale status` on all peers
- [ ] Add node to Ansible inventory at `blackroad-infra/ansible/inventory.yaml`

---

## Common Issues & Fixes

### Ollama Not Responding

```bash
# Check if service is running
systemctl status ollama

# Check port
ss -tlnp | grep 11434

# Restart
sudo systemctl restart ollama

# Check available RAM (need ~4GB free for llama3.2)
free -h
```

### SD Card Full

```bash
# Check disk usage
df -h

# Find large files
du -sh /* 2>/dev/null | sort -rh | head -20

# Clean Docker images
docker system prune -f

# Remove unused Ollama models
ollama list
ollama rm <unused-model>
```

### Tailscale Peer Unreachable

```bash
# Re-check status
tailscale status

# Try direct connection
tailscale ping <peer-ip>

# Check if peer is online
tailscale status | grep <hostname>

# Force reconnect
sudo tailscale down && sudo tailscale up
```

### Overheating / Throttling

```bash
# Check temperature
vcgencmd measure_temp

# Check throttle state (0x0 = not throttled)
vcgencmd get_throttled

# Ensure active cooler is running
# Pi 5 requires active cooling for sustained inference
```

---

## Recovery Procedures

### Full Node Recovery (SD card failure)

1. Flash fresh OS to new SD card with same hostname and SSH key
2. Boot and SSH in
3. Run setup: `curl -fsSL https://raw.githubusercontent.com/BlackRoad-OS-Inc/blackroad-infra/main/scripts/pi-setup.sh | bash`
4. Join Tailscale with `sudo tailscale up --auth-key=<KEY>`
5. Pull Docker images and restart containers
6. Re-pull Ollama models if AI node
7. Verify services: `docker ps`, `systemctl status ollama`, `tailscale status`

### Gateway Can't Reach Ollama

```bash
# From gateway host, test connectivity
curl http://100.66.235.47:11434/api/version

# If down, SSH to lucidia and restart
ssh pi@100.66.235.47 'sudo systemctl restart ollama'

# Update BLACKROAD_OLLAMA_URL if IP changed
export BLACKROAD_OLLAMA_URL=http://$(tailscale ip -4 lucidia):11434
```

---

## Related Documents

- [Architecture Overview](../architecture/OVERVIEW.md)
- [Hardware Inventory](../../operations/BLACKROAD_HARDWARE_INVENTORY_2026.md)
- [WireGuard Mesh Setup](../../operations/BLACKROAD_MESH_SETUP_RUNBOOK.md)
- [Gateway API Reference](../api/gateway-api.md)
