import sys
import os
import json
import base64
import argparse
import subprocess
import numpy as np

def analyze_audio(input_source, ffmpeg_bin="ffmpeg", proxy=None, n_bands=16, fps=20, max_duration=600):
    sr = 11025
    hop_size = int(sr / fps)
    n_fft = 1024

    cmd = [ffmpeg_bin, "-v", "error"]
    if proxy and proxy.strip():
        cmd.extend(["-http_proxy", proxy.strip()])
    cmd.extend([
        "-i", input_source,
        "-t", str(max_duration),
        "-vn",
        "-ac", "1",
        "-ar", str(sr),
        "-f", "s16le",
        "pipe:1"
    ])

    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    raw_pcm, stderr_data = proc.communicate()

    if proc.returncode != 0 or len(raw_pcm) < n_fft * 2:
        err_msg = stderr_data.decode("utf-8", errors="ignore").strip()
        raise RuntimeError(f"FFmpeg decoding failed (code {proc.returncode}): {err_msg}")

    # Convert s16le bytes to float32 in range [-1.0, 1.0]
    pcm = np.frombuffer(raw_pcm, dtype=np.int16).astype(np.float32) / 32768.0
    total_samples = len(pcm)
    duration = total_samples / sr

    # Compute number of frames
    if total_samples <= n_fft:
        n_frames = 1
        # Pad pcm to n_fft
        pcm = np.pad(pcm, (0, n_fft - total_samples))
    else:
        n_frames = (total_samples - n_fft) // hop_size + 1

    window = np.hanning(n_fft)

    # 16 Logarithmic frequency bands from 30 Hz to 5000 Hz
    f_min = 30.0
    f_max = 5000.0
    band_edges_hz = np.logspace(np.log10(f_min), np.log10(f_max), num=n_bands + 1)
    bin_edges = np.clip(np.round(band_edges_hz * n_fft / sr).astype(int), 1, n_fft // 2)

    # Ensure strictly increasing bin indices
    for b in range(len(bin_edges) - 1):
        if bin_edges[b + 1] <= bin_edges[b]:
            bin_edges[b + 1] = bin_edges[b] + 1
        if bin_edges[b + 1] > n_fft // 2:
            bin_edges[b + 1] = n_fft // 2

    # Frame extraction and vectorized STFT
    envelope = np.zeros((n_frames, n_bands), dtype=np.uint8)

    for i in range(n_frames):
        start = i * hop_size
        frame = pcm[start : start + n_fft]
        if len(frame) < n_fft:
            frame = np.pad(frame, (0, n_fft - len(frame)))
        
        # Real FFT magnitude
        spec = np.abs(np.fft.rfft(frame * window))

        # Band energy aggregation
        for b in range(n_bands):
            b_start = bin_edges[b]
            b_end = bin_edges[b + 1]
            if b_start < b_end:
                mag = np.mean(spec[b_start:b_end])
            else:
                mag = spec[b_start] if b_start < len(spec) else 0.0

            # Convert magnitude to decibel-like curve:
            # 20 * log10(mag + 1e-4)
            db = 20.0 * np.log10(mag + 1e-4)
            # Map [-50 dB, 0 dB] to [0.0, 1.0]
            norm = (db + 45.0) / 45.0
            norm = max(0.0, min(1.0, norm))
            envelope[i, b] = int(norm * 255.0)

    # Base64 encode the byte array
    b64_envelope = base64.b64encode(envelope.tobytes()).decode("ascii")

    return {
        "fps": float(fps),
        "bands": int(n_bands),
        "duration": round(float(duration), 2),
        "totalFrames": int(n_frames),
        "envelope": b64_envelope
    }

def main():
    parser = argparse.ArgumentParser(description="Analyze audio and extract frequency envelope.")
    parser.add_argument("--input", required=True, help="Input audio URL or file path")
    parser.add_argument("--ffmpeg", default="ffmpeg", help="Path to ffmpeg binary")
    parser.add_argument("--proxy", default=None, help="Proxy URL for ffmpeg")
    parser.add_argument("--bands", type=int, default=16, help="Number of frequency bands")
    parser.add_argument("--fps", type=int, default=20, help="Frames per second")
    parser.add_argument("--max-duration", type=int, default=600, help="Max duration in seconds")

    args = parser.parse_args()

    try:
        result = analyze_audio(
            input_source=args.input,
            ffmpeg_bin=args.ffmpeg,
            proxy=args.proxy,
            n_bands=args.bands,
            fps=args.fps,
            max_duration=args.max_duration
        )
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
