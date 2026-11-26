import json
import os
import tempfile
from datetime import date

from fastapi import FastAPI, File, Form, UploadFile
from pydantic import BaseModel

from cluster import cluster_questions
from extract import extract_paper
from mapper import TopicMapper
from planner import build_plan
from scoring import topic_scores
from segment import segment_questions

app = FastAPI(title="PYQ Insight NLP Service")


class QuestionIn(BaseModel):
    topic_id: str | None = None
    marks: int
    year: int


class ScoreRequest(BaseModel):
    questions: list[QuestionIn]
    current_year: int = date.today().year


class PlanRequest(BaseModel):
    scores: dict[str, float]
    weak: list[str] = []
    days_left: int
    daily_hours: float


@app.post("/process")
async def process(file: UploadFile = File(...), topics: str = Form(...)):
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(await file.read())
    try:
        extracted = extract_paper(tmp.name)
        questions = segment_questions(extracted)
    finally:
        os.remove(tmp.name)
    mapped = TopicMapper(json.loads(topics)).map([q["text"] for q in questions])
    labels, silhouette = cluster_questions([q["text"] for q in questions])
    for q, m, c in zip(questions, mapped, labels):
        q.update(m, cluster_id=c)
    return {"questions": questions, "silhouette": silhouette}


@app.post("/score")
def score(req: ScoreRequest):
    return topic_scores([q.model_dump() for q in req.questions], req.current_year)


@app.post("/plan")
def plan(req: PlanRequest):
    return {"schedule": build_plan(req.scores, req.weak, req.days_left, req.daily_hours)}
