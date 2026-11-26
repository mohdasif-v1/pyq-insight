# PYQ Insight — Previous Year Question Intelligence & Adaptive Planner

An automated exam preparation platform designed for Dr. A.P.J. Abdul Kalam Technical University (AKTU) B.Tech students. PYQ Insight ingests previous year university examination question papers, strips watermarks and OCR artifacts, automatically maps questions to syllabus topics, clusters recurring question variants, and generates optimal revision study plans.

---

## 1. Project Architecture

The system consists of three decoupled services:
- **`nlp/` (FastAPI, Python 3.10+)**: Handles PDF text extraction, noise stripping, TF-IDF + Cosine Similarity topic mapping, K-Means question clustering, multi-factor priority scoring, and greedy study schedule generation.
- **`backend/` (Node.js Express, MongoDB, Redis [optional])**: RESTful API managing syllabus structure, role-based authentication (student/admin), question review queue, and student revision progress tracking.
- **`frontend/` (Next.js 14, Tailwind CSS, Recharts)**: Responsive desktop and mobile interface featuring interactive heatmaps, exam question trends, practice mode, study planner, and admin ingestion controls.

```
PYQ_Insight_source_code/
├── backend/                  # Node.js Express REST API
│   ├── src/                  # Controllers, models, middleware, routes
│   ├── scripts/              # createAdmin.js, seed.js, seed_syllabus.js
│   └── tests/                # Jest test suite with coverage
├── frontend/                 # Next.js 14 App Router frontend
│   ├── app/                  # login, register, dashboard, planner, practice, admin
│   ├── components/           # Heatmap.jsx, TrendChart.jsx
│   └── lib/                  # api.js client fetch wrapper
├── nlp/                      # FastAPI Python NLP microservice
│   ├── evaluation/           # Evaluation scripts, ground truth data, syllabi
│   │   ├── data/papers/      # Real AKTU exam PDFs (dbms, da)
│   │   ├── labels_dbms.csv   # 97 questions ready for student ground truth
│   │   ├── labels_da.csv     # 94 questions ready for student ground truth
│   │   ├── evaluate.py       # Metrics, confusion matrix, threshold sweep
│   │   └── validate_labels.py# Label integrity validator
│   ├── extract.py            # PDF text and table extractor
│   ├── segment.py            # Exam question segmentation & noise cleaner
│   ├── mapper.py             # TF-IDF topic mapping (threshold 0.15)
│   ├── cluster.py            # K-Means clustering with silhouette selection
│   ├── scoring.py            # Frequency + Recency + Marks weighting formula
│   └── planner.py            # Greedy adaptive study planner
├── report_assets/            # Real browser screenshots & test logs
└── docker-compose.yml        # Multi-container containerization
```

---

## 2. Core Methodologies & Algorithms

1. **Question Segmentation & Noise Cleaning (`nlp/segment.py`)**:
   - Strips university watermarks, timestamps, download IP addresses, and tabular header tags (`QP25DP1...`, `Printed Page`, etc.).
   - Discards corrupted Hindi transliterations in bilingual examination papers, preserving technical symbols (`->`, `{}`, `=`).
   - Normalizes question numbering across cohorts: plain text (`a.`, `(a)`), table rows, and roman sub-items (`(i)-(iv)`).
2. **Topic Mapping (`nlp/mapper.py`)**:
   - Preprocesses question text with stop-word filtering, lemmatization, and uni/bi-gram TF-IDF vectorization.
   - Maps each question to syllabus topics using Cosine Similarity; matches scoring below 0.15 confidence are automatically routed to the Admin Review Queue.
3. **Recurring Question Clustering (`nlp/cluster.py`)**:
   - Groups repeated and paraphrased questions using K-Means with Silhouette Analysis across $K \in [2, 15]$.
4. **Topic Priority Score (`nlp/scoring.py`)**:
   $$\text{Score} = 0.4 \times \text{Frequency} + 0.3 \times \text{Recency} + 0.3 \times \text{MarksWeight}$$
   Scaled to $0-100\%$: High ($\ge 66\%$), Medium ($\ge 33\%$), Low ($< 33\%$).
5. **Greedy Study Planner (`nlp/planner.py`)**:
   - Allocates available daily study hours proportionally to topic priority, applying a $1.5\times$ multiplier to student-marked weak topics and dedicating the final day to comprehensive revision.

---

## 3. Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/pyqinsight
JWT_SECRET=btech_pyq_insight_secret_jwt_key_2026
NLP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
# REDIS_URL=redis://localhost:6379  (Optional)
```

### NLP Service Environment Variables (Windows Optional)
```bash
TESSERACT_CMD="C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH="C:\Program Files\poppler\Library\bin"
```

---

## 4. Setup and Execution

### Step 1: Start MongoDB
Ensure MongoDB service is running locally (`net start MongoDB`) or through Docker (`docker compose up -d mongo redis`).

### Step 2: NLP Microservice
```bash
cd nlp
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -c "import nltk; nltk.download('stopwords'); nltk.download('wordnet'); nltk.download('omw-1.4')"
python -m uvicorn main:app --port 8000
```
Swagger documentation opens at: `http://localhost:8000/docs`

### Step 3: Backend API Service
```bash
cd backend
npm install
node scripts/createAdmin.js      # Creates admin: admin@pyqinsight.edu / admin12345
node scripts/seed_syllabus.js    # Seeds DBMS and Data Analytics syllabus
npm start
```
API endpoints and Swagger documentation open at: `http://localhost:5000/api/docs`

### Step 4: Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
Access the application at: `http://localhost:3000`

---

## 5. Running Tests and Evaluation

### Automated Unit & Coverage Tests
```bash
# Backend Jest Tests with coverage
cd backend
npm test -- --coverage

# NLP Pytest Suite
cd nlp
pytest -v
```

### Ground-Truth Labelling & Benchmark Validation
1. Fill in `true_topic` in `nlp/evaluation/labels_dbms.csv` and `labels_da.csv` using the topic titles listed in `nlp/evaluation/labelling_guide.md`.
2. Validate labels:
   ```bash
   cd nlp
   python evaluation/validate_labels.py
   ```
3. Run extraction benchmark & clustering evaluation:
   ```bash
   python evaluation/evaluate_extraction.py
   python evaluation/evaluate_clusters.py
   python evaluation/evaluate.py
   ```
Results and metrics will be saved in `nlp/evaluation/results/metrics.json` and figures in `nlp/evaluation/results/figures/`.
