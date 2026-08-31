import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Track } from '../types'

export interface Playlist {
	id: string
	name: string
	tracks: Track[]
}

interface PlaylistStore {
	playlists: Playlist[]
	createPlaylist: (name: string) => void
	deletePlaylist: (id: string) => void
	renamePlaylist: (id: string, name: string) => void
	addTrackToPlaylist: (playlistId: string, track: Track) => void
	removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
}

export const usePlaylistStore = create<PlaylistStore>()(
	persist(
		(set) => ({
			playlists: [],
			createPlaylist: (name) =>
				set((state) => ({
					playlists: [
						...state.playlists,
						{ id: Date.now().toString(), name, tracks: [] },
					],
				})),
			deletePlaylist: (id) =>
				set((state) => ({
					playlists: state.playlists.filter((p) => p.id !== id),
				})),
			renamePlaylist: (id, name) =>
				set((state) => ({
					playlists: state.playlists.map((p) =>
						p.id === id ? { ...p, name } : p
					),
				})),
			addTrackToPlaylist: (playlistId, track) =>
				set((state) => ({
					playlists: state.playlists.map((p) => {
						if (p.id === playlistId) {
							// Avoid duplicates
							if (!p.tracks.some((t) => t.id === track.id)) {
								return { ...p, tracks: [...p.tracks, track] }
							}
						}
						return p
					}),
				})),
			removeTrackFromPlaylist: (playlistId, trackId) =>
				set((state) => ({
					playlists: state.playlists.map((p) => {
						if (p.id === playlistId) {
							return {
								...p,
								tracks: p.tracks.filter((t) => t.id !== trackId),
							}
						}
						return p
					}),
				})),
		}),
		{
			name: 'playlist-storage',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
)
