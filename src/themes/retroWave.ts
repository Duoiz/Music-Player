import type { ThemeStyle } from '../types'

/**
 * 🌆 RetroWave Theme (Premium)
 *
 * Synthwave / vaporwave aesthetic.
 * Hot pink + cyan neon gradients on dark backgrounds.
 * Glow effects, retro-futuristic feel.
 */
export const retroWave: ThemeStyle = {
	id: 'retro-wave',
	name: 'RetroWave',
	description: 'Synthwave neon aesthetic with hot pink and cyan glow effects on dark backgrounds',
	author: 'Built-in',
	preview: '',
	isPremium: true,
	useBlur: true,
	useInnerShadows: false,
	useTextures: false,
	colors: {
		// Background — deep purple to dark
		backgroundGradient: ['#1A0A2E', '#2D1B69', '#16213E'],
		backgroundGradientStart: { x: 0, y: 0 },
		backgroundGradientEnd: { x: 0.5, y: 1 },

		// Glass Card — dark purple translucent
		cardGradient: ['rgba(45, 27, 105, 0.7)', 'rgba(26, 10, 46, 0.6)'],
		cardBorderColor: 'rgba(255, 0, 128, 0.3)',
		cardBorderWidth: 1,

		// Text
		textPrimary: '#F0E6FF',
		textSecondary: '#B794D6',
		textMuted: '#6B4C8A',
		textOnAccent: '#1A0A2E',

		// Accent — hot pink to cyan
		accentGradient: ['#FF006E', '#00D4FF'],
		accentPrimary: '#FF006E',
		accentSecondary: '#00D4FF',

		// Controls
		controlBackground: 'rgba(60, 30, 120, 0.6)',
		controlBackgroundActive: 'rgba(80, 40, 160, 0.8)',
		controlIcon: '#F0E6FF',

		// Progress — neon pink
		progressTrack: 'rgba(255, 255, 255, 0.08)',
		progressFillGradient: ['#FF006E', '#00D4FF'],

		// Tab Bar
		tabBarBackground: 'rgba(26, 10, 46, 0.95)',
		tabBarActive: '#FF006E',
		tabBarInactive: '#6B4C8A',

		// Misc
		shadowColor: 'rgba(0, 0, 0, 0.5)',
		divider: 'rgba(255, 255, 255, 0.05)',
		overlay: 'rgba(0, 0, 0, 0.5)',
	},
	metrics: {
		borderRadiusLarge: 24,
		borderRadiusMedium: 16,
		borderRadiusSmall: 10,
		blurIntensity: 70,
		cardPadding: 24,
		shadowLight: {
			color: 'rgba(255, 0, 110, 0.1)',
			offset: { width: 0, height: 2 },
			opacity: 0.1,
			radius: 4,
			elevation: 2,
		},
		shadowMedium: {
			color: 'rgba(255, 0, 110, 0.15)',
			offset: { width: 0, height: 4 },
			opacity: 0.15,
			radius: 8,
			elevation: 5,
		},
		shadowHeavy: {
			color: 'rgba(0, 0, 0, 0.5)',
			offset: { width: 0, height: 10 },
			opacity: 0.5,
			radius: 20,
			elevation: 15,
		},
		shadowAccent: {
			color: 'rgba(255, 0, 110, 0.35)',
			offset: { width: 0, height: 6 },
			opacity: 0.35,
			radius: 14,
			elevation: 8,
		},
	},
	typography: {
		titleSize: 18,
		titleWeight: '800',
		bodySize: 14,
		bodyWeight: '500',
		captionSize: 12,
		captionWeight: '600',
	},
}
