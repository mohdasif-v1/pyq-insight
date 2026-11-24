import pytest
from extractor import segment_questions_from_text
from nlp_engine import preprocess_text, map_questions_to_topics, cluster_similar_questions

def test_preprocess_text():
    sample = "Explain with suitable diagram what is Operating System?"
    clean = preprocess_text(sample)
    # Stop words like explain, suitable, diagram, what, is removed
    assert "operating" in clean
    assert "system" in clean
    assert "explain" not in clean

def test_question_segmentation():
    sample_pages = [
        {
            "page_number": 1,
            "text": """
            AKTU B.TECH EXAMINATION 2023
            1. (a) What is virtual memory? Explain paging mechanism. [10 Marks]
            (b) Differentiate between preemptive and non-preemptive scheduling. (10 Marks)
            Q2. Explain Banker's Algorithm with example. [10 Marks]
            """
        }
    ]
    questions = segment_questions_from_text(sample_pages)
    assert len(questions) >= 3
    assert questions[0]["question_number"] == "1"
    assert questions[0]["sub_question_number"] == "a"
    assert questions[0]["marks"] == 10
    assert "virtual memory" in questions[0]["original_text"].lower()

def test_map_questions_to_topics():
    topics = [
        {
            "id": "top_mem",
            "name": "Memory Management",
            "keywords": ["virtual memory", "paging", "segmentation", "page fault"],
            "description": "Techniques for managing computer memory and paging"
        },
        {
            "id": "top_cpu",
            "name": "CPU Scheduling",
            "keywords": ["scheduling", "preemptive", "round robin", "priority", "fcfs"],
            "description": "Process scheduling algorithms"
        }
    ]

    questions = [
        {
            "id": "q1",
            "question_number": "1",
            "original_text": "Explain paging and page replacement algorithms in virtual memory.",
            "normalised_text": "explain paging and page replacement algorithms in virtual memory"
        },
        {
            "id": "q2",
            "question_number": "2",
            "original_text": "What is preemptive CPU scheduling? Compare with non-preemptive.",
            "normalised_text": "what is preemptive cpu scheduling compare with non preemptive"
        }
    ]

    mapped = map_questions_to_topics(questions, topics, threshold=0.15)
    assert len(mapped) == 2
    assert mapped[0]["topic_id"] == "top_mem"
    assert mapped[0]["mapping_status"] == "AUTO_MAPPED"
    assert mapped[0]["mapping_confidence"] > 0.15

    assert mapped[1]["topic_id"] == "top_cpu"
    assert mapped[1]["mapping_status"] == "AUTO_MAPPED"

def test_clustering_similar_questions():
    questions = [
        {
            "id": "q101",
            "original_text": "Explain Banker's algorithm for deadlock avoidance with diagram.",
            "year": 2021
        },
        {
            "id": "q102",
            "original_text": "What is Banker's algorithm? How does it avoid deadlock? Explain with example.",
            "year": 2023
        },
        {
            "id": "q103",
            "original_text": "Discuss disk scheduling algorithms like SCAN and C-SCAN.",
            "year": 2022
        }
    ]

    clusters = cluster_similar_questions(questions, distance_threshold=0.6)
    # The two Banker's algorithm questions should be clustered
    assert len(clusters) == 1
    assert clusters[0]["cluster_size"] == 2
    assert set(clusters[0]["years_repeated"]) == {2021, 2023}
