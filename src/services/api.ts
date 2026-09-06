import type { Song, StreamInfo, SpectrumEnvelope } from '../types'

/**
 * Backend API base URL.
 * Automatically uses EXPO_PUBLIC_API_URL (e.g. from .env or Modal deployment).
 * Falls back to local development IP.
 */
export const API_BASE_URL =
	process.env.EXPO_PUBLIC_API_URL || 'https://duoiz--music-player-backend-web.modal.run'

const TIMEOUT = 25000

// ============================================================
// Efficiency Caching & In-Flight Request Deduplication
// ============================================================

interface CacheEntry<T> {
	data: T
	timestamp: number
}

const SEARCH_CACHE_TTL = 1000 * 60 * 5 // 5 minutes
const STREAM_CACHE_TTL = 1000 * 60 * 60 // 1 hour
const MAX_CACHE_ENTRIES = 60

const searchCache = new Map<string, CacheEntry<Song[]>>()
const streamCache = new Map<string, CacheEntry<StreamInfo>>()

const inFlightSearches = new Map<string, Promise<Song[]>>()
const inFlightStreams = new Map<string, Promise<StreamInfo>>()

function setWithEviction<K, V>(map: Map<K, V>, key: K, value: V, maxLimit: number) {
	if (map.size >= maxLimit) {
		const oldestKey = map.keys().next().value
		if (oldestKey !== undefined) {
			map.delete(oldestKey)
		}
	}
	map.set(key, value)
}

/**
 * Ensures audio stream URLs use HTTPS when targeting remote hosts
 * to prevent Android 9+ Cleartext HTTP blocks.
 */
function sanitizeStreamUrl(url: string): string {
	if (!url) return url
	if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
		return url.replace(/^http:\/\//i, 'https://')
	}
	return url
}

/**
 * Fetch wrapper with timeout, signal, and error handling.
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			signal: controller.signal,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers,
			},
		})

		if (!response.ok) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`)
		}

		return await response.json()
	} catch (error: unknown) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error('Request timed out. Please check connection.')
		}
		throw error
	} finally {
		clearTimeout(timeoutId)
	}
}

// ============================================================
// Search
// ============================================================

/**
 * Search for songs via the backend (YouTube Music search).
 * Includes 5-minute memory cache and in-flight deduplication.
 */
export async function searchSongs(query: string): Promise<Song[]> {
	const trimmed = query.trim().toLowerCase()
	if (!trimmed) return []

	// 1. Check in-memory cache
	const cached = searchCache.get(trimmed)
	if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
		return cached.data
	}

	// 2. Check if a request for this identical query is already in-flight
	const inFlight = inFlightSearches.get(trimmed)
	if (inFlight) {
		return inFlight
	}

	// 3. Initiate request with deduplication wrapper
	const searchPromise = (async () => {
		try {
			const data = await apiFetch<{ results: Song[] }>(
				`/api/search?q=${encodeURIComponent(trimmed)}`
			)
			const results = data.results || []
			setWithEviction(searchCache, trimmed, { data: results, timestamp: Date.now() }, MAX_CACHE_ENTRIES)
			return results
		} finally {
			inFlightSearches.delete(trimmed)
		}
	})()

	inFlightSearches.set(trimmed, searchPromise)
	return searchPromise
}

// ============================================================
// Streaming
// ============================================================

/**
 * Get the direct audio stream URL for a video ID.
 * The backend runs yt-dlp to extract this.
 * Cached for 1 hour with in-flight deduplication and HTTPS enforcement.
 */
export async function getStreamUrl(videoId: string): Promise<StreamInfo> {
	if (!videoId) {
		throw new Error('Missing videoId')
	}

	// 1. Check in-memory cache
	const cached = streamCache.get(videoId)
	if (cached && Date.now() - cached.timestamp < STREAM_CACHE_TTL) {
		return cached.data
	}

	// 2. Check in-flight
	const inFlight = inFlightStreams.get(videoId)
	if (inFlight) {
		return inFlight
	}

	// 3. Fetch from backend
	const streamPromise = (async () => {
		try {
			const data = await apiFetch<StreamInfo>(`/api/stream/${videoId}`)
			const sanitizedData: StreamInfo = {
				...data,
				streamUrl: sanitizeStreamUrl(data.streamUrl),
			}
			setWithEviction(streamCache, videoId, { data: sanitizedData, timestamp: Date.now() }, MAX_CACHE_ENTRIES)
			return sanitizedData
		} finally {
			inFlightStreams.delete(videoId)
		}
	})()

	inFlightStreams.set(videoId, streamPromise)
	return streamPromise
}

// ============================================================
// Real-time Audio Spectrum Envelope
// ============================================================

const spectrumCache = new Map<string, CacheEntry<SpectrumEnvelope>>()
const inFlightSpectrum = new Map<string, Promise<SpectrumEnvelope>>()

/**
 * Fetch pre-computed 16-band audio spectrum envelope for a song.
 * Cached in memory and deduplicated during flight.
 */
export async function getSpectrumData(videoId: string): Promise<SpectrumEnvelope> {
	if (!videoId) {
		throw new Error('Missing videoId')
	}

	const cached = spectrumCache.get(videoId)
	if (cached && Date.now() - cached.timestamp < STREAM_CACHE_TTL) {
		return cached.data
	}

	const inFlight = inFlightSpectrum.get(videoId)
	if (inFlight) {
		return inFlight
	}

	const spectrumPromise = (async () => {
		try {
			const data = await apiFetch<SpectrumEnvelope>(`/api/spectrum/${videoId}`)
			setWithEviction(spectrumCache, videoId, { data, timestamp: Date.now() }, MAX_CACHE_ENTRIES)
			return data
		} finally {
			inFlightSpectrum.delete(videoId)
		}
	})()

	inFlightSpectrum.set(videoId, spectrumPromise)
	return spectrumPromise
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
 * Fetch community themes from the backend.
 */
export async function fetchCommunityThemes(): Promise<ThemeAPIResponse> {
	const data = await apiFetch<ThemeAPIResponse>('/api/themes')
	return data
}

/**
 * Utility to manually clear API caches if needed.
 */
export function clearApiCache() {
	searchCache.clear()
	streamCache.clear()
	inFlightSearches.clear()
	inFlightStreams.clear()
}
