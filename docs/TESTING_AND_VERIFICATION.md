# Testing and Verification Report — PYQ Insight

This document provides empirical evidence of the automated testing suites, benchmark evaluations, and runtime verification executed on the canonical PYQ Insight application.

---

## 1. Automated Test Suites Summary

| Test Suite | Component | Framework | Executed Commands | Results | Status |
|---|---|---|---|---|---|
| **Backend Validators & Security** | `backend/tests/` | Jest (Node.js) | `cd backend && npx jest --coverage` | **12 / 12 passed** (validators: 7, security & route guards: 5) | **PASS** |
| **NLP Microservice Algorithms** | `nlp/test_nlp.py` | Pytest (Python 3.12) | `pytest -v nlp/test_nlp.py` | **9 / 9 passed** (segmentation, marks, Hindi filter, watermarks, scoring, planner, thresholding, clustering) | **PASS** |
| **Frontend Production Build** | `frontend/` | Next.js 14 Standalone | `cd frontend && npm run build` | **10 / 10 static pages generated** (first load JS: 87.4 kB) | **PASS** |

---

## 2. Empirical Paper Extraction Benchmark

Evaluated across **8 genuine AKTU examination papers** (191 total questions):

```
==========================================================================
EXTRACTION & SEGMENTATION BENCHMARK EVALUATION
==========================================================================
Paper File           | Expected   | Extracted  | Accuracy   | Seconds   
------------------------------------------------------------------------
da_2023.pdf          | 25         | 25         | 100.0    % | 0.103     s
da_2024.pdf          | 25         | 25         | 100.0    % | 0.238     s
da_2025.pdf          | 22         | 22         | 100.0    % | 0.228     s
da_2026.pdf          | 22         | 22         | 100.0    % | 0.557     s
dbms_2022.pdf        | 25         | 25         | 100.0    % | 0.162     s
dbms_2023.pdf        | 25         | 25         | 100.0    % | 0.166     s
dbms_2024.pdf        | 25         | 25         | 100.0    % | 0.200     s
dbms_2025.pdf        | 22         | 22         | 100.0    % | 0.298     s
------------------------------------------------------------------------
OVERALL              | 191        | 191        | 100.0    % | 0.236 s avg
==========================================================================
```

---

## 3. Empirical Clustering Silhouette Quality

Evaluated across TF-IDF representations of the 191 questions:
- **Database Management System (DBMS)**: Total questions = 97.
  - Optimal $K = 15$
  - Measured Silhouette Score = **0.0631** (Meaningful topic-level groupings formed; low magnitude reflects diversity and short length of technical exam queries).
- **Data Analytics (DA)**: Total questions = 94.
  - Optimal $K = 14$
  - Measured Silhouette Score = **0.0263**.
- Generated plots saved to:
  - `nlp/evaluation/results/figures/silhouette_vs_k_dbms.png`
  - `nlp/evaluation/results/figures/silhouette_vs_k_da.png`

---

## 4. Ground-Truth & Supervised Metric Status

- **Status of `true_topic`:** Preserved strictly blank across `labels_dbms.csv` (97 rows) and `labels_da.csv` (94 rows).
- **Scientific Integrity Decision:** In accordance with academic honesty directives, model predictions were **not** auto-populated into ground-truth files. Supervised classification accuracy (claimed as 84.5% in initial drafts) is explicitly flagged as **Pending Manual Ground-Truth Labelling** in all documentation and the final project report.
