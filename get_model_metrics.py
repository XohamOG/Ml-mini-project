#!/usr/bin/env python3
"""
Script to extract trained model metrics and confusion matrix data
for display in the React frontend.
"""

import json
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (confusion_matrix, accuracy_score, f1_score, 
                             precision_score, recall_score)
import joblib

def load_models_and_data():
    """Load the trained models and test data to compute metrics"""
    
    # Load the dataset
    df = pd.read_csv("data/voice.csv")
    X = df.drop(columns=['label'])
    y = df['label']
    
    # Load the saved preprocessing objects
    scaler = joblib.load("models/scaler.pkl")
    pca = joblib.load("models/pca.pkl")
    le = joblib.load("models/label_encoder.pkl")
    
    # Encode labels
    y_enc = le.transform(y)
    
    # Split data (same as training)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )
    
    # Apply preprocessing
    X_train_scaled = scaler.transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    X_train_pca = pca.transform(X_train_scaled)
    X_test_pca = pca.transform(X_test_scaled)
    
    return X_train_pca, X_test_pca, y_train, y_test, le

def evaluate_all_models():
    """Evaluate all trained models and return metrics"""
    
    X_train_pca, X_test_pca, y_train, y_test, le = load_models_and_data()
    
    # Define the same models as in training
    models = {
        "Logistic Regression": LogisticRegression(max_iter=2000, random_state=42),
        "SVM (Linear)": SVC(kernel='linear', probability=True, random_state=42),
        "SVM (Polynomial)": SVC(kernel='poly', degree=3, probability=True, random_state=42),
        "SVM (RBF)": SVC(kernel='rbf', probability=True, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42)
    }
    
    results = {}
    
    for name, model in models.items():
        # Train the model
        model.fit(X_train_pca, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test_pca)
        
        # Calculate metrics
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        
        # Get confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        results[name] = {
            "accuracy": float(acc),
            "f1_score": float(f1),
            "precision": float(prec),
            "recall": float(rec),
            "confusion_matrix": cm.tolist()
        }
    
    # Find the best model (highest F1 score)
    best_model_name = max(results.keys(), key=lambda k: results[k]["f1_score"])
    
    return {
        "models": results,
        "best_model": best_model_name,
        "label_classes": le.classes_.tolist()
    }

def get_final_model_metrics():
    """Get metrics for the saved final model"""
    
    try:
        X_train_pca, X_test_pca, y_train, y_test, le = load_models_and_data()
        
        # Load the final model
        final_model = joblib.load("models/final_model.pkl")
        
        # Make predictions
        y_pred = final_model.predict(X_test_pca)
        
        # Calculate metrics
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        
        # Get confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        return {
            "accuracy": float(acc),
            "f1_score": float(f1),
            "precision": float(prec),
            "recall": float(rec),
            "confusion_matrix": cm.tolist(),
            "label_classes": le.classes_.tolist()
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--all":
        # Return all model results
        results = evaluate_all_models()
    else:
        # Return just the final model metrics
        results = get_final_model_metrics()
    
    print(json.dumps(results, indent=2))