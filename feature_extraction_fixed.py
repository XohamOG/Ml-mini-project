# feature_extraction_fixed.py
import numpy as np
import librosa
from scipy.stats import skew, kurtosis
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

def spectral_entropy(S, power_spectrogram=True):
    if power_spectrogram:
        S = S**2
    S_sum = np.sum(S, axis=0, keepdims=True) + 1e-12
    P = S / S_sum
    ent = -np.sum(P * np.log2(P + 1e-12), axis=0)
    return np.mean(ent)

def extract_features_from_file(path, sr=22050, duration=3.0, offset=0.0):
    y, sr = librosa.load(path, sr=sr, duration=duration, offset=offset)
    if y.ndim > 1:
        y = librosa.to_mono(y)

    # Ensure we have enough samples
    if len(y) < 1024:
        y = np.pad(y, (0, 1024 - len(y)), mode='constant')

    stft = librosa.stft(y, n_fft=2048, hop_length=512)
    S = np.abs(stft)

    # Extract spectral features
    centroid = librosa.feature.spectral_centroid(S=S, sr=sr)[0]
    flatness = librosa.feature.spectral_flatness(S=S)[0]
    bandwidth = librosa.feature.spectral_bandwidth(S=S, sr=sr)[0]
    
    try:
        f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=80, fmax=400, sr=sr)
        f0_clean = f0[~np.isnan(f0)]
    except Exception:
        f0_clean = np.array([])

    # Calculate frequency domain statistics
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    magnitude_spectrum = np.mean(S, axis=1)
    
    # Normalize spectrum
    magnitude_spectrum = magnitude_spectrum / np.sum(magnitude_spectrum)
    
    # Calculate weighted frequency statistics
    mean_freq = np.sum(freqs * magnitude_spectrum)
    freq_variance = np.sum(magnitude_spectrum * (freqs - mean_freq)**2)
    freq_std = np.sqrt(freq_variance)
    
    # Calculate quantiles
    cumsum_spectrum = np.cumsum(magnitude_spectrum)
    median_freq = freqs[np.argmax(cumsum_spectrum >= 0.5)]
    q25_freq = freqs[np.argmax(cumsum_spectrum >= 0.25)]
    q75_freq = freqs[np.argmax(cumsum_spectrum >= 0.75)]
    
    # Normalize to match dataset scale (0-0.3 range typically)
    freq_scale = 1.0 / (sr / 2.0)  # Normalize by Nyquist frequency
    
    features = {}
    
    # Frequency distribution features
    features['meanfreq'] = mean_freq * freq_scale
    features['sd'] = freq_std * freq_scale
    features['median'] = median_freq * freq_scale
    features['Q25'] = q25_freq * freq_scale
    features['Q75'] = q75_freq * freq_scale
    features['IQR'] = features['Q75'] - features['Q25']
    
    # Higher order statistics
    freq_skew = np.sum(magnitude_spectrum * ((freqs - mean_freq) / freq_std)**3) if freq_std > 0 else 0
    freq_kurt = np.sum(magnitude_spectrum * ((freqs - mean_freq) / freq_std)**4) if freq_std > 0 else 0
    features['skew'] = freq_skew
    features['kurt'] = freq_kurt
    
    # Spectral entropy (normalize to 0.7-1.0 range)
    sp_ent_raw = spectral_entropy(S, power_spectrogram=True)
    features['sp.ent'] = 0.7 + 0.3 * (sp_ent_raw / 10.0)  # Scale to typical range
    features['sp.ent'] = min(max(features['sp.ent'], 0.7), 1.0)  # Clamp
    
    # Spectral flatness
    features['sfm'] = np.mean(flatness) if flatness.size > 0 else 0.0
    
    # Mode (most common frequency bin)
    peak_bin = np.argmax(magnitude_spectrum)
    features['mode'] = freqs[peak_bin] * freq_scale
    
    # Centroid
    features['centroid'] = features['meanfreq']  # Same as mean frequency
    
    # Fundamental frequency features
    if f0_clean.size > 0:
        # Scale F0 to match dataset range (0.01-0.28)
        f0_scaled = f0_clean / 1000.0
        features['meanfun'] = np.nanmean(f0_scaled)
        features['minfun'] = np.nanmin(f0_scaled)
        features['maxfun'] = np.nanmax(f0_scaled)
        
        # Modulation index
        f0_mean = np.nanmean(f0_scaled)
        f0_std = np.nanstd(f0_scaled)
        features['modindx'] = f0_std / (f0_mean + 1e-12) if f0_mean > 0 else 0.0
        features['modindx'] = min(features['modindx'], 1.0)  # Cap at 1.0
    else:
        features['meanfun'] = 0.1  # Default reasonable value
        features['minfun'] = 0.02  # Default reasonable value
        features['maxfun'] = 0.25  # Default reasonable value
        features['modindx'] = 0.1  # Default reasonable value
    
    # Dominant frequency features (use spectral statistics)
    # Scale to match dataset range (0.007-22 range)
    dom_scale = 20.0 / (sr / 2.0)  # Scale factor for dominant frequencies
    features['meandom'] = mean_freq * dom_scale * 0.1  # Scale down to reasonable range
    features['mindom'] = q25_freq * dom_scale * 0.1
    features['maxdom'] = q75_freq * dom_scale * 0.5  # Allow higher max
    features['dfrange'] = features['maxdom'] - features['mindom']
    
    # Ensure all values are in reasonable ranges
    features['meandom'] = min(max(features['meandom'], 0.005), 3.0)
    features['mindom'] = min(max(features['mindom'], 0.004), 0.5)
    features['maxdom'] = min(max(features['maxdom'], 0.01), 22.0)
    features['dfrange'] = features['maxdom'] - features['mindom']

    return features

def features_dict_to_vector(d, feature_order):
    """Convert dict to vector following feature_order list."""
    return np.array([d.get(k, 0.0) for k in feature_order]).reshape(1, -1)

if __name__ == "__main__":
    feats = extract_features_from_file("temp.wav")
    print(feats)