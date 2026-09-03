import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NativeModules, Platform } from 'react-native'
import TrackPlayer from 'react-native-track-player'
import type { EQBand } from '../types'
import { DEFAULT_EQ_BANDS, EQ_PRESETS, EQ_MIN_GAIN, EQ_MAX_GAIN } from '../constants/eqPresets'

const { TrackPlayerModule } = NativeModules

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

export const applyEQToPlayer = async (bands: EQBand[], enabled: boolean) => {
	if (Platform.OS !== 'android') return
	try {
		const gains = bands.map(b => b.gain)
		console.log(`[EQ] applyEQToPlayer enabled=${enabled}, gains=${JSON.stringify(gains)}`)
		
		// Direct native invocation is 100% reliable regardless of JS bundling export variations
		if (TrackPlayerModule?.setEqualizerEnabled) {
			await TrackPlayerModule.setEqualizerEnabled(enabled)
			if (enabled) {
				await TrackPlayerModule.setEqualizerBands(gains)
			}
		} else if (typeof (TrackPlayer as any)?.setEqualizerEnabled === 'function') {
			await (TrackPlayer as any).setEqualizerEnabled(enabled)
			if (enabled) {
				await (TrackPlayer as any).setEqualizerBands(gains)
			}
		} else {
			console.warn('[EQ] setEqualizerEnabled method not found on native module')
		}
	} catch (e: any) {
		console.warn('[EQ] applyEQToPlayer caught error:', e?.message || e)
	}
}

export const useEQStore = create<EQStore>()(
	persist(
		(set, get) => ({
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
				applyEQToPlayer(newBands, get().isEnabled)
			},

			applyPreset: (presetId) => {
				const preset = EQ_PRESETS.find((p) => p.id === presetId)
				if (!preset) return

				const newBands = get().bands.map((band, i) => ({
					...band,
					gain: preset.bands[i] ?? 0,
				}))
				set({ bands: newBands, activePreset: presetId })
				applyEQToPlayer(newBands, get().isEnabled)
			},

			resetEQ: () => {
				const newBands = [...DEFAULT_EQ_BANDS]
				set({
					bands: newBands,
					activePreset: 'flat',
				})
				applyEQToPlayer(newBands, get().isEnabled)
			},

			toggleEQ: () => {
				const newState = !get().isEnabled
				set({ isEnabled: newState })
				applyEQToPlayer(get().bands, newState)
			},
		}),
		{
			name: 'equalizer-storage',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
)
