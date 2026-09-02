// ============================================================
// Core Music Types
// ============================================================

export interface Song {
	id: string
	title: string
	artist: string
	thumbnail: string
	duration: number // in seconds
	videoId: string
}

export interface Track {
	id: string
	url: string
	title: string
	artist: string
	artwork: string
	duration: number
}

export interface SearchResult {
	songs: Song[]
	query: string
	totalResults: number
}

export interface StreamInfo {
	streamUrl: string
	metadata: {
		title: string
		artist: string
		thumbnail: string
		duration: number
	}
}

// ============================================================
// Player Types
// ============================================================

export type RepeatMode = 'off' | 'one' | 'all'

export interface PlayerState {
	currentTrack: Track | null
	queue: Track[]
	isPlaying: boolean
	isLoading: boolean
	position: number
	duration: number
	buffered: number
	volume: number
	repeatMode: RepeatMode
	shuffleEnabled: boolean
}

export interface PlayerActions {
	play: (track?: Track) => Promise<void>
	pause: () => Promise<void>
	resume: () => Promise<void>
	next: () => Promise<void>
	previous: () => Promise<void>
	seekTo: (position: number) => Promise<void>
	setVolume: (volume: number) => Promise<void>
	addToQueue: (track: Track) => Promise<void>
	removeFromQueue: (index: number) => Promise<void>
	clearQueue: () => Promise<void>
	setRepeatMode: (mode: RepeatMode) => void
	toggleShuffle: () => void
	setPosition: (position: number) => void
	setDuration: (duration: number) => void
	setIsPlaying: (isPlaying: boolean) => void
	setIsLoading: (isLoading: boolean) => void
	setCurrentTrack: (track: Track | null) => void
}

// ============================================================
// Theme Types
// ============================================================

export interface ThemeColors {
	// Background
	backgroundGradient: string[]
	backgroundGradientStart: { x: number; y: number }
	backgroundGradientEnd: { x: number; y: number }

	// Glass / Card
	cardGradient: string[]
	cardBorderColor: string
	cardBorderWidth: number

	// Text
	textPrimary: string
	textSecondary: string
	textMuted: string
	textOnAccent: string

	// Accent
	accentGradient: string[]
	accentPrimary: string
	accentSecondary: string

	// Controls
	controlBackground: string
	controlBackgroundActive: string
	controlIcon: string

	// Progress / Sliders
	progressTrack: string
	progressFillGradient: string[]

	// Tab Bar
	tabBarBackground: string
	tabBarActive: string
	tabBarInactive: string

	// Misc
	shadowColor: string
	divider: string
	overlay: string

	// New optional tokens for Frutiger Aero reference design
	titleBarGradient?: string[]
	glowColor?: string
	innerPanelBackground?: string
	waveformGradient?: string[]
	playButtonGradient?: string[]
	pauseButtonGradient?: string[]
}

export interface ThemeShadow {
	color: string
	offset: { width: number; height: number }
	opacity: number
	radius: number
	elevation: number
}

export interface ThemeMetrics {
	borderRadiusLarge: number
	borderRadiusMedium: number
	borderRadiusSmall: number
	blurIntensity: number
	cardPadding: number
	shadowLight: ThemeShadow
	shadowMedium: ThemeShadow
	shadowHeavy: ThemeShadow
	shadowAccent: ThemeShadow
}

export interface ThemeTypography {
	titleSize: number
	titleWeight: '400' | '500' | '600' | '700' | '800' | '900'
	bodySize: number
	bodyWeight: '400' | '500' | '600' | '700'
	captionSize: number
	captionWeight: '400' | '500' | '600' | '700'
	fontFamily?: string
	textShadowColor?: string
	textShadowOffset?: { width: number; height: number }
	textShadowRadius?: number
}

export interface ThemeStyle {
	id: string
	name: string
	description: string
	author: string
	preview: string // preview image URL or asset
	isPremium: boolean
	colors: ThemeColors
	metrics: ThemeMetrics
	typography: ThemeTypography
	// Special rendering flags
	useBlur: boolean // whether to use BlurView
	useInnerShadows: boolean // for neomorphism
	useTextures: boolean // for skeuomorphism
}

// ============================================================
// EQ Types
// ============================================================

export interface EQBand {
	frequency: number // Hz
	gain: number // dB, typically -12 to +12
	label: string // e.g. "60Hz", "230Hz"
}

export interface EQPreset {
	id: string
	name: string
	icon: string
	bands: number[] // gain values for each band
}

export interface EQState {
	bands: EQBand[]
	activePreset: string
	isEnabled: boolean
	customBands: number[]
}

export interface EQActions {
	setBandGain: (index: number, gain: number) => void
	applyPreset: (presetId: string) => void
	resetEQ: () => void
	toggleEQ: () => void
	setCustomBands: (bands: number[]) => void
}

// ============================================================
// Theme Store Types
// ============================================================

export interface ThemeStoreState {
	activeThemeId: string
	isPremiumUser: boolean
	unlockedPremiumThemes: string[]
	availableThemes: ThemeStyle[]
}

export interface ThemeStoreActions {
	setTheme: (themeId: string) => void
	unlockPremium: () => void
	unlockTheme: (themeId: string) => void
	getActiveTheme: () => ThemeStyle
}

// ============================================================
// API Types
// ============================================================

export interface APIConfig {
	baseUrl: string
	timeout: number
}
