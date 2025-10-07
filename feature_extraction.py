# feature_extraction.py
import numpy as np
import librosa
from scipy.stats import skew, kurtosis, entropy
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

def spectral_entropy(S, power_spectrogram=True):
    # S : magnitude spectrogram (freq x frames)
    # compute normalized power per frame and Shannon entropy averaged across frames
    if power_spectrogram:
        S = S**2
    S_sum = np.sum(S, axis=0, keepdims=True) + 1e-12
    P = S / S_sum
    ent = -np.sum(P * np.log2(P + 1e-12), axis=0)
    return np.mean(ent)

def extract_features_from_file(path, sr=22050, duration=3.0, offset=0.0):
    """
    Returns a dict with features that approximate the 'voice' dataset features.
    Works with .wav files — load at sr and extract spectral + pitch features.
    """
    y, sr = librosa.load(path, sr=sr, duration=duration, offset=offset)
    # ensure mono
    if y.ndim > 1:
        y = librosa.to_mono(y)

    # STFT and magnitude
    stft = librosa.stft(y, n_fft=2048, hop_length=512)
    S = np.abs(stft)

    # spectral centroid (as proxy for frequency distribution)
    centroid = librosa.feature.spectral_centroid(S=S, sr=sr)[0]
    # spectral flatness
    flatness = librosa.feature.spectral_flatness(S=S)[0]
    # spectral rolloff (peak freq proxy)
    rolloff = librosa.feature.spectral_rolloff(S=S, sr=sr)[0]

    # Fundamental frequency estimation (f0) using pyin
    try:
        f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=50, fmax=500, sr=sr)
        # f0 can be many NaNs for unvoiced frames
        f0_clean = f0[~np.isnan(f0)]
    except Exception:
        f0 = np.array([np.nan])
        f0_clean = np.array([])

    # dominant frequency per frame approximation: use spectral centroid per frame (proxy)
    dom_freq = centroid

    # peak frequency (approx): frequency bin with max magnitude averaged across frames
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    avg_spectrum = np.mean(S, axis=1)
    peak_bin = np.argmax(avg_spectrum)
    peakf = freqs[peak_bin]

    features = {}
    # frequency distribution features (proxies)
    features['meanfreq'] = np.mean(centroid) if centroid.size else 0.0
    features['sd']       = np.std(centroid) if centroid.size else 0.0
    features['median']   = np.median(centroid) if centroid.size else 0.0
    features['Q25']      = np.quantile(centroid, 0.25) if centroid.size else 0.0
    features['Q75']      = np.quantile(centroid, 0.75) if centroid.size else 0.0
    features['IQR']      = features['Q75'] - features['Q25']
    features['skew']     = skew(centroid) if centroid.size else 0.0
    features['kurt']     = kurtosis(centroid) if centroid.size else 0.0

    # spectral entropy
    features['sp_ent']   = spectral_entropy(S, power_spectrogram=True)

    # spectral flatness mean
    features['sfm']      = np.mean(flatness) if flatness.size else 0.0

    # centroid mean (another column present in dataset)
    features['centroid'] = np.mean(centroid) if centroid.size else 0.0

    # peak frequency
    features['peakf']    = peakf

    # fundamental frequency features (meanfun, minfun, maxfun)
    features['meanfun']  = np.nanmean(f0_clean) if f0_clean.size else 0.0
    features['minfun']   = np.nanmin(f0_clean) if f0_clean.size else 0.0
    features['maxfun']   = np.nanmax(f0_clean) if f0_clean.size else 0.0

    # dominant frequency stats approximated by centroid stats
    features['meandom']  = np.mean(dom_freq) if dom_freq.size else 0.0
    features['mindom']   = np.min(dom_freq) if dom_freq.size else 0.0
    features['maxdom']   = np.max(dom_freq) if dom_freq.size else 0.0
    features['dfrange']  = features['maxdom'] - features['mindom']

    # modulation index: std(f0)/mean(f0)
    features['modindx']  = (np.nanstd(f0_clean) / (np.nanmean(f0_clean) + 1e-12)) if f0_clean.size else 0.0

    # some features in the original dataset may have different names; make sure the order matches your training dataframe
    return features

def features_dict_to_vector(d, feature_order):
    """Convert dict to vector following feature_order list."""
    return np.array([d.get(k, 0.0) for k in feature_order]).reshape(1, -1)

if __name__ == "__main__":
    # quick test
    feats = extract_features_from_file("test.wav")
    print(feats)
