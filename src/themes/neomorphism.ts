import type { ThemeStyle } from '../types'

/**
 * ☁️ Neomorphism Theme (Free)
 *
 * Soft, extruded UI elements with dual shadows (light + dark).
 * Muted pastel background, no hard borders, raised/pressed states.
 * Think: "soft plastic UI" — flat but with depth.
 */
export const neomorphism: ThemeStyle = {
	id: 'neomorphism',
	name: 'Neomorphism',
	description: 'Soft extruded UI with dual shadows, muted pastels, and no hard borders',
	author: 'Built-in',
	preview: '',
	isPremium: false,
	useBlur: false, // Neomorphism doesn't use glass blur
	useInnerShadows: true, // Key characteristic
	useTextures: false,
	colors: {
		// Background — uniform soft gray (neomorphism needs solid bg)
		backgroundGradient: ['#E0E5EC', '#E0E5EC', '#E0E5EC'],
		backgroundGradientStart: { x: 0, y: 0 },
		backgroundGradientEnd: { x: 1, y: 1 },

		// Card — same as background (elements are extruded FROM the bg)
		cardGradient: ['#E0E5EC', '#E0E5EC'],
		cardBorderColor: 'transparent',
		cardBorderWidth: 0,

		// Text
		textPrimary: '#2D3436',
		textSecondary: '#636E72',
		textMuted: '#B2BEC3',
		textOnAccent: '#FFFFFF',

		// Accent — soft teal
		accentGradient: ['#00CEC9', '#55EFC4'],
		accentPrimary: '#00CEC9',
		accentSecondary: '#55EFC4',

		// Controls
		controlBackground: '#E0E5EC',
		controlBackgroundActive: '#D5DAE1',
		controlIcon: '#2D3436',

		// Progress
		progressTrack: '#D5DAE1',
		progressFillGradient: ['#00CEC9', '#55EFC4'],

		// Tab Bar
		tabBarBackground: '#E0E5EC',
		tabBarActive: '#00CEC9',
		tabBarInactive: '#B2BEC3',

		// Misc — neomorphism uses dual shadows instead of single
		shadowColor: 'rgba(0, 0, 0, 0.15)',
		divider: 'rgba(0, 0, 0, 0.06)',
		overlay: 'rgba(0, 0, 0, 0.2)',
	},
	metrics: {
		borderRadiusLarge: 25,
		borderRadiusMedium: 16,
		borderRadiusSmall: 10,
		blurIntensity: 0, // No blur
		cardPadding: 24,
		// Dark shadow (bottom-right)
		shadowLight: {
			color: '#A3B1C6',
			offset: { width: 3, height: 3 },
			opacity: 0.5,
			radius: 6,
			elevation: 3,
		},
		shadowMedium: {
			color: '#A3B1C6',
			offset: { width: 5, height: 5 },
			opacity: 0.5,
			radius: 10,
			elevation: 5,
		},
		shadowHeavy: {
			color: '#A3B1C6',
			offset: { width: 8, height: 8 },
			opacity: 0.5,
			radius: 16,
			elevation: 10,
		},
		shadowAccent: {
			color: 'rgba(0, 206, 201, 0.35)',
			offset: { width: 4, height: 4 },
			opacity: 0.35,
			radius: 10,
			elevation: 5,
		},
	},
	typography: {
		titleSize: 18,
		titleWeight: '700',
		bodySize: 14,
		bodyWeight: '500',
		captionSize: 12,
		captionWeight: '500',
	},
}
