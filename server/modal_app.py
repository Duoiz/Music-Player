import modal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import re

app = modal.App("music-player-backend")

# Define the environment container and install dependencies
image = (
    modal.Image.debian_slim()
    .pip_install("fastapi[standard]", "yt-dlp", "youtube-search-python", "pydantic", "httpx==0.27.2")
)

web_app = FastAPI()

# Allow cross-origin requests from the React Native app
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_title(title: str) -> str:
    """Clean up song titles by removing common suffixes."""
    title = re.sub(r'(?i)\s*\(Official\s*(Music\s*)?Video\)', '', title)
    title = re.sub(r'(?i)\s*\[Official\s*(Music\s*)?Video\]', '', title)
    title = re.sub(r'(?i)\s*\(Official\s*Audio\)', '', title)
    title = re.sub(r'(?i)\s*\[Official\s*Audio\]', '', title)
    title = re.sub(r'(?i)\s*\(Lyrics?\)', '', title)
    title = re.sub(r'(?i)\s*\[Lyrics?\]', '', title)
    title = re.sub(r'(?i)\s*\(Visualizer\)', '', title)
    title = re.sub(r'\|.*$', '', title)
    return title.strip()

def parse_duration(duration_str: str) -> int:
    """Parse duration string '3:45' to seconds."""
    if not duration_str:
        return 0
    parts = list(map(int, duration_str.split(':')))
    if len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    elif len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return 0

@web_app.get("/api/health")
def health_check():
    return {"status": "ok", "backend": "modal-serverless"}

@web_app.get("/api/search")
def search(q: str):
    if not q:
        raise HTTPException(status_code=400, detail="Missing search query parameter 'q'")
    
    try:
        import yt_dlp
    
        ydl_opts = {
            'quiet': True,
            'extract_flat': True, # extract_flat=True gets fast search results without fully resolving every video
            'no_warnings': True,
        }
        
        songs = []
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # ytsearch<limit>:<query>
            info = ydl.extract_info(f"ytsearch20:{q} music", download=False)
            entries = info.get('entries', [])
            
            for item in entries:
                try:
                    if not item:
                        continue
                    
                    # yt-dlp flat extraction fields
                    video_id = item.get("id") or item.get("url")
                    title = item.get("title") or "Unknown"
                    artist = item.get("uploader") or item.get("channel") or "Unknown Artist"
                    duration = item.get("duration") or 0
                    
                    # Some flat extractions have 'thumbnails', some have just 'thumbnail'
                    thumbnails = item.get("thumbnails", [])
                    if thumbnails:
                        best_thumbnail = thumbnails[-1].get("url", "")
                    else:
                        best_thumbnail = item.get("thumbnail", f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg")
                    
                    songs.append({
                        "id": video_id,
                        "title": clean_title(title),
                        "artist": artist,
                        "thumbnail": best_thumbnail,
                        "duration": duration, # yt-dlp duration is already an integer in seconds
                        "videoId": video_id
                    })
                except Exception as item_e:
                    print(f"Error parsing item: {item_e}")
                    continue
            
        return {"results": songs}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@web_app.get("/api/stream/{video_id}")
def get_stream(video_id: str):
    # Import inside the function so it only runs in the cloud container
    import yt_dlp

    url = f"https://www.youtube.com/watch?v={video_id}"
    
    # yt-dlp native configuration
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # download=False means it just extracts the direct streaming URL
            info = ydl.extract_info(url, download=False)
            
            return {
                "streamUrl": info.get("url"),
                "metadata": {
                    "title": info.get("title", "Unknown"),
                    "artist": info.get("uploader", "Unknown Artist"),
                    "thumbnail": info.get("thumbnail", ""),
                    "duration": info.get("duration", 0),
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"yt-dlp failed: {str(e)}")

@web_app.get("/api/themes")
def get_themes():
    return {
        "themes": [
            {
                "id": "community-ocean",
                "name": "Ocean Vibes",
                "author": "CommunityUser1",
                "preview": "",
                "isPremium": False,
                "style": {},
            },
            {
                "id": "community-sunset",
                "name": "Sunset Glow",
                "author": "CommunityUser2",
                "preview": "",
                "isPremium": False,
                "style": {},
            },
        ]
    }

# Bind the FastAPI app to the Modal serverless infrastructure
@app.function(image=image)
@modal.asgi_app()
def fastapi_app():
    return web_app
