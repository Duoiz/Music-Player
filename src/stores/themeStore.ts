import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ThemeStyle } from '../types'
import { allThemes, getThemeById, DEFAULT_THEME_ID } from '../themes'

const CUSTOM_THEMES_STORAGE_KEY = '@music_player_custom_themes_v1'

interface ThemeStore {
	// State
	activeThemeId: string
	isPremiumUser: boolean
	unlockedPremiumThemes: string[]
	customThemes: ThemeStyle[]

	// Computed
	getActiveTheme: () => ThemeStyle
	getAllThemes: () => ThemeStyle[]
	isThemeUnlocked: (themeId: string) => boolean

	// Actions
	setTheme: (themeId: string) => void
	unlockPremium: () => void
	unlockTheme: (themeId: string) => void
	loadCustomThemes: () => Promise<void>
	addCustomTheme: (theme: ThemeStyle) => Promise<void>
	updateCustomTheme: (theme: ThemeStyle) => Promise<void>
	deleteCustomTheme: (themeId: string) => Promise<void>
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
	activeThemeId: DEFAULT_THEME_ID,
	isPremiumUser: false,
	unlockedPremiumThemes: [],
	customThemes: [],

	getActiveTheme: () => {
		const activeId = get().activeThemeId
		const custom = get().customThemes.find((t) => t.id === activeId)
		if (custom) return custom
		return getThemeById(activeId)
	},

	getAllThemes: () => {
		return [...allThemes, ...get().customThemes]
	},

	isThemeUnlocked: (themeId: string) => {
		const isCustom = get().customThemes.some((t) => t.id === themeId)
		if (isCustom) return true // User-created skins are always unlocked
		const theme = getThemeById(themeId)
		if (!theme.isPremium) return true // Free themes are always unlocked
		if (get().isPremiumUser) return true // Premium users have all themes
		return get().unlockedPremiumThemes.includes(themeId)
	},

	setTheme: (themeId: string) => {
		const canUse = get().isThemeUnlocked(themeId)
		if (canUse) {
			set({ activeThemeId: themeId })
		}
	},

	unlockPremium: () => {
		set({ isPremiumUser: true })
	},

	unlockTheme: (themeId: string) => {
		const current = get().unlockedPremiumThemes
		if (!current.includes(themeId)) {
			set({ unlockedPremiumThemes: [...current, themeId] })
		}
	},

	loadCustomThemes: async () => {
		try {
			const saved = await AsyncStorage.getItem(CUSTOM_THEMES_STORAGE_KEY)
			if (saved) {
				const parsed = JSON.parse(saved) as ThemeStyle[]
				if (Array.isArray(parsed)) {
					set({ customThemes: parsed })
				}
			}
		} catch (err) {
			console.error('[THEME_STORE] Error loading custom themes:', err)
		}
	},

	addCustomTheme: async (theme: ThemeStyle) => {
		try {
			const updated = [...get().customThemes.filter((t) => t.id !== theme.id), theme]
			set({ customThemes: updated, activeThemeId: theme.id })
			await AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(updated))
		} catch (err) {
			console.error('[THEME_STORE] Error saving custom theme:', err)
		}
	},

	updateCustomTheme: async (theme: ThemeStyle) => {
		try {
			const updated = get().customThemes.map((t) => (t.id === theme.id ? theme : t))
			set({ customThemes: updated })
			await AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(updated))
		} catch (err) {
			console.error('[THEME_STORE] Error updating custom theme:', err)
		}
	},

	deleteCustomTheme: async (themeId: string) => {
		try {
			const updated = get().customThemes.filter((t) => t.id !== themeId)
			const nextActive = get().activeThemeId === themeId ? DEFAULT_THEME_ID : get().activeThemeId
			set({ customThemes: updated, activeThemeId: nextActive })
			await AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(updated))
		} catch (err) {
			console.error('[THEME_STORE] Error deleting custom theme:', err)
		}
	},
}))

