# PYQ Insight - Deployment Guide

## 1. 2 GB RAM Target Architecture
PYQ Insight is engineered to run on a standard 2 GB RAM Linux VPS (Ubuntu 22.04 / Debian 12) without crashing or relying on unbounded swap:

| Service | Technology | Peak Memory Target |
| :--- | :--- | :--- |
| Nginx Reverse Proxy | Nginx Alpine | ~40 MB |
| Next.js Frontend | Node 20 Standalone | ~180 MB |
| Express API | Node 20 (`--max-old-space-size=200`) | ~180 MB |
| Python ML Service | FastAPI, scikit-learn (Single worker) | ~280 MB |
| MongoDB (Local WiredTiger) | `--wiredTigerCacheSizeGB 0.25` | ~380 MB |
| OS & Buffers | Linux Kernel | ~350 MB |
| **Total** | | **~1.43 GB (Leaves >550 MB Free)** |

*(Note: When MongoDB Atlas is used, memory usage drops by 380 MB, providing even greater headroom).*

## 2. One-Command Production Launch via Docker Compose
Ensure Docker and Docker Compose are installed on the host VPS:

```bash
# 1. Clone repository
git clone <repo_url> /opt/pyq-insight
cd /opt/pyq-insight

# 2. Configure production secrets
cp .env.example .env
nano .env

# 3. Build minimal images and launch containers
docker compose up -d --build

# 4. Initialize AKTU database seed
docker compose exec api node dist/scripts/seed.js
```

## 3. Verifying Deployment
- **Web Interface:** `http://<your-vps-ip>/`
- **API Health:** `http://<your-vps-ip>/api/v1/health`
- **Swagger Documentation:** `http://<your-vps-ip>/api-docs`
- **Memory Consumption:** Run `docker stats` to verify that each service remains within its allocated budget.
