import { create } from 'zustand'
import type { ThemeStyle } from '../types'
import { allThemes, getThemeById, DEFAULT_THEME_ID } from '../themes'

interface ThemeStore {
	// State
	activeThemeId: string
	isPremiumUser: boolean
	unlockedPremiumThemes: string[]

	// Computed
	getActiveTheme: () => ThemeStyle
	getAllThemes: () => ThemeStyle[]
	isThemeUnlocked: (themeId: string) => boolean

	// Actions
	setTheme: (themeId: string) => void
	unlockPremium: () => void
	unlockTheme: (themeId: string) => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
	activeThemeId: DEFAULT_THEME_ID,
	isPremiumUser: false,
	unlockedPremiumThemes: [],

	getActiveTheme: () => {
		return getThemeById(get().activeThemeId)
	},

	getAllThemes: () => allThemes,

	isThemeUnlocked: (themeId: string) => {
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
}))
