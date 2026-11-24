import re
from typing import List, Dict, Any, Optional
import pdfplumber

def extract_text_and_pages(pdf_path: str) -> List[Dict[str, Any]]:
    pages_data = []
    with pdfplumber.open(pdf_path) as pdf:
        for idx, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            # If text is virtually empty, note that OCR fallback may be needed
            is_scanned = len(text.strip()) < 30
            if is_scanned:
                # Scanned fallback note: pytesseract OCR can be invoked page by page
                # If tesseract binary is not present or text is empty, keep minimal marker
                pass
            pages_data.append({
                "page_number": idx + 1,
                "text": text,
                "is_scanned": is_scanned
            })
    return pages_data

QUESTION_PATTERNS = [
    # Standard AKTU section headers and question lines: "Q1. ", "Question 1", "1. ", "1(a)", "(a)"
    r'(?:^|\n)\s*(?:Q(?:uestion|\.)?\s*(\d+)|(\d+)\.)\s*(?:\(([a-z]|[iIvVxX]+)\))?\s*',
    r'(?:^|\n)\s*\(([a-z]|[iIvVxX]+)\)\s+'
]

MARKS_PATTERN = r'(?:\[|\()(\d+)\s*(?:Marks?|marks?|M)\]?'

def segment_questions_from_text(pages_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    questions = []
    current_q: Optional[Dict[str, Any]] = None

    for page in pages_data:
        page_num = page["page_number"]
        lines = page["text"].split("\n")

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            # Check if line indicates a question start: e.g. "1. (a) Explain...", "Q.2 What is..."
            q_match = re.match(r'^(?:Q(?:uestion|\.)?\s*(\d+)[\.\s]*|(\d+)\.\s*)(?:\(([a-zA-Z0-9]+)\))?\s*(.*)', line_str, re.IGNORECASE)
            sub_match = re.match(r'^\(([a-zA-Z0-9]+)\)\s*(.*)', line_str)

            if q_match:
                if current_q:
                    questions.append(current_q)
                
                q_num = q_match.group(1) or q_match.group(2) or "1"
                sub_q = q_match.group(3) or ""
                rest = q_match.group(4) or ""

                # Marks extraction
                marks = None
                marks_m = re.search(MARKS_PATTERN, line_str)
                if marks_m:
                    marks = int(marks_m.group(1))

                current_q = {
                    "question_number": q_num,
                    "sub_question_number": sub_q,
                    "page_number": page_num,
                    "original_text": line_str,
                    "marks": marks
                }
            elif sub_match and current_q:
                # Subquestion break: save existing question and start new subquestion
                questions.append(current_q)
                sub_q = sub_match.group(1)
                marks = None
                marks_m = re.search(MARKS_PATTERN, line_str)
                if marks_m:
                    marks = int(marks_m.group(1))
                
                current_q = {
                    "question_number": current_q["question_number"],
                    "sub_question_number": sub_q,
                    "page_number": page_num,
                    "original_text": line_str,
                    "marks": marks
                }
            elif current_q:
                # Continuation of question text
                current_q["original_text"] += " " + line_str
                if not current_q.get("marks"):
                    marks_m = re.search(MARKS_PATTERN, line_str)
                    if marks_m:
                        current_q["marks"] = int(marks_m.group(1))
            else:
                # Initial preamble lines (e.g. Roll No, instructions), ignore or attach if question starts
                pass

    if current_q:
        questions.append(current_q)

    # Clean text
    for q in questions:
        q["normalised_text"] = re.sub(r'\s+', ' ', q["original_text"]).strip()

    return questions
