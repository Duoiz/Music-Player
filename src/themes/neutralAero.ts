import type { ThemeStyle } from '../types'

/**
 * ❄️ Neutral Aero Theme
 *
 * Clean silver, white, and glassy light-gray aesthetic.
 * A sophisticated, more neutral variant of the Frutiger Aero design language.
 */
export const neutralAero: ThemeStyle = {
	id: 'neutral-aero',
	name: 'Neutral Aero',
	description: 'Clean silver glass aesthetic with polished white and gray tones',
	author: 'Built-in',
	preview: '',
	isPremium: false,
	useBlur: true,
	useInnerShadows: false,
	useTextures: false,
	colors: {
		// Background (Light silver gradient)
		backgroundGradient: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da'],
		backgroundGradientStart: { x: 0.3, y: 0.2 },
		backgroundGradientEnd: { x: 1, y: 1 },

		// Glass Card (Outer)
		cardGradient: ['rgba(255, 255, 255, 0.7)', 'rgba(233, 236, 239, 0.5)'],
		cardBorderColor: 'rgba(255, 255, 255, 0.9)',
		cardBorderWidth: 1,

		// Text
		textPrimary: 'rgba(52, 58, 64, 0.95)',
		textSecondary: 'rgba(73, 80, 87, 0.75)',
		textMuted: 'rgba(108, 117, 125, 0.6)',
		textOnAccent: 'rgba(255, 255, 255, 0.95)',

		// Accent
		accentGradient: ['#adb5bd', '#6c757d'],
		accentPrimary: '#6c757d',
		accentSecondary: '#adb5bd',

		// Controls
		controlBackground: 'rgba(255, 255, 255, 0.85)',
		controlBackgroundActive: 'rgba(233, 236, 239, 0.95)',
		controlIcon: 'rgba(33, 37, 41, 0.9)',

		// Progress
		progressTrack: 'rgba(206, 212, 218, 0.6)',
		progressFillGradient: ['#868e96', '#495057'],

		// Tab Bar
		tabBarBackground: 'rgba(248, 249, 250, 0.85)',
		tabBarActive: 'rgba(33, 37, 41, 0.95)',
		tabBarInactive: 'rgba(134, 142, 150, 0.6)',

		// Misc
		shadowColor: 'rgba(0, 0, 0, 0.1)',
		divider: 'rgba(206, 212, 218, 0.5)',
		overlay: 'rgba(255, 255, 255, 0.6)',

		// Custom Reference Tokens
		titleBarGradient: ['rgba(248, 249, 250, 0.8)', 'rgba(233, 236, 239, 0.7)'],
		glowColor: 'rgba(255, 255, 255, 0.8)',
		innerPanelBackground: 'rgba(248, 249, 250, 0.55)',
		waveformGradient: ['#adb5bd', '#6c757d'],
		playButtonGradient: ['rgba(255, 255, 255, 0.95)', 'rgba(233, 236, 239, 0.9)'],
		pauseButtonGradient: ['rgba(248, 249, 250, 0.95)', 'rgba(222, 226, 230, 0.9)'],
	},
	metrics: {
		borderRadiusLarge: 12,
		borderRadiusMedium: 8,
		borderRadiusSmall: 5,
		blurIntensity: 25,
		cardPadding: 16,
		shadowLight: {
			color: 'rgba(0, 0, 0, 0.05)',
			offset: { width: 0, height: 2 },
			opacity: 1,
			radius: 8,
			elevation: 2,
		},
		shadowMedium: {
			color: 'rgba(0, 0, 0, 0.1)',
			offset: { width: 0, height: 10 },
			opacity: 1,
			radius: 20,
			elevation: 6,
		},
		shadowHeavy: {
			color: 'rgba(255, 255, 255, 0.8)',
			offset: { width: 0, height: 0 },
			opacity: 1,
			radius: 30,
			elevation: 10,
		},
		shadowAccent: {
			color: 'rgba(255, 255, 255, 0.6)',
			offset: { width: 0, height: 0 },
			opacity: 1,
			radius: 12,
			elevation: 4,
		},
	},
	typography: {
		fontFamily: 'Rajdhani_600SemiBold',
		titleSize: 22,
		titleWeight: '700',
		bodySize: 14,
		bodyWeight: '600',
		captionSize: 10,
		captionWeight: '600',
	},
}
