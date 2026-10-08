import re
from typing import List, Dict, Any

class ClauseSplitter:
    # Common clause headers and numbered prefixes
    HEADER_REGEX = re.compile(
        r'(?m)^[ \t]*(?:'
        r'(?:Clause|SECTION|Section|ARTICLE|Article|Paragraph)\s+[0-9IVXLCDM]+(?:\.[0-9]+)*[:\.\-\s]+[^\n]+|'
        r'(?:[0-9]{1,2}\.(?:[0-9]{1,2})?)\s+([A-Z][^\n]{3,60})|'
        r'(?:[0-9]{1,2}\.)\s+[^\n]+|'
        r'(?:[A-Z\s]{4,40}:)|'
        r'(?:Recitals|RECITALS|Preamble|PREAMBLE|Definitions|DEFINITIONS|Execution|SIGNATURES)'
        r')',
        re.MULTILINE
    )

    TYPE_KEYWORDS = {
        "INDEMNITY": ["indemn", "hold harmless", "defend and hold"],
        "LIABILITY": ["liability", "limitation of liability", "indirect damages", "consequential"],
        "TERMINATION": ["terminat", "cure period", "cancel", "default"],
        "CONFIDENTIALITY": ["confidenti", "non-disclosure", "proprietary information", "trade secret"],
        "NON_COMPETE": ["non-compete", "non compete", "restraint of trade", "restrictive covenant"],
        "NON_SOLICITATION": ["solicit", "poach", "entice away"],
        "GOVERNING_LAW": ["governing law", "jurisdiction", "dispute resolution", "arbitrat", "courts of"],
        "PAYMENT": ["payment", "fee", "consideration", "invoic", "compensation", "interest rate"],
        "INTELLECTUAL_PROPERTY": ["intellectual property", "work for hire", "patent", "copyright", "ownership of work"],
        "FORCE_MAJEURE": ["force majeure", "act of god", "unforeseen event"],
        "WARRANTY": ["warrant", "as is", "merchantability", "fitness for"],
        "SEVERABILITY": ["severab", "invalidity"],
    }

    @classmethod
    def classify_clause(cls, text: str, title: str) -> str:
        combined = f"{title} {text}".lower()
        for c_type, keywords in cls.TYPE_KEYWORDS.items():
            if any(kw in combined for kw in keywords):
                return c_type
        return "GENERAL"

    @classmethod
    def segment(cls, text: str) -> List[Dict[str, Any]]:
        """
        Segments raw text into structured clauses with exact start and end character offsets.
        Guarantees that slicing text[start:end] returns the exact clause segment.
        """
        if not text.strip():
            return []

        # Find all match positions for potential clause boundaries
        matches = list(cls.HEADER_REGEX.finditer(text))
        
        # If no explicit headings found, fallback to paragraph blocks
        if len(matches) < 2:
            return cls._segment_by_paragraphs(text)

        clauses = []
        
        # Handle preamble / header before first match if non-empty
        first_start = matches[0].start()
        if first_start > 0 and text[:first_start].strip():
            clauses.append({
                "index": 1,
                "title": "Preamble & Opening",
                "text": text[:first_start].strip(),
                "start_char": 0,
                "end_char": first_start,
                "clause_type": "PREAMBLE"
            })

        for i, match in enumerate(matches):
            start_pos = match.start()
            end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            
            raw_segment = text[start_pos:end_pos]
            lines = raw_segment.strip().split("\n")
            title = lines[0].strip() if lines else f"Clause {len(clauses) + 1}"
            
            # Clean title of trailing colon or dashes
            clean_title = re.sub(r'[:\.\-]+$', '', title).strip()
            if len(clean_title) > 60:
                clean_title = clean_title[:60] + "..."

            clause_text = raw_segment.strip()
            clause_type = cls.classify_clause(clause_text, clean_title)

            clauses.append({
                "index": len(clauses) + 1,
                "title": clean_title if clean_title else f"Clause {len(clauses) + 1}",
                "text": clause_text,
                "start_char": start_pos,
                "end_char": end_pos,
                "clause_type": clause_type
            })

        return clauses

    @classmethod
    def _segment_by_paragraphs(cls, text: str) -> List[Dict[str, Any]]:
        # Split on double newlines
        parts = re.split(r'\n{2,}', text)
        clauses = []
        current_offset = 0

        for idx, part in enumerate(parts):
            stripped = part.strip()
            if not stripped:
                current_offset = text.find(part, current_offset) + len(part)
                continue

            start_char = text.find(part, current_offset)
            end_char = start_char + len(part)
            current_offset = end_char

            lines = stripped.split("\n")
            first_line = lines[0].strip()
            title = first_line[:50] + ("..." if len(first_line) > 50 else "")

            clauses.append({
                "index": len(clauses) + 1,
                "title": title if title else f"Section {len(clauses) + 1}",
                "text": stripped,
                "start_char": start_char,
                "end_char": end_char,
                "clause_type": cls.classify_clause(stripped, title)
            })

        return clauses
