import type { ThemeStyle } from '../types'

/**
 * ⚙️ Steampunk Chronograph (Featured Community Showcase / Skin of the Week)
 * Features interlocking brass cogs, aged copper chassis, warm amber VU meter glow,
 * and audio-reactive gear twitching.
 */
export const steampunkChronograph: ThemeStyle = {
	id: 'steampunk-chronograph',
	name: 'Steampunk Chronograph',
	description: 'Clockwork brass gears, riveted copper chassis, and audio-reactive mechanical cogs',
	author: '@ClockworkArtisan',
	preview: '',
	isPremium: false,
	isFeatured: true,
	badge: 'Skin of the Week',
	remixCount: 3420,
	downloadsCount: 12850,
	useBlur: false,
	useInnerShadows: false,
	useTextures: true,
	colors: {
		// Dark weathered copper & walnut chassis
		backgroundGradient: ['#1C140E', '#2B1D12', '#140E0A'],
		backgroundGradientStart: { x: 0, y: 0 },
		backgroundGradientEnd: { x: 0.6, y: 1 },

		// Brass riveted panel
		cardGradient: ['rgba(54, 38, 26, 0.85)', 'rgba(32, 22, 14, 0.95)'],
		cardBorderColor: 'rgba(218, 165, 32, 0.35)',
		cardBorderWidth: 1.5,

		// Mechanical text readout
		textPrimary: '#F5D061',
		textSecondary: '#D4AF37',
		textMuted: '#996515',
		textOnAccent: '#1A120B',

		// Warm antique gold accent
		accentGradient: ['#F5D061', '#C68B1C', '#8C6221'],
		accentPrimary: '#DAA520',
		accentSecondary: '#CD7F32',

		// Clockwork controls
		controlBackground: 'rgba(58, 42, 28, 0.8)',
		controlBackgroundActive: 'rgba(92, 66, 44, 0.95)',
		controlIcon: '#F5D061',

		// Mechanical bronze track
		progressTrack: 'rgba(20, 14, 9, 0.7)',
		progressFillGradient: ['#DAA520', '#F5D061'],

		// Tab Bar — dark polished brass deck
		tabBarBackground: '#16100B',
		tabBarActive: '#F5D061',
		tabBarInactive: '#8C6221',

		shadowColor: '#DAA520',
		divider: 'rgba(218, 165, 32, 0.2)',
		overlay: 'rgba(15, 10, 6, 0.75)',

		titleBarGradient: ['#3A2A1C', '#241910'],
		glowColor: '#DAA52055',
		innerPanelBackground: 'rgba(26, 18, 11, 0.7)',
		waveformGradient: ['#DAA520', '#F5D061'],
		playButtonGradient: ['#F5D061', '#C68B1C'],
		pauseButtonGradient: ['#CD7F32', '#8B4513'],
	},
	metrics: {
		borderRadiusLarge: 14,
		borderRadiusMedium: 10,
		borderRadiusSmall: 6,
		blurIntensity: 0,
		cardPadding: 16,
		shadowLight: {
			color: 'rgba(0, 0, 0, 0.4)',
			offset: { width: 0, height: 2 },
			opacity: 0.4,
			radius: 4,
			elevation: 3,
		},
		shadowMedium: {
			color: 'rgba(0, 0, 0, 0.6)',
			offset: { width: 0, height: 6 },
			opacity: 0.6,
			radius: 12,
			elevation: 8,
		},
		shadowHeavy: {
			color: 'rgba(0, 0, 0, 0.8)',
			offset: { width: 0, height: 10 },
			opacity: 0.8,
			radius: 20,
			elevation: 14,
		},
		shadowAccent: {
			color: 'rgba(218, 165, 32, 0.4)',
			offset: { width: 0, height: 0 },
			opacity: 0.8,
			radius: 14,
			elevation: 7,
		},
	},
	typography: {
		titleSize: 18,
		titleWeight: '700',
		bodySize: 14,
		bodyWeight: '500',
		captionSize: 12,
		captionWeight: '600',
		fontFamily: 'Rajdhani_600SemiBold',
		textShadowColor: 'rgba(0, 0, 0, 0.8)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	widgets: {
		volumeControl: 'steampunk-cog',
		artworkDisplay: 'vinyl',
		playButton: 'tactile-toggle',
		audioReactivity: {
			enabled: true,
			intensity: 'dynamic',
			target: 'wobble',
		},
	},
}
