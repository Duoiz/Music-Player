import React, { createContext, useContext, useMemo } from 'react'
import type { ThemeStyle } from '../types'
import { useThemeStore } from '../stores/themeStore'
import { useLayoutStore } from '../stores/layoutStore'
import { applyLayoutToTheme } from '../utils/layout'

const ThemeContext = createContext<ThemeStyle | null>(null)

/**
 * Theme provider that wraps the app and provides the active theme
 * to all child components via useTheme().
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const getActiveTheme = useThemeStore((s) => s.getActiveTheme)
	const activeThemeId = useThemeStore((s) => s.activeThemeId)

	const layout = useLayoutStore((s) => s.layout)
	const customThemes = useThemeStore((s) => s.customThemes)

	const theme = useMemo(
		() => applyLayoutToTheme(getActiveTheme(), layout),
		[activeThemeId, customThemes, getActiveTheme, layout]
	)

	return (
		<ThemeContext.Provider value={theme}>
			{children}
		</ThemeContext.Provider>
	)
}

/**
 * Hook to access the current theme from any component.
 */
export function useTheme(): ThemeStyle {
	const theme = useContext(ThemeContext)
	if (!theme) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return theme
}
