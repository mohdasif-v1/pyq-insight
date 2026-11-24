import os
from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from extractor import extract_text_and_pages, segment_questions_from_text
from nlp_engine import map_questions_to_topics, cluster_similar_questions

app = FastAPI(title="PYQ Insight NLP Core Service", version="1.0.0")

API_KEY = os.getenv("ML_SERVICE_API_KEY", "internal_pyq_insight_ml_secret_key")

def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key and x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized ML Service Access")
    return True

class ExtractRequest(BaseModel):
    file_path: str

class TopicItem(BaseModel):
    id: str
    name: str
    keywords: List[str] = []
    description: Optional[str] = ""

class QuestionItem(BaseModel):
    id: Optional[str] = None
    question_number: str
    sub_question_number: Optional[str] = ""
    page_number: int = 1
    original_text: str
    normalised_text: Optional[str] = None
    marks: Optional[int] = None
    year: Optional[int] = None

class MapRequest(BaseModel):
    questions: List[QuestionItem]
    topics: List[TopicItem]
    threshold: Optional[float] = 0.15

class ClusterRequest(BaseModel):
    questions: List[QuestionItem]
    distance_threshold: Optional[float] = 0.6

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "pyq-insight-ml"}

@app.post("/extract-questions", dependencies=[Depends(verify_api_key)])
def extract_questions(req: ExtractRequest):
    if not os.path.exists(req.file_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk")
    try:
        pages = extract_text_and_pages(req.file_path)
        questions = segment_questions_from_text(pages)
        return {
            "success": True,
            "page_count": len(pages),
            "questions_count": len(questions),
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction error: {str(e)}")

@app.post("/map-topics", dependencies=[Depends(verify_api_key)])
def map_topics(req: MapRequest):
    try:
        q_dicts = [q.model_dump() for q in req.questions]
        t_dicts = [t.model_dump() for t in req.topics]
        mapped = map_questions_to_topics(q_dicts, t_dicts, req.threshold or 0.15)
        return {"success": True, "mapped_questions": mapped}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Topic mapping error: {str(e)}")

@app.post("/cluster-questions", dependencies=[Depends(verify_api_key)])
def cluster_questions(req: ClusterRequest):
    try:
        q_dicts = [q.model_dump() for q in req.questions]
        clusters = cluster_similar_questions(q_dicts, req.distance_threshold or 0.6)
        return {"success": True, "clusters": clusters}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question clustering error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
