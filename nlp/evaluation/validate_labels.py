import csv
import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


def load_valid_topics(syllabus_json_path):
    with open(syllabus_json_path, "r", encoding="utf-8") as f:
        topics = json.load(f)
    return {t["topic"] for t in topics} | {"OUT_OF_SCOPE"}


def validate_csv(csv_path, valid_topics, subject_name):
    if not os.path.exists(csv_path):
        print(f"[{subject_name}] ERROR: File not found: {csv_path}")
        return False

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))

    total = len(reader)
    if total == 0:
        print(f"[{subject_name}] ERROR: File is empty: {csv_path}")
        return False

    unlabelled = 0
    invalid_topics = []
    seen = set()
    duplicates = []

    for idx, row in enumerate(reader, start=2):
        paper = row.get("paper_file", "").strip()
        qno = row.get("question_no", "").strip()
        pair = (paper, qno)
        if pair in seen:
            duplicates.append((idx, pair))
        seen.add(pair)

        topic = row.get("true_topic", "").strip()
        if not topic:
            unlabelled += 1
        elif topic not in valid_topics:
            invalid_topics.append((idx, topic))

    print(f"\n=======================================================")
    print(f"Validation Report: {subject_name} ({total} questions)")
    print(f"=======================================================")
    print(f"Total Rows: {total}")
    print(f"Unlabelled Rows: {unlabelled}")

    if duplicates:
        print(f"DUPLICATES FOUND: {len(duplicates)}")
        for line, p in duplicates[:5]:
            print(f"  Line {line}: Paper {p[0]}, Question {p[1]}")

    if invalid_topics:
        print(f"INVALID TOPIC NAMES: {len(invalid_topics)}")
        for line, t in invalid_topics[:5]:
            print(f"  Line {line}: '{t}'")

    if unlabelled > 0 or duplicates or invalid_topics:
        print(f"\n[{subject_name}] VALIDATION FAILED: Please complete labelling according to labelling_guide.md.")
        return False

    print(f"[{subject_name}] VALIDATION PASSED: All {total} questions correctly labelled!")
    return True


def main():
    dbms_syllabus = os.path.join(DATA_DIR, "syllabus_dbms.json")
    da_syllabus = os.path.join(DATA_DIR, "syllabus_da.json")
    dbms_csv = os.path.join(BASE_DIR, "labels_dbms.csv")
    da_csv = os.path.join(BASE_DIR, "labels_da.csv")

    dbms_valid = load_valid_topics(dbms_syllabus)
    da_valid = load_valid_topics(da_syllabus)

    v1 = validate_csv(dbms_csv, dbms_valid, "DBMS")
    v2 = validate_csv(da_csv, da_valid, "Data Analytics")

    if not (v1 and v2):
        sys.exit(1)
    else:
        print("\nAll evaluation datasets are valid and ready for benchmark analysis!")


if __name__ == "__main__":
    main()
