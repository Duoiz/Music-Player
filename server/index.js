const express = require('express')
const cors = require('cors')
const { searchYouTubeMusic } = require('./services/search')
const { extractStreamUrl } = require('./services/ytdlp')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

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
		const streamInfo = await extractStreamUrl(videoId)
		console.log(`[STREAM] Success: ${streamInfo.metadata.title}`)

		res.json(streamInfo)
	} catch (error) {
		console.error('[STREAM] Error:', error.message)
		res.status(500).json({ error: 'Stream extraction failed', details: error.message })
	}
})

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
  │     GET /api/themes                     │
  │                                         │
  └─────────────────────────────────────────┘
  `)
})
