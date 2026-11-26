import re

MARKS = re.compile(r"\(\s*(\d{1,2})\s*marks?\s*\)|\[\s*(\d{1,2})\s*\]", re.I)


def drop_hindi(text: str) -> str:
    """Keep only English lines / drop lines with high Devanagari ratio (DA 2025-26 bilingual)."""
    if not text:
        return ""
    lines = []
    for line in text.split("\n"):
        dev = len(re.findall(r"[\u0900-\u097F]", line))
        tot = len(line.strip())
        if tot > 0 and (dev / tot) > 0.35:
            continue
        cleaned = re.sub(r"[\u0900-\u097F]", "", line)
        if cleaned.strip():
            lines.append(cleaned)
    return "\n".join(lines)


def clean_watermarks_and_stamps(text: str) -> str:
    """Strip watermark noise, timestamps, IP addresses, roll numbers, and headers."""
    if not text:
        return ""
    text = re.sub(r"QP\d{2}[A-Za-z0-9_]+", "", text)
    text = re.sub(r"\d{2}-[A-Za-z]{3}-\d{4}\s+\d{1,2}:\d{2}:\d{2}(?:\s*[AP]M)?", "", text)
    text = re.sub(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", "", text)
    text = re.sub(r"Printed Page[s]?:\s*\d+(?:\s*of\s*\d+)?", "", text, flags=re.I)
    text = re.sub(r"Roll No(?:\.|\:)?(?:\s*0)+", "", text, flags=re.I)
    text = re.sub(r"Sub(?:ject)? Code:[^\n]+", "", text, flags=re.I)
    text = re.sub(r"Paper Id:[^\n]+", "", text, flags=re.I)
    text = re.sub(r"B\.?\s*Tech\.?[^\n]*", "", text, flags=re.I)
    text = re.sub(r"\(SEM [^\)]+\)[^\n]*", "", text, flags=re.I)
    text = re.sub(r"THEORY EXAMINATION[^\n]*", "", text, flags=re.I)
    text = re.sub(r"TIME:\s*[^\n]+", "", text, flags=re.I)
    text = re.sub(r"M\.MARKS:\s*[^\n]+", "", text, flags=re.I)
    text = re.sub(r"Note:[^\n]+", "", text, flags=re.I)
    # Strip standalone noise artifacts (e.g. '0 1', '9 3', etc.)
    cleaned_lines = []
    for line in text.split("\n"):
        l = line.strip()
        if re.match(r"^[\d\s\._:\|P\-]+$", l) and len(l) < 15:
            continue
        cleaned_lines.append(line)
    text = "\n".join(cleaned_lines)
    # Strip trailing CO and Level indicators (e.g. 'CO1', 'K2', 'K4')
    text = re.sub(r"\s+CO\d?\b", "", text, flags=re.I)
    text = re.sub(r"\s+K[1-6]\b", "", text, flags=re.I)
    return " ".join(text.split())


def _marks(chunk: str, default: int) -> int:
    m = MARKS.search(chunk)
    return int(m.group(1) or m.group(2)) if m else default


def is_roman_numeral(line: str) -> bool:
    """Identify roman numeral sub-items e.g. (i), (ii), (iv), I, II that shouldn't be split."""
    return bool(re.match(r"^\(?(?:[ivx]+|[IVX]+)\)[.\)]?\s+", line.strip()))


def segment_questions(text_or_dict, default_marks: int = 2) -> list:
    """
    Split paper text into individual questions with labels (e.g. '1a', '2c', '5b') and marks.
    Supports both table-based papers and plain-text papers across all AKTU exam formats.
    """
    tables = []
    if isinstance(text_or_dict, dict):
        tables = text_or_dict.get("tables", [])
        text = text_or_dict.get("text", "")
    else:
        text = str(text_or_dict)

    is_70_marks = "70" in text[:600]
    questions = []

    # Table-based format (AKTU 2023-24, 2024-25, 2025-26)
    if len(tables) >= 5:
        for t in tables:
            for row in t:
                if not row or not row[0]:
                    continue
                first = str(row[0]).strip().lower()
                m = re.match(r"^([a-j])[\.\)]?", first)
                if m and len(row) >= 2:
                    letter = m.group(1)
                    raw_q = row[1] or ""
                    clean_q = clean_watermarks_and_stamps(drop_hindi(raw_q))
                    if len(clean_q) < 5:
                        continue

                    count = len(questions)
                    if is_70_marks:
                        # 70-mark paper: Sec A (7 q's @ 2 marks), Sec B (5 q's @ 7 marks), Sec C (5x2 q's @ 7 marks)
                        if count < 7:
                            main_no = 1
                            marks = 2
                        elif count < 12:
                            main_no = 2
                            marks = 7
                        else:
                            main_no = 3 + (count - 12) // 2
                            marks = 7
                    else:
                        # 100-mark paper: Sec A (10 q's @ 2 marks), Sec B (5 q's @ 10 marks), Sec C (5x2 q's @ 10 marks)
                        if count < 10:
                            main_no = 1
                            marks = 2
                        elif count < 15:
                            main_no = 2
                            marks = 10
                        else:
                            main_no = 3 + (count - 15) // 2
                            marks = 10

                    # Check explicit marks column if present
                    if len(row) >= 3 and row[2]:
                        m_val = re.search(r"\b(\d{1,2})\b", str(row[2]))
                        if m_val:
                            marks = int(m_val.group(1))

                    label = f"{main_no}{letter}"
                    questions.append({"no": label, "text": clean_q, "marks": marks})
        if questions:
            return questions

    # Plain text format (AKTU 2021-22, 2022-23, or simple mock texts)
    lines = text.split("\n")
    current_main = None
    current_marks = default_marks
    part_re = re.compile(r"^\(?([a-j])\)?[.\)]\s+(.*)")
    q_start = re.compile(r"(?m)^\s*(?:Q\.?\s*)?(\d{1,2})\s*[\.\)]\s+")

    for line in lines:
        l = line.strip()
        if not l:
            continue
        # Watermarks & headers
        if re.search(r"Printed Page|Roll No|Paper Id|Sub Code|THEORY EXAMINATION|M\.MARKS|TIME:|Note:", l, re.I):
            continue
        if re.search(r"QP\d{2}[A-Za-z0-9_]+|\d{2}-[A-Za-z]{3}-\d{4}|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", l):
            continue

        if "SECTION A" in l.upper():
            current_marks = 2
        elif "SECTION B" in l.upper():
            current_marks = 7 if is_70_marks else 10
        elif "SECTION C" in l.upper():
            current_marks = 7 if is_70_marks else 10

        mq = re.match(r"^(\d)\.\s+Attempt", l, re.I)
        if mq:
            current_main = mq.group(1)
            m_marks = re.search(r"(\d{1,2})\s*x\s*\d+", l, re.I)
            if m_marks:
                current_marks = int(m_marks.group(1))
            continue

        # Check Q1. (a) ... pattern if standard section header isn't present
        q_alt = q_start.match(l)
        if q_alt and not current_main:
            current_main = q_alt.group(1)
            # If the same line continues with (a) ...
            rest = l[q_alt.end():].strip()
            if rest:
                l = rest

        if current_main is not None:
            pq = part_re.match(l)
            is_roman = current_main != "1" and is_roman_numeral(l)
            if pq and not is_roman:
                letter = pq.group(1).lower()
                q_text = pq.group(2).strip()
                label = f"{current_main}{letter}"
                clean_q = clean_watermarks_and_stamps(drop_hindi(q_text))
                # Marks check from text or section
                m_score = _marks(l, current_marks)
                questions.append({"no": label, "text": clean_q, "marks": m_score})
            elif questions:
                if not re.match(r"^[\d\s\._:\|P\-]+$", l):
                    clean_line = clean_watermarks_and_stamps(drop_hindi(l))
                    if clean_line:
                        questions[-1]["text"] += " " + clean_line

    # Fallback to simple regex if nothing parsed
    if not questions:
        chunks = q_start.split(text)
        for i in range(1, len(chunks) - 1, 2):
            number, body = chunks[i], chunks[i + 1]
            pieces = re.split(r"(?m)^\s*\(?([a-e])[\.\)]\s+", body)
            if len(pieces) == 1:
                items = [(number, body)]
            else:
                items = [(number + pieces[j], pieces[j + 1]) for j in range(1, len(pieces) - 1, 2)]
            for label, chunk in items:
                clean = " ".join(MARKS.sub("", chunk).split())
                if len(clean) > 10:
                    questions.append({"no": label, "text": clean, "marks": _marks(chunk, default_marks)})

    return questions
