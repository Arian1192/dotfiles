import json
import os
import subprocess
import sys
import tempfile


def main():
    payload = json.load(sys.stdin)
    text = str(payload.get("text") or "").strip()
    profile = payload.get("profile") or {}
    if not text:
        print(json.dumps({"error": "missing text"}))
        sys.exit(1)

    fd, out_path = tempfile.mkstemp(prefix="opencode-voice-", suffix=".aiff")
    os.close(fd)

    cmd = ["say", "-o", out_path]
    voice = profile.get("macOSVoice")
    if voice:
        cmd.extend(["-v", voice])
    cmd.append(text)

    subprocess.run(cmd, check=True)
    print(json.dumps({"audioPath": out_path, "provider": "stub-say"}))


if __name__ == "__main__":
    main()
