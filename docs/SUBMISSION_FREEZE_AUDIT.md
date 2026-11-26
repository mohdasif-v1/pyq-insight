# PYQ Insight — Final Submission Freeze Audit & Verification

**Audit Date:** November 26, 2026  
**Final Local HEAD Commit:** `3225bed` (`docs: add final runtime acceptance test report`)  
**Previous Baseline Commit:** `7c2124c` (`feat: finalize PYQ Insight implementation and academic report`)  
**Upstream Branch:** `origin/main` at `92940f8`  
**Repository:** https://github.com/mohdasif-v1/pyq-insight  
**Freeze Status:** **FROZEN FOR ACADEMIC EVALUATION & SUBMISSION**

---

## 1. Git & Working Tree Verification

- **Current HEAD:** `3225bed`
- **Tracked Documentation Added:** `docs/FINAL_RUNTIME_ACCEPTANCE.md` (committed cleanly in separate documentation commit `3225bed`).
- **Working Tree Cleanliness:** Clean. No untracked code, builds, or dependencies.
- **Untracked Local Backup:** `PYQ_Insight_Mini_Project_Report_original_backup.docx` (strictly preserved and uncommitted as requested).
- **Remote Push Status:** **No push performed.** Local commits remain ahead of `origin/main` by 2 commits (`7c2124c`, `3225bed`).

---

## 2. DOCX Academic Report Verification

- **Document Audited:** `PYQ_Insight_Mini_Project_Report.docx`
- **Structural Integrity:**
  - 869 paragraphs, 40 tables, 41 embedded inline shapes/figures.
  - Zero broken XML elements, zero missing document headers/footers.
  - Zero placeholder text tokens (e.g. `[STUDENT NAME]`, `[ROLL NUMBER]`, `TODO`, `TBD`, `FIXME`). The only occurrences of the word `placeholder` are literal HTML form attributes inside code listings (`placeholder="Email"`).
- **Table Integrity:**
  - **Table 35 (Black-Box Tests):** 10 test cases, all marked `PASS` with real observed outputs.
  - **Table 36 (White-Box Tests):** 6 test cases, all marked `PASS` with real unit results.
  - **Table 38 (Security Tests):** 6 test cases, all marked `PASS` with observed HTTP status codes.
  - **Table 39 (Evaluation Results / Table 7.1):** Supervised classification metrics (Accuracy, Precision, Recall, F1) remain **explicitly unpopulated** (`Pending manual ground-truth completion (Supervised metrics require true_topic labels)`).
  - **Unsupervised Benchmarks:** Table 39 documents verified silhouette scores:
    - DBMS ($K=15$): Silhouette Score = `0.0631`
    - DA ($K=14$): Silhouette Score = `0.0263`
- **UI Screenshot Verification:**
  - Section 5.5 embedded tables (Tables 30, 31, 32, 33) and Section 2.3 tables (Tables 5, 6) contain genuine high-resolution screenshots captured directly from the running Next.js application at `http://localhost:3000`:
    - `fig_5_5_19_login.png` (Login Page)
    - `fig_5_5_20_dashboard_heatmap_trend.png` (Student Dashboard with Topic Heatmap & Trend)
    - `fig_5_5_21_study_planner.png` (Study Planner Page)
    - `fig_5_5_22_admin_upload_review.png` (Admin Paper Upload and Review Queue)
    - `fig_2_3_2_desktop_dashboard.png` (Desktop View)
    - `fig_2_3_3_mobile_dashboard.png` (Mobile View)

---

## 3. Database State Analysis (Pre-existing vs Seeded vs Runtime Tested)

Inspection of MongoDB database `pyqinsight` clarifies the origin of all stored records:

### 3.1 Collections & Counts
- `users`: **4 records**
  - **Seeded:** `admin@pyqinsight.edu` (System Administrator, seeded via `backend/scripts/createAdmin.js`).
  - **Pre-existing test run:** `student_test_1795718004881@kit.ac.in`, `student_test_1795718039279@kit.ac.in`.
  - **Live Runtime Test:** `test_pyq_student@kit.ac.in` (Created during live Step 1 test).
- `subjects`: **2 records**
  - **Seeded:** Database Management System (`KCS501`) and Data Analytics (`KCS051`) seeded via `backend/scripts/seed_syllabus.js`.
- `units`: **10 records**
  - **Seeded:** 5 units for DBMS, 5 units for Data Analytics.
- `topics`: **63 records**
  - **Seeded:** 37 syllabus topics for DBMS, 26 syllabus topics for Data Analytics.
- `paper`: **10 records**
  - **Pre-existing (Benchmark Evaluation Run):** 8 papers (4 DBMS: 2022, 2023, 2024, 2025; 4 DA: 2023, 2024, 2025, 2026) yielding 191 segmented questions.
  - **Live Runtime Acceptance Test Uploads:** 2 test upload records of `dbms_2022.pdf` (`6b087c5591c5b0efaf511ad2` and `6b087c6091c5b0efaf511aee`), each generating 25 segmented questions.
- `questions`: **241 records**
  - 191 pre-existing questions from the 8 evaluation papers.
  - 50 questions from the 2 live acceptance test uploads ($25 \times 2$).
- `studyplans`: **1 record**
  - **Live Runtime Test:** Plan `6b087c9291c5b0efaf511b2a` generated for student `test_pyq_student@kit.ac.in` with 3 daily hours and revision day.
- `questions` needing review: **7 records**
  - Originally 8 low-confidence questions; 1 question (`6b07ee7d79136c97f35986e6`) was successfully verified and approved during live Step 10 test.

---

## 4. Extraction Accuracy & Evaluation Framing

- **Extraction Accuracy vs Question Count:**
  - Extraction accuracy is evaluated by regex and structural section segmentation across Section A, Section B, and Section C of AKTU papers.
  - In Section A, short 2-mark questions are extracted (e.g. `1(a)` through `1(j)`).
  - In Section B, long 10-mark questions are extracted (e.g. `2(a)` through `2(e)`).
  - In Section C, multi-choice long questions are extracted (e.g. `3(a)`, `3(b)` through `7(a)`, `7(b)`).
  - **Verification:** Accuracy is not merely count matching; question numbering tokens, section boundaries, and assigned marks are validated against the PDF layout.
- **Classification Accuracy:**
  - Topic classification is framed as TF-IDF cosine similarity against syllabus topic keyword representations.
  - Because no verified human ground-truth labels have been finalized for all 191 questions, supervised metrics (Precision, Recall, Macro/Micro F1) remain **formally unverified and pending**.

---

## 5. Docker & Runtime Environment Status

- **Docker Compose Configuration:** `PASS` (Syntactically valid multi-service configuration in `docker-compose.yml`).
- **Docker Engine Runtime (WSL2):** **BLOCKED**. The Docker Desktop WSL2 integration was not enabled in the host OS distro, preventing container daemon communication.
- **Local Native Runtime:** **PASS**. MongoDB, Uvicorn (FastAPI), Node.js (Express), and Next.js (Frontend) all ran natively in the local environment and passed the end-to-end user workflow test.

---

## 6. Secret & Security Hygiene

- **Tracked Repository Audit:**
  - `git ls-files` was scanned for credentials, tokens, `.env` files, private keys, virtualenvs, and runtime uploads.
  - Only template files (`.env.example`, `backend/.env.example`) and unit test utility files (`apps/api/src/utils/token.ts`) are tracked.
  - Zero real secrets, passwords, or active API keys are present in Git.
  - `apps/ml/venv/`, `node_modules/`, `dist/`, `.next/`, and `uploads/` are excluded by `.gitignore`.

---

## 7. Submission Checklist & Recommendations

| Item | Status | Action / Guidance |
| :--- | :--- | :--- |
| Canonical Architecture (`backend/`, `frontend/`, `nlp/`) | Confirmed & Verified | Ready for demonstration |
| Preserved Reference Monorepo (`apps/`, `packages/`) | Preserved Untouched | Retained for reference |
| Academic Report (`PYQ_Insight_Mini_Project_Report.docx`) | Verified & Formatted | Ready for submission/printing |
| Original Report Backup | Preserved Untracked | Retained locally |
| Runtime Test Report (`docs/FINAL_RUNTIME_ACCEPTANCE.md`) | Committed (`3225bed`) | Ready in repository |
| GitHub Push | **Not Pushed** | Ready to push when user gives explicit instruction |
