import type { EQPreset } from '../types'

/**
 * 5-band EQ frequency labels.
 * Matches standard frequency bands for a consumer-grade equalizer.
 */
export const EQ_FREQUENCIES = [60, 230, 910, 3600, 14000] as const

export const EQ_FREQUENCY_LABELS = ['60Hz', '230Hz', '910Hz', '3.6kHz', '14kHz'] as const

/**
 * Gain range: -12dB to +12dB
 */
export const EQ_MIN_GAIN = -12
export const EQ_MAX_GAIN = 12

/**
 * Preset definitions.
 * Each preset provides gain values for the 5 frequency bands in order:
 * [60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz]
 */
export const EQ_PRESETS: EQPreset[] = [
	{
		id: 'flat',
		name: 'Flat',
		icon: '📊',
		bands: [0, 0, 0, 0, 0],
	},
	{
		id: 'bass_boost',
		name: 'Bass Boost',
		icon: '🔊',
		bands: [6, 4, 0, -1, 1],
	},
	{
		id: 'vocal',
		name: 'Vocal',
		icon: '🎤',
		bands: [-2, 0, 3, 4, 1],
	},
	{
		id: 'rock',
		name: 'Rock',
		icon: '🎸',
		bands: [4, 2, -1, 3, 5],
	},
	{
		id: 'electronic',
		name: 'Electronic',
		icon: '🎹',
		bands: [5, 3, 0, 2, 4],
	},
	{
		id: 'jazz',
		name: 'Jazz',
		icon: '🎷',
		bands: [3, 1, -1, 2, 3],
	},
	{
		id: 'classical',
		name: 'Classical',
		icon: '🎻',
		bands: [0, 0, 0, 2, 4],
	},
	{
		id: 'pop',
		name: 'Pop',
		icon: '🎵',
		bands: [-1, 2, 4, 2, -1],
	},
	{
		id: 'custom',
		name: 'Custom',
		icon: '⚙️',
		bands: [0, 0, 0, 0, 0],
	},
]

/**
 * Default bands configuration.
 */
export const DEFAULT_EQ_BANDS = EQ_FREQUENCIES.map((freq, i) => ({
	frequency: freq,
	gain: 0,
	label: EQ_FREQUENCY_LABELS[i],
}))
