# Final Report Changelog — PYQ Insight

This document records the modifications made to `PYQ_Insight_Mini_Project_Report.docx` to guarantee complete scientific integrity and 100% synchronization with the actual verified software implementation.

---

## 1. Summary of Changes

| Section / Element | Previous Text / State | Updated Verified State | Reason / Evidence |
|---|---|---|---|
| **Table 39 (Row 1: Topic-Mapping Accuracy)** | Claimed: *"84.5% overall topic classification accuracy across 191 questions"* | Updated to: *"Pending manual ground-truth completion (Pipeline ready in nlp/evaluation/evaluate.py)"* | `labels_dbms.csv` (97) and `labels_da.csv` (94) have blank `true_topic`. In accordance with academic honesty directives, model predictions were not used to fabricate self-evaluations. |
| **Table 39 (Row 2: Precision, Recall, F1)** | Claimed: *"Macro Avg Precision: 0.86, Recall: 0.84, F1-Score: 0.85"* | Updated to: *"Pending manual ground-truth completion (Supervised metrics require true_topic labels)"* | Prevents circular unvalidated metric claims; aligns with unpopulated ground-truth state. |
| **Table 39 (Row 3: Keyword Baseline)** | Claimed: *"52.6% accuracy (+31.9% improvement)"* | Updated to: *"Pending manual ground-truth completion (Baseline script ready)"* | Baseline comparisons require ground-truth labels for mathematical validity. |
| **Table 39 (Row 4: Clustering Quality)** | Claimed: *"DBMS: Silhouette = 0.0740 (K=15)"* | Updated to: *"DBMS: Silhouette = 0.0631 (K=15); DA: Silhouette = 0.0263 (K=14); meaningful groups formed"* | Accurately updated to match the fresh empirical benchmark run using `evaluate_clusters.py` across all 191 questions. |
| **Table 39 (Row 5: Extraction Accuracy)** | Stated: *"100.0% extraction accuracy (191 / 191 questions)"* | **Retained as Verified**: *"100.0% extraction accuracy (191 / 191 questions correctly segmented across 8 real AKTU papers)"* | Reproducibly verified by running `evaluate_extraction.py` against `expected_counts.csv` across 8 real PDFs. |
| **Table 39 (Row 6: Processing Speed)** | Claimed: *"0.26s average per paper"* | Updated to: *"0.24s average per paper (minimum: 0.10s, maximum: 0.56s across 8 papers)"* | Updated to match the measured benchmark average across `da_2023.pdf` through `dbms_2025.pdf`. |

---

## 2. Integrity Verification
- **Original Document Backup:** The file `PYQ_Insight_Mini_Project_Report_original_backup.docx` remains preserved locally on disk and untouched.
- **Academic Formatting:** Times New Roman styling, margins, headers, table numbering, and page layouts have been preserved.
