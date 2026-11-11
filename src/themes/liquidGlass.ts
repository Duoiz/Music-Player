import type { ThemeStyle } from '../types'

/**
 * 💎 Liquid Glass Theme (Free)
 *
 * Inspired by iOS 26 / Apple's "Liquid Glass" design language.
 * Ultra-high blur, near-transparent panels, monochromatic tints,
 * subtle refraction borders, ethereal feel.
 */
export const liquidGlass: ThemeStyle = {
	id: 'liquid-glass',
	name: 'Liquid Glass',
	description: 'Ultra-modern translucent panels with ethereal refraction effects inspired by iOS 26',
	author: 'Built-in',
	preview: '',
	isPremium: false,
	useBlur: true,
	useInnerShadows: false,
	useTextures: false,
	colors: {
		// Background — soft lavender-to-silver gradient
		backgroundGradient: ['#E8E0F0', '#F0EFF4', '#DDE4EC'],
		backgroundGradientStart: { x: 0, y: 0 },
		backgroundGradientEnd: { x: 0.5, y: 1 },

		// Glass Card — extremely transparent for true frosted look
		cardGradient: ['rgba(255, 255, 255, 0.25)', 'rgba(240, 245, 255, 0.15)'],
		cardBorderColor: 'rgba(255, 255, 255, 0.75)',
		cardBorderWidth: 1,

		// Text
		textPrimary: '#1C1C1E',
		textSecondary: '#636366',
		textMuted: '#AEAEB2',
		textOnAccent: '#FFFFFF',

		// Accent — soft blue, slightly desaturated and glowing
		accentGradient: ['#007AFF', '#5AC8FA'],
		accentPrimary: '#007AFF',
		accentSecondary: '#5AC8FA',

		// Controls
		controlBackground: 'rgba(255, 255, 255, 0.45)',
		controlBackgroundActive: 'rgba(255, 255, 255, 0.65)',
		controlIcon: '#1C1C1E',

		// Progress
		progressTrack: 'rgba(0, 0, 0, 0.04)',
		progressFillGradient: ['#007AFF', '#5AC8FA'],

		// Tab Bar - highly transparent for fluid bottom
		tabBarBackground: 'rgba(255, 255, 255, 0.2)',
		tabBarActive: '#007AFF',
		tabBarInactive: '#AEAEB2',

		// Misc
		shadowColor: 'rgba(0, 0, 0, 0.05)',
		divider: 'rgba(0, 0, 0, 0.04)',
		overlay: 'rgba(0, 0, 0, 0.1)',
	},
	metrics: {
		borderRadiusLarge: 32,
		borderRadiusMedium: 20,
		borderRadiusSmall: 12,
		blurIntensity: 100, // Maximum blur for frosted glass
		cardPadding: 24,
		shadowLight: {
			color: 'rgba(0, 0, 0, 0.03)',
			offset: { width: 0, height: 2 },
			opacity: 1,
			radius: 8,
			elevation: 2,
		},
		shadowMedium: {
			color: 'rgba(0, 0, 0, 0.05)',
			offset: { width: 0, height: 4 },
			opacity: 1,
			radius: 12,
			elevation: 4,
		},
		shadowHeavy: {
			color: 'rgba(0, 0, 0, 0.08)',
			offset: { width: 0, height: 8 },
			opacity: 1,
			radius: 20,
			elevation: 8,
		},
		shadowAccent: {
			color: 'rgba(0, 122, 255, 0.15)',
			offset: { width: 0, height: 4 },
			opacity: 1,
			radius: 12,
			elevation: 4,
		},
	},
	typography: {
		titleSize: 18,
		titleWeight: '600',
		bodySize: 15,
		bodyWeight: '400',
		captionSize: 13,
		captionWeight: '400',
		fontFamily: undefined,
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
