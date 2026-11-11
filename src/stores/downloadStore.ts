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

// O(1) "is this id downloaded?" lookup. The Set is rebuilt only when the
// downloadedTracks array reference changes, so hundreds of list rows can each
// subscribe without every row scanning the array on every store update.
const downloadedIdCache = new WeakMap<DownloadedTrack[], Set<string>>()

export function selectIsDownloaded(
	state: { downloadedTracks: DownloadedTrack[] },
	id: string
): boolean {
	let ids = downloadedIdCache.get(state.downloadedTracks)
	if (!ids) {
		ids = new Set(state.downloadedTracks.map((t) => t.id))
		downloadedIdCache.set(state.downloadedTracks, ids)
	}
	return ids.has(id)
}
