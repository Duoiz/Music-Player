import type { Track } from './index'

export interface PlaylistSongMetadata {
	id: string
	tags: string[] // e.g. "chill", "workout", "study", "hype", "party", "night"
	energy: number // 1 to 10 (1 = ambient/sleep, 5 = moderate, 10 = max intensity/EDM)
	durationSec: number
	addedAt: string
	playCount: number
	lastPlayedAt?: string
	userCustomized?: boolean
}

export type PlaylistMood = 'chill' | 'workout' | 'study' | 'hype' | 'party' | 'night' | 'all'

export type EnergyCurve = 'ramp-up' | 'steady' | 'chill-down' | 'rollercoaster' | 'smart-shuffle'

export type SongPoolSource = 'all' | 'device' | 'downloads' | 'playlist'

export interface PlaylistGenerationConfig {
	mood: PlaylistMood
	energyCurve: EnergyCurve
	targetCount: number // e.g. 10, 15, 25, 40
	sourcePool: SongPoolSource
	sourcePlaylistId?: string
	minEnergy?: number
	maxEnergy?: number
}

export interface GeneratedPlaylistResult {
	name: string
	tracks: Track[]
	slotEnergies: number[] // energy values for each position
	totalDurationSec: number
	config: PlaylistGenerationConfig
}
