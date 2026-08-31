import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Track } from '../types'

export interface DownloadedTrack extends Track {
	localFileUri: string
	downloadedAt: number
}

interface DownloadStore {
	downloadedTracks: DownloadedTrack[]
	addDownloadedTrack: (track: DownloadedTrack) => void
	removeDownloadedTrack: (id: string) => void
	isDownloaded: (id: string) => boolean
	getLocalUri: (id: string) => string | undefined
	activeDownloads: Record<string, number>
	setDownloadProgress: (id: string, progress: number) => void
	removeActiveDownload: (id: string) => void
}

export const useDownloadStore = create<DownloadStore>()(
	persist(
		(set, get) => ({
			downloadedTracks: [],
			activeDownloads: {},
			setDownloadProgress: (id, progress) =>
				set((state) => ({
					activeDownloads: { ...state.activeDownloads, [id]: progress },
				})),
			removeActiveDownload: (id) =>
				set((state) => {
					const newActive = { ...state.activeDownloads }
					delete newActive[id]
					return { activeDownloads: newActive }
				}),
			addDownloadedTrack: (track) =>
				set((state) => {
					// Replace if it already exists, otherwise add
					const exists = state.downloadedTracks.some((t) => t.id === track.id)
					if (exists) {
						return {
							downloadedTracks: state.downloadedTracks.map((t) =>
								t.id === track.id ? track : t
							),
						}
					}
					return {
						downloadedTracks: [...state.downloadedTracks, track],
					}
				}),
			removeDownloadedTrack: (id) =>
				set((state) => ({
					downloadedTracks: state.downloadedTracks.filter((t) => t.id !== id),
				})),
			isDownloaded: (id) => get().downloadedTracks.some((t) => t.id === id),
			getLocalUri: (id) => get().downloadedTracks.find((t) => t.id === id)?.localFileUri,
		}),
		{
			name: 'download-storage',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
)
