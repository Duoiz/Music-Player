const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const express = require('express')
const cors = require('cors')
const https = require('https')
const { searchYouTubeMusic } = require('./services/search')
const { extractStreamUrl } = require('./services/ytdlp')

const app = express()
app.set('trust proxy', true)
const PORT = process.env.PORT || 3001

const PROXY_URL = process.env.WEBSHARE_PROXY_URL || process.env.PROXY_URL || ''
let proxyAgent = null

async function getProxyAgent() {
	if (!PROXY_URL) return undefined
	if (!proxyAgent) {
		try {
			const mod = await import('https-proxy-agent')
			const AgentClass = mod.HttpsProxyAgent || mod.default?.HttpsProxyAgent || mod.default
			proxyAgent = new AgentClass(PROXY_URL)
		} catch (err) {
			console.error('[PROXY] Error initializing proxy agent:', err.message)
		}
	}
	return proxyAgent
}

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
		const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
		const protocol = req.headers['x-forwarded-proto'] || (isLocal ? (req.secure ? 'https' : req.protocol) : 'https')
		responseInfo.streamUrl = `${protocol}://${host}/api/proxy/${videoId}`

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
		const isDownload = req.query.download === 'true' || req.query.full === 'true' || req.headers['x-download'] === 'true';

		// Only apply 1MB preview cap for streaming playback when explicitly requested as unbounded stream start (bytes=0-),
		// and NEVER for download requests or requests without a partial range!
		if (!isDownload && rangeHeader === 'bytes=0-') {
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

		const makeRequest = async (urlToFetch) => {
			const agent = await getProxyAgent()
			currentReq = https.get(urlToFetch, {
				agent,
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
