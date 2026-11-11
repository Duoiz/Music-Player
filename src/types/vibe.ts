import type { LayoutSettings } from './layout'
import type { PlaylistGenerationConfig } from './playlistGenerator'
import type { ThemeStyle } from './index'

export interface VibeBundle {
	format: 'music-player-vibe'
	version: 1
	name: string
	author: string
	description?: string
	createdAt: number
	theme: ThemeStyle
	layout: LayoutSettings
	playlist?: PlaylistGenerationConfig
}

export interface SavedVibe {
	id: string
	bundle: VibeBundle
}
