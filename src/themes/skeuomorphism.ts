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
		// Background — dark brushed metal chassis
		backgroundGradient: ['#28282B', '#1A1A1D', '#121214'],
		backgroundGradientStart: { x: 0, y: 0 },
		backgroundGradientEnd: { x: 0.5, y: 1 },

		// Card — raised aluminum chassis panel with beveled edge
		cardGradient: ['#343438', '#222226'],
		cardBorderColor: 'rgba(255, 255, 255, 0.15)',
		cardBorderWidth: 1.5,

		// Text — high legibility mechanical console readout
		textPrimary: '#F5F5F7',
		textSecondary: '#C7C7CC',
		textMuted: '#8E8E93',
		textOnAccent: '#000000',

		// Accent — warm amber / vintage VU meter glow
		accentGradient: ['#FF9F0A', '#FFB340'],
		accentPrimary: '#FF9F0A',
		accentSecondary: '#FFB340',

		// Controls — knurled rotary knobs and recessed push buttons
		controlBackground: '#2A2A2E',
		controlBackgroundActive: '#1C1C20',
		controlIcon: '#F5F5F7',

		// Progress — warm amber mechanical level track
		progressTrack: 'rgba(0, 0, 0, 0.6)',
		progressFillGradient: ['#FF9F0A', '#FFB340'],

		// Tab Bar — dark metallic console deck
		tabBarBackground: '#161618',
		tabBarActive: '#FF9F0A',
		tabBarInactive: '#636366',

		// Deep cast shadows & physical borders
		shadowColor: '#000000',
		divider: 'rgba(255, 255, 255, 0.1)',
		overlay: 'rgba(0, 0, 0, 0.65)',
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
	widgets: {
		volumeControl: 'rotary-knob',
		artworkDisplay: 'vinyl',
		playButton: 'tactile-toggle',
		audioReactivity: {
			enabled: true,
			intensity: 'subtle',
			target: 'scale',
		},
	},
}
