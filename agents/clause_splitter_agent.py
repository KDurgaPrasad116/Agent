<<<<<<< HEAD
import re

class ClauseSplitterAgent:
    MIN_LEN = 30

    def run(self, text: str) -> list[str]:
        text = re.sub(r'[\r\n]+', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()

        raw = re.split(r'''(?xi)
            (?<=\.)\s+(?=[A-Z]) |
            (?<=;)\s+ |
            \b\d+\.\s+ |
            \b\d+\.\d+\s+ |
            \(\w\)\s+ |
            \bWHEREAS\b |
            \bProvided\s+that\b |
            \bNotwithstanding\b |
            \bSubject\s+to\b
        ''', text)

        return [
            c.strip() for c in raw
            if len(c.strip()) >= self.MIN_LEN
            and not re.fullmatch(r'[\d\W]+', c.strip())
        ]
=======
import re

class ClauseSplitterAgent:
    MIN_LEN = 25

    def run(self, text: str) -> list[str]:
        if not text:
            return []

        # Normalize line breaks
        text = text.replace('\r\n', '\n').replace('\r', '\n')

        # Split across numbered sections, bullets, paragraph breaks, or sentence ends
        raw = re.split(r'''(?xi)
            \n+(?=\s*(?:\d+[\.\)]|\([a-z0-9]+\)|[•\-\*]|SECTION|ARTICLE|CLAUSE)\b) |
            (?<=[.;:])\s*\n+ |
            (?<=\.)\s+(?=[A-Z0-9]) |
            (?<=;)\s+ |
            \b(?=WHEREAS\b) |
            \b(?=Notwithstanding\b) |
            \b(?=Provided\s+that\b) |
            \b(?=Subject\s+to\b)
        ''', text)

        clauses = []
        for c in raw:
            cleaned = re.sub(r'\s+', ' ', c).strip()
            if len(cleaned) >= self.MIN_LEN and not re.fullmatch(r'[\d\W]+', cleaned):
                clauses.append(cleaned)

        if not clauses and text.strip():
            clauses = [re.sub(r'\s+', ' ', text).strip()]

        return clauses
>>>>>>> 3a27112 (Pushing major agent changes)
