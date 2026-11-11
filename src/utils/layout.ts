import type { LayoutPreset, LayoutSettings, ThemeStyle } from '../types'

export const DEFAULT_LAYOUT: LayoutSettings = {
	pillScale: 1,
	pillRoundness: 0.67,
	cornerScale: 1,
	paddingScale: 1,
	tabIconSize: 22,
	showTabLabels: true,
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
	{ id: 'default', name: 'Default', settings: DEFAULT_LAYOUT },
	{
		id: 'compact',
		name: 'Compact',
		settings: { pillScale: 0.85, pillRoundness: 0.67, cornerScale: 0.8, paddingScale: 0.7, tabIconSize: 20, showTabLabels: false },
	},
	{
		id: 'spacious',
		name: 'Spacious',
		settings: { pillScale: 1.25, pillRoundness: 0.8, cornerScale: 1.2, paddingScale: 1.4, tabIconSize: 26, showTabLabels: true },
	},
	{
		id: 'sharp',
		name: 'Sharp',
		settings: { pillScale: 1, pillRoundness: 0, cornerScale: 0.4, paddingScale: 1, tabIconSize: 22, showTabLabels: true },
	},
	{
		id: 'bubble',
		name: 'Bubble',
		settings: { pillScale: 1.2, pillRoundness: 1, cornerScale: 1.8, paddingScale: 1.2, tabIconSize: 24, showTabLabels: false },
	},
]

type NumericKey = Exclude<keyof LayoutSettings, 'showTabLabels'>

const RANGES: Record<NumericKey, [number, number]> = {
	pillScale: [0.8, 1.5],
	pillRoundness: [0, 1],
	cornerScale: [0.4, 1.8],
	paddingScale: [0.6, 1.6],
	tabIconSize: [18, 30],
}

/** Coerces untrusted input (imported vibe, old storage) into a valid LayoutSettings. */
export function sanitizeLayout(input: unknown): LayoutSettings {
	const src = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>
	const out: LayoutSettings = { ...DEFAULT_LAYOUT }
	for (const key of Object.keys(RANGES) as NumericKey[]) {
		const value = src[key]
		if (typeof value === 'number' && Number.isFinite(value)) {
			const [min, max] = RANGES[key]
			out[key] = Math.min(max, Math.max(min, value))
		}
	}
	if (typeof src.showTabLabels === 'boolean') out.showTabLabels = src.showTabLabels
	return out
}

export function isDefaultLayout(layout: LayoutSettings): boolean {
	return (Object.keys(DEFAULT_LAYOUT) as (keyof LayoutSettings)[]).every((k) => layout[k] === DEFAULT_LAYOUT[k])
}

/** Returns the theme with corner radii and card padding scaled by the layout. */
export function applyLayoutToTheme(theme: ThemeStyle, layout: LayoutSettings): ThemeStyle {
	if (layout.cornerScale === 1 && layout.paddingScale === 1) return theme
	const m = theme.metrics
	return {
		...theme,
		metrics: {
			...m,
			borderRadiusLarge: Math.round(m.borderRadiusLarge * layout.cornerScale),
			borderRadiusMedium: Math.round(m.borderRadiusMedium * layout.cornerScale),
			borderRadiusSmall: Math.round(m.borderRadiusSmall * layout.cornerScale),
			cardPadding: Math.round(m.cardPadding * layout.paddingScale),
		},
	}
}

export interface PillMetrics {
	paddingHorizontal: number
	paddingVertical: number
	borderRadius: number
	fontSize: number
	iconSize: number
}

export function getPillMetrics(layout: LayoutSettings): PillMetrics {
	const s = layout.pillScale
	const radius = 4 + layout.pillRoundness * 18
	return {
		paddingHorizontal: Math.round(12 * s),
		paddingVertical: Math.round(7 * s),
		borderRadius: layout.pillRoundness >= 0.99 ? 999 : Math.round(radius * s),
		fontSize: Math.round(12 * s * 10) / 10,
		iconSize: Math.round(15 * s),
	}
}
