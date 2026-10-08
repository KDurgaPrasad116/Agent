"""
Translation utility using Helsinki-NLP MarianMT models via HuggingFace.
All models run locally — no API key required.

Supported source → English:
  Hindi  (hi) → English (en) : Helsinki-NLP/opus-mt-hi-en
  Kannada (kn) → English (en): Helsinki-NLP/opus-mt-kn-en

Models are downloaded on first use and cached in ~/.cache/huggingface/
"""

from transformers import MarianMTModel, MarianTokenizer
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Model registry: source_lang_code → HuggingFace model name
TRANSLATION_MODELS = {
    "hi": "Helsinki-NLP/opus-mt-hi-en",
    "kn": "Helsinki-NLP/opus-mt-kn-en",
}

# In-memory model cache so we don't reload on every request
_model_cache: dict = {}


def _load_model(lang_code: str):
    """Load and cache a MarianMT model for the given source language."""
    if lang_code in _model_cache:
        return _model_cache[lang_code]

    model_name = TRANSLATION_MODELS.get(lang_code)
    if not model_name:
        raise ValueError(f"No translation model available for language code: '{lang_code}'")

    logger.info(f"Loading translation model: {model_name}")
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model     = MarianMTModel.from_pretrained(model_name)
    model.eval()

    _model_cache[lang_code] = (tokenizer, model)
    logger.info(f"Translation model loaded: {model_name}")
    return _model_cache[lang_code]


def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translate text from source_lang to English.

    Args:
        text:        The text to translate.
        source_lang: ISO 639-1 language code (e.g. 'hi', 'kn').

    Returns:
        Translated English text, or original text if translation not needed/available.
    """
    if source_lang == "en":
        return text

    if source_lang not in TRANSLATION_MODELS:
        logger.warning(
            f"No translation model for '{source_lang}'. Returning original text."
        )
        return text

    try:
        tokenizer, model = _load_model(source_lang)

        # Split into chunks of max 400 chars to stay within model token limits
        chunks     = _chunk_text(text, max_chars=400)
        translated = []

        for chunk in chunks:
            if not chunk.strip():
                continue
            inputs = tokenizer(
                [chunk],
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512,
            )
            output_ids = model.generate(**inputs, max_length=512)
            decoded    = tokenizer.decode(output_ids[0], skip_special_tokens=True)
            translated.append(decoded)

        return " ".join(translated)

    except Exception as e:
        logger.error(f"Translation failed for lang '{source_lang}': {e}")
        return text  # graceful fallback — return original


def _chunk_text(text: str, max_chars: int = 400) -> list[str]:
    """Split text into sentence-aware chunks under max_chars."""
<<<<<<< HEAD
    sentences = text.replace("\n", " ").split(". ")
=======
    import re
    sentences = re.split(r'(?<=[।\.\?!;:\n])\s*', text)
>>>>>>> 3a27112 (Pushing major agent changes)
    chunks    = []
    current   = ""

    for sentence in sentences:
<<<<<<< HEAD
        if len(current) + len(sentence) + 2 <= max_chars:
            current += sentence + ". "
        else:
            if current:
                chunks.append(current.strip())
            current = sentence + ". "
=======
        sentence = sentence.strip()
        if not sentence:
            continue
        if len(current) + len(sentence) + 2 <= max_chars:
            current += sentence + " "
        else:
            if current:
                chunks.append(current.strip())
            current = sentence + " "
>>>>>>> 3a27112 (Pushing major agent changes)

    if current.strip():
        chunks.append(current.strip())

    return chunks if chunks else [text]
