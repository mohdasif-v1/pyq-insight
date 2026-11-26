import csv
import json
import os
import sys
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
sys.path.insert(0, PARENT_DIR)

from mapper import TopicMapper
from preprocess import preprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
RESULTS_DIR = os.path.join(BASE_DIR, "results")
FIGS_DIR = os.path.join(RESULTS_DIR, "figures")
os.makedirs(FIGS_DIR, exist_ok=True)


def load_syllabus(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    topics = []
    for t in data:
        topics.append({
            "id": t["topic"],
            "name": t["topic"],
            "keywords": t["keywords"],
            "unit": t["unit"]
        })
    return topics


def keyword_baseline(texts, topics):
    predictions = []
    for text in texts:
        clean = preprocess(text).split()
        scores = {}
        for t in topics:
            kw_set = {preprocess(k) for k in t["keywords"]}
            # count overlap
            overlap = sum(1 for w in clean if any(w in k or k in w for k in kw_set))
            scores[t["id"]] = overlap
        best_t = max(scores, key=scores.get)
        predictions.append(best_t if scores[best_t] > 0 else None)
    return predictions


def run_evaluation_for_subject(csv_file, syllabus_file, subject_name):
    topics = load_syllabus(syllabus_file)
    with open(csv_file, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    texts = [r["question_text"] for r in rows]
    y_true = [r["true_topic"] for r in rows]

    # Model evaluation
    mapper = TopicMapper(topics, threshold=0.15)
    mapped = mapper.map(texts)
    y_pred = [m["topic_id"] for m in mapped]
    confidences = [m["confidence"] for m in mapped]
    needs_review = [m["needs_review"] for m in mapped]

    # Review queue fraction
    review_fraction = sum(needs_review) / len(rows)

    # Accepted only accuracy
    accepted_indices = [i for i, nr in enumerate(needs_review) if not nr]
    accepted_acc = 0.0
    if accepted_indices:
        accepted_acc = sum(1 for i in accepted_indices if y_pred[i] == y_true[i]) / len(accepted_indices)

    # Overall accuracy
    overall_acc = sum(1 for yp, yt in zip(y_pred, y_true) if yp == yt) / len(rows)

    # Baseline accuracy
    base_preds = keyword_baseline(texts, topics)
    baseline_acc = sum(1 for bp, yt in zip(base_preds, y_true) if bp == yt) / len(rows)

    # Threshold sweep
    sweep_results = {}
    for th in [0.05, 0.10, 0.15, 0.20, 0.25, 0.30]:
        th_mapper = TopicMapper(topics, threshold=th)
        th_mapped = th_mapper.map(texts)
        th_pred = [m["topic_id"] for m in th_mapped]
        th_review = sum(m["needs_review"] for m in th_mapped)
        th_acc = sum(1 for yp, yt in zip(th_pred, y_true) if yp == yt) / len(rows)
        sweep_results[f"{th:.2f}"] = {
            "accuracy": round(th_acc * 100, 2),
            "review_queue_count": th_review,
            "review_queue_percent": round(th_review / len(rows) * 100, 2)
        }

    # Classification report
    all_classes = sorted(list({t["id"] for t in topics}))
    clf_report = classification_report(
        y_true,
        [yp or "OUT_OF_SCOPE" for yp in y_pred],
        labels=all_classes,
        output_dict=True,
        zero_division=0
    )
    conf_mat = confusion_matrix(
        y_true,
        [yp or "OUT_OF_SCOPE" for yp in y_pred],
        labels=all_classes
    ).tolist()

    return {
        "subject": subject_name,
        "total_questions": len(rows),
        "overall_accuracy": round(overall_acc * 100, 2),
        "accepted_accuracy": round(accepted_acc * 100, 2),
        "review_queue_fraction": round(review_fraction * 100, 2),
        "keyword_baseline_accuracy": round(baseline_acc * 100, 2),
        "threshold_sweep": sweep_results,
        "classification_report": clf_report,
        "confusion_matrix": conf_mat,
        "classes": all_classes
    }


def main():
    dbms_csv = os.path.join(BASE_DIR, "labels_dbms.csv")
    da_csv = os.path.join(BASE_DIR, "labels_da.csv")
    dbms_syl = os.path.join(DATA_DIR, "syllabus_dbms.json")
    da_syl = os.path.join(DATA_DIR, "syllabus_da.json")

    # Verify files
    with open(dbms_csv, "r", encoding="utf-8") as f:
        r1 = list(csv.DictReader(f))
    if any(not r["true_topic"].strip() for r in r1):
        print("ERROR: labels_dbms.csv is not fully labelled yet.")
        sys.exit(1)

    with open(da_csv, "r", encoding="utf-8") as f:
        r2 = list(csv.DictReader(f))
    if any(not r["true_topic"].strip() for r in r2):
        print("ERROR: labels_da.csv is not fully labelled yet.")
        sys.exit(1)

    print("Running real evaluation...")
    dbms_res = run_evaluation_for_subject(dbms_csv, dbms_syl, "Database Management System")
    da_res = run_evaluation_for_subject(da_csv, da_syl, "Data Analytics")

    combined_total = dbms_res["total_questions"] + da_res["total_questions"]
    combined_acc = (dbms_res["overall_accuracy"] * dbms_res["total_questions"] +
                    da_res["overall_accuracy"] * da_res["total_questions"]) / combined_total
    combined_baseline = (dbms_res["keyword_baseline_accuracy"] * dbms_res["total_questions"] +
                         da_res["keyword_baseline_accuracy"] * da_res["total_questions"]) / combined_total

    results = {
        "dbms": dbms_res,
        "da": da_res,
        "combined": {
            "total_questions": combined_total,
            "overall_accuracy": round(combined_acc, 2),
            "keyword_baseline_accuracy": round(combined_baseline, 2)
        }
    }

    out_json = os.path.join(RESULTS_DIR, "metrics.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"Metrics saved to {out_json}")
    print(f"DBMS Accuracy: {dbms_res['overall_accuracy']}% (Baseline: {dbms_res['keyword_baseline_accuracy']}%)")
    print(f"DA Accuracy: {da_res['overall_accuracy']}% (Baseline: {da_res['keyword_baseline_accuracy']}%)")
    print(f"Combined Accuracy: {results['combined']['overall_accuracy']}%")


if __name__ == "__main__":
    main()
