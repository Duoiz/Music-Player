const { execFile } = require('child_process')
const path = require('path')
let ffmpegStatic = null
try {
	ffmpegStatic = require('ffmpeg-static')
} catch (e) {
	// ffmpeg-static not installed or unavailable
}

// Spectrum Cache: videoId -> { data, timestamp }
const spectrumCache = new Map()
const inFlightAnalyses = new Map()
const CACHE_TTL = 1000 * 60 * 60 * 6 // 6 hours

function getFfmpegPath() {
	if (ffmpegStatic) {
		return ffmpegStatic
	}
	return 'ffmpeg'
}

/**
 * Computes or retrieves pre-computed frequency envelope for a track.
 *
 * @param {string} videoId - Unique YouTube or track identifier
 * @param {string} streamUrl - Direct audio stream URL or local audio file path
 * @returns {Promise<Object>} Spectrum envelope with { fps, bands, duration, totalFrames, envelope }
 */
async function getSpectrumEnvelope(videoId, streamUrl) {
	if (!videoId || !streamUrl) {
		throw new Error('Missing videoId or streamUrl for audio analysis')
	}

	// 1. Check in-memory cache
	const cached = spectrumCache.get(videoId)
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data
	}

	// 2. Check in-flight deduplication
	const inFlight = inFlightAnalyses.get(videoId)
	if (inFlight) {
		return inFlight
	}

	const analysisPromise = (async () => {
		try {
			const pyScript = path.resolve(__dirname, 'analyzer.py')
			const ffmpegBin = getFfmpegPath()
			const proxy = process.env.WEBSHARE_PROXY_URL || process.env.PROXY_URL || ''

			const args = [
				pyScript,
				'--input', streamUrl,
				'--ffmpeg', ffmpegBin,
				'--bands', '16',
				'--fps', '20',
				'--max-duration', '600',
			]

			if (proxy) {
				args.push('--proxy', proxy)
			}

			const result = await new Promise((resolve, reject) => {
				execFile('python', args, { maxBuffer: 10 * 1024 * 1024, timeout: 60000 }, (err, stdout, stderr) => {
					if (err) {
						return reject(new Error(`Spectrum analysis failed: ${err.message}. Stderr: ${stderr}`))
					}
					try {
						const parsed = JSON.parse(stdout)
						resolve(parsed)
					} catch (jsonErr) {
						reject(new Error(`Failed to parse analyzer output: ${jsonErr.message}. Output was: ${stdout}`))
					}
				})
			})

			// Cache result
			spectrumCache.set(videoId, {
				data: result,
				timestamp: Date.now(),
			})

			return result
		} finally {
			inFlightAnalyses.delete(videoId)
		}
	})()

	inFlightAnalyses.set(videoId, analysisPromise)
	return analysisPromise
}

module.exports = {
	getSpectrumEnvelope,
}
