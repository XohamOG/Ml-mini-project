const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow audio files
    const allowedTypes = [
      "audio/wav",
      "audio/mpeg",
      "audio/mp3",
      "audio/flac",
      "audio/m4a",
      "audio/ogg",
    ];
    if (
      allowedTypes.includes(file.mimetype) ||
      [".wav", ".mp3", ".flac", ".m4a", ".ogg"].includes(
        path.extname(file.originalname).toLowerCase()
      )
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  try {
    await fs.access("uploads");
  } catch {
    await fs.mkdir("uploads");
  }
};

// Python script runner helper
const runPythonScript = (scriptPath, args = []) => {
  return new Promise((resolve, reject) => {
    // Change working directory to parent directory where models and Python files are located
    const workingDir = path.join(__dirname, "..");

    const python = spawn("python", [scriptPath, ...args], {
      cwd: workingDir,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        console.error(`Python script stderr: ${stderr}`);
        console.error(`Python script stdout: ${stdout}`);
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      }
    });

    python.on("error", (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
};

// Create a Python script that processes audio and returns JSON results
const createProcessorScript = async () => {
  const processorScript = `
import sys
import json
import numpy as np
import joblib
import os
from feature_extraction import extract_features_from_file, features_dict_to_vector

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python processor.py <audio_file_path>"}))
        sys.exit(1)
    
    audio_file_path = sys.argv[1]
    
    try:
        # Load trained models
        scaler = joblib.load("models/scaler.pkl")
        pca = joblib.load("models/pca.pkl")
        final_model = joblib.load("models/final_model.pkl")
        label_encoder = joblib.load("models/label_encoder.pkl")
        
        # Feature order
        FEATURE_ORDER = ['meanfreq', 'sd', 'median', 'Q25', 'Q75', 'IQR', 'skew', 'kurt', 'sp.ent', 'sfm', 
                         'mode', 'centroid', 'meanfun', 'minfun', 'maxfun', 'meandom', 'mindom', 'maxdom', 'dfrange', 'modindx']
        
        # Extract features from audio
        features_dict = extract_features_from_file(audio_file_path)
        
        # Convert to vector in correct order
        features_vector = features_dict_to_vector(features_dict, FEATURE_ORDER)
        
        # Scale features
        features_scaled = scaler.transform(features_vector)
        
        # Apply PCA transformation
        features_pca = pca.transform(features_scaled)
        
        # Make prediction
        pred_encoded = final_model.predict(features_pca)
        pred_label = label_encoder.inverse_transform(pred_encoded)
        probabilities = final_model.predict_proba(features_pca)
        
        # Prepare results
        result = {
            "success": True,
            "prediction": pred_label[0],
            "confidence": float(max(probabilities[0])),
            "probabilities": {
                label_encoder.classes_[i]: float(probabilities[0][i]) 
                for i in range(len(label_encoder.classes_))
            },
            "extracted_features": {
                feature_name: float(features_dict.get(feature_name, 0.0))
                for feature_name in FEATURE_ORDER
            },
            "scaled_features": features_scaled.tolist()[0],
            "pca_features": features_pca.tolist()[0]
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
`;

  await fs.writeFile(
    path.join(__dirname, "..", "audio_processor.py"),
    processorScript
  );
};

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Voice Prediction API is running" });
});

// Upload and process audio file
app.post("/api/predict", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const audioFilePath = req.file.path;

    try {
      // Adjust path for Python script running from parent directory
      const relativePath = path.join("backend", audioFilePath);

      // Run Python script to process audio
      const result = await runPythonScript("audio_processor.py", [
        relativePath,
      ]);
      const parsedResult = JSON.parse(result);

      res.json(parsedResult);
    } catch (error) {
      console.error("Python processing error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process audio file: " + error.message,
      });
    } finally {
      // Clean up uploaded file
      try {
        await fs.unlink(audioFilePath);
      } catch (unlinkError) {
        console.error("Failed to delete uploaded file:", unlinkError);
      }
    }
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  }
});

// Test with sample data
app.post("/api/test-sample", async (req, res) => {
  try {
    const { sampleName, features } = req.body;

    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ error: "Invalid features data" });
    }

    // Create a temporary Python script for testing samples
    const testScript = `
import sys
import json
import numpy as np
import joblib

def main():
    features = ${JSON.stringify(features)}
    
    try:
        # Load trained models
        scaler = joblib.load("models/scaler.pkl")
        pca = joblib.load("models/pca.pkl")
        final_model = joblib.load("models/final_model.pkl")
        label_encoder = joblib.load("models/label_encoder.pkl")
        
        # Convert to numpy array
        X = np.array(features).reshape(1, -1)
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Apply PCA transformation
        X_pca = pca.transform(X_scaled)
        
        # Make prediction
        pred_encoded = final_model.predict(X_pca)
        pred_label = label_encoder.inverse_transform(pred_encoded)
        probabilities = final_model.predict_proba(X_pca)
        
        # Prepare results
        result = {
            "success": True,
            "sample_name": "${sampleName}",
            "prediction": pred_label[0],
            "confidence": float(max(probabilities[0])),
            "probabilities": {
                label_encoder.classes_[i]: float(probabilities[0][i]) 
                for i in range(len(label_encoder.classes_))
            },
            "raw_features": features,
            "scaled_features": X_scaled.tolist()[0],
            "pca_features": X_pca.tolist()[0]
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
`;

    await fs.writeFile(
      path.join(__dirname, "..", "test_sample.py"),
      testScript
    );

    try {
      const result = await runPythonScript("test_sample.py");
      const parsedResult = JSON.parse(result);
      res.json(parsedResult);
    } finally {
      // Clean up temporary script
      try {
        await fs.unlink(path.join(__dirname, "..", "test_sample.py"));
      } catch (unlinkError) {
        console.error("Failed to delete test script:", unlinkError);
      }
    }
  } catch (error) {
    console.error("Sample test error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to test sample: " + error.message,
    });
  }
});

// Get available test samples (matching Streamlit app)
app.get("/api/test-samples", (req, res) => {
  const testSamples = {
    "Male Sample 1 (from dataset)": {
      features: [
        0.0597809849598081, 0.0642412677031359, 0.032026913372582,
        0.0150714886459209, 0.0901934398654331, 0.0751219512195122,
        12.8634618371626, 274.402905502067, 0.893369416700807,
        0.491917766397811, 0.0, 0.0597809849598081, 0.084279106440321,
        0.0157016683022571, 0.275862068965517, 0.0078125, 0.0078125, 0.0078125,
        0.0, 0.0,
      ],
      expected: "male",
    },
    "Female Sample 1 (from dataset)": {
      features: [
        0.158107989456496, 0.0827815915759607, 0.191191454396056,
        0.0623500410846343, 0.22455217748562, 0.162202136400986,
        2.80134396306528, 19.9296167053104, 0.952160964900451,
        0.679223312622536, 0.0499260476581758, 0.158107989456496,
        0.185041734793057, 0.023021582733813, 0.275862068965517,
        0.272964015151515, 0.046875, 0.7421875, 0.6953125, 0.339887640449438,
      ],
      expected: "female",
    },
    "Male Sample 2 (from dataset)": {
      features: [
        0.157020511056795, 0.0719429306811688, 0.168160152526215,
        0.101429933269781, 0.2167397521449, 0.115309818875119, 0.97944227542161,
        3.97422262552131, 0.96524913928741, 0.733692877928757,
        0.0963584366062917, 0.157020511056795, 0.0888939829948002,
        0.0220689655172414, 0.117647058823529, 0.460227272727273, 0.0078125,
        2.8125, 2.8046875, 0.2,
      ],
      expected: "male",
    },
    "Female Sample 2 (from dataset)": {
      features: [
        0.191794364284314, 0.0380885989305895, 0.198856689162366,
        0.169845176657404, 0.213973799126638, 0.0441286224692338,
        2.47511050097125, 9.89855914302963, 0.889682499995533,
        0.260589970651856, 0.208638348551012, 0.191794364284314,
        0.170612504674634, 0.0328542094455852, 0.275862068965517,
        0.839015151515151, 0.0078125, 6.9921875, 6.984375, 0.192856591838309,
      ],
      expected: "female",
    },
  };

  res.json(testSamples);
});

// Initialize server
const startServer = async () => {
  try {
    await createUploadsDir();
    await createProcessorScript();

    app.listen(PORT, () => {
      console.log(
        `🚀 Voice Prediction API running on http://localhost:${PORT}`
      );
      console.log(`📁 Uploads directory ready`);
      console.log(`🐍 Python processor script created`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
