import { create } from 'zustand'
import type { EQBand } from '../types'
import { DEFAULT_EQ_BANDS, EQ_PRESETS, EQ_MIN_GAIN, EQ_MAX_GAIN } from '../constants/eqPresets'

interface EQStore {
	// State
	bands: EQBand[]
	activePreset: string
	isEnabled: boolean

	// Actions
	setBandGain: (index: number, gain: number) => void
	applyPreset: (presetId: string) => void
	resetEQ: () => void
	toggleEQ: () => void
}

export const useEQStore = create<EQStore>((set, get) => ({
	bands: [...DEFAULT_EQ_BANDS],
	activePreset: 'flat',
	isEnabled: false,

	setBandGain: (index, gain) => {
		const clampedGain = Math.min(Math.max(gain, EQ_MIN_GAIN), EQ_MAX_GAIN)
		const newBands = [...get().bands]
		if (newBands[index]) {
			newBands[index] = { ...newBands[index], gain: clampedGain }
		}
		set({ bands: newBands, activePreset: 'custom' })
	},

	applyPreset: (presetId) => {
		const preset = EQ_PRESETS.find((p) => p.id === presetId)
		if (!preset) return

		const newBands = get().bands.map((band, i) => ({
			...band,
			gain: preset.bands[i] ?? 0,
		}))
		set({ bands: newBands, activePreset: presetId })
	},

	resetEQ: () => {
		set({
			bands: [...DEFAULT_EQ_BANDS],
			activePreset: 'flat',
		})
	},

	toggleEQ: () => {
		set((state) => ({ isEnabled: !state.isEnabled }))
	},
}))
