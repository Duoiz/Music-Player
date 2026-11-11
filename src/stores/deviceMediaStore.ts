import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { scanDeviceAudio } from '../services/mediaScannerService'
import { useAutoPlaylistStore } from './autoPlaylistStore'
import type { Track } from '../types'

interface DeviceMediaStore {
	deviceTracks: Track[]
	isScanning: boolean
	lastScannedAt: number | null
	searchQuery: string

	scanTracks: () => Promise<Track[]>
	setSearchQuery: (query: string) => void
	clearTracks: () => void
}

export const useDeviceMediaStore = create<DeviceMediaStore>()(
	persist(
		(set, get) => ({
			deviceTracks: [],
			isScanning: false,
			lastScannedAt: null,
			searchQuery: '',

			scanTracks: async () => {
				set({ isScanning: true })
				try {
					const tracks = await scanDeviceAudio()
					useAutoPlaylistStore.getState().batchEnsureMetadata(tracks)
					set({
						deviceTracks: tracks,
						lastScannedAt: Date.now(),
						isScanning: false,
					})
					return tracks
				} catch (error) {
					console.error('[DeviceMediaStore] scanTracks error:', error)
					set({ isScanning: false })
					return get().deviceTracks
				}
			},

			setSearchQuery: (query: string) => set({ searchQuery: query }),

			clearTracks: () => set({ deviceTracks: [], lastScannedAt: null }),
		}),
		{
			name: 'device-media-storage',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
)
