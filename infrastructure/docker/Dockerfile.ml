# Lightweight Python base image for FastAPI NLP Service
FROM python:3.12-slim AS runner

# Install Tesseract OCR runtime and poppler dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY apps/ml/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/ml/ ./

# Non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
