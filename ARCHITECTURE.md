# PYQ Insight - Architecture & Technical Specification

## 1. System Overview
PYQ Insight is an academic exam intelligence platform designed specifically for AKTU B.Tech students (and extensible to other universities). It analyzes Previous Year Question Papers (PYQs) using deterministic NLP (TF-IDF + Cosine Similarity) and clustering (Agglomerative / K-Means) to map questions to syllabus units/topics, score topic importance based on frequency, recency, and marks weightage, and generate personalized study schedules.

## 2. 2 GB RAM Architecture Constraint & Resource Budgets
The entire system is designed as a memory-efficient modular monolith with a decoupled Python ML worker, strictly budgeting system memory to ensure reliable execution within a 2 GB total RAM envelope:

| Component | Target Budget (MB) | Strategy |
| :--- | :--- | :--- |
| OS & Nginx | 350 MB | Alpine/Debian slim, minimal buffers |
| Next.js Frontend | 250 MB | Standalone output, dynamic chart loading, no client bloat |
| Express.js API | 180 MB | Bounded node heap (`--max-old-space-size=180`), stream processing |
| FastAPI ML Service | 300 MB | Scikit-learn TF-IDF, lazy-loaded models, single concurrency |
| MongoDB (Atlas / Local) | 400 MB | Atlas preferred (0 MB local); if local, WiredTiger cache bounded to 256MB |
| Background Worker / OCR | 250 MB | Serial worker (concurrency = 1), temporary files cleaned immediately |
| System Reserve | 320 MB | Cushion for spike isolation and OS safety |
| **Total** | **~2050 MB** | With Atlas, local RAM comfortably under 1.2 GB |

## 3. High-Level Architecture & Communication
```
┌────────────────────────────────────────────────────────┐
│                   Next.js 15+ Frontend                 │
│              (App Router, Tailwind CSS, Recharts)      │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON (JWT in Cookies/Bearer)
                           ▼
┌────────────────────────────────────────────────────────┐
│                 Express.js REST API                    │
│      (Zod Validation, Mongoose, Auth, Mongo Job Queue) │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │ Internal HTTP
              ▼                            ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     MongoDB (Atlas)       │  │    FastAPI NLP Service   │
│ (Users, Catalog, Papers,  │  │ (TF-IDF, Cosine Sim,    │
│  Questions, Scores, Jobs) │  │  pdfplumber, Tesseract) │
└───────────────────────────┘  └─────────────────────────┘
```

## 4. Repository Structure (pnpm Monorepo)
```
/
├── apps/
│   ├── web/                     # Next.js 15 Frontend
│   ├── api/                     # Express.js REST API
│   └── ml/                      # FastAPI Python NLP Service
├── packages/
│   ├── shared-types/            # Shared TypeScript contracts and interfaces
│   ├── shared-validation/       # Reusable Zod validation schemas
│   └── config/                  # Shared lint/tsconfig configurations
├── infrastructure/
│   ├── docker/                  # Multi-stage Dockerfiles & Compose
│   └── nginx/                   # Reverse proxy and SSL configuration
├── docs/                        # Architecture, API & DB specifications
└── scripts/                     # Seed scripts, data fixtures & maintenance
```

## 5. Storage & Processing Guarantees
- **StorageProvider abstraction**: Local persistent directory (`uploads/`) for local development; easily swappable with S3/MinIO.
- **Persistent Mongo Queue**: Jobs stored in `ProcessingJob` with atomic status updates (`findOneAndUpdate` with lock timestamps and attempt tracking).
- **Concurrency**: Guaranteed single-thread/single-process job execution to eliminate RAM thrashing.
- **Fail-Safe OCR**: Primary extraction uses `pdfplumber`. OCR via `pytesseract` triggers strictly on scanned/blank page fallbacks.
