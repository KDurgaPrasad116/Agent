import pandas as pd
import torch
import numpy as np
from torch.utils.data import Dataset
from torch.nn import CrossEntropyLoss
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

MODEL_NAME = "roberta-base"
SAVE_PATH  = "models/saved/legality_classifier"
LABELS     = ["Illegal", "Legal"]


# ── Dataset ───────────────────────────────────────────────────────────────────
class LegalityDataset(Dataset):
    def __init__(self, texts, labels, tokenizer):
        self.texts     = [str(t) for t in texts]
        self.labels    = labels
        self.tokenizer = tokenizer

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, i):
        enc = self.tokenizer(
            self.texts[i],
            truncation=True,
            max_length=128,           # Reduced from 512 → much faster on CPU
            padding="max_length",
            return_tensors="pt",
        )
        return {
            "input_ids":      enc["input_ids"].squeeze(0),
            "attention_mask": enc["attention_mask"].squeeze(0),
            "labels":         torch.tensor(self.labels[i], dtype=torch.long),
        }


# ── Weighted Trainer ──────────────────────────────────────────────────────────
class WeightedTrainer(Trainer):
    def __init__(self, class_weights, **kwargs):
        super().__init__(**kwargs)
        self.class_weights = class_weights

    def compute_loss(self, model, inputs, return_outputs=False, **kwargs):
        labels  = inputs.pop("labels")
        outputs = model(**inputs)
        logits  = outputs.logits
        weights = self.class_weights.to(logits.device)
        loss    = CrossEntropyLoss(weight=weights)(logits, labels)
        return (loss, outputs) if return_outputs else loss


# ── Metrics ───────────────────────────────────────────────────────────────────
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    acc   = float((preds == labels).mean())

    # Precision, Recall, F1 for Illegal class (index 0)
    tp = int(((preds == 0) & (labels == 0)).sum())
    fp = int(((preds == 0) & (labels == 1)).sum())
    fn = int(((preds == 1) & (labels == 0)).sum())

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1        = (2 * precision * recall / (precision + recall)
                 if (precision + recall) > 0 else 0.0)

    return {
        "accuracy":          round(acc, 4),
        "illegal_precision": round(precision, 4),
        "illegal_recall":    round(recall, 4),
        "illegal_f1":        round(f1, 4),
    }


# ── Train ─────────────────────────────────────────────────────────────────────
def train():
    df = pd.read_csv("dataset/legality_train.csv")
    df.dropna(subset=["clause", "label"], inplace=True)
    df["label"] = df["label"].str.strip()
<<<<<<< HEAD
    df = df.sample(20, random_state=42)  # Added to prevent OOM
=======
>>>>>>> 3a27112 (Pushing major agent changes)

    print(f"Loaded {len(df)} rows")
    print(df["label"].value_counts())

    le = LabelEncoder()
    le.fit(LABELS)
    df["label_id"] = le.transform(df["label"])

    train_df, val_df = train_test_split(
        df, test_size=0.15, stratify=df["label_id"], random_state=42
    )
    print(f"Train: {len(train_df)} | Val: {len(val_df)}")

    counts        = df["label_id"].value_counts().sort_index().tolist()
    total         = sum(counts)
    class_weights = torch.tensor(
        [total / (len(LABELS) * c) for c in counts], dtype=torch.float
    )
    print(f"Class weights: {dict(zip(LABELS, [round(w.item(), 3) for w in class_weights]))}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model     = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(LABELS),
        ignore_mismatched_sizes=True,
        id2label={i: l for i, l in enumerate(LABELS)},
        label2id={l: i for i, l in enumerate(LABELS)},
    )

    args = TrainingArguments(
        output_dir=SAVE_PATH,
        num_train_epochs=3,                   # Reduced from 5 → faster training
<<<<<<< HEAD
        per_device_train_batch_size=2,         # Reduced from 8 to 2 to prevent OOM
        gradient_accumulation_steps=4,         # Accumulate to effective batch size of 8
        per_device_eval_batch_size=2,          # Reduced from 8 to 2
=======
        per_device_train_batch_size=8,         # Reduced from 16 → less RAM usage
        per_device_eval_batch_size=8,          # Reduced from 16 → less RAM usage
>>>>>>> 3a27112 (Pushing major agent changes)
        learning_rate=2e-5,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="illegal_f1",
        greater_is_better=True,
<<<<<<< HEAD
        weight_decay=0.01,
        logging_steps=50,                      # More frequent logs on small data
=======
        warmup_ratio=0.1,
        weight_decay=0.01,
        logging_steps=50,                      # More frequent logs on small data
        logging_dir="models/logs",
>>>>>>> 3a27112 (Pushing major agent changes)
        report_to="none",
        fp16=False,                            # Disabled — fp16 not supported on CPU
        dataloader_num_workers=0,              # Safer on CPU, avoids multiprocessing issues                          # Force CPU explicitly
    )

    trainer = WeightedTrainer(
        class_weights=class_weights,
        model=model,
        args=args,
        train_dataset=LegalityDataset(
            train_df["clause"].tolist(), train_df["label_id"].tolist(), tokenizer
        ),
        eval_dataset=LegalityDataset(
            val_df["clause"].tolist(), val_df["label_id"].tolist(), tokenizer
        ),
        compute_metrics=compute_metrics,
    )

    print("\nStarting training...")
    trainer.train()

    model.save_pretrained(SAVE_PATH)
    tokenizer.save_pretrained(SAVE_PATH)
    print(f"\nModel saved to '{SAVE_PATH}'")


if __name__ == "__main__":
    train()
