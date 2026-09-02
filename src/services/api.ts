import type { Song, StreamInfo } from '../types'

/**
 * Backend API base URL.
 * In development, point to your local server.
 * In production, replace with your deployed server URL.
 */
const API_BASE_URL = 'http://192.168.31.139:3001'

// For iOS simulator, use 'http://localhost:3001' instead
// For physical device on same network, use your machine's local IP

const TIMEOUT = 30000

/**
 * Fetch wrapper with timeout and error handling.
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
			throw new Error('Request timed out')
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
 */
export async function searchSongs(query: string): Promise<Song[]> {
	if (!query.trim()) return []

	const data = await apiFetch<{ results: Song[] }>(
		`/api/search?q=${encodeURIComponent(query)}`
	)
	return data.results
}

// ============================================================
// Streaming
// ============================================================

/**
 * Get the direct audio stream URL for a video ID.
 * The backend runs yt-dlp to extract this.
 */
export async function getStreamUrl(videoId: string): Promise<StreamInfo> {
	const data = await apiFetch<StreamInfo>(`/api/stream/${videoId}`)
	return data
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
 * For MVP, this returns hardcoded themes; later connect to a real UGC backend.
 */
export async function fetchCommunityThemes(): Promise<ThemeAPIResponse> {
	const data = await apiFetch<ThemeAPIResponse>('/api/themes')
	return data
}
