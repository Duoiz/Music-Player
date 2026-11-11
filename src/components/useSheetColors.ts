import { useMemo } from 'react'
import { useTheme } from './ThemeProvider'
import { contrastRatio, ensureContrast, luminance, readableOn } from '../utils/color'

export interface SheetColors {
	surface: string
	surfaceAlt: string
	border: string
	text: string
	textSecondary: string
	textMuted: string
	accent: string
	onAccent: string
}

const LIGHT: Omit<SheetColors, 'accent' | 'onAccent'> = {
	surface: '#F6F7FB',
	surfaceAlt: '#E6E9F2',
	border: '#B8BFCF',
	text: '#14161C',
	textSecondary: '#454C5C',
	textMuted: '#586070',
}

const DARK: Omit<SheetColors, 'accent' | 'onAccent'> = {
	surface: '#16161D',
	surfaceAlt: '#262833',
	border: '#4A4D5E',
	text: '#F2F3F8',
	textSecondary: '#BDC2D0',
	textMuted: '#9AA1B3',
}

/**
 * Fixed, high-contrast palette for sheets and modals. Theme text colors are tuned for each
 * theme's own gradient, so they can't be reused on a flat surface. Only the accent hue is borrowed.
 */
export function useSheetColors(): SheetColors {
	const theme = useTheme()
	const accentPrimary = theme.colors.accentPrimary
	const textPrimary = theme.colors.textPrimary

	return useMemo(() => {
		// Dark theme text means the theme is light, so use the light surface.
		const base = luminance(textPrimary) < 0.4 ? LIGHT : DARK
		const accent = ensureContrast(accentPrimary, base.surface, 3, base.text)
		// Guard against an accent that is nearly the surface color (filled buttons would vanish).
		const visibleAccent = contrastRatio(accent, base.surface) >= 1.5 ? accent : base.text
		return { ...base, accent: visibleAccent, onAccent: readableOn(visibleAccent) }
	}, [accentPrimary, textPrimary])
}
