import streamlit as st
import numpy as np
import joblib
import tempfile
import os
from feature_extraction import extract_features_from_file, features_dict_to_vector

# --- Load trained objects ---
scaler = joblib.load("models/scaler.pkl")
pca = joblib.load("models/pca.pkl")
final_model = joblib.load("models/final_model.pkl")
label_encoder = joblib.load("models/label_encoder.pkl")

# Feature order from voice.csv dataset
FEATURE_ORDER = ['meanfreq', 'sd', 'median', 'Q25', 'Q75', 'IQR', 'skew', 'kurt', 'sp.ent', 'sfm', 
                 'mode', 'centroid', 'meanfun', 'minfun', 'maxfun', 'meandom', 'mindom', 'maxdom', 'dfrange', 'modindx']

st.title("🎤 Voice Gender Prediction")

# Create tabs for different input methods
tab1, tab2 = st.tabs(["📁 Upload Audio File", "🧪 Test with Sample Data"])

with tab1:
    st.header("Upload Audio File for Prediction")
    
    uploaded_file = st.file_uploader(
        "Choose an audio file", 
        type=['wav', 'mp3', 'flac', 'm4a', 'ogg'],
        help="Upload a voice recording to predict gender. Supported formats: WAV, MP3, FLAC, M4A, OGG"
    )
    
    if uploaded_file is not None:
        # Display file info
        st.write(f"**File:** {uploaded_file.name}")
        st.write(f"**Size:** {uploaded_file.size} bytes")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(uploaded_file.name)[1]) as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            temp_path = tmp_file.name
        
        try:
            # Extract features from audio
            with st.spinner("🔊 Analyzing audio and extracting features..."):
                features_dict = extract_features_from_file(temp_path)
                
            # Convert to vector in correct order
            features_vector = features_dict_to_vector(features_dict, FEATURE_ORDER)
            
            st.success("✅ Features extracted successfully!")
            
            # Display extracted features
            with st.expander("🔍 View Extracted Features"):
                for i, feature_name in enumerate(FEATURE_ORDER):
                    value = features_dict.get(feature_name, 0.0)
                    st.write(f"**{feature_name}:** {value:.6f}")
            
            # Scale features using the trained scaler
            with st.spinner("⚖️ Scaling features..."):
                features_scaled = scaler.transform(features_vector)
            
            # Apply PCA transformation
            with st.spinner("📊 Applying PCA transformation..."):
                features_pca = pca.transform(features_scaled)
            
            # Make prediction
            with st.spinner("🧠 Making prediction..."):
                pred_encoded = final_model.predict(features_pca)
                pred_label = label_encoder.inverse_transform(pred_encoded)
                probabilities = final_model.predict_proba(features_pca)
            
            # Display results
            st.subheader("🎯 Prediction Results")
            predicted_gender = pred_label[0]
            st.write(f"**Predicted Gender:** {predicted_gender}")
            
            # Prediction probabilities with progress bars
            st.subheader("📊 Prediction Confidence")
            prob_dict = {label_encoder.classes_[i]: float(probabilities[0][i]) for i in range(len(label_encoder.classes_))}
            
            for gender, prob in prob_dict.items():
                st.write(f"**{gender.capitalize()}:** {prob:.4f} ({prob*100:.2f}%)")
                st.progress(prob)
            
            # Display processing steps
            with st.expander("📈 View Processing Steps"):
                st.write("**Scaled Features:**")
                st.json(features_scaled.tolist())
                st.write("**PCA Transformed Features:**")
                st.json(features_pca.tolist())
                
        except Exception as e:
            st.error(f"❌ Error processing audio file: {str(e)}")
            st.error("Please make sure the audio file is valid and contains voice data.")
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)

with tab2:
    st.header("Test with Sample Data")
    
    # Test samples from voice.csv dataset
    test_samples = {
        "Male Sample 1 (from dataset)": {
            "features": [0.0597809849598081, 0.0642412677031359, 0.032026913372582, 0.0150714886459209, 
                         0.0901934398654331, 0.0751219512195122, 12.8634618371626, 274.402905502067, 
                         0.893369416700807, 0.491917766397811, 0.0, 0.0597809849598081, 
                         0.084279106440321, 0.0157016683022571, 0.275862068965517, 0.0078125, 
                         0.0078125, 0.0078125, 0.0, 0.0],
            "expected": "male"
        },
        "Female Sample 1 (from dataset)": {
            "features": [0.158107989456496, 0.0827815915759607, 0.191191454396056, 0.0623500410846343, 
                         0.22455217748562, 0.162202136400986, 2.80134396306528, 19.9296167053104, 
                         0.952160964900451, 0.679223312622536, 0.0499260476581758, 0.158107989456496, 
                         0.185041734793057, 0.023021582733813, 0.275862068965517, 0.272964015151515, 
                         0.046875, 0.7421875, 0.6953125, 0.339887640449438],
            "expected": "female"
        },
        "Male Sample 2 (from dataset)": {
            "features": [0.157020511056795, 0.0719429306811688, 0.168160152526215, 0.101429933269781, 
                         0.2167397521449, 0.115309818875119, 0.97944227542161, 3.97422262552131, 
                         0.96524913928741, 0.733692877928757, 0.0963584366062917, 0.157020511056795, 
                         0.0888939829948002, 0.0220689655172414, 0.117647058823529, 0.460227272727273, 
                         0.0078125, 2.8125, 2.8046875, 0.2],
            "expected": "male"
        },
        "Female Sample 2 (from dataset)": {
            "features": [0.191794364284314, 0.0380885989305895, 0.198856689162366, 0.169845176657404, 
                         0.213973799126638, 0.0441286224692338, 2.47511050097125, 9.89855914302963, 
                         0.889682499995533, 0.260589970651856, 0.208638348551012, 0.191794364284314, 
                         0.170612504674634, 0.0328542094455852, 0.275862068965517, 0.839015151515151, 
                         0.0078125, 6.9921875, 6.984375, 0.192856591838309],
            "expected": "female"
        },
        "Synthetic Male (with noise)": {
            "features": [0.06474812648992043, 0.06285862469142406, 0.03850379875358892, 0.030301787210001152, 
                         0.08785190611819974, 0.0727805816500204, 12.879253965317673, 274.4105798493585, 
                         0.8886746728414575, 0.49734336683367064, -0.0046341769281246226, 0.05512368742410553, 
                         0.08669872915598134, -0.0034311341443208805, 0.2586128906403867, 0.002189624707590273, 
                         -0.0023158112033442382, 0.010954973325952739, -0.00908024075521211, -0.014123037013352916],
            "expected": "male (synthetic)"
        },
        "Synthetic Female (with noise)": {
            "features": [0.17276447714571155, 0.08052382857109534, 0.19186673644293525, 0.04810255922249973, 
                         0.21910835024036818, 0.16331136229808466, 2.789834027291057, 19.93337368549386, 
                         0.9461545780012629, 0.6763063751246032, 0.04390898153588183, 0.1766307713015854, 
                         0.18490676254567764, 0.012444473444253996, 0.2840875180865489, 0.2607555786518048, 
                         0.04896363595004755, 0.7225907987612022, 0.6820306395110157, 0.3418562528081292],
            "expected": "female (synthetic)"
        }
    }

    # Select test sample
    selected_sample = st.selectbox("Choose a test sample:", list(test_samples.keys()))
    features_list = test_samples[selected_sample]["features"]
    expected_label = test_samples[selected_sample]["expected"]

    X = np.array(features_list).reshape(1, -1)

    st.subheader("🔍 Selected Sample")
    st.write(f"**Sample:** {selected_sample}")
    st.write(f"**Expected Gender:** {expected_label}")

    with st.expander("View Raw Features"):
        st.json(features_list)

    # Scale features
    X_scaled = scaler.transform(X)

    # Apply PCA if your model uses it
    X_pca = pca.transform(X_scaled)

    # Predict
    pred_encoded = final_model.predict(X_pca)
    pred_label = label_encoder.inverse_transform(pred_encoded)

    st.subheader("🎯 Prediction Results")
    predicted_gender = pred_label[0]
    st.write(f"**Predicted Gender:** {predicted_gender}")

    # Check if prediction matches expected (for dataset samples)
    if not expected_label.endswith("(synthetic)"):
        expected_clean = expected_label
        if predicted_gender == expected_clean:
            st.success("✅ Prediction matches expected result!")
        else:
            st.error("❌ Prediction does not match expected result!")
    else:
        st.info("ℹ️ This is a synthetic sample for testing robustness")

    # Prediction probabilities
    probabilities = final_model.predict_proba(X_pca)
    st.subheader("📊 Prediction Confidence")
    prob_dict = {label_encoder.classes_[i]: float(probabilities[0][i]) for i in range(len(label_encoder.classes_))}

    # Display probabilities with progress bars
    for gender, prob in prob_dict.items():
        st.write(f"**{gender.capitalize()}:** {prob:.4f} ({prob*100:.2f}%)")
        st.progress(prob)

    st.subheader("📈 Model Processing Steps")
    with st.expander("View Scaled Features"):
        st.json(X_scaled.tolist())

    with st.expander("View PCA Transformed Features"):
        st.json(X_pca.tolist())
