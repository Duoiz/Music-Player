import type { Song, StreamInfo } from '../types'

/**
 * Public Piped instances. 
 * Since public instances can be unreliable, we include several backups.
 */
const PIPED_SERVERS = [
	'https://pipedapi.kavin.rocks',
	'https://pipedapi.leptons.xyz',
	'https://pipedapi.nosebs.ru',
	'https://piped-api.privacy.com.de',
	'https://api.piped.yt',
	'https://pipedapi.owo.si',
	'https://pipedapi.drgns.space'
]

const TIMEOUT = 8000 // 8 seconds per server attempt

/**
 * Fetch wrapper that tries each Piped server sequentially until one succeeds.
 */
async function pipedFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
	let lastError: Error | unknown = null

	for (const server of PIPED_SERVERS) {
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

		try {
			const response = await fetch(`${server}${endpoint}`, {
				...options,
				signal: controller.signal,
				headers: {
					'Content-Type': 'application/json',
					...options?.headers,
				},
			})

			if (!response.ok) {
				throw new Error(`API Error: ${response.status} from ${server}`)
			}

			const data = await response.json()
			return data
		} catch (error: unknown) {
			console.warn(`[Piped] Failed to fetch from ${server}:`, error instanceof Error ? error.message : error)
			lastError = error
		} finally {
			clearTimeout(timeoutId)
		}
	}

	throw new Error(`All Piped servers failed. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown'}`)
}

// ============================================================
// Search
// ============================================================

/**
 * Search for songs via Piped (YouTube Music search).
 */
export async function searchSongs(query: string): Promise<Song[]> {
	if (!query.trim()) return []

	// Piped /search API for music
	const data = await pipedFetch<any>(
		`/search?q=${encodeURIComponent(query)}&filter=music_songs`
	)
	
	if (!data.items || !Array.isArray(data.items)) {
		return []
	}

	// Map Piped's response format to our Song interface
	return data.items.map((item: any) => {
		const videoId = item.url.replace('/watch?v=', '')
		return {
			id: videoId,
			title: item.title || 'Unknown Title',
			artist: item.uploaderName || 'Unknown Artist',
			thumbnail: item.thumbnail || '',
			duration: item.duration || 0,
			videoId: videoId
		}
	})
}

// ============================================================
// Streaming
// ============================================================

/**
 * Get the direct audio stream URL for a video ID from Piped.
 */
export async function getStreamUrl(videoId: string): Promise<StreamInfo> {
	const data = await pipedFetch<any>(`/streams/${videoId}`)
	
	if (!data.audioStreams || !Array.isArray(data.audioStreams) || data.audioStreams.length === 0) {
		throw new Error('No audio streams found for this video.')
	}

	// Find the best audio stream. Piped usually returns m4a or webm. 
	// We prefer m4a (audio/mp4) for best native compatibility on iOS/Android.
	let bestStream = data.audioStreams.find((s: any) => s.mimeType === 'audio/mp4' || s.format === 'm4a')
	
	// Fallback to highest bitrate if no m4a
	if (!bestStream) {
		bestStream = data.audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0]
	}

	if (!bestStream || !bestStream.url) {
		throw new Error('Could not extract a valid stream URL.')
	}

	return {
		streamUrl: bestStream.url,
		format: bestStream.mimeType || 'audio/mp4'
	}
}

// ============================================================
// Themes (UGC)
// ============================================================

interface ThemeAPIResponse {
	themes: Array<{
		id: string
		name: string
		author: string
		preview: string
		isPremium: boolean
		style: Record<string, unknown>
	}>
}

/**
 * Fetch community themes.
 * Since we are on Piped, this returns empty for now.
 */
export async function fetchCommunityThemes(): Promise<ThemeAPIResponse> {
	return { themes: [] }
}
