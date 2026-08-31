import type { ThemeStyle } from '../types'

/**
 * 🎚️ Skeuomorphism Theme (Free)
 *
 * Realistic textures, brushed metal gradients, physical knob-like controls.
 * Inspired by classic audio hardware (amplifiers, mixing boards).
 * Leather, wood, brushed aluminum accents.
 */
export const skeuomorphism: ThemeStyle = {
	id: 'skeuomorphism',
	name: 'Skeuomorphism',
	description: 'Realistic textures, brushed metal gradients, and physical knob-like audio controls',
	author: 'Built-in',
	preview: '',
	isPremium: false,
	useBlur: false,
	useInnerShadows: false,
	useTextures: true, // Key characteristic
	colors: {
		// Background — dark brushed metal
		backgroundGradient: ['#2C2C2E', '#1C1C1E', '#2C2C2E'],
		backgroundGradientStart: { x: 0, y: 0 },
		backgroundGradientEnd: { x: 1, y: 1 },

		// Card — raised panel with metallic tones
		cardGradient: ['#3A3A3C', '#2C2C2E'],
		cardBorderColor: 'rgba(100, 100, 100, 0.5)',
		cardBorderWidth: 1,

		// Text
		textPrimary: '#F2F2F7',
		textSecondary: '#AEAEB2',
		textMuted: '#636366',
		textOnAccent: '#FFFFFF',

		// Accent — warm amber/orange (like vintage VU meters)
		accentGradient: ['#FF9F0A', '#FFD60A'],
		accentPrimary: '#FF9F0A',
		accentSecondary: '#FFD60A',

		// Controls — recessed knob look
		controlBackground: '#3A3A3C',
		controlBackgroundActive: '#48484A',
		controlIcon: '#F2F2F7',

		// Progress — warm amber
		progressTrack: 'rgba(255, 255, 255, 0.1)',
		progressFillGradient: ['#FF9F0A', '#FFD60A'],

		// Tab Bar — dark metallic
		tabBarBackground: '#1C1C1E',
		tabBarActive: '#FF9F0A',
		tabBarInactive: '#636366',

		// Misc
		shadowColor: 'rgba(0, 0, 0, 0.5)',
		divider: 'rgba(255, 255, 255, 0.08)',
		overlay: 'rgba(0, 0, 0, 0.5)',
	},
	metrics: {
		borderRadiusLarge: 16, // Less rounded, more physical
		borderRadiusMedium: 12,
		borderRadiusSmall: 8,
		blurIntensity: 0,
		cardPadding: 20,
		shadowLight: {
			color: 'rgba(0, 0, 0, 0.3)',
			offset: { width: 0, height: 2 },
			opacity: 0.3,
			radius: 4,
			elevation: 3,
		},
		shadowMedium: {
			color: 'rgba(0, 0, 0, 0.4)',
			offset: { width: 0, height: 4 },
			opacity: 0.4,
			radius: 8,
			elevation: 6,
		},
		shadowHeavy: {
			color: 'rgba(0, 0, 0, 0.6)',
			offset: { width: 0, height: 8 },
			opacity: 0.6,
			radius: 16,
			elevation: 12,
		},
		shadowAccent: {
			color: 'rgba(255, 159, 10, 0.4)',
			offset: { width: 0, height: 4 },
			opacity: 0.4,
			radius: 10,
			elevation: 6,
		},
	},
	typography: {
		titleSize: 18,
		titleWeight: '700',
		bodySize: 14,
		bodyWeight: '500',
		captionSize: 12,
		captionWeight: '600',
	},
}
