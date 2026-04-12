import json
import os
import sys
import tempfile
import traceback
import wave
from typing import Any


def ensure_voxcpm_import_path(profile: dict[str, Any]) -> None:
    repo_path = profile.get("localRepoPath") or os.environ.get("VOXCPM_REPO")
    if not repo_path:
        return

    src_path = os.path.join(str(repo_path), "src")
    if os.path.isdir(src_path) and src_path not in sys.path:
        sys.path.insert(0, src_path)
    elif os.path.isdir(str(repo_path)) and str(repo_path) not in sys.path:
        sys.path.insert(0, str(repo_path))


def error(message: str, **extra: Any):
    payload = {"error": message, **extra}
    print(json.dumps(payload))
    sys.exit(1)


def normalize_pcm16_bytes(wav: Any) -> bytes:
    try:
        values = wav.tolist() if hasattr(wav, "tolist") else list(wav)
    except Exception as exc:
        error("could-not-read-waveform", detail=str(exc))

    frames = bytearray()
    for sample in values:
        try:
            value = float(sample)
        except Exception as exc:
            error("non-numeric-waveform-sample", detail=str(exc))
        if value > 1.0:
            value = 1.0
        if value < -1.0:
            value = -1.0
        pcm = int(value * 32767.0)
        frames.extend(int(pcm).to_bytes(2, byteorder="little", signed=True))
    return bytes(frames)


def write_wav_file(wav: Any, sample_rate: int) -> str:
    fd, out_path = tempfile.mkstemp(prefix="opencode-voxcpm-", suffix=".wav")
    os.close(fd)
    pcm = normalize_pcm16_bytes(wav)
    with wave.open(out_path, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(int(sample_rate))
        handle.writeframes(pcm)
    return out_path


def generate_audio(payload: dict[str, Any]) -> dict[str, Any]:
    profile = payload.get("profile") or {}
    ensure_voxcpm_import_path(profile)

    try:
        from voxcpm import VoxCPM  # type: ignore
    except Exception as exc:
        error("voxcpm-import-failed", detail=str(exc))

    text = str(payload.get("text") or "").strip()
    if not text:
        error("missing-text")

    model_id = profile.get("model") or os.environ.get("VOXCPM_MODEL") or "openbmb/VoxCPM2"
    load_denoiser = bool(profile.get("loadDenoiser", False))

    try:
        model = VoxCPM.from_pretrained(model_id, load_denoiser=load_denoiser)
    except Exception as exc:
        error("voxcpm-load-failed", model=model_id, detail=str(exc))

    kwargs: dict[str, Any] = {
        "text": text,
    }

    reference_audio = profile.get("referenceAudioPath")
    if reference_audio:
        kwargs["reference_wav_path"] = reference_audio

    prompt_audio = profile.get("promptAudioPath")
    if prompt_audio:
        kwargs["prompt_wav_path"] = prompt_audio

    prompt_text = profile.get("promptText")
    if prompt_text:
        kwargs["prompt_text"] = prompt_text

    cfg_value = profile.get("cfgValue")
    if cfg_value is not None:
        kwargs["cfg_value"] = cfg_value

    inference_timesteps = profile.get("inferenceTimesteps")
    if inference_timesteps is not None:
        kwargs["inference_timesteps"] = inference_timesteps

    for optional in ["normalize", "denoise", "retry_badcase", "retry_badcase_max_times", "retry_badcase_ratio_threshold"]:
        if optional in profile:
            kwargs[optional] = profile[optional]

    try:
        wav = model.generate(**kwargs)
    except Exception as exc:
        error("voxcpm-generate-failed", detail=str(exc))

    sample_rate = getattr(getattr(model, "tts_model", None), "sample_rate", None) or 48000
    audio_path = write_wav_file(wav, int(sample_rate))
    return {
        "audioPath": audio_path,
        "provider": "voxcpm",
        "sampleRate": int(sample_rate),
        "model": model_id,
    }


def main():
    try:
        payload = json.load(sys.stdin)
        result = generate_audio(payload)
        print(json.dumps(result))
    except SystemExit:
        raise
    except Exception as exc:
        error("unexpected-bridge-error", detail=str(exc), traceback=traceback.format_exc())


if __name__ == "__main__":
    main()
