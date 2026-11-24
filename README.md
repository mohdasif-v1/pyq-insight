# PYQ Insight: An Exam-Prep Intelligence Platform Using NLP on Previous-Year Question Papers

> Understand Previous Year Questions. Prioritise Smarter. Prepare Better.

## 1. Project Overview
PYQ Insight is an academic exam intelligence platform designed for AKTU B.Tech students. It extracts questions from historical university PDFs, maps them to syllabus units using deterministic Natural Language Processing (TF-IDF + Cosine Similarity), discovers repeated questions via clustering, scores topic importance, and provides an actionable, day-by-day study schedule.

## 2. Key Capabilities
- **Automated Question Extraction:** Regex-based segmentation of AKTU exam patterns (`Q1`, `(a)`, `(b)`, marks detection) with OCR fallback.
- **Explainable Topic Mapping:** Matches questions against topic definitions and keywords using scikit-learn TF-IDF without heavyweight neural dependencies.
- **Topic Importance Heatmap:** Computes objective priority percentages:
  $$\text{Score}(\text{topic}) = 0.4 \times \text{Frequency} + 0.3 \times \text{Recency} + 0.3 \times \text{MarksWeight}$$
- **Greedy Study Scheduler:** Allocates available days before the exam, boosting weak topics by +50% and reserving the final day for revision.
- **Admin Review Queue:** Low-confidence mappings are flagged for one-click instructor verification and audit logging.
- **2 GB RAM Monolith Profile:** Explicit memory budgeting to guarantee smooth operation on low-cost virtual servers.

## 3. Technology Stack
- **Frontend:** Next.js 14 (App Router, Standalone output), React, Tailwind CSS, Recharts.
- **API Backend:** Node.js, Express.js, TypeScript, Mongoose, Zod validation, JWT authentication.
- **ML Engine:** Python 3.12, FastAPI, scikit-learn, pdfplumber, pytesseract.
- **Database & Queue:** MongoDB with atomic job claiming (`ProcessingJob`).
- **Containerization:** Multi-stage Docker, Docker Compose, Nginx.

## 4. Local Quickstart
### Prerequisites
- Node.js 20+
- pnpm 9+
- Python 3.12+
- MongoDB running locally or on Atlas

### Setup Instructions
```bash
# 1. Install Monorepo Dependencies
pnpm install

# 2. Build Shared Contracts
pnpm --filter @pyq/shared-types build
pnpm --filter @pyq/shared-validation build

# 3. Setup Python ML Environment
cd apps/ml
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
cd ../..

# 4. Configure Environment
cp .env.example .env

# 5. Run Seed Script (AKTU KCS-401 Operating Systems)
npx tsx scripts/seed.ts

# 6. Start Services
pnpm dev:api   # Starts API on http://localhost:5000
pnpm dev:web   # Starts Next.js on http://localhost:3000
pnpm dev:ml    # Starts FastAPI on http://localhost:8000
```
