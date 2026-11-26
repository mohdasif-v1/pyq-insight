import pytest
from planner import build_plan
from scoring import topic_scores
from mapper import TopicMapper
from cluster import cluster_questions
from segment import (
    segment_questions,
    clean_watermarks_and_stamps,
    drop_hindi,
    is_roman_numeral,
)


def test_segmentation_finds_parts_and_marks():
    text = "Q1. (a) Explain stack and queue operations. (2 marks)\n(b) Define a binary tree with example. (2 marks)"
    qs = segment_questions(text)
    assert [q["no"] for q in qs] == ["1a", "1b"]
    assert qs[0]["marks"] == 2


def test_score_is_percentage_and_ordered():
    qs = [
        {"topic_id": "A", "marks": 10, "year": 2025},
        {"topic_id": "A", "marks": 10, "year": 2024},
        {"topic_id": "B", "marks": 2, "year": 2020},
    ]
    s = topic_scores(qs, 2026)
    assert 0 <= s["B"]["score"] < s["A"]["score"] <= 100
    assert s["A"]["level"] == "High"


def test_planner_uses_all_hours_and_ends_with_revision():
    plan = build_plan({"A": 80, "B": 40}, ["B"], days_left=6, daily_hours=3)
    study = [p["hours"] for p in plan if p["topic_id"] != "REVISION"]
    assert sum(study) == pytest.approx(15, abs=0.1)
    assert plan[-1]["topic_id"] == "REVISION" and plan[-1]["day"] == 6


def test_watermark_and_header_stripping():
    snippet = """
    QP25DP1_290 | 09-Jan-2025 9:05:30 AM | 117.55.242.132
    Printed Page: 1 of 3
    Subject Code: BCS501
    Roll No: 0 0 0 0 0 0 0 0 0 0 0 0 0
    BTECH (SEM V) THEORY EXAMINATION 2024-25
    TIME: 3 HRS M.MARKS: 70
    Note: Attempt all Sections.
    Explain the difference between physical and logical data independence. CO1 K2
    """
    cleaned = clean_watermarks_and_stamps(snippet)
    assert "QP25DP1" not in cleaned
    assert "117.55.242.132" not in cleaned
    assert "Roll No" not in cleaned
    assert "Printed Page" not in cleaned
    assert "CO1" not in cleaned
    assert "K2" not in cleaned
    assert "physical and logical data independence" in cleaned


def test_hindi_removal_bilingual_paper():
    snippet = """
    Explain Support Vector Machines (SVM) with the concept of margin and support vectors.
    मालजवन एिों सपोटव िेक्टि के सोंदभव में सपोटव िेक्टि मशीन की व्याख्या किें।
    """
    eng_only = drop_hindi(snippet)
    assert "Support Vector Machines" in eng_only
    assert "मालजवन" not in eng_only


def test_roman_sub_items_preserved():
    assert is_roman_numeral("(i) Calculate percentage variance") is True
    assert is_roman_numeral("(iv) Compute eigenvalues") is True
    assert is_roman_numeral("(a) Explain SVM") is False


def test_section_marks_tracking():
    paper_text = """
    SECTION A
    1. Attempt all questions in brief. 2 x 10 = 20
    a. What is DBMS?
    b. Define entity set.
    SECTION B
    2. Attempt any three of the following: 10 x 3 = 30
    a. Explain 3-tier architecture.
    """
    qs = segment_questions(paper_text)
    assert len(qs) == 3
    assert qs[0]["marks"] == 2
    assert qs[1]["marks"] == 2
    assert qs[2]["marks"] == 10
    assert qs[0]["no"] == "1a"
    assert qs[2]["no"] == "2a"


def test_topic_mapper_threshold_and_needs_review():
    topics = [
        {"id": "t1", "name": "Relational Algebra", "keywords": ["relational algebra", "join", "selection", "projection"]},
        {"id": "t2", "name": "Normalization", "keywords": ["normalization", "1nf", "2nf", "3nf", "bcnf"]}
    ]
    mapper = TopicMapper(topics, threshold=0.15)
    
    # Matching question
    res_high = mapper.map(["Explain natural join and theta join in relational algebra with suitable examples."])
    assert res_high[0]["topic_id"] == "t1"
    assert res_high[0]["needs_review"] is False
    assert res_high[0]["confidence"] >= 0.15

    # Out of domain question should trigger needs_review
    res_low = mapper.map(["Explain the life cycle of Drosophila melanogaster."])
    assert res_low[0]["topic_id"] is None
    assert res_low[0]["needs_review"] is True


def test_clustering_handles_small_dataset_gracefully():
    # Less than 4 questions returns cluster 0 and 0.0 silhouette
    labels, score = cluster_questions(["What is SQL?", "What is Relational Algebra?"])
    assert labels == [0, 0]
    assert score == 0.0

    # 4+ questions runs K-Means
    sample_texts = [
        "Explain BCNF decomposition and lossy join.",
        "What is BCNF and functional dependency?",
        "Define 3NF and BCNF with examples.",
        "Explain transaction ACID properties."
    ]
    labels_kmeans, silhouette = cluster_questions(sample_texts)
    assert len(labels_kmeans) == 4
    assert isinstance(silhouette, float)
