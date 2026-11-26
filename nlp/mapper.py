from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from preprocess import preprocess


class TopicMapper:
    """Maps each question to the syllabus topic with the highest cosine similarity."""

    def __init__(self, topics: list, threshold: float = 0.15):
        self.topics, self.threshold = topics, threshold
        docs = [preprocess(t["name"] + " " + " ".join(t["keywords"])) for t in topics]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        self.topic_matrix = self.vectorizer.fit_transform(docs)

    def map(self, texts: list) -> list:
        q_matrix = self.vectorizer.transform([preprocess(t) for t in texts])
        sims = cosine_similarity(q_matrix, self.topic_matrix)
        results = []
        for row in sims:
            best = int(row.argmax())
            score = float(row[best])
            low = score < self.threshold
            results.append({
                "topic_id": None if low else self.topics[best]["id"],
                "confidence": round(score, 3),
                "needs_review": low,
            })
        return results
