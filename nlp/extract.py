import os
import pdfplumber
import pytesseract
from pdf2image import convert_from_path

# On Windows, set pytesseract and poppler path via environment variables if provided
if os.environ.get("TESSERACT_CMD"):
    pytesseract.pytesseract.tesseract_cmd = os.environ["TESSERACT_CMD"]

POPPLER_PATH = os.environ.get("POPPLER_PATH")


def extract_text(path: str, min_chars: int = 200) -> str:
    """Read text from a PDF; fall back to OCR when the PDF is a scanned image."""
    with pdfplumber.open(path) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    if len(text.strip()) >= min_chars:
        return text
    kwargs = {"dpi": 300}
    if POPPLER_PATH:
        kwargs["poppler_path"] = POPPLER_PATH
    pages = convert_from_path(path, **kwargs)
    return "\n".join(pytesseract.image_to_string(p, lang="eng") for p in pages)


def extract_paper(path: str) -> dict:
    """Extract both structured tables and raw text from a PDF paper."""
    with pdfplumber.open(path) as pdf:
        tables = []
        for p in pdf.pages:
            for t in p.extract_tables():
                # Filter out student roll number grid
                if len(t) > 0 and len(t[0]) == 13 and str(t[0][0]).strip() == "0":
                    continue
                tables.append(t)
        raw_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    return {"tables": tables, "text": raw_text}
