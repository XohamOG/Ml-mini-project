# train.py
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (classification_report, confusion_matrix, 
                             accuracy_score, f1_score, precision_score, recall_score)
import seaborn as sns
import matplotlib.pyplot as plt
import joblib
from tabulate import tabulate  # for clean console tables

# ----------------------------
# 0. Paths
# ----------------------------
DATA_PATH = "data/voice.csv"
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

# ----------------------------
# 1. Load dataset
# ----------------------------
df = pd.read_csv(DATA_PATH)
print(f"✅ Dataset loaded: {df.shape[0]} samples, {df.shape[1]} features")

# Target column = 'label' (male/female)
X = df.drop(columns=['label'])
y = df['label']

# Encode labels (female=0, male=1)
le = LabelEncoder()
y_enc = le.fit_transform(y)
print("🔠 Label encoding:", dict(zip(le.classes_, le.transform(le.classes_))))

# ----------------------------
# 2. Train-test split (Stratified)
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
)
print("📊 Train size:", X_train.shape, " Test size:", X_test.shape)

# ----------------------------
# 3. Feature scaling + PCA
# ----------------------------
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.pkl"))

# PCA to retain 95% variance
pca = PCA(n_components=0.95, random_state=42)
X_train_pca = pca.fit_transform(X_train_scaled)
X_test_pca = pca.transform(X_test_scaled)
joblib.dump(pca, os.path.join(MODELS_DIR, "pca.pkl"))
print(f"📉 PCA reduced features: {pca.n_components_} (explains {pca.explained_variance_ratio_.sum():.2f} variance)")

# ----------------------------
# 4. Define models
# ----------------------------
models = {
    "Logistic Regression": LogisticRegression(max_iter=2000, random_state=42),
    "SVM (Linear)": SVC(kernel='linear', probability=True, random_state=42),
    "SVM (Polynomial)": SVC(kernel='poly', degree=3, probability=True, random_state=42),
    "SVM (RBF)": SVC(kernel='rbf', probability=True, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42)
}

# ----------------------------
# 5. Stratified K-Fold Cross-validation
# ----------------------------
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
results = []

print("\n🔍 Running 5-Fold Stratified Cross-Validation on PCA features...\n")
for name, model in models.items():
    cv_scores = cross_val_score(model, X_train_pca, y_train, cv=cv, scoring='f1_macro')
    results.append({
        "Model": name,
        "CV Mean F1": np.mean(cv_scores),
        "CV Std": np.std(cv_scores)
    })
    print(f"{name:<20} | Mean F1 = {np.mean(cv_scores):.4f} | Std = {np.std(cv_scores):.4f}")

# ----------------------------
# 6. Train & Evaluate on Test Data
# ----------------------------
print("\n📈 Training and evaluating models on test data...\n")
detailed_results = []

for name, model in models.items():
    model.fit(X_train_pca, y_train)
    y_pred = model.predict(X_test_pca)

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)

    detailed_results.append([name, acc, f1, prec, rec])
    print(f"\n🧠 {name}")
    print("Accuracy :", round(acc, 4))
    print("F1-score :", round(f1, 4))
    print("Precision:", round(prec, 4))
    print("Recall   :", round(rec, 4))
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Plot confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(4,3))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=le.classes_, yticklabels=le.classes_)
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.title(f"Confusion Matrix - {name}")
    plt.tight_layout()
    plt.savefig(os.path.join(MODELS_DIR, f"cm_{name.replace(' ', '_')}.png"))
    plt.close()

# ----------------------------
# 7. Compare models & choose best
# ----------------------------
print("\n📊 Summary of Test Metrics:\n")
print(tabulate(detailed_results, headers=["Model", "Accuracy", "F1", "Precision", "Recall"], floatfmt=".4f"))

# Choose model with highest F1
best_model_name = max(detailed_results, key=lambda x: x[1])[0]
best_model = models[best_model_name]
print(f"\n🏆 Best model based on F1-score: {best_model_name}")

# Retrain best model on full training data and save
best_model.fit(X_train_pca, y_train)
joblib.dump(best_model, os.path.join(MODELS_DIR, "final_model.pkl"))
joblib.dump(le, os.path.join(MODELS_DIR, "label_encoder.pkl"))

print("\n✅ Training complete.")
print(f"Model saved as: models/final_model.pkl")
print(f"Scaler, PCA, Encoder saved in {MODELS_DIR}/")
