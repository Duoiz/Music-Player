import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface ArtistMix {
	id: string
	name: string
	artists: string[]
	createdAt: number
}

interface ArtistMixStore {
	mixes: ArtistMix[]
	createMix: (name: string, artists: string[]) => void
	deleteMix: (id: string) => void
	updateMix: (id: string, name: string, artists: string[]) => void
}

export const useArtistMixStore = create<ArtistMixStore>()(
	persist(
		(set) => ({
			mixes: [],
			createMix: (name, artists) =>
				set((state) => ({
					mixes: [
						...state.mixes,
						{
							id: Date.now().toString(),
							name,
							artists,
							createdAt: Date.now(),
						},
					],
				})),
			deleteMix: (id) =>
				set((state) => ({
					mixes: state.mixes.filter((m) => m.id !== id),
				})),
			updateMix: (id, name, artists) =>
				set((state) => ({
					mixes: state.mixes.map((m) =>
						m.id === id ? { ...m, name, artists } : m
					),
				})),
		}),
		{
			name: 'artist-mix-storage',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
)
