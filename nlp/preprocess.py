import re
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# English stop-words plus command words that appear in every exam question
STOP = set(stopwords.words("english")) | {
    "explain", "write", "define", "discuss", "short", "note", "describe", "what", "briefly",
}
LEMMATIZER = WordNetLemmatizer()


def clean_text(text: str) -> str:
    """Lower-case the text and strip punctuation and extra whitespace."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def preprocess(text: str) -> str:
    """Tokenise, remove stop-words and lemmatise a question."""
    tokens = clean_text(text).split()
    tokens = [LEMMATIZER.lemmatize(t) for t in tokens if t not in STOP and len(t) > 2]
    return " ".join(tokens)
