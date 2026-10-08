import sys
sys.path.insert(0, r"d:\Projects\Agent-main\Agent-main")
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import StratifiedKFold, cross_val_score

# 1. Load current clean legality dataset
df = pd.read_csv("dataset/clean_legality_train.csv")
print(f"Original shape: {df.shape}")
print(df["label"].value_counts())

# 2. Add realistic statutory domain samples
new_samples = [
    # Alienation restraints (Illegal)
    ("Purchaser shall not sell, mortgage, lease, gift or transfer the property without prior consent in perpetuity and any transfer shall be void ab initio.", "Illegal"),
    ("The buyer is prohibited from transferring, leasing, or creating any third party interest in the property forever.", "Illegal"),
    ("Seller reserves the perpetual right to approve or deny any future sale or transfer of the schedule property.", "Illegal"),
    ("Any transfer of the property without seller's consent shall result in immediate forfeiture without refund.", "Illegal"),

    # Discrimination (Illegal)
    ("The property shall never be sold, leased, or transferred to any person belonging to a different religion, caste or community.", "Illegal"),
    ("Transferee agrees not to let out or convey the premises to individuals of specific religious or ethnic communities.", "Illegal"),
    ("Any covenant restricting transfer or lease of property on the grounds of caste, religion, or community is void.", "Illegal"),

    # Tax & Stamp Evasion (Illegal)
    ("The parties agree to declare an undervalued consideration to evade stamp duty and mislead registration authorities.", "Illegal"),
    ("Balance consideration shall be paid in unrecorded cash directly to seller and not reflected in banking channels.", "Illegal"),
    ("Both parties agree to conceal the execution of this deed from the income tax department and deny knowledge thereof.", "Illegal"),
    ("In order to evade payment of appropriate stamp duty, parties agree to declare a false market value.", "Illegal"),

    # Unilateral Cancellation of Deed (Illegal)
    ("Seller retains the absolute right to unilaterally cancel and revoke this registered sale deed at any time without refund.", "Illegal"),
    ("The grantor may unilaterally revoke this absolute transfer of title at their sole discretion without reason.", "Illegal"),
    ("Seller may cancel this sale deed at will without assigning any reason or refunding consideration.", "Illegal"),

    # Restraint of legal proceedings & criminal complaints (Illegal)
    ("Purchaser waives all rights to file civil suits, consumer complaints, or police cases for fraud, cheating, or forgery.", "Illegal"),
    ("Contractor agrees not to institute any legal proceeding or police complaint against company for defect in title or misrepresentation.", "Illegal"),
    ("Purchaser hereby unconditionally discharges all rights to pursue suit or criminal complaint against seller for cheating or fraud.", "Illegal"),

    # Unreasonable penalties & Usurious interest (Illegal)
    ("In the event of any minor breach, the entire consideration shall be forfeited and purchaser shall pay an additional 50% penalty.", "Illegal"),
    ("Delay of any delivery shall trigger immediate forfeiture of all compensation and a liquidated penalty of 50%.", "Illegal"),
    ("Any overdue payment shall attract compound penal interest of 10% per month payable immediately.", "Illegal"),
    ("Liquidated damages of 100% of contract value plus total forfeiture of all fees shall apply for any delayed milestone.", "Illegal"),

    # Unilateral arbitration & exclusion of courts (Illegal)
    ("Any dispute shall be referred to a sole arbitrator appointed exclusively by seller whose award cannot be challenged in any court.", "Illegal"),
    ("Company shall unilaterally appoint the arbitrator and the jurisdiction of all civil courts is entirely excluded.", "Illegal"),
    ("Sole arbitrator appointed solely by the company without right of objection or challenge by contractor.", "Illegal"),

    # Indemnity against own fraud / crimes (Illegal)
    ("Purchaser shall indemnify seller against all claims arising out of seller's own misrepresentation, fraud, forgery, or criminal conduct.", "Illegal"),
    ("Contractor indemnifies company for any losses caused by company's own intentional fraud, forgery, or criminal offenses.", "Illegal"),
    ("Vendor agrees to hold harmless the company against damages resulting from company's own willful misconduct or fraud.", "Illegal"),

    # Evasion of registration (Illegal)
    ("To avoid payment of stamp duty and registration fee, parties agree not to present this deed for registration.", "Illegal"),
    ("This document shall take effect as an unregistered private transfer of title avoiding registration act requirements.", "Illegal"),

    # Benami (Illegal)
    ("Purchaser shall hold the property only benami in trust for the seller who remains the true beneficial owner.", "Illegal"),
    ("The title holder is a benami trustee and the real ownership vests exclusively in the undisclosed seller.", "Illegal"),

    # Bribery / Gratification (Illegal)
    ("Parties agree to pay cash gratification to officials at the registration office to overlook document irregularities.", "Illegal"),
    ("A sum of money shall be paid as a bribe to sub-registrar officers to expedite property registration.", "Illegal"),

    # Post-employment non-compete (Illegal)
    ("Following termination of employment, employee shall not directly or indirectly engage in or consult for any competing business.", "Illegal"),
    ("Employee agrees not to work for any competitor in the territory for a period of twelve months after leaving the company.", "Illegal"),
    ("During employment and for two years after termination, contractor shall not provide services to competing technology companies.", "Illegal"),

    # Legal Property & Conveyance Clauses (Legal)
    ("Seller declares that he is the sole and absolute owner of the property and has clear marketable title thereto.", "Legal"),
    ("Seller assures purchaser that all property taxes and local municipal levies have been paid up to date.", "Legal"),
    ("Seller delivers vacant and peaceful possession of the property to purchaser along with original title documents.", "Legal"),
    ("Seller indemnifies purchaser against any prior encumbrances or defects in marketable title.", "Legal"),
    ("Purchaser shall be the absolute owner with complete rights of possession, enjoyment, and peaceful transfer.", "Legal"),
    ("This sale deed is executed in accordance with the provisions of the Transfer of Property Act and Registration Act.", "Legal"),
    ("Consideration was paid through verified banking channels, demand draft, and RTGS bank transfer.", "Legal"),
    ("Purchaser shall enjoy the property forever free from all encumbrances, charges, and prior mortgages.", "Legal"),
    ("Seller has not done any act to curtail or prejudice his right to convey the schedule property.", "Legal"),
    ("Both parties agree to execute any further assurances necessary to perfect title in favour of purchaser.", "Legal"),
]

df_new = pd.DataFrame(new_samples, columns=["clause", "label"])
df_combined = pd.concat([df, df_new], ignore_index=True).drop_duplicates(subset=["clause"])
print(f"Combined shape: {df_combined.shape}")
print(df_combined["label"].value_counts())

df_combined.to_csv("dataset/clean_legality_train.csv", index=False)
df_combined.to_csv("dataset/legality_train.csv", index=False)

# 3. Train High Accuracy Legality Classifier
X = df_combined["clause"]
y = df_combined["label"]

features = FeatureUnion([
    ('word_tfidf', TfidfVectorizer(
        ngram_range=(1, 3),
        max_features=8000,
        sublinear_tf=True,
        strip_accents='unicode'
    )),
    ('char_tfidf', TfidfVectorizer(
        ngram_range=(3, 5),
        analyzer='char',
        max_features=8000,
        sublinear_tf=True
    ))
])

base_svm = LinearSVC(C=1.0, class_weight='balanced', random_state=42, max_iter=3000)
calibrated_clf = CalibratedClassifierCV(estimator=base_svm, cv=3)

pipeline = Pipeline([
    ('features', features),
    ('classifier', calibrated_clf)
])

# 5-fold CV evaluation
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipeline, X, y, cv=cv, scoring='f1_macro')
print(f"\n5-Fold CV Macro F1 on Expanded Legality Dataset: {scores.mean():.4f} (+/- {scores.std():.4f})")

# Fit on full dataset and export
pipeline.fit(X, y)
joblib.dump(pipeline, "models/saved/legality_classifier_ml.joblib")
print("Saved retrained legality classifier to models/saved/legality_classifier_ml.joblib")
