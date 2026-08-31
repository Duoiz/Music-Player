import type { ThemeStyle } from '../types'

import { frutigerAero } from './frutigerAero'
import { liquidGlass } from './liquidGlass'
import { neomorphism } from './neomorphism'
import { skeuomorphism } from './skeuomorphism'
import { midnightAero } from './midnightAero'
import { retroWave } from './retroWave'
import { neutralAero } from './neutralAero'

/**
 * All available themes, ordered: free first, premium last.
 */
export const allThemes: ThemeStyle[] = [
	frutigerAero,
	liquidGlass,
	neomorphism,
	skeuomorphism,
	midnightAero,
	retroWave,
	neutralAero,
]

export const freeThemes = allThemes.filter((t) => !t.isPremium)
export const premiumThemes = allThemes.filter((t) => t.isPremium)

export const DEFAULT_THEME_ID = 'frutiger-aero'

/**
 * Lookup a theme by ID. Falls back to Fruitiger Aero.
 */
export function getThemeById(id: string): ThemeStyle {
	return allThemes.find((t) => t.id === id) ?? frutigerAero
}

export {
	frutigerAero,
	liquidGlass,
	neomorphism,
	skeuomorphism,
	midnightAero,
	retroWave,
	neutralAero,
}
