import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { inferHeuristicMetadata } from '../utils/playlistGenerator'
import type { Track, PlaylistSongMetadata, GeneratedPlaylistResult, PlaylistGenerationConfig } from '../types'

interface AutoPlaylistStore {
	songMetadata: Record<string, PlaylistSongMetadata>
	lastGenerated: GeneratedPlaylistResult | null
	defaultConfig: PlaylistGenerationConfig | null

	getOrInitMetadata: (track: Track) => PlaylistSongMetadata
	updateSongMetadata: (id: string, updates: Partial<PlaylistSongMetadata>) => void
	recordPlay: (id: string) => void
	batchEnsureMetadata: (tracks: Track[]) => void
	setLastGenerated: (result: GeneratedPlaylistResult | null) => void
	setDefaultConfig: (config: PlaylistGenerationConfig | null) => void
}

export const useAutoPlaylistStore = create<AutoPlaylistStore>()(
	persist(
		(set, get) => ({
			songMetadata: {},
			lastGenerated: null,
			defaultConfig: null,

			getOrInitMetadata: (track: Track) => {
				const current = get().songMetadata[track.id]
				if (current) return current

				const initial = inferHeuristicMetadata(track)
				set((state) => ({
					songMetadata: {
						...state.songMetadata,
						[track.id]: initial,
					},
				}))
				return initial
			},

			updateSongMetadata: (id: string, updates: Partial<PlaylistSongMetadata>) => {
				set((state) => {
					const existing = state.songMetadata[id] || {
						id,
						tags: [],
						energy: 5,
						durationSec: 180,
						addedAt: new Date().toISOString(),
						playCount: 0,
					}

					return {
						songMetadata: {
							...state.songMetadata,
							[id]: {
								...existing,
								...updates,
								userCustomized: true,
							},
						},
					}
				})
			},

			recordPlay: (id: string) => {
				if (!id) return
				set((state) => {
					const existing = state.songMetadata[id] || {
						id,
						tags: ['chill'],
						energy: 5,
						durationSec: 180,
						addedAt: new Date().toISOString(),
						playCount: 0,
					}

					return {
						songMetadata: {
							...state.songMetadata,
							[id]: {
								...existing,
								playCount: (existing.playCount || 0) + 1,
								lastPlayedAt: new Date().toISOString(),
							},
						},
					}
				})
			},

			batchEnsureMetadata: (tracks: Track[]) => {
				if (!tracks || tracks.length === 0) return
				const metadata = { ...get().songMetadata }
				let modified = false

				for (const track of tracks) {
					if (!metadata[track.id]) {
						metadata[track.id] = inferHeuristicMetadata(track)
						modified = true
					}
				}

				if (modified) {
					set({ songMetadata: metadata })
				}
			},

			setLastGenerated: (result) => set({ lastGenerated: result }),
			setDefaultConfig: (config) => set({ defaultConfig: config }),
		}),
		{
			name: 'auto-playlist-storage',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
)
