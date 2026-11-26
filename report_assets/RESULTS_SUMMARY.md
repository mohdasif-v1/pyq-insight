# PYQ Insight - Evaluation & Test Results Summary

This document presents measured empirical results, system performance benchmarks, and comprehensive test case verification for the **PYQ Insight** B.Tech examination intelligence system.

---

## 1. Experimental Setup & Dataset Specifications
- **Exam Cohorts Evaluated**: AKTU B.Tech Sem-V Previous Year Examination Papers.
  - **Database Management System (DBMS)**: `KCS501` / `BCS501` (4 Papers: 2021-22, 2022-23, 2023-24, 2024-25; Total 97 Questions).
  - **Data Analytics (DA)**: `KCS051` / `BCS052` (4 Papers: 2022-23, 2023-24, 2024-25, 2025-26; Total 94 Questions).
- **Total Real Exam Papers Processed**: 8 papers.
- **Total Segmented Questions**: 191 questions.
- **Evaluation Decision**: In strict accordance with the project guidelines, every "attempt any one/three" optional question is indexed as a valid question instance to capture syllabus distribution across exam designs.
- **Keywords Construction**: Topic keywords in `syllabus_dbms.json` and `syllabus_da.json` were constructed strictly from standard university syllabus terminology and textbooks prior to labelling, avoiding data leakage.

---

## 2. Table 7.1: System Performance & Metric Measurements

| Metric | Target | Measured Empirical Result | Status / Notes |
| :--- | :--- | :--- | :--- |
| **Paper Extraction Accuracy** | $\ge 95\%$ | **100.0%** (191 / 191 questions) | Verified against AKTU question papers |
| **Extraction Response Time** | $\le 2.0\text{ s}$/paper | **0.26s average** (min: 0.13s, max: 0.56s) | Sub-second extraction per paper |
| **Topic Mapping Accuracy (Overall)** | $\ge 80\%$ | *Awaiting User Ground-Truth Labels* | Pipeline & validation script ready |
| **Keyword-Match Baseline Accuracy** | Baseline | *Awaiting User Ground-Truth Labels* | Benchmark script ready |
| **K-Means Cluster Silhouette (DBMS)** | $> 0$ | **0.0740** (Optimal $K=15$) | Measured across 97 questions |
| **K-Means Cluster Silhouette (DA)** | $> 0$ | **0.0263** (Optimal $K=14$) | Measured across 94 questions |
| **Topic Priority Formula** | Exact | $0.4\times\text{Freq} + 0.3\times\text{Rec} + 0.3\times\text{Marks}$ | Unit-tested & validated |
| **Adaptive Planner Schedule** | Exact | Greedy allocation with 0.5 weak factor + Final Day Revision | Unit-tested & validated |

### Paper-by-Paper Extraction Benchmark Breakdown
| Paper File | Session / Year | Expected Questions | Correctly Extracted | Accuracy | Processing Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `dbms_2022.pdf` | 2021-22 (2022) | 25 | 25 | 100.0% | 0.137 s |
| `dbms_2023.pdf` | 2022-23 (2023) | 25 | 25 | 100.0% | 0.171 s |
| `dbms_2024.pdf` | 2023-24 (2024) | 25 | 25 | 100.0% | 0.175 s |
| `dbms_2025.pdf` | 2024-25 (2025) | 22 | 22 | 100.0% | 0.291 s |
| `da_2023.pdf` | 2022-23 (2023) | 25 | 25 | 100.0% | 0.131 s |
| `da_2024.pdf` | 2023-24 (2024) | 25 | 25 | 100.0% | 0.330 s |
| `da_2025.pdf` | 2024-25 (2025) | 22 | 22 | 100.0% | 0.298 s |
| `da_2026.pdf` | 2025-26 (2026) | 22 | 22 | 100.0% | 0.562 s |
| **TOTAL** | — | **191** | **191** | **100.0%** | **0.262 s avg** |

---

## 3. Test Cases Execution Matrix

### A. Black-Box Test Cases (BT01 - BT10)
| Test ID | Description | Input | Expected Output | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT01** | Student Registration | Valid name, email, 8+ char password | Account created with role `student`, JWT issued | User registered, role confirmed as `student`, token returned | **PASS** |
| **BT02** | Short Password Rejection | Password with $< 8$ characters | HTTP 400 with validation error | HTTP 400: "String must contain at least 8 character(s)" | **PASS** |
| **BT03** | Duplicate Registration | Existing registered email | HTTP 409 Conflict | HTTP 409: "Email already registered" | **PASS** |
| **BT04** | User Authentication | Valid credentials | HTTP 200, JWT token + user profile | HTTP 200: Valid signed JWT token | **PASS** |
| **BT05** | Unauthorized Route Guard | Request `/api/review/queue` without token | HTTP 401 Unauthorized | HTTP 401: "Token missing" | **PASS** |
| **BT06** | Student Role Guard on Admin | Student accessing `/api/papers` POST | HTTP 403 Forbidden | HTTP 403: "Access denied" | **PASS** |
| **BT07** | Admin Paper Upload | Valid PDF + subjectId, year, session, totalMarks | PDF ingested, segmented, classified | Paper created, 25 questions segmented into DB | **PASS** |
| **BT08** | Ingestion of Invalid Session | `session: "Winter"` | HTTP 400 Zod validation error | Validation rejected invalid enum value | **PASS** |
| **BT09** | Adaptive Planner Generation | Future exam date, 4 daily hours | Plan with revision day | Schedule created ending with REVISION on last day | **PASS** |
| **BT10** | Practice Mode Retrieval | Subject ID with clustered questions | Grouped clusters (count $\ge 2$) | Repeated question clusters returned | **PASS** |

### B. White-Box Test Cases (WT01 - WT06)
| Test ID | Module Tested | Input | Expected Output | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WT01** | Segmentation Parser | AKTU exam text with sub-parts & marks | Extracted array with label, marks, clean text | Correct question labels (`1a`, `1b`, marks: 2) | **PASS** |
| **WT02** | Watermark Stripper | Raw text with QP stamps, dates, IPs, roll numbers | Clean text devoid of header/stamp noise | All noise stripped; question text preserved | **PASS** |
| **WT03** | Bilingual Filter | English question with Hindi transliteration | Clean English string with symbols | Hindi lines removed; technical symbols retained | **PASS** |
| **WT04** | Roman Sub-Item Guard | Text with sub-items `(i)`, `(ii)` | Retained within same question chunk | Sub-items preserved without extra question splits | **PASS** |
| **WT05** | Priority Scorer | Questions with varied marks and recency | Normalized score $0-100$, High/Medium/Low levels | Topic scores ranked; High $\ge 66$, Medium $\ge 33$ | **PASS** |
| **WT06** | Greedy Scheduler | Priority scores, 6 days left, 3 hrs/day | Total 15 hrs study + Day 6 Revision | Study hours matched 15h; Day 6 marked REVISION | **PASS** |

### C. Security & Permission Tests (SP01 - SP06)
| Test ID | Target Component | Attack Vector / Scenario | Expected Security Defense | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SP01** | `auth.js` Middleware | Expired or forged JWT token | Immediate rejection with HTTP 401 | HTTP 401: "Invalid or expired token" | **PASS** |
| **SP02** | Registration Route | Payload containing `role: "admin"` | Server forces `role: "student"` | Role explicitly set to "student" in DB | **PASS** |
| **SP03** | Admin Script Access | Attempt to create admin through public API | Admin creation restricted to CLI script | Script `createAdmin.js` isolated to CLI | **PASS** |
| **SP04** | Multer Upload Guard | Non-PDF file upload (e.g. `.exe`, `.js`) | Rejection by PDF MIME filter | Multer fileFilter rejected non-PDF upload | **PASS** |
| **SP05** | Zod Schema Sanitization | Malformed inputs and negative marks | Schema validation error before DB query | Strict type coercion and validation applied | **PASS** |
| **SP06** | Password Storage | Database inspection | Bcrypt salted hashes (rounds: 10) | Passwords stored as Bcrypt hashes | **PASS** |
