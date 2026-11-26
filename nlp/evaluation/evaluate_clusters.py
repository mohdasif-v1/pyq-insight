import csv
import glob
import os
import sys
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import silhouette_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
sys.path.insert(0, PARENT_DIR)

from cluster import cluster_questions
from extract import extract_paper
from preprocess import preprocess
from segment import segment_questions

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PAPERS_DIR = os.path.join(BASE_DIR, "data", "papers")
FIGS_DIR = os.path.join(BASE_DIR, "results", "figures")
os.makedirs(FIGS_DIR, exist_ok=True)


def evaluate_subject_clusters(sub_code, sub_name):
    pdf_files = sorted(glob.glob(os.path.join(PAPERS_DIR, sub_code, "*.pdf")))
    all_texts = []
    question_meta = []

    for pdf_path in pdf_files:
        fname = os.path.basename(pdf_path)
        year = fname.split("_")[1].replace(".pdf", "")
        extracted = extract_paper(pdf_path)
        qs = segment_questions(extracted)
        for q in qs:
            all_texts.append(q["text"])
            question_meta.append({"year": year, "text": q["text"], "no": q["no"]})

    print(f"\n[{sub_name}] Total questions collected: {len(all_texts)}")

    # Vectorize
    X = TfidfVectorizer(ngram_range=(1, 2)).fit_transform([preprocess(t) for t in all_texts])

    # Silhouette vs K sweep (K = 2 to 15)
    k_range = list(range(2, min(16, X.shape[0])))
    scores = []
    best_k, best_score = 2, -1.0

    for k in k_range:
        labels = KMeans(n_clusters=k, n_init=10, random_state=42).fit_predict(X)
        score = silhouette_score(X, labels)
        scores.append(score)
        if score > best_score:
            best_k, best_score = k, score

    # Plot silhouette vs K
    plt.figure(figsize=(7, 4.5))
    plt.plot(k_range, scores, marker="o", color="#4f46e5", linewidth=2, markersize=6)
    plt.axvline(best_k, color="#ef4444", linestyle="--", label=f"Optimal K={best_k} (Score: {best_score:.3f})")
    plt.title(f"Silhouette Score vs Cluster Count K ({sub_name})", fontsize=11, fontweight="bold")
    plt.xlabel("Number of Clusters (K)")
    plt.ylabel("Mean Silhouette Coefficient")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend()
    plt.tight_layout()
    plot_path = os.path.join(FIGS_DIR, f"silhouette_vs_k_{sub_code}.png")
    plt.savefig(plot_path, dpi=200)
    plt.close()
    print(f"Saved silhouette plot to {plot_path}")

    return {
        "subject": sub_name,
        "best_k": best_k,
        "best_silhouette": round(best_score, 4),
        "total_questions": len(all_texts)
    }


def main():
    print("Evaluating K-Means clustering and silhouette across real exam papers...")
    dbms_res = evaluate_subject_clusters("dbms", "Database Management System")
    da_res = evaluate_subject_clusters("da", "Data Analytics")

    print("\n=======================================================")
    print("CLUSTERING BENCHMARK RESULTS")
    print("=======================================================")
    print(f"DBMS: Chosen K = {dbms_res['best_k']}, Silhouette = {dbms_res['best_silhouette']}")
    print(f"DA:   Chosen K = {da_res['best_k']}, Silhouette = {da_res['best_silhouette']}")
    print("=======================================================\n")


if __name__ == "__main__":
    main()
