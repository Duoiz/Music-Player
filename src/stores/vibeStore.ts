import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SavedVibe, VibeBundle } from '../types'
import { useThemeStore } from './themeStore'
import { useLayoutStore } from './layoutStore'
import { useAutoPlaylistStore } from './autoPlaylistStore'

interface VibeStore {
	vibes: SavedVibe[]
	authorName: string
	setAuthorName: (name: string) => void
	saveVibe: (bundle: VibeBundle) => void
	deleteVibe: (id: string) => void
	applyVibe: (bundle: VibeBundle) => Promise<void>
}

export const useVibeStore = create<VibeStore>()(
	persist(
		(set) => ({
			vibes: [],
			authorName: '',

			setAuthorName: (name) => set({ authorName: name.slice(0, 40) }),

			saveVibe: (bundle) =>
				set((s) => ({
					vibes: [{ id: `vibe-${Date.now()}`, bundle }, ...s.vibes],
				})),

			deleteVibe: (id) => set((s) => ({ vibes: s.vibes.filter((v) => v.id !== id) })),

			applyVibe: async (bundle) => {
				// Re-id the theme so applying the same vibe twice never overwrites an edited copy.
				const theme = { ...bundle.theme, id: `custom-vibe-${Date.now()}` }
				await useThemeStore.getState().addCustomTheme(theme)
				useLayoutStore.getState().replaceLayout(bundle.layout)
				useAutoPlaylistStore.getState().setDefaultConfig(bundle.playlist ?? null)
			},
		}),
		{
			name: 'vibe-storage',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
)
