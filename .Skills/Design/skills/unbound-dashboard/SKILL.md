---
name: unbound-dashboard
description: "Expert guide for deploying, configuring, and maintaining the Unbound DNS Dashboard using Grafana, Prometheus, and Loki. Covers installation, exporter setup, log aggregation, and troubleshooting."
---

# Unbound Dashboard Skill

This skill provides expert knowledge for setting up a comprehensive dashboard for Unbound DNS using the Prometheus + Grafana + Loki stack. It is based on the [ar51an/unbound-dashboard](https://github.com/ar51an/unbound-dashboard) repository.

## Capabilities

- **Installation Guide**: Step-by-step instructions for Grafana, Prometheus, and Loki on ARM64 (Raspberry Pi), easily adaptable to other architectures.
- **Unbound Exporter**: Configuration and usage of the `unbound-exporter` to collect metrics.
- **Log Aggregation**: Setting up Loki and Promtail to ingest and query Unbound logs.
- **Dashboard Management**: Importing and configuring the Grafana dashboard.
- **Troubleshooting**: Tips for common issues and optimizations.

## Prerequisite Stack

- **Grafana**: Visualisation platform.
- **Prometheus**: Time-series database for metrics.
- **Loki**: Log aggregation system.
- **Unbound**: The DNS resolver itself.
- **Go**: (Optional) if building the exporter from source.

## Installation Steps

### 1. Grafana Setup

**Download & Install (ARM64 example):**
```bash
wget https://dl.grafana.com/oss/release/grafana_11.1.0_arm64.deb
sudo apt install musl
sudo dpkg -i grafana_11.1.0_arm64.deb
```

**Configuration:**
- Access UI at `http://<IP>:3000` (Default: admin/admin).
- A tweaked `grafana.ini` is available in the release for reduced memory footprint.

**Service Management:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

### 2. Prometheus Setup

**Install:**
```bash
sudo apt install prometheus
```

**Configuration (`prometheus.yml`):**
- Configure to scrape `unbound-exporter`.
- Disable default `node-exporter` if not needed to save resources.
- Scrape interval recommendation: `5m`.

**Clean up:**
- Remove `prometheus-node-exporter` if not used.

### 3. Unbound Exporter Setup

The exporter collects statistics from Unbound. Binary available in [releases](https://github.com/ar51an/unbound-dashboard/releases).

**Unbound Config (`/etc/unbound/unbound.conf`):**
```yaml
server:
    extended-statistics: yes

remote-control:
    control-interface: "/var/run/unbound.sock"
    control-use-cert: no
```

**Install Exporter:**
1. Copy binary to `/usr/local/bin/unbound-exporter`.
2. Make executable: `chmod +x /usr/local/bin/unbound-exporter`.
3. Setup systemd service (`prometheus-unbound-exporter.service`).

### 4. Loki & Promtail Setup (Logs)

**Install:**
```bash
# Download .deb packages from Grafana releases
sudo dpkg -i loki_<version>_arm64.deb
sudo dpkg -i promtail_<version>_arm64.deb
```

**Unbound Logging Config:**
```yaml
server:
    log-replies: yes
    log-tag-queryreply: yes
    log-local-actions: yes
    logfile: /var/log/unbound/unbound.log
    verbosity: 0
```
*Ensure `/var/log/unbound` exists and is writable by `unbound` user.*

**Loki/Promtail Config:**
- Use the optimized `config.yml` provided in the repository release for better performance with Unbound logs.

### 5. Dashboard Import

1. **Add Data Sources** in Grafana:
   - **Prometheus**: `http://localhost:9090`
   - **Loki**: `http://localhost:3100` (Max lines: 100000)
2. **Import JSON**:
   - Upload `unbound-dashboard.json` from the release.
   - Select the Prometheus and Loki data sources.

## Panels & Metrics

- **Lookup Avg**: Average recursive query time (uncached).
- **Req Max/Avg**: Recursive processing request list size.
- **Recursion Time**: Graph of recursion times (Avg & Median).
- **Client Requests**: Bar graphs of requests per client.
- **Top Client Queries**: Table of domains requested by each client.
- **Live Blocked**: Real-time blocked domains table.

## Tips

- **Theme**: You can switch Grafana theme between Dark/Light in User Preferences.
- **Map IPs to Hostnames**: Use Grafana's `Overrides` -> `Value mappings` in panels to show hostnames instead of IPs.
- **Reset Metrics**: You can clear Prometheus time series using the Admin API if enabled.

## References
- Source Repo: https://github.com/ar51an/unbound-dashboard
- Dashboard Release: https://github.com/ar51an/unbound-dashboard/releases
