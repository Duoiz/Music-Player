import type { ThemeStyle, ThemeColors, ThemeMetrics, ThemeTypography } from '../types'

export interface GradientPreset {
	id: string
	name: string
	colors: string[]
	start: { x: number; y: number }
	end: { x: number; y: number }
}

export interface AccentPreset {
	id: string
	name: string
	primary: string
	secondary: string
	gradient: string[]
}

export interface GlassTintPreset {
	id: string
	name: string
	cardGradient: string[]
	cardBorderColor: string
	isDark: boolean
}

// ============================================================
// Curated Aesthetic Presets
// ============================================================

export const BACKGROUND_PRESETS: GradientPreset[] = [
	{
		id: 'frutiger-aqua',
		name: 'Frutiger Aqua',
		colors: ['#6bc5e8', '#40a9d4', '#1f85b3', '#11658f'],
		start: { x: 0.3, y: 0.2 },
		end: { x: 1, y: 1 },
	},
	{
		id: 'vapor-sunset',
		name: 'Vapor Sunset',
		colors: ['#ff7eb3', '#ff758c', '#795290', '#251b35'],
		start: { x: 0, y: 0 },
		end: { x: 1, y: 1 },
	},
	{
		id: 'cyber-matrix',
		name: 'Cyber Matrix',
		colors: ['#021008', '#072518', '#00ff88', '#03150d'],
		start: { x: 0, y: 0 },
		end: { x: 1, y: 1 },
	},
	{
		id: 'deep-space',
		name: 'Deep Cosmos',
		colors: ['#090514', '#1e1035', '#4c1d95', '#0f051d'],
		start: { x: 0.5, y: 0 },
		end: { x: 0.5, y: 1 },
	},
	{
		id: 'liquid-metal',
		name: 'Liquid Steel',
		colors: ['#2e3440', '#3b4252', '#4c566a', '#1e222a'],
		start: { x: 0.2, y: 0 },
		end: { x: 0.8, y: 1 },
	},
	{
		id: 'solar-gold',
		name: 'Obsidian Gold',
		colors: ['#1c1917', '#292524', '#78350f', '#0c0a09'],
		start: { x: 0, y: 0 },
		end: { x: 1, y: 1 },
	},
	{
		id: 'pure-frost',
		name: 'Alpine Frost',
		colors: ['#f0fdf4', '#e0f2fe', '#bae6fd', '#7dd3fc'],
		start: { x: 0, y: 0 },
		end: { x: 1, y: 1 },
	},
	{
		id: 'neon-tokyo',
		name: 'Neon Tokyo',
		colors: ['#0f0c29', '#302b63', '#24243e', '#110726'],
		start: { x: 0, y: 0 },
		end: { x: 1, y: 1 },
	},
]

export const ACCENT_PRESETS: AccentPreset[] = [
	{
		id: 'electric-cyan',
		name: 'Electric Cyan',
		primary: '#00e5ff',
		secondary: '#38bdf8',
		gradient: ['#00e5ff', '#38bdf8'],
	},
	{
		id: 'toxic-emerald',
		name: 'Toxic Emerald',
		primary: '#00ff88',
		secondary: '#10b981',
		gradient: ['#00ff88', '#10b981'],
	},
	{
		id: 'hot-magenta',
		name: 'Hot Magenta',
		primary: '#ff007f',
		secondary: '#ec4899',
		gradient: ['#ff007f', '#f43f5e'],
	},
	{
		id: 'amber-flame',
		name: 'Amber Flame',
		primary: '#ff9100',
		secondary: '#f59e0b',
		gradient: ['#ff9100', '#f59e0b'],
	},
	{
		id: 'plasma-violet',
		name: 'Plasma Violet',
		primary: '#c084fc',
		secondary: '#a855f7',
		gradient: ['#c084fc', '#9333ea'],
	},
	{
		id: 'gold-crown',
		name: 'Imperial Gold',
		primary: '#fbbf24',
		secondary: '#f59e0b',
		gradient: ['#fde047', '#f59e0b'],
	},
	{
		id: 'frost-white',
		name: 'Polar White',
		primary: '#ffffff',
		secondary: '#e2e8f0',
		gradient: ['#ffffff', '#cbd5e1'],
	},
]

export const GLASS_TINT_PRESETS: GlassTintPreset[] = [
	{
		id: 'frosted-aqua',
		name: 'Aqua Glass',
		cardGradient: ['rgba(210, 245, 255, 0.55)', 'rgba(90, 180, 230, 0.45)'],
		cardBorderColor: 'rgba(255, 255, 255, 0.75)',
		isDark: false,
	},
	{
		id: 'smoked-dark',
		name: 'Smoked Obsidian',
		cardGradient: ['rgba(24, 24, 32, 0.70)', 'rgba(12, 12, 18, 0.85)'],
		cardBorderColor: 'rgba(255, 255, 255, 0.15)',
		isDark: true,
	},
	{
		id: 'crystal-white',
		name: 'Crystal Glass',
		cardGradient: ['rgba(255, 255, 255, 0.75)', 'rgba(240, 248, 255, 0.50)'],
		cardBorderColor: 'rgba(255, 255, 255, 0.90)',
		isDark: false,
	},
	{
		id: 'neon-tint',
		name: 'Cyber Glass',
		cardGradient: ['rgba(18, 10, 36, 0.75)', 'rgba(8, 4, 18, 0.85)'],
		cardBorderColor: 'rgba(200, 120, 255, 0.40)',
		isDark: true,
	},
]

export interface CustomThemeDraft {
	name: string
	author: string
	description?: string
	backgroundPresetId: string
	accentPresetId: string
	glassTintId: string
	blurIntensity: number // 10, 25, 45, 75
	cornerRadius: 'sharp' | 'balanced' | 'pill'
	fontChoice: 'rajdhani' | 'orbitron' | 'system'
	glowIntensity: 'subtle' | 'vivid' | 'neon'
	// Componentized Hardware Widgets
	volumeWidget: 'slider' | 'rotary-knob' | 'steampunk-cog' | 'minimal-pill'
	artworkWidget: 'glass-cylinder' | 'vinyl' | 'floating-card'
	buttonWidget: 'glossy-orb' | 'neumorphic-convex' | 'tactile-toggle'
	// Generative Audio Reactivity
	audioReactiveEnabled: boolean
	audioReactiveTarget: 'side-pulse' | 'glow' | 'scale' | 'wobble'
	audioReactiveIntensity: 'subtle' | 'dynamic' | 'rave'
	// Remix lineage
	forkedFrom?: {
		id: string
		name: string
		author: string
	}
}

export const DEFAULT_THEME_DRAFT: CustomThemeDraft = {
	name: 'My Custom Skin',
	author: 'You',
	description: 'Crafted in Skin Studio',
	backgroundPresetId: 'frutiger-aqua',
	accentPresetId: 'electric-cyan',
	glassTintId: 'frosted-aqua',
	blurIntensity: 25,
	cornerRadius: 'balanced',
	fontChoice: 'rajdhani',
	glowIntensity: 'vivid',
	volumeWidget: 'slider',
	artworkWidget: 'glass-cylinder',
	buttonWidget: 'glossy-orb',
	audioReactiveEnabled: true,
	audioReactiveTarget: 'glow',
	audioReactiveIntensity: 'dynamic',
}

/**
 * Build a complete, valid ThemeStyle object from a user's customized draft.
 */
export function buildThemeFromDraft(draft: CustomThemeDraft, existingId?: string): ThemeStyle {
	const bgPreset = BACKGROUND_PRESETS.find((p) => p.id === draft.backgroundPresetId) || BACKGROUND_PRESETS[0]
	const accentPreset = ACCENT_PRESETS.find((p) => p.id === draft.accentPresetId) || ACCENT_PRESETS[0]
	const tintPreset = GLASS_TINT_PRESETS.find((p) => p.id === draft.glassTintId) || GLASS_TINT_PRESETS[0]

	const id = existingId || `custom-${Date.now()}`

	const radiusMap = {
		sharp: { large: 8, medium: 6, small: 4 },
		balanced: { large: 16, medium: 12, small: 6 },
		pill: { large: 28, medium: 20, small: 10 },
	}
	const radii = radiusMap[draft.cornerRadius] || radiusMap.balanced

	const fontMap = {
		rajdhani: 'Rajdhani_600SemiBold',
		orbitron: 'Orbitron_600SemiBold',
		system: undefined,
	}
	const selectedFont = fontMap[draft.fontChoice]

	const isDark = tintPreset.isDark
	const textPrimary = isDark ? '#FFFFFF' : '#123655'
	const textSecondary = isDark ? '#94A3B8' : '#3D6E8F'
	const textMuted = isDark ? '#64748B' : '#6495ED'

	const glowAlpha = draft.glowIntensity === 'neon' ? 0.8 : draft.glowIntensity === 'vivid' ? 0.5 : 0.25

	const colors: ThemeColors = {
		backgroundGradient: bgPreset.colors,
		backgroundGradientStart: bgPreset.start,
		backgroundGradientEnd: bgPreset.end,

		cardGradient: tintPreset.cardGradient,
		cardBorderColor: tintPreset.cardBorderColor,
		cardBorderWidth: 1.2,

		textPrimary,
		textSecondary,
		textMuted,
		textOnAccent: '#FFFFFF',

		accentGradient: accentPreset.gradient,
		accentPrimary: accentPreset.primary,
		accentSecondary: accentPreset.secondary,

		controlBackground: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(190, 235, 255, 0.85)',
		controlBackgroundActive: isDark ? 'rgba(255, 255, 255, 0.30)' : 'rgba(220, 248, 255, 0.95)',
		controlIcon: isDark ? '#FFFFFF' : 'rgba(0, 40, 100, 0.95)',

		progressTrack: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 40, 80, 0.35)',
		progressFillGradient: accentPreset.gradient,

		tabBarBackground: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(160, 225, 255, 0.75)',
		tabBarActive: accentPreset.primary,
		tabBarInactive: isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(0, 80, 150, 0.6)',

		shadowColor: `rgba(0, 200, 255, ${glowAlpha})`,
		divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.5)',
		overlay: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 30, 70, 0.7)',

		titleBarGradient: tintPreset.cardGradient,
		glowColor: `${accentPreset.primary}${Math.round(glowAlpha * 255).toString(16).padStart(2, '0')}`,
		innerPanelBackground: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(0, 30, 70, 0.55)',
		waveformGradient: accentPreset.gradient,
		playButtonGradient: accentPreset.gradient,
		pauseButtonGradient: ['#ff4d4d', '#cc0000'],
	}

	const metrics: ThemeMetrics = {
		borderRadiusLarge: radii.large,
		borderRadiusMedium: radii.medium,
		borderRadiusSmall: radii.small,
		blurIntensity: draft.blurIntensity,
		cardPadding: 16,
		shadowLight: {
			color: colors.shadowColor,
			offset: { width: 0, height: 2 },
			opacity: 1,
			radius: 8,
			elevation: 2,
		},
		shadowMedium: {
			color: colors.shadowColor,
			offset: { width: 0, height: 12 },
			opacity: 1,
			radius: 24,
			elevation: 8,
		},
		shadowHeavy: {
			color: colors.shadowColor,
			offset: { width: 0, height: 0 },
			opacity: 1,
			radius: 35,
			elevation: 14,
		},
		shadowAccent: {
			color: `${accentPreset.primary}80`,
			offset: { width: 0, height: 0 },
			opacity: 1,
			radius: 16,
			elevation: 8,
		},
	}

	const typography: ThemeTypography = {
		titleSize: 28,
		titleWeight: '700',
		bodySize: 15,
		bodyWeight: '500',
		captionSize: 12,
		captionWeight: '500',
		fontFamily: selectedFont,
		textShadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 4,
	}

	return {
		id,
		name: draft.name.trim() || 'Custom Skin',
		description: draft.description || `Created by ${draft.author}`,
		author: draft.author.trim() || 'Community Creator',
		preview: '',
		isPremium: false,
		isCustom: true,
		createdAt: Date.now(),
		useBlur: draft.blurIntensity > 0,
		useInnerShadows: draft.buttonWidget === 'neumorphic-convex',
		useTextures: draft.volumeWidget === 'steampunk-cog' || draft.volumeWidget === 'rotary-knob',
		colors,
		metrics,
		typography,
		widgets: {
			volumeControl: draft.volumeWidget,
			artworkDisplay: draft.artworkWidget,
			playButton: draft.buttonWidget,
			audioReactivity: {
				enabled: draft.audioReactiveEnabled,
				intensity: draft.audioReactiveIntensity,
				target: draft.audioReactiveTarget,
			},
		},
		forkedFrom: draft.forkedFrom,
	}
}

/**
 * Serialize a ThemeStyle to shareable JSON.
 */
export function exportThemeToJSON(theme: ThemeStyle): string {
	return JSON.stringify(theme, null, 2)
}

/**
 * Validate and import a ThemeStyle from JSON string.
 */
export function importThemeFromJSON(jsonString: string): ThemeStyle | null {
	try {
		const parsed = JSON.parse(jsonString)
		if (
			typeof parsed === 'object' &&
			parsed !== null &&
			typeof parsed.name === 'string' &&
			typeof parsed.colors === 'object' &&
			Array.isArray(parsed.colors.backgroundGradient)
		) {
			return {
				...parsed,
				id: `custom-import-${Date.now()}`,
				isCustom: true,
				createdAt: Date.now(),
			} as ThemeStyle
		}
		return null
	} catch {
		return null
	}
}
