# WireGuard Mesh — Operations Guide

**Deployed:** 2026-02-21
**Replaces:** Tailscale (disabled fleet-wide due to recurring 190% CPU bug on Pi 4)
**Architecture:** Hub-and-spoke via Shellfish

---

## Quick Reference

```bash
# Check mesh status from hub
ssh root@174.138.44.45 "wg show"

# Check local WireGuard status on any node
sudo wg show

# Bring up WireGuard on a node
sudo wg-quick up wg0

# Bring down WireGuard on a node
sudo wg-quick down wg0

# Ping through the mesh
ping 10.8.0.1   # shellfish (hub)
ping 10.8.0.3   # cecilia
ping 10.8.0.4   # lucidia
ping 10.8.0.6   # alice
ping 10.8.0.7   # aria
ping 10.8.0.8   # infinity
```

---

## IP Assignments (10.8.0.0/24)

| IP | Device | Local IP | Status |
|----|--------|----------|--------|
| 10.8.0.1 | **Shellfish** (HUB) | 174.138.44.45 | Active |
| 10.8.0.2 | Alexandria (Mac) | 192.168.4.28 | Pending — needs `sudo wg-quick up ~/.wireguard/wg0.conf` |
| 10.8.0.3 | Cecilia | 192.168.4.89 | Active |
| 10.8.0.4 | Lucidia | 192.168.4.81 | Active |
| 10.8.0.5 | Octavia | 192.168.4.38 | Pending — no SSH key for sudo user |
| 10.8.0.6 | Alice | 192.168.4.49 | Active |
| 10.8.0.7 | Aria | 192.168.4.82 | Active |
| 10.8.0.8 | Infinity | 159.65.43.12 | Active |

---

## Hub Configuration (Shellfish)

- **OS:** CentOS Stream 9
- **Public IP:** 174.138.44.45
- **WireGuard Port:** 51820/UDP
- **IP Forwarding:** `net.ipv4.ip_forward=1` (`/etc/sysctl.d/99-wireguard.conf`)
- **NAT/Forwarding:** iptables FORWARD + MASQUERADE in PostUp/PostDown
- **Firewall:** Port opened via `firewall-cmd --permanent --add-port=51820/udp`
- **Config:** `/etc/wireguard/wg0.conf`
- **Auto-start:** `systemctl enable wg-quick@wg0`

---

## Client Configuration (All Nodes)

All clients connect to Shellfish as their only peer:

```ini
[Interface]
Address = 10.8.0.X/24
PrivateKey = <device-private-key>

[Peer]
PublicKey = j11GHOdcfXoV3iPsHAFxb/7O9gfxrNQZ7ZRNHP8hAys=
Endpoint = 174.138.44.45:51820
AllowedIPs = 10.8.0.0/24
PersistentKeepalive = 25
```

- **Config location:** `/etc/wireguard/wg0.conf`
- **Auto-start:** `systemctl enable wg-quick@wg0`
- **No DNS line** (Pis use local router DNS, avoids `resolvconf` dependency)

---

## SSH Access for Admin

| Node | SSH Command | Sudo |
|------|-------------|------|
| Alice | `ssh alice@192.168.4.49` | NOPASSWD |
| Cecilia | `ssh cecilia@192.168.4.89` | NOPASSWD |
| Lucidia | `ssh lucidia@192.168.4.81` | NOPASSWD |
| Aria | `ssh aria@192.168.4.82` | NOPASSWD |
| Octavia | `ssh blackroad@192.168.4.38` | **Needs password** |
| Shellfish | `ssh root@174.138.44.45` | root |
| Infinity | `ssh root@159.65.43.12` | root |

---

## Troubleshooting

### No handshake
```bash
# Check if hub is reachable
ping 174.138.44.45

# Check if WireGuard port is open
nc -zu 174.138.44.45 51820

# Check local WireGuard interface
sudo wg show
ip addr show wg0
```

### Regenerate keys (if compromised)
```bash
# On the device
wg genkey | tee /tmp/new.key | wg pubkey > /tmp/new.pub

# Update /etc/wireguard/wg0.conf with new private key
# Update hub's wg0.conf with new public key
# Restart both: sudo wg-quick down wg0 && sudo wg-quick up wg0
```

### Add a new device
1. Generate keypair: `wg genkey | tee device.key | wg pubkey > device.pub`
2. Assign next IP (10.8.0.9, etc.)
3. Create client config with Shellfish as peer
4. Add `[Peer]` block to Shellfish's `/etc/wireguard/wg0.conf`
5. On Shellfish: `sudo wg set wg0 peer <pubkey> allowed-ips 10.8.0.9/32` (hot-add without restart)

---

## Why WireGuard over Tailscale

| Factor | Tailscale | WireGuard |
|--------|-----------|-----------|
| CPU usage | 190% userspace daemon (bug) | Near-zero (in-kernel) |
| Control | Tailscale coordination server | Self-hosted hub |
| Setup | Automatic | Manual (one-time) |
| NAT traversal | Automatic | Via hub public IP |
| DNS | MagicDNS | Use IPs or manual /etc/hosts |
| Dependencies | `tailscaled` daemon | Kernel module (built-in) |

---

## Key Backup Location

WireGuard keypairs generated on Mac at `/tmp/wg-keys/`. **These are ephemeral** — copy to a secure location before reboot. Each device also has its private key in `/etc/wireguard/wg0.conf`.

---

*Deployed by Erebus agent, 2026-02-21. Proprietary to BlackRoad OS, Inc.*
