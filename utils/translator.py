"""
Language detection utility.
Uses langdetect with a fallback to 'en' on failure.
Supported languages for this system: English (en), Hindi (hi), Kannada (kn)
"""

from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException

# Make detection deterministic
DetectorFactory.seed = 42

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
}


def detect_language(text: str) -> dict:
    """
    Detect the language of the given text.
    Returns:
        {
            "code": "hi",
            "name": "Hindi",
            "needs_translation": True
        }
    """
    if not text or len(text.strip()) < 10:
        return {"code": "en", "name": "English", "needs_translation": False}

    try:
        code = detect(text[:2000])  # use first 2000 chars for speed
    except LangDetectException:
        code = "en"

    name = SUPPORTED_LANGUAGES.get(code, f"Unknown ({code})")
    needs_translation = code != "en"

    return {
        "code": code,
        "name": name,
        "needs_translation": needs_translation,
    }
