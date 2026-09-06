import modal
import subprocess
from pathlib import Path

# Initialize Modal App
app = modal.App("music-player-backend")

# Server directory path
SERVER_DIR = Path(__file__).parent

# Build container image with Node.js 20, ffmpeg, and yt-dlp
server_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("curl", "ffmpeg", "python3")
    .run_commands(
        "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
        "apt-get install -y nodejs",
        "ln -sf $(which python3) /usr/local/bin/python",
    )
    .pip_install("yt-dlp")
    .add_local_dir(
        SERVER_DIR,
        remote_path="/root/server",
        ignore=["node_modules", ".git", "__pycache__", "*.pyc"],
        copy=True,
    )
    .run_commands("cd /root/server && npm install --omit=dev")
)

@app.function(
    image=server_image,
    timeout=600,
    scaledown_window=300,
    secrets=[modal.Secret.from_name("webshare-proxy")],
)
@modal.web_server(port=3001, startup_timeout=120)
def web():
    """Runs the Express.js music streaming backend inside Modal."""
    subprocess.Popen(["node", "/root/server/index.js"])
