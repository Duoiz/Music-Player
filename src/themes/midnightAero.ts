import type { ThemeStyle } from '../types'

/**
 * 🌙 Midnight Aero Theme (Premium)
 *
 * Dark mode variant of Fruitiger Aero.
 * Deep navy/purple gradients, neon green accents, glass panels on dark.
 * Keeps the iconic glass aesthetic but shifted to nighttime.
 */
export const midnightAero: ThemeStyle = {
	id: 'midnight-aero',
	name: 'Midnight Aero',
	description: 'Dark mode Fruitiger Aero with deep navy gradients and neon green accents',
	author: 'Built-in',
	preview: '',
	isPremium: true,
	useBlur: true,
	useInnerShadows: false,
	useTextures: false,
	colors: {
		// Background — deep navy to purple
		backgroundGradient: ['#0A0E27', '#1A1A3E', '#0F1B3D'],
		backgroundGradientStart: { x: 0, y: 0 },
		backgroundGradientEnd: { x: 1, y: 1 },

		// Glass Card — dark translucent
		cardGradient: ['rgba(30, 35, 70, 0.85)', 'rgba(20, 25, 60, 0.75)'],
		cardBorderColor: 'rgba(100, 120, 200, 0.3)',
		cardBorderWidth: 1,

		// Text
		textPrimary: '#E8ECFF',
		textSecondary: '#9BA3C7',
		textMuted: '#5A6190',
		textOnAccent: '#0A0E27',

		// Accent — neon green (punchy against dark bg)
		accentGradient: ['#00FF88', '#00E676'],
		accentPrimary: '#00FF88',
		accentSecondary: '#00E676',

		// Controls
		controlBackground: 'rgba(50, 55, 100, 0.6)',
		controlBackgroundActive: 'rgba(70, 75, 130, 0.8)',
		controlIcon: '#E8ECFF',

		// Progress
		progressTrack: 'rgba(255, 255, 255, 0.08)',
		progressFillGradient: ['#00FF88', '#00E676'],

		// Tab Bar
		tabBarBackground: 'rgba(15, 18, 45, 0.9)',
		tabBarActive: '#00FF88',
		tabBarInactive: '#5A6190',

		// Misc
		shadowColor: 'rgba(0, 0, 0, 0.4)',
		divider: 'rgba(255, 255, 255, 0.05)',
		overlay: 'rgba(0, 0, 0, 0.5)',
	},
	metrics: {
		borderRadiusLarge: 30,
		borderRadiusMedium: 20,
		borderRadiusSmall: 12,
		blurIntensity: 80,
		cardPadding: 24,
		shadowLight: {
			color: 'rgba(0, 255, 136, 0.05)',
			offset: { width: 0, height: 2 },
			opacity: 0.05,
			radius: 4,
			elevation: 2,
		},
		shadowMedium: {
			color: 'rgba(0, 0, 0, 0.3)',
			offset: { width: 0, height: 4 },
			opacity: 0.3,
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
			color: 'rgba(0, 255, 136, 0.3)',
			offset: { width: 0, height: 6 },
			opacity: 0.3,
			radius: 12,
			elevation: 8,
		},
	},
	typography: {
		titleSize: 18,
		titleWeight: '700',
		bodySize: 14,
		bodyWeight: '400',
		captionSize: 12,
		captionWeight: '500',
	},
}
