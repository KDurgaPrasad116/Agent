import os
import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, f1_score, accuracy_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.svm import LinearSVC

SAVE_DIR = "models/saved"
os.makedirs(SAVE_DIR, exist_ok=True)


def build_clause_pipeline():
    features = FeatureUnion([
        ("word", TfidfVectorizer(
            ngram_range=(1, 3),
            min_df=2,
            max_features=35000,
            sublinear_tf=True
        )),
        ("char", TfidfVectorizer(
            ngram_range=(3, 5),
            min_df=3,
            analyzer="char_wb",
            max_features=25000,
            sublinear_tf=True
        ))
    ])

    base_svc = LinearSVC(C=1.0, class_weight="balanced", random_state=42)
    calibrated_clf = CalibratedClassifierCV(estimator=base_svc, cv=5)

    return Pipeline([
        ("features", features),
        ("classifier", calibrated_clf)
    ])


def build_legality_pipeline():
    features = FeatureUnion([
        ("word", TfidfVectorizer(
            ngram_range=(1, 3),
            min_df=2,
            max_features=20000,
            sublinear_tf=True
        )),
        ("char", TfidfVectorizer(
            ngram_range=(3, 5),
            min_df=3,
            analyzer="char_wb",
            max_features=20000,
            sublinear_tf=True
        ))
    ])

    base_svc = LinearSVC(C=1.0, class_weight="balanced", random_state=42)
    calibrated_clf = CalibratedClassifierCV(estimator=base_svc, cv=5)

    return Pipeline([
        ("features", features),
        ("classifier", calibrated_clf)
    ])


def train_clause_classifier():
    print("=" * 60)
    print("Training High-Accuracy Clause Classifier...")
    df = pd.read_csv("dataset/clauses_train.csv").dropna(subset=["clause", "label"])
    df["clause"] = df["clause"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.strip()

    X = df["clause"].values
    y = df["label"].values

    pipe = build_clause_pipeline()

    # 5-fold cross validation verification
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    preds = cross_val_predict(pipe, X, y, cv=cv)
    acc = accuracy_score(y, preds)
    f1_macro = f1_score(y, preds, average="macro")
    print(f"Clause 5-Fold Cross-Validation Accuracy: {acc * 100:.2f}%")
    print(f"Clause 5-Fold Cross-Validation Macro F1: {f1_macro * 100:.2f}%")
    print(classification_report(y, preds, digits=4))

    # Fit on all data and save
    pipe.fit(X, y)
    save_path = os.path.join(SAVE_DIR, "clause_classifier_ml.joblib")
    joblib.dump(pipe, save_path)
    print(f"Saved clause classifier model to: {save_path}")
    return acc, f1_macro


def train_legality_classifier():
    print("=" * 60)
    print("Training High-Accuracy Legality Classifier...")
    df = pd.read_csv("dataset/legality_train.csv").dropna(subset=["clause", "label"])
    df["clause"] = df["clause"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.strip()

    X = df["clause"].values
    y = df["label"].values

    pipe = build_legality_pipeline()

    # 5-fold cross validation verification
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    preds = cross_val_predict(pipe, X, y, cv=cv)
    acc = accuracy_score(y, preds)
    f1 = f1_score(y, preds, average="macro")
    print(f"Legality 5-Fold Cross-Validation Accuracy: {acc * 100:.2f}%")
    print(f"Legality 5-Fold Cross-Validation Macro F1: {f1 * 100:.2f}%")
    print(classification_report(y, preds, digits=4))

    # Fit on all data and save
    pipe.fit(X, y)
    save_path = os.path.join(SAVE_DIR, "legality_classifier_ml.joblib")
    joblib.dump(pipe, save_path)
    print(f"Saved legality classifier model to: {save_path}")
    return acc, f1


if __name__ == "__main__":
    train_clause_classifier()
    train_legality_classifier()
    print("=" * 60)
    print("All models trained and exported successfully!")
