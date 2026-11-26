from collections import defaultdict

HIGH, MEDIUM = 0.66, 0.33


def _normalise(values: dict) -> dict:
    top = max(values.values(), default=0) or 1
    return {k: v / top for k, v in values.items()}


def topic_scores(questions: list, current_year: int, weights=(0.4, 0.3, 0.3)) -> dict:
    """Score(topic) = w1*Frequency + w2*Recency + w3*MarksWeight, each scaled to 0-1."""
    total_q = len(questions) or 1
    total_marks = sum(q["marks"] for q in questions) or 1
    freq, marks = defaultdict(float), defaultdict(float)
    years = defaultdict(set)
    for q in questions:
        t = q.get("topic_id")
        if t is None:
            continue
        freq[t] += 1 / total_q
        marks[t] += q["marks"] / total_marks
        years[t].add(q["year"])
    recency = {t: sum(1 / (1 + current_year - y) for y in ys) for t, ys in years.items()}
    f, r, m = _normalise(freq), _normalise(recency), _normalise(marks)
    w1, w2, w3 = weights
    result = {}
    for t in freq:
        s = w1 * f[t] + w2 * r[t] + w3 * m[t]
        level = "High" if s >= HIGH else "Medium" if s >= MEDIUM else "Low"
        result[t] = {"frequency": round(f[t], 3), "recency": round(r[t], 3),
                     "marks_weight": round(m[t], 3), "score": round(100 * s, 1), "level": level}
    return result
