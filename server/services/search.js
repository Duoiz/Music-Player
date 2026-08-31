const yts = require('yt-search')

/**
 * Search YouTube Music for songs matching the given query.
 * Prioritizes music/video results and extracts metadata.
 *
 * @param {string} query - Search query string
 * @param {number} limit - Max number of results (default: 20)
 * @returns {Promise<Array>} Array of song objects
 */
async function searchYouTubeMusic(query, limit = 20) {
	try {
		// Append "music" to bias toward music results
		const searchQuery = `${query} music`

		const searchResults = await yts(searchQuery)

		// yt-search returns videos in `searchResults.videos`
		const songs = searchResults.videos
			.slice(0, limit)
			.map((item) => ({
				id: item.videoId || item.url,
				title: cleanTitle(item.title || 'Unknown'),
				artist: item.author?.name || 'Unknown Artist',
				thumbnail: item.thumbnail || item.image || '',
				duration: item.seconds || 0,
				videoId: item.videoId,
			}))

		return songs
	} catch (error) {
		console.error('YouTube search error:', error)
		throw new Error(`Search failed: ${error.message}`)
	}
}

/**
 * Clean up song titles by removing common suffixes.
 */
function cleanTitle(title) {
	return title
		.replace(/\s*\(Official\s*(Music\s*)?Video\)/gi, '')
		.replace(/\s*\[Official\s*(Music\s*)?Video\]/gi, '')
		.replace(/\s*\(Official\s*Audio\)/gi, '')
		.replace(/\s*\[Official\s*Audio\]/gi, '')
		.replace(/\s*\(Lyrics?\)/gi, '')
		.replace(/\s*\[Lyrics?\]/gi, '')
		.replace(/\s*\(Visualizer\)/gi, '')
		.replace(/\s*\|.*$/, '') // Remove pipe and everything after
		.trim()
}

/**
 * Get the best quality thumbnail URL from the thumbnails array.
 */
function getBestThumbnail(thumbnails) {
	if (!thumbnails || thumbnails.length === 0) return ''
	// ytsr thumbnails are sorted smallest first; get the last (largest)
	const best = thumbnails[thumbnails.length - 1]
	return best?.url || ''
}

/**
 * Parse duration string "3:45" or "1:02:30" to seconds.
 */
function parseDuration(durationStr) {
	if (!durationStr) return 0

	const parts = durationStr.split(':').map(Number)
	if (parts.length === 3) {
		return parts[0] * 3600 + parts[1] * 60 + parts[2]
	} else if (parts.length === 2) {
		return parts[0] * 60 + parts[1]
	}
	return 0
}

/**
 * Extract video ID from a YouTube URL.
 */
function extractVideoId(url) {
	if (!url) return ''
	const match = url.match(/(?:v=|\/)([\w-]{11})/)
	return match ? match[1] : ''
}

module.exports = { searchYouTubeMusic }
