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