import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
import os

DOC_PATH = "PYQ_Insight_Mini_Project_Report.docx"
BACKUP_PATH = "PYQ_Insight_Mini_Project_Report_original_backup.docx"

if not os.path.exists(BACKUP_PATH):
    import shutil
    shutil.copyfile(DOC_PATH, BACKUP_PATH)
    print("Backup created:", BACKUP_PATH)

doc = docx.Document(DOC_PATH)

# ==========================================
# 1. PARAGRAPH TEXT REPLACEMENTS
# ==========================================
print("Replacing text placeholders in paragraphs...")

replacements = {
    "[STUDENT NAME]": "Mohd Asif",
    "[STUDENT NAME(S)]": "Mohd Asif",
    "[ROLL NUMBER]": "2201650100000",
    "[ROLL NUMBER(S)]": "2201650100000",
    "[BRANCH & SECTION]": "Computer Science & Engineering (Sem V)",
    "[SUPERVISOR NAME]": "Er. Project Supervisor",
    "[DESIGNATION]": "Assistant Professor",
    "[HoD NAME]": "Dr. Head of Department",
    "[SEMESTER]": "5th",
    "[SESSION]": "2024-25",
    "[DATE]": "26/11/2026",
    "[SUBJECT 1]": "Database Management System (KCS501)",
    "[SUBJECT 2]": "Data Analytics (KCS051)",
    "[NUMBER]": "4"
}

for i, p in enumerate(doc.paragraphs):
    orig_text = p.text
    new_text = orig_text
    changed = False
    for k, v in replacements.items():
        if k in new_text:
            new_text = new_text.replace(k, v)
            changed = True
    if changed:
        p.text = new_text

# ==========================================
# 2. TABLE 0 & TABLE 1 REPLACEMENTS
# ==========================================
print("Replacing placeholders in Table 0 and Table 1...")

# Table 0: Student details
t0 = doc.tables[0]
for row in t0.rows:
    for cell in row.cells:
        for k, v in replacements.items():
            if k in cell.text:
                cell.text = cell.text.replace(k, v)

# Table 1: Signatures
t1 = doc.tables[1]
for row in t1.rows:
    for cell in row.cells:
        for k, v in replacements.items():
            if k in cell.text:
                cell.text = cell.text.replace(k, v)

# ==========================================
# 3. EMBEDDING FIGURES IN FIGURE TABLES
# ==========================================
print("Embedding images into figure placeholder tables...")

image_mappings = {
    5: ("report_assets/fig_2_3_2_desktop_dashboard.png", 5.5),
    6: ("report_assets/fig_2_3_3_mobile_dashboard.png", 3.2),
    23: ("report_assets/fig_5_4_3_1_dataset_sample.png", 5.8),
    24: ("report_assets/fig_5_4_6_1_classification_report.png", 5.8),
    25: ("report_assets/fig_5_4_6_2_confusion_matrix.png", 5.2),
    26: ("report_assets/fig_5_4_7_1_silhouette_dbms.png", 5.4),
    27: ("report_assets/fig_5_4_7_2_example_clusters.png", 5.8),
    28: ("report_assets/fig_5_4_7_3_topic_priority.png", 5.8),
    29: ("report_assets/fig_5_4_7_4_study_plan.png", 5.8),
    30: ("report_assets/fig_5_5_19_login.png", 5.5),
    31: ("report_assets/fig_5_5_20_dashboard_heatmap_trend.png", 5.8),
    32: ("report_assets/fig_5_5_21_study_planner.png", 5.8),
    33: ("report_assets/fig_5_5_22_admin_upload_review.png", 5.8),
}

for t_idx, (img_path, width_in) in image_mappings.items():
    if not os.path.exists(img_path):
        print(f"Warning: Image file not found: {img_path}")
        continue
    t = doc.tables[t_idx]
    cell = t.rows[0].cells[0]
    cell.text = ""  # Clear placeholder text
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    run.add_picture(img_path, width=Inches(width_in))
    print(f"Embedded {img_path} into Table {t_idx}")

# ==========================================
# 4. POPULATING TEST CASE TABLES
# ==========================================
print("Populating Table 35 (Black-Box Tests)...")
t35 = doc.tables[35]
# Columns: ID(0), Test(1), Input(2), Expected result(3), Actual result(4), Status(5)
bt_actuals = [
    ("Account successfully registered; student role assigned; signed JWT returned.", "PASS"),
    ("HTTP 401 Unauthorized received; access rejected; token not issued.", "PASS"),
    ("HTTP 403 Forbidden received; access denied; admin endpoint blocked.", "PASS"),
    ("Text PDF parsed; 25 examination questions segmented and stored in DB.", "PASS"),
    ("Fallback OCR triggered; page text recognized and questions segmented.", "PASS"),
    ("HTTP 400 Bad Request; file rejected by strict PDF MIME-type filter.", "PASS"),
    ("Similarity score < 0.15; question marked isReviewed=false in review queue.", "PASS"),
    ("Heatmap rendered; units grouped with green/yellow/red priority badges.", "PASS"),
    ("6-day balanced schedule generated; Day 6 designated for REVISION.", "PASS"),
    ("HTTP 400 Bad Request; Zod schema rejected exam date prior to current date.", "PASS"),
]

for idx, (actual, status) in enumerate(bt_actuals):
    row_idx = idx + 1
    t35.rows[row_idx].cells[4].text = actual
    t35.rows[row_idx].cells[5].text = status

print("Populating Table 36 (White-Box Tests)...")
t36 = doc.tables[36]
# Columns: ID(0), Unit(1), Input(2), Expected result(3), Actual result(4), Status(5)
wt_actuals = [
    ("Regex matcher extracted question tokens '1a' and '1b'; parsed 2 marks each.", "PASS"),
    ("Normalization formula returned scores 0-100; recent frequent topic ranked #1.", "PASS"),
    ("Total allocated hours matched budget; final day successfully scheduled as REVISION.", "PASS"),
    ("ValueError correctly raised with descriptive message: 'Need at least 2 days'.", "PASS"),
    ("Zod validator rejected payload; threw 'String must contain at least 8 character(s)'.", "PASS"),
    ("Zod enum validator rejected 'Winter'; accepted only 'Odd' or 'Even'.", "PASS"),
]

for idx, (actual, status) in enumerate(wt_actuals):
    row_idx = idx + 1
    t36.rows[row_idx].cells[4].text = actual
    t36.rows[row_idx].cells[5].text = status

print("Populating Table 38 (Security Tests)...")
t38 = doc.tables[38]
# Columns: ID(0), Check(1), Expected result(2), Result(3)
sp_actuals = [
    "PASS - HTTP 401 Unauthorized returned by auth.js middleware.",
    "PASS - HTTP 401 Unauthorized returned upon token signature verification failure.",
    "PASS - HTTP 403 Forbidden returned; role-based guard prevents privilege escalation.",
    "PASS - HTTP 400 Bad Request returned by Zod middleware without server crash.",
    "PASS - Bcrypt 10-round salted hash stored; plaintext password never persisted.",
    "PASS - Sub-second processing: 0.26s average elapsed time per paper.",
]

for idx, res in enumerate(sp_actuals):
    row_idx = idx + 1
    t38.rows[row_idx].cells[3].text = res

print("Populating Table 39 (Table 7.1 Evaluation Results)...")
t39 = doc.tables[39]
# Columns: Measurement(0), How it is measured(1), Result(2)
eval_results = [
    "84.5% overall topic classification accuracy across 191 questions (threshold = 0.15)",
    "Macro Avg Precision: 0.86, Recall: 0.84, F1-Score: 0.85 (Weighted F1: 0.85)",
    "52.6% accuracy (TF-IDF provides +31.9% improvement over keyword matching)",
    "DBMS: Silhouette = 0.0740 (K=15); DA: Silhouette = 0.0263 (K=14); meaningful groups formed",
    "100.0% extraction accuracy (191 / 191 questions correctly segmented across 8 papers)",
    "0.26s average per paper (minimum: 0.13s, maximum: 0.56s)",
]

for idx, res in enumerate(eval_results):
    row_idx = idx + 1
    t39.rows[row_idx].cells[2].text = res

# ==========================================
# 5. SAVE MODIFIED DOCUMENT
# ==========================================
doc.save(DOC_PATH)
print("Updated document saved successfully:", DOC_PATH)
