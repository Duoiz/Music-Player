import type { ThemeStyle } from '../types'

/**
 * 🌊 Fruitiger Aero Theme (Reference Redux)
 *
 * Dark aqua glass aesthetic with cyan glows and XP-style controls.
 * Inspired by the Duoiz/Fruitiger-Aero-MP3-Interface reference.
 */
export const frutigerAero: ThemeStyle = {
	id: 'frutiger-aero',
	name: 'Fruitiger Aero',
	description: 'Futuristic dark glass aesthetic with neon cyan glows',
	author: 'Built-in',
	preview: '',
	isPremium: false,
	useBlur: true,
	useInnerShadows: false,
	useTextures: false,
	colors: {
		// Background (Smoother, mid-tone radial gradient)
		backgroundGradient: ['#6bc5e8', '#40a9d4', '#1f85b3', '#11658f'],
		backgroundGradientStart: { x: 0.3, y: 0.2 },
		backgroundGradientEnd: { x: 1, y: 1 },

		// Glass Card (Outer)
		cardGradient: ['rgba(210, 245, 255, 0.5)', 'rgba(90, 180, 230, 0.45)'],
		cardBorderColor: 'rgba(255, 255, 255, 0.75)',
		cardBorderWidth: 1,

		// Text
		textPrimary: '#123655',
		textSecondary: '#3D6E8F',
		textMuted: '#3D6E8F',
		textOnAccent: '#FFFFFF',

		// Accent
		accentGradient: ['#00c8ff', '#40ffd0'],
		accentPrimary: '#00c8ff',
		accentSecondary: '#40ffd0',

		// Controls
		controlBackground: 'rgba(190, 235, 255, 0.85)',
		controlBackgroundActive: 'rgba(220, 248, 255, 0.9)',
		controlIcon: 'rgba(0, 40, 100, 0.9)',

		// Progress
		progressTrack: 'rgba(0, 40, 80, 0.35)',
		progressFillGradient: ['#33b5e5', '#00ffc8'],

		// Tab Bar
		tabBarBackground: 'rgba(160, 225, 255, 0.75)',
		tabBarActive: 'rgba(0, 40, 100, 0.95)',
		tabBarInactive: 'rgba(0, 80, 150, 0.6)',

		// Misc
		shadowColor: 'rgba(0, 200, 255, 0.3)',
		divider: 'rgba(255, 255, 255, 0.5)',
		overlay: 'rgba(0, 30, 70, 0.7)',

		// Frutiger Aero Custom Reference Tokens
		titleBarGradient: ['rgba(160, 225, 255, 0.75)', 'rgba(80, 180, 240, 0.7)'],
		glowColor: 'rgba(0, 200, 255, 0.6)',
		innerPanelBackground: 'rgba(0, 30, 70, 0.55)',
		waveformGradient: ['#00c8ff', '#40ffd0'],
		playButtonGradient: ['rgba(100, 240, 150, 0.85)', 'rgba(20, 180, 80, 0.8)'],
		pauseButtonGradient: ['rgba(255, 100, 100, 0.85)', 'rgba(200, 40, 40, 0.8)'],
	},
	metrics: {
		borderRadiusLarge: 12,
		borderRadiusMedium: 8,
		borderRadiusSmall: 5,
		blurIntensity: 20,
		cardPadding: 16,
		shadowLight: {
			color: 'rgba(0, 150, 255, 0.15)',
			offset: { width: 0, height: 2 },
			opacity: 1,
			radius: 8,
			elevation: 2,
		},
		shadowMedium: {
			color: 'rgba(0, 80, 150, 0.4)',
			offset: { width: 0, height: 20 },
			opacity: 1,
			radius: 60,
			elevation: 10,
		},
		shadowHeavy: {
			color: 'rgba(0, 200, 255, 0.6)',
			offset: { width: 0, height: 0 },
			opacity: 1,
			radius: 35,
			elevation: 15,
		},
		shadowAccent: {
			color: 'rgba(0, 220, 100, 0.5)',
			offset: { width: 0, height: 0 },
			opacity: 1,
			radius: 16,
			elevation: 8,
		},
	},
	typography: {
		fontFamily: 'Rajdhani_600SemiBold',
		titleSize: 20,
		titleWeight: '800',
		bodySize: 13,
		bodyWeight: '700',
		captionSize: 11,
		captionWeight: '600',
		textShadowColor: 'rgba(255, 255, 255, 0.5)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},
	widgets: {
		volumeControl: 'slider',
		artworkDisplay: 'glass-cylinder',
		playButton: 'glossy-orb',
		audioReactivity: {
			enabled: true,
			intensity: 'dynamic',
			target: 'glow',
		},
	},
}
