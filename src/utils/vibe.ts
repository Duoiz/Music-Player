import type {
	EnergyCurve,
	LayoutSettings,
	PlaylistGenerationConfig,
	PlaylistMood,
	SongPoolSource,
	ThemeStyle,
	VibeBundle,
} from '../types'
import { sanitizeLayout } from './layout'

const MAX_VIBE_CHARS = 300_000
const MOODS: PlaylistMood[] = ['chill', 'workout', 'study', 'hype', 'party', 'night', 'all']
const CURVES: EnergyCurve[] = ['ramp-up', 'steady', 'chill-down', 'rollercoaster', 'smart-shuffle']
const POOLS: SongPoolSource[] = ['all', 'device', 'downloads', 'playlist']

export function createVibe(input: {
	name: string
	author: string
	description?: string
	theme: ThemeStyle
	layout: LayoutSettings
	playlist?: PlaylistGenerationConfig
}): VibeBundle {
	return {
		format: 'music-player-vibe',
		version: 1,
		name: input.name.trim() || 'Untitled vibe',
		author: input.author.trim() || 'Anonymous',
		description: input.description?.trim() || undefined,
		createdAt: Date.now(),
		theme: input.theme,
		layout: input.layout,
		playlist: input.playlist,
	}
}

export function exportVibe(vibe: VibeBundle): string {
	return JSON.stringify(vibe)
}

function sanitizePlaylist(input: unknown): PlaylistGenerationConfig | undefined {
	if (typeof input !== 'object' || input === null) return undefined
	const p = input as Record<string, unknown>
	if (!MOODS.includes(p.mood as PlaylistMood) || !CURVES.includes(p.energyCurve as EnergyCurve)) return undefined
	const count = typeof p.targetCount === 'number' && Number.isFinite(p.targetCount) ? p.targetCount : 15
	return {
		mood: p.mood as PlaylistMood,
		energyCurve: p.energyCurve as EnergyCurve,
		targetCount: Math.min(100, Math.max(5, Math.round(count))),
		sourcePool: POOLS.includes(p.sourcePool as SongPoolSource) ? (p.sourcePool as SongPoolSource) : 'all',
	}
}

/**
 * Parses and validates a shared vibe. Imported themes get a fresh id, are never premium,
 * and keep attribution to the original creator via forkedFrom.
 */
export function parseVibe(json: string): VibeBundle | null {
	if (typeof json !== 'string' || json.length > MAX_VIBE_CHARS) return null
	try {
		const raw = JSON.parse(json)
		if (typeof raw !== 'object' || raw === null || raw.format !== 'music-player-vibe') return null
		const t = raw.theme
		if (
			typeof t !== 'object' ||
			t === null ||
			typeof t.name !== 'string' ||
			typeof t.colors !== 'object' ||
			t.colors === null ||
			!Array.isArray(t.colors.backgroundGradient) ||
			typeof t.metrics !== 'object' ||
			t.metrics === null ||
			typeof t.typography !== 'object' ||
			t.typography === null
		) {
			return null
		}
		const author = typeof raw.author === 'string' ? raw.author.slice(0, 40) : 'Anonymous'
		const theme: ThemeStyle = {
			...t,
			id: `custom-vibe-${Date.now()}`,
			isCustom: true,
			isPremium: false,
			createdAt: Date.now(),
			forkedFrom: t.forkedFrom ?? { id: String(t.id ?? ''), name: t.name, author: t.author ?? author },
		}
		return {
			format: 'music-player-vibe',
			version: 1,
			name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.slice(0, 60) : 'Imported vibe',
			author,
			description: typeof raw.description === 'string' ? raw.description.slice(0, 200) : undefined,
			createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
			theme,
			layout: sanitizeLayout(raw.layout),
			playlist: sanitizePlaylist(raw.playlist),
		}
	} catch {
		return null
	}
}
