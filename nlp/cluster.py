from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import silhouette_score

from preprocess import preprocess


def choose_k(X, k_min: int = 2, k_max: int = 15):
    """Pick the number of clusters with the best silhouette score."""
    best_k, best_score = k_min, -1.0
    for k in range(k_min, min(k_max, X.shape[0] - 1) + 1):
        labels = KMeans(n_clusters=k, n_init=10, random_state=42).fit_predict(X)
        score = silhouette_score(X, labels)
        if score > best_score:
            best_k, best_score = k, score
    return best_k, best_score


def cluster_questions(texts: list):
    """Group repeated or paraphrased questions; returns (labels, silhouette)."""
    if len(texts) < 4:
        return [0] * len(texts), 0.0
    X = TfidfVectorizer(ngram_range=(1, 2)).fit_transform([preprocess(t) for t in texts])
    k, score = choose_k(X)
    labels = KMeans(n_clusters=k, n_init=10, random_state=42).fit_predict(X)
    return labels.tolist(), float(score)
