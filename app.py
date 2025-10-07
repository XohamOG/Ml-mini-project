# app.py
import streamlit as st
import numpy as np
import joblib
import os
from feature_extraction import extract_features_from_file, features_dict_to_vector

MODELS_DIR = "models"

@st.cache_resource
def load_artifacts():
    scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.pkl"))
    pca = joblib.load(os.path.join(MODELS_DIR, "pca.pkl"))
    model = joblib.load(os.path.join(MODELS_DIR, "final_model.pkl"))
    le = joblib.load(os.path.join(MODELS_DIR, "label_encoder.pkl"))
    return scaler, pca, model, le

scaler, pca, model, le = load_artifacts()

st.title("🎤 Voice Gender Prediction from Audio")
st.write("Upload a `.wav` file and the model will predict the gender.")

uploaded_file = st.file_uploader("Choose a .wav file", type=["wav"])

# Ensure feature order matches your trained model
feature_order = [
    "meanfreq", "sd", "median", "Q25", "Q75", "IQR", "skew", "kurt",
    "sp_ent", "sfm", "centroid", "peakf", "meanfun", "minfun", "maxfun",
    "meandom", "mindom", "maxdom", "dfrange", "modindx"
]

if uploaded_file is not None:
    st.audio(uploaded_file, format='audio/wav')
    # Extract features
    feats_dict = extract_features_from_file(uploaded_file)
    X_raw = features_dict_to_vector(feats_dict, feature_order)

    # Scale + PCA
    X_scaled = scaler.transform(X_raw)
    X_pca = pca.transform(X_scaled)

    # Predict
    pred = model.predict(X_pca)[0]
    proba = model.predict_proba(X_pca)[0] if hasattr(model, "predict_proba") else None
    label_name = le.inverse_transform([pred])[0]

    st.success(f"Predicted Gender: **{label_name.upper()}**")

    if proba is not None:
        st.write("Confidence / Probabilities:", {le.inverse_transform([i])[0]: float(p) for i, p in enumerate(proba)})

    st.write("Scaled feature vector used:")
    st.json({feature_order[i]: float(X_scaled[0, i]) for i in range(X_scaled.shape[1])})
