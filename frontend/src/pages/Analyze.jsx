import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import WaveCanvas from "@/components/WaveCanvas";
import EnhancedAudioControls from "@/components/EnhancedAudioControls";
import AnimatedButton from "@/components/AnimatedButton";
import EnhancedOrb from "@/components/EnhancedOrb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

const API_BASE_URL = "http://localhost:3001/api";

// Feature order from the Python script
const FEATURE_ORDER = [
  "meanfreq",
  "sd",
  "median",
  "Q25",
  "Q75",
  "IQR",
  "skew",
  "kurt",
  "sp.ent",
  "sfm",
  "mode",
  "centroid",
  "meanfun",
  "minfun",
  "maxfun",
  "meandom",
  "mindom",
  "maxdom",
  "dfrange",
  "modindx",
];

// Analyze page: audio upload + ML prediction with same output as Streamlit app
export default function Analyze() {
  const { isDark } = useTheme();
  const [hasAudio, setHasAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [testSamples, setTestSamples] = useState({});
  const [selectedSample, setSelectedSample] = useState("");
  const navigate = useNavigate();

  // Load test samples on component mount
  useEffect(() => {
    fetchTestSamples();
  }, []);

  const fetchTestSamples = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-samples`);
      if (response.ok) {
        const samples = await response.json();
        setTestSamples(samples);
        setSelectedSample(Object.keys(samples)[0] || "");
      }
    } catch (err) {
      console.error("Failed to fetch test samples:", err);
    }
  };

  const processAudioFile = async (audioFile) => {
    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      
      // If it's a Blob (recorded audio), convert it to a File with proper name
      let fileToSend = audioFile;
      if (audioFile instanceof Blob && !(audioFile instanceof File)) {
        fileToSend = new File([audioFile], 'recorded-audio.webm', { 
          type: audioFile.type || 'audio/webm' 
        });
      }
      
      formData.append("audio", fileToSend);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned HTML instead of JSON. Response: ${text.substring(0, 200)}...`);
      }

      const result = await response.json();

      if (result.success) {
        setResults(result);
        setHasAudio(true);
      } else {
        setError(result.error || "Failed to process audio");
      }
    } catch (err) {
      console.error("Audio processing error:", err);
      if (err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Please make sure the backend is running on http://localhost:3001");
      } else {
        setError(`Network error: ${err.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const testSampleData = async () => {
    if (!selectedSample || !testSamples[selectedSample]) return;

    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const sampleData = testSamples[selectedSample];

      const response = await fetch(`${API_BASE_URL}/test-sample`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sampleName: selectedSample,
          features: sampleData.features,
        }),
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned HTML instead of JSON. Response: ${text.substring(0, 200)}...`);
      }

      const result = await response.json();

      if (result.success) {
        // Add expected result for comparison
        result.expected = sampleData.expected;
        setResults(result);
        setHasAudio(true);
      } else {
        setError(result.error || "Failed to test sample");
      }
    } catch (err) {
      console.error("Sample testing error:", err);
      if (err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Please make sure the backend is running on http://localhost:3001");
      } else {
        setError(`Network error: ${err.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen relative"
    >
      {/* Enhanced background with orb and waves */}
      <EnhancedOrb
        hue={35}
        hoverIntensity={0.3}
        rotateOnHover={true}
        className="opacity-25"
      />
      <div className="absolute inset-0 pointer-events-none z-10">
        <WaveCanvas className="w-full h-[50vh] md:h-[60vh] opacity-50" />
      </div>

      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-12 pt-24 md:pt-32 space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-3"
        >
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="funky-title text-3xl md:text-5xl"
          >
            🎤 Voice Gender Prediction
          </motion.h1>
          <div className="flex flex-wrap items-center gap-2">
            {["Upload", "Analyze", "Predict", "Test"].map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.4 + index * 0.1,
                  type: "spring",
                  stiffness: 300,
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="inline-block rounded-full bg-gradient-to-r from-secondary to-accent/20 text-secondary-foreground text-xs px-3 py-1 cursor-default"
              >
                {tag}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-muted-foreground max-w-prose"
          >
            Upload an audio file or test with sample data to predict gender
            using machine learning.
          </motion.p>
        </motion.header>

        {/* Tab-like sections matching Streamlit app */}
        <div className="space-y-8">
          {/* Upload Audio File Section */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">📁 Upload Audio File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose an audio file to predict gender. Supported formats: WAV,
                MP3, FLAC, M4A, OGG
              </p>

              <EnhancedAudioControls
                onAudioReady={(audioFile) => {
                  console.log("Audio file received:", audioFile);
                  processAudioFile(audioFile);
                }}
              />

              {isProcessing && (
                <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-beige-700'}`}>
                  <div className={`animate-spin w-4 h-4 border-2 ${isDark ? 'border-white' : 'border-beige-600'} border-t-transparent rounded-full`}></div>
                  <span>🔊 Analyzing audio and extracting features...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test with Sample Data Section */}
          <Card className="border-2 border-secondary/20">
            <CardHeader>
              <CardTitle className="text-xl">
                🧪 Test with Sample Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test the model with pre-defined samples from the dataset
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedSample}
                  onChange={(e) => setSelectedSample(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md bg-background"
                >
                  {Object.keys(testSamples).map((sampleName) => (
                    <option key={sampleName} value={sampleName}>
                      {sampleName}
                    </option>
                  ))}
                </select>

                <AnimatedButton
                  onClick={testSampleData}
                  disabled={isProcessing || !selectedSample}
                  variant="secondary"
                >
                  Test Sample
                </AnimatedButton>
              </div>

              {selectedSample && testSamples[selectedSample] && (
                <div className="text-sm bg-muted/50 p-3 rounded">
                  <strong>Expected:</strong>{" "}
                  {testSamples[selectedSample].expected}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              isDark 
                ? 'bg-neutral-800 border-neutral-600 text-neutral-300' 
                : 'bg-neutral-100 border-neutral-300 text-neutral-700'
            } border p-4 rounded-lg`}
          >
            <div className="flex items-center gap-2">
              <span>✗</span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Results Display - Same as Streamlit app */}
        {results && results.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Prediction Results */}
            <Card className={`${
              isDark 
                ? 'bg-gradient-to-r from-neutral-900 to-black border-neutral-700' 
                : 'bg-gradient-to-r from-neutral-50 to-neutral-100 border-neutral-200'
            }`}>
              <CardHeader>
                <CardTitle className={`${isDark ? 'text-white' : 'text-neutral-800'} text-xl`}>
                  Prediction Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  Predicted Gender:{" "}
                  <span className="capitalize">{results.prediction}</span>
                </div>

                {/* Show expected vs predicted for test samples */}
                {results.expected && (
                  <div className="text-lg">
                    <span className="font-semibold">Expected:</span>{" "}
                    {results.expected}
                    {results.prediction === results.expected ? (
                      <span className={`ml-2 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>✓ Match!</span>
                    ) : (
                      <span className={`ml-2 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`}>✗ Mismatch</span>
                    )}
                  </div>
                )}

                {/* Prediction Confidence - Same as Streamlit */}
                <div className="space-y-3">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-800'} text-lg`}>
                    Prediction Confidence
                  </h3>
                  {Object.entries(results.probabilities).map(
                    ([gender, prob]) => (
                      <div key={gender} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium capitalize">
                            {gender}
                          </span>
                          <span>{(prob * 100).toFixed(2)}%</span>
                        </div>
                        <div className={`w-full ${isDark ? 'bg-neutral-700' : 'bg-neutral-200'} rounded-full h-3`}>
                          <motion.div
                            className={`${isDark ? 'bg-white' : 'bg-neutral-600'} h-3 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${prob * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Extracted Features - Same as Streamlit */}
            {results.extracted_features && (
              <Card>
                <CardHeader>
                  <CardTitle>🔍 Extracted Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {FEATURE_ORDER.map((featureName) => {
                      const value =
                        results.extracted_features[featureName] || 0.0;
                      return (
                        <div
                          key={featureName}
                          className="p-3 border rounded bg-muted/10"
                        >
                          <div className="font-medium text-sm">
                            {featureName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {value.toFixed(6)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Steps - Same as Streamlit */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Model Processing Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <details className="border rounded p-3">
                  <summary className="cursor-pointer font-medium">
                    View Scaled Features
                  </summary>
                  <div className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                    <pre>
                      {JSON.stringify(results.scaled_features, null, 2)}
                    </pre>
                  </div>
                </details>

                <details className="border rounded p-3">
                  <summary className="cursor-pointer font-medium">
                    View PCA Transformed Features
                  </summary>
                  <div className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                    <pre>{JSON.stringify(results.pca_features, null, 2)}</pre>
                  </div>
                </details>

                {results.raw_features && (
                  <details className="border rounded p-3">
                    <summary className="cursor-pointer font-medium">
                      View Raw Features
                    </summary>
                    <div className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                      <pre>{JSON.stringify(results.raw_features, null, 2)}</pre>
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-6"
        >
          <div className="flex gap-3">
            <AnimatedButton
              className="gap-2"
              variant="primary"
              disabled={!hasAudio || isProcessing}
              onClick={() => {
                if (results) {
                  navigate("/results", { state: { results } });
                }
              }}
            >
              {isProcessing ? "Processing..." : "View Enhanced Results →"}
            </AnimatedButton>
          </div>

          {!hasAudio && !isProcessing && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground mt-3"
            >
              Upload audio or test a sample to see prediction results.
            </motion.p>
          )}
        </motion.div>
      </section>
    </motion.main>
  );
}
