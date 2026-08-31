const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

/**
 * Extract the direct audio stream URL from a YouTube video using yt-dlp.
 *
 * @param {string} videoId - YouTube video ID (e.g., "dQw4w9WgXcQ")
 * @returns {Promise<Object>} Stream info with URL and metadata
 */
async function extractStreamUrl(videoId) {
	const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`

	try {
		// Extract the best audio-only URL using yt-dlp
		// -f bestaudio: select best audio format
		// --get-url: only output the direct URL
		// --no-playlist: don't download entire playlist
		// --no-warnings: suppress warnings
		const { stdout: streamUrl } = await execAsync(
			`python -m yt_dlp -f bestaudio --get-url --no-playlist --no-warnings "${youtubeUrl}"`,
			{ timeout: 30000 }
		)

		// Also extract metadata (title, artist, thumbnail, duration)
		const { stdout: metadataJson } = await execAsync(
			`python -m yt_dlp --dump-json --no-playlist --no-warnings "${youtubeUrl}"`,
			{ timeout: 30000 }
		)

		const metadata = JSON.parse(metadataJson)

		return {
			streamUrl: streamUrl.trim(),
			metadata: {
				title: metadata.title || 'Unknown',
				artist: metadata.artist || metadata.uploader || metadata.channel || 'Unknown Artist',
				thumbnail:
					metadata.thumbnail ||
					metadata.thumbnails?.[metadata.thumbnails.length - 1]?.url ||
					'',
				duration: metadata.duration || 0,
			},
		}
	} catch (error) {
		// If metadata extraction fails, try to get at least the stream URL
		try {
			const { stdout: streamUrl } = await execAsync(
				`python -m yt_dlp -f bestaudio --get-url --no-playlist --no-warnings "${youtubeUrl}"`,
				{ timeout: 30000 }
			)

			return {
				streamUrl: streamUrl.trim(),
				metadata: {
					title: 'Unknown',
					artist: 'Unknown Artist',
					thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
					duration: 0,
				},
			}
		} catch (fallbackError) {
			throw new Error(
				`yt-dlp extraction failed: ${error.message}. ` +
				`Make sure yt-dlp is installed globally: pip install yt-dlp`
			)
		}
	}
}

module.exports = { extractStreamUrl }
