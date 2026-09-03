const express = require('express')
const cors = require('cors')
const https = require('https')
const { HttpsProxyAgent } = require('https-proxy-agent')
const { searchYouTubeMusic } = require('./services/search')
const { extractStreamUrl } = require('./services/ytdlp')

const app = express()
const PORT = process.env.PORT || 3001

const PROXY_URL = 'http://zdhylekl:vaigrn5oy9qu@31.59.20.176:6754'
const proxyAgent = new HttpsProxyAgent(PROXY_URL)

// Cache for stream URLs
const streamUrlCache = new Map()
const CACHE_TTL = 1000 * 60 * 60 * 2 // 2 hours

// Middleware
app.use(cors())
app.use(express.json())

// Network Traffic Logger
app.use((req, res, next) => {
	const start = Date.now()
	res.on('finish', () => {
		const duration = Date.now() - start
		// Calculate rough payload size. For exact packet tracking, you'd need a packet sniffer,
		// but this logs the API bandwidth being used.
		const bytes = res.get('Content-Length') || 0
		console.log(`[NETWORK] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Bytes Sent: ${bytes} B | Time: ${duration}ms`)
	})
	next()
})

// ============================================================
// Health check
// ============================================================
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ============================================================
// Search — YouTube Music search
// ============================================================
app.get('/api/search', async (req, res) => {
	try {
		const query = req.query.q
		if (!query || typeof query !== 'string') {
			return res.status(400).json({ error: 'Missing search query parameter "q"' })
		}

		console.log(`[SEARCH] Searching for: "${query}"`)
		const results = await searchYouTubeMusic(query)
		console.log(`[SEARCH] Found ${results.length} results`)

		res.json({ results })
	} catch (error) {
		console.error('[SEARCH] Error:', error.message)
		res.status(500).json({ error: 'Search failed', details: error.message })
	}
})

// ============================================================
// Stream — Extract audio URL via yt-dlp
// ============================================================
app.get('/api/stream/:videoId', async (req, res) => {
	try {
		const { videoId } = req.params
		if (!videoId) {
			return res.status(400).json({ error: 'Missing videoId parameter' })
		}

		console.log(`[STREAM] Extracting stream for: ${videoId}`)
		
		let streamInfo = streamUrlCache.get(`info_${videoId}`);
		if (!streamInfo) {
			streamInfo = await extractStreamUrl(videoId)
			streamUrlCache.set(`info_${videoId}`, streamInfo)
			streamUrlCache.set(videoId, streamInfo.streamUrl)
			setTimeout(() => {
				streamUrlCache.delete(`info_${videoId}`)
				streamUrlCache.delete(videoId)
			}, CACHE_TTL)
		}

		console.log(`[STREAM] Success: ${streamInfo.metadata.title}`)

		// Override streamUrl with proxy endpoint because Google strictly enforces IP-locking
		const responseInfo = { ...streamInfo }
		const host = req.get('host') || `localhost:${PORT}`
		responseInfo.streamUrl = `${req.protocol}://${host}/api/proxy/${videoId}`

		res.json(responseInfo)
	} catch (error) {
		console.error('[STREAM] Error:', error.message)
		res.status(500).json({ error: 'Stream extraction failed', details: error.message })
	}
})

// ============================================================
// Proxy — Proxy audio through Webshare
// ============================================================
app.get('/api/proxy/:videoId', async (req, res) => {
	const { videoId } = req.params;
	try {
		let streamUrl = streamUrlCache.get(videoId);
		if (!streamUrl) {
			console.log(`[PROXY] Cache miss for ${videoId}, extracting URL...`);
			const info = await extractStreamUrl(videoId);
			streamUrl = info.streamUrl;
			streamUrlCache.set(videoId, streamUrl);
			setTimeout(() => streamUrlCache.delete(videoId), CACHE_TTL);
		}

		let rangeHeader = req.headers.range;

		// OPTIMIZATION: If the client requests the start of the file unboundedly (e.g., bytes=0-),
		// we cap it to the first 1MB (~1 minute of 128kbps audio).
		// This acts as a low-bandwidth "preview". If they skip the song, we only used 1MB.
		// If they keep listening, the player will naturally request the next chunk (bytes=1048576-)
		// which we will leave unbounded to download the rest of the song efficiently.
		if (rangeHeader === 'bytes=0-') {
			rangeHeader = 'bytes=0-1048575';
		} else if (!rangeHeader) {
			// If no range is provided, force a 1MB chunk anyway to prevent full download on tap
			rangeHeader = 'bytes=0-1048575';
		}

		const requestHeaders = {
			'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
		};
		if (rangeHeader) {
			requestHeaders['Range'] = rangeHeader;
		}

		let currentReq = null;
		let currentRes = null;

		const makeRequest = (urlToFetch) => {
			currentReq = https.get(urlToFetch, {
				agent: proxyAgent,
				headers: requestHeaders,
			}, (proxyRes) => {
				currentRes = proxyRes;

				// Handle redirects (301, 302, 303, 307, 308)
				if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
					// Consume the response data to free up memory before redirecting
					proxyRes.resume();
					return makeRequest(proxyRes.headers.location);
				}

				res.status(proxyRes.statusCode);
				
				const headersToForward = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
				for (const header of headersToForward) {
					if (proxyRes.headers[header]) {
						res.setHeader(header, proxyRes.headers[header]);
					}
				}

				proxyRes.pipe(res);
			});

			currentReq.on('error', (err) => {
				console.error('[PROXY] Stream error:', err.message);
				if (!res.headersSent) {
					res.status(500).json({ error: 'Stream proxy failed' });
				}
			});
		};

		makeRequest(streamUrl);

		req.on('close', () => {
			if (currentReq) currentReq.destroy();
			if (currentRes) currentRes.destroy();
		});

	} catch (error) {
		console.error('[PROXY] Extraction error:', error.message);
		if (!res.headersSent) {
			res.status(500).json({ error: 'Extraction failed' });
		}
	}
});

// ============================================================
// Themes — UGC themes (hardcoded for MVP)
// ============================================================
app.get('/api/themes', (req, res) => {
	// For MVP, return an empty array. In the future, connect to a
	// database for user-submitted themes.
	res.json({
		themes: [
			{
				id: 'community-ocean',
				name: 'Ocean Vibes',
				author: 'CommunityUser1',
				preview: '',
				isPremium: false,
				style: {},
			},
			{
				id: 'community-sunset',
				name: 'Sunset Glow',
				author: 'CommunityUser2',
				preview: '',
				isPremium: false,
				style: {},
			},
		],
	})
})

// ============================================================
// Start server
// ============================================================
app.listen(PORT, '0.0.0.0', () => {
	console.log(`
  ┌─────────────────────────────────────────┐
  │                                         │
  │   🎵 Music Player Backend Server        │
  │                                         │
  │   Running on: http://localhost:${PORT}     │
  │                                         │
  │   Endpoints:                            │
  │     GET /api/health                     │
  │     GET /api/search?q=<query>           │
  │     GET /api/stream/:videoId            │
  │     GET /api/proxy/:videoId             │
  │     GET /api/themes                     │
  │                                         │
  └─────────────────────────────────────────┘
  `)
})
