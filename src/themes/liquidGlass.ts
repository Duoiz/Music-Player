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

		// Glass Card — extremely transparent
		cardGradient: ['rgba(255, 255, 255, 0.45)', 'rgba(240, 245, 255, 0.35)'],
		cardBorderColor: 'rgba(255, 255, 255, 0.6)',
		cardBorderWidth: 0.5,

		// Text
		textPrimary: '#1C1C1E',
		textSecondary: '#636366',
		textMuted: '#AEAEB2',
		textOnAccent: '#FFFFFF',

		// Accent — soft blue
		accentGradient: ['#007AFF', '#5AC8FA'],
		accentPrimary: '#007AFF',
		accentSecondary: '#5AC8FA',

		// Controls
		controlBackground: 'rgba(255, 255, 255, 0.35)',
		controlBackgroundActive: 'rgba(255, 255, 255, 0.55)',
		controlIcon: '#1C1C1E',

		// Progress
		progressTrack: 'rgba(0, 0, 0, 0.06)',
		progressFillGradient: ['#007AFF', '#5AC8FA'],

		// Tab Bar
		tabBarBackground: 'rgba(255, 255, 255, 0.4)',
		tabBarActive: '#007AFF',
		tabBarInactive: '#AEAEB2',

		// Misc
		shadowColor: 'rgba(0, 0, 0, 0.08)',
		divider: 'rgba(0, 0, 0, 0.04)',
		overlay: 'rgba(0, 0, 0, 0.15)',
	},
	metrics: {
		borderRadiusLarge: 28,
		borderRadiusMedium: 18,
		borderRadiusSmall: 10,
		blurIntensity: 95,
		cardPadding: 22,
		shadowLight: {
			color: 'rgba(0, 0, 0, 0.05)',
			offset: { width: 0, height: 1 },
			opacity: 0.05,
			radius: 3,
			elevation: 1,
		},
		shadowMedium: {
			color: 'rgba(0, 0, 0, 0.08)',
			offset: { width: 0, height: 3 },
			opacity: 0.08,
			radius: 6,
			elevation: 3,
		},
		shadowHeavy: {
			color: 'rgba(0, 0, 0, 0.12)',
			offset: { width: 0, height: 8 },
			opacity: 0.12,
			radius: 16,
			elevation: 8,
		},
		shadowAccent: {
			color: 'rgba(0, 122, 255, 0.25)',
			offset: { width: 0, height: 4 },
			opacity: 0.25,
			radius: 10,
			elevation: 5,
		},
	},
	typography: {
		titleSize: 17,
		titleWeight: '600',
		bodySize: 15,
		bodyWeight: '400',
		captionSize: 13,
		captionWeight: '400',
		fontFamily: undefined, // System default (SF Pro on iOS)
	},
}
