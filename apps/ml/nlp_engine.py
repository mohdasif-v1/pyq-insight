import re
import string
from typing import List, Dict, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering

STOPWORDS = {
    'what', 'is', 'are', 'explain', 'describe', 'discuss', 'with', 'suitable',
    'example', 'diagram', 'short', 'note', 'on', 'the', 'of', 'and', 'in', 'to',
    'for', 'a', 'an', 'define', 'write', 'differentiate', 'between', 'how', 'does',
    'briefly', 'compare', 'contrast', 'give', 'detail', 'state', 'prove'
}

def preprocess_text(text: str) -> str:
    """Deterministic token clean, lowercasing, and academic exam stop-word removal."""
    text = text.lower()
    text = re.sub(r'\d+', ' ', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = text.split()
    filtered = [w for w in tokens if w not in STOPWORDS and len(w) > 2]
    return ' '.join(filtered)

def map_questions_to_topics(
    questions: List[Dict[str, Any]], 
    topics: List[Dict[str, Any]], 
    threshold: float = 0.15
) -> List[Dict[str, Any]]:
    """
    Computes TF-IDF vectors for topics (name + keywords + description)
    and questions, calculating cosine similarity to assign best candidate topic.
    """
    if not questions or not topics:
        return questions

    # Prepare topic documents
    topic_docs = []
    for t in topics:
        doc = f"{t.get('name', '')} {' '.join(t.get('keywords', []))} {t.get('description', '')}"
        topic_docs.append(preprocess_text(doc))

    question_docs = [preprocess_text(q.get("normalised_text", q.get("original_text", ""))) for q in questions]

    # Fit TF-IDF on topic corpus + question corpus
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    all_corpus = topic_docs + question_docs
    vectorizer.fit(all_corpus)

    topic_vectors = vectorizer.transform(topic_docs)
    question_vectors = vectorizer.transform(question_docs)

    sim_matrix = cosine_similarity(question_vectors, topic_vectors)

    mapped_results = []
    for i, q in enumerate(questions):
        sims = sim_matrix[i]
        best_idx = int(np.argmax(sims))
        best_score = float(sims[best_idx])

        candidates = []
        top_indices = np.argsort(sims)[::-1][:3]
        for tidx in top_indices:
            candidates.append({
                "topic_id": topics[tidx]["id"],
                "topic_name": topics[tidx]["name"],
                "score": float(sims[tidx])
            })

        q_copy = dict(q)
        q_copy["mapping_confidence"] = round(best_score, 4)
        q_copy["candidates"] = candidates

        if best_score >= threshold:
            q_copy["topic_id"] = topics[best_idx]["id"]
            q_copy["mapping_status"] = "AUTO_MAPPED"
        else:
            q_copy["topic_id"] = topics[best_idx]["id"] if best_score > 0.05 else None
            q_copy["mapping_status"] = "REVIEW_REQUIRED" if best_score > 0 else "UNMAPPED"

        mapped_results.append(q_copy)

    return mapped_results

def cluster_similar_questions(questions: List[Dict[str, Any]], distance_threshold: float = 0.6) -> List[Dict[str, Any]]:
    """
    Agglomerative clustering on question TF-IDF vectors to identify repeated questions across years.
    """
    if len(questions) < 2:
        return []

    texts = [preprocess_text(q.get("normalised_text", q.get("original_text", ""))) for q in questions]
    vectorizer = TfidfVectorizer(min_df=1, ngram_range=(1, 2))
    vectors = vectorizer.fit_transform(texts)

    if vectors.shape[0] < 2 or vectors.shape[1] == 0:
        return []

    dense = vectors.toarray()
    # Agglomerative clustering with cosine distance
    clustering = AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=distance_threshold,
        metric='cosine',
        linkage='average'
    )
    labels = clustering.fit_predict(dense)

    clusters_dict: Dict[int, List[Dict[str, Any]]] = {}
    for idx, label in enumerate(labels):
        clusters_dict.setdefault(label, []).append(questions[idx])

    result_clusters = []
    for label, members in clusters_dict.items():
        if len(members) > 1: # Only clusters with 2 or more repeated questions
            # Representative question is the one with longest text or highest marks
            rep = max(members, key=lambda m: len(m.get("original_text", "")))
            result_clusters.append({
                "representative_question_id": rep.get("id"),
                "representative_text": rep.get("original_text"),
                "member_question_ids": [m.get("id") for m in members],
                "cluster_size": len(members),
                "years_repeated": sorted(list({m.get("year") for m in members if m.get("year")}))
            })

    return result_clusters
