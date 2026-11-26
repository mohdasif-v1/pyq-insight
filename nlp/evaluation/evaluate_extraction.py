import csv
import glob
import os
import sys
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
sys.path.insert(0, PARENT_DIR)

from extract import extract_paper
from segment import segment_questions

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
EXPECTED_COUNTS_FILE = os.path.join(DATA_DIR, "expected_counts.csv")
PAPERS_DIR = os.path.join(DATA_DIR, "papers")


def main():
    expected = {}
    with open(EXPECTED_COUNTS_FILE, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or row[0].startswith("#"):
                continue
            if row[0] == "paper_file":
                continue
            expected[row[0].strip()] = int(row[1].strip())

    total_expected = 0
    total_extracted = 0
    results = []

    pdf_files = sorted(glob.glob(os.path.join(PAPERS_DIR, "*", "*.pdf")))

    print("\n==========================================================================")
    print("EXTRACTION & SEGMENTATION BENCHMARK EVALUATION")
    print("==========================================================================")
    print(f"{'Paper File':<20} | {'Expected':<10} | {'Extracted':<10} | {'Accuracy':<10} | {'Seconds':<10}")
    print("-" * 72)

    for pdf_path in pdf_files:
        fname = os.path.basename(pdf_path)
        exp = expected.get(fname, 0)
        total_expected += exp

        t0 = time.time()
        extracted = extract_paper(pdf_path)
        questions = segment_questions(extracted)
        elapsed = round(time.time() - t0, 3)

        ext_cnt = len(questions)
        total_extracted += ext_cnt
        acc = round((ext_cnt / exp) * 100, 2) if exp > 0 else 0.0

        results.append({
            "paper_file": fname,
            "expected": exp,
            "extracted": ext_cnt,
            "accuracy": acc,
            "seconds": elapsed
        })
        print(f"{fname:<20} | {exp:<10} | {ext_cnt:<10} | {acc:<9}% | {elapsed:<10}s")

    overall_acc = round((total_extracted / total_expected) * 100, 2) if total_expected > 0 else 0.0
    print("-" * 72)
    print(f"{'OVERALL':<20} | {total_expected:<10} | {total_extracted:<10} | {overall_acc:<9}% |")
    print("==========================================================================\n")


if __name__ == "__main__":
    main()
