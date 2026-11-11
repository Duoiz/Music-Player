const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

function getProxyArg() {
	const proxyUrl = process.env.WEBSHARE_PROXY_URL || process.env.PROXY_URL
	return proxyUrl
		? `--proxy "${proxyUrl}" --extractor-args "youtube:player_client=android"`
		: '--extractor-args "youtube:player_client=android"'
}

/**
 * Extract the direct audio stream URL from a YouTube video using yt-dlp.
 *
 * @param {string} videoId - YouTube video ID (e.g., "dQw4w9WgXcQ")
 * @returns {Promise<Object>} Stream info with URL and metadata
 */
async function extractStreamUrl(videoId) {
	const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
	const proxyArg = getProxyArg()

	try {
		// Extract the best audio-only URL using yt-dlp
		// -f bestaudio: select best audio format
		// --get-url: only output the direct URL
		// --no-playlist: don't download entire playlist
		// --no-warnings: suppress warnings
		const { stdout: streamUrl } = await execAsync(
			`python -m yt_dlp ${proxyArg} -f "m4a/bestaudio/best" --get-url --no-playlist --no-warnings "${youtubeUrl}"`,
			{ timeout: 30000 }
		)

		// Also extract metadata (title, artist, thumbnail, duration)
		const { stdout: metadataJson } = await execAsync(
			`python -m yt_dlp ${proxyArg} --dump-json --no-playlist --no-warnings "${youtubeUrl}"`,
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
				`python -m yt_dlp ${proxyArg} -f "m4a/bestaudio/best" --get-url --no-playlist --no-warnings "${youtubeUrl}"`,
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
