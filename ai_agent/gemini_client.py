"""
MetricMind - Gemini Client
============================

Thin wrapper around Google's Gemini API used for insight / narrative / recommendation
generation. Every caller in this codebase already has a deterministic fallback, so this
module is intentionally defensive: any missing key, missing package, or network error
simply returns None instead of raising, letting the caller fall back gracefully.
"""

import os

_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


def _get_api_key() -> str:
    try:
        from backend.config.config import GEMINI_API_KEY
        if GEMINI_API_KEY:
            return GEMINI_API_KEY
    except Exception:
        pass
    return os.getenv("GEMINI_API_KEY", "")


def generate_text(prompt: str, timeout: float = 10.0) -> str:
    """Return Gemini's response text, or None if unavailable for any reason."""
    api_key = _get_api_key()
    if not api_key:
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(_GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            request_options={"timeout": timeout},
        )
        text = getattr(response, "text", None)
        if text and len(text.strip()) > 0:
            return text.strip()
        return None
    except Exception:
        return None


if __name__ == "__main__":
    print(generate_text("Say hello in one sentence."))
