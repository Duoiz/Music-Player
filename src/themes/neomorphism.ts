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
		// Background — soft cool gray-blue base (elements are extruded FROM this canvas)
		backgroundGradient: ['#E6E9F2', '#E6E9F2', '#E6E9F2'],
		backgroundGradientStart: { x: 0, y: 0 },
		backgroundGradientEnd: { x: 1, y: 1 },

		// Card — matching base surface with subtle border
		cardGradient: ['#E6E9F2', '#E6E9F2'],
		cardBorderColor: 'rgba(255, 255, 255, 0.6)',
		cardBorderWidth: 1,

		// Text (WCAG AA compliant against #E6E9F2)
		textPrimary: '#1E2432',
		textSecondary: '#4A5568',
		textMuted: '#8A94A6',
		textOnAccent: '#FFFFFF',

		// Accent — warm coral for playback and tactile highlights
		accentGradient: ['#FF5A5F', '#FF7E82'],
		accentPrimary: '#FF5A5F',
		accentSecondary: '#FF7E82',

		// Controls
		controlBackground: '#E6E9F2',
		controlBackgroundActive: '#DCE0EB',
		controlIcon: '#2D3748',

		// Progress — inset channel with vibrant fill
		progressTrack: '#DCE0EB',
		progressFillGradient: ['#FF5A5F', '#FF7E82'],

		// Tab Bar
		tabBarBackground: '#E6E9F2',
		tabBarActive: '#FF5A5F',
		tabBarInactive: '#8A94A6',

		// Dual-shadow tokens
		shadowColor: '#9AA7BD',
		divider: 'rgba(154, 167, 189, 0.25)',
		overlay: 'rgba(30, 36, 50, 0.35)',
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
	widgets: {
		volumeControl: 'slider',
		artworkDisplay: 'vinyl',
		playButton: 'neumorphic-convex',
		audioReactivity: {
			enabled: true,
			intensity: 'subtle',
			target: 'scale',
		},
	},
}
