# agents/classifier_agent.py

LABELS = ["Negative", "Neutral", "Positive"]

class ClassifierAgent:
    def __init__(self, model_path="models/saved/clause_classifier"):
        self.model_path = model_path
        self._tokenizer = None
        self._model     = None

    def _load(self):
        # Imported here — not at module level — so Windows DLL
        # issue does not block server startup
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        import torch
        if self._model is None:
            try:
                self._tokenizer = AutoTokenizer.from_pretrained(self.model_path)
                self._model     = AutoModelForSequenceClassification.from_pretrained(
                    self.model_path
                )
                self._model.eval()
                self._torch = torch
            except Exception:
                self._model = "fallback"

    def run(self, clause: str) -> dict:
        self._load()

        if self._model == "fallback":
            return self._rule_based(clause)

        try:
            enc = self._tokenizer(
                clause,
                truncation=True,
                max_length=512,
                return_tensors="pt",
                padding=True,
            )
            with self._torch.no_grad():
                logits = self._model(**enc).logits
            idx = int(logits.argmax())
            probs = self._torch.softmax(logits, dim=-1).squeeze().tolist()
            return {
                "type":       LABELS[idx],
                "confidence": round(probs[idx], 3),
            }
        except Exception:
            return self._rule_based(clause)

    def _rule_based(self, clause: str) -> dict:
        t = clause.lower()
        neg = ["terminat","penalt","forfeit","liabil","breach","indemnif","waive"]
        pos = ["benefit","entitl","protect","right","reimburse","compensat"]
        if any(k in t for k in neg):
            return {"type": "Negative", "confidence": 0.7}
        if any(k in t for k in pos):
            return {"type": "Positive", "confidence": 0.7}
        return {"type": "Neutral", "confidence": 0.6}