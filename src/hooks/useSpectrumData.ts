import { useEffect } from 'react'
import {
	useSharedValue,
	useFrameCallback,
	SharedValue,
} from 'react-native-reanimated'
import { usePlayerStore } from '../stores/playerStore'
import { useEQStore } from '../stores/eqStore'
import type { BeatPulseConfig } from '../types'

export function resampleBands(bands: Float32Array | number[], targetCount: number): number[] {
	'worklet'
	const result = new Array(targetCount).fill(0)
	const bucketSize = bands.length / targetCount
	for (let i = 0; i < targetCount; i++) {
		let sum = 0
		const start = Math.floor(i * bucketSize)
		const end = Math.floor((i + 1) * bucketSize)
		for (let j = start; j < end; j++) {
			sum += bands[j] ?? 0
		}
		result[i] = sum / (end - start || 1)
	}
	return result
}

export interface SpectrumDataResult {
	magnitudes: SharedValue<number[]>
	updateFromFFT: (bandMagnitudes: Float32Array | number[]) => void
}

/**
 * High-performance UI-thread spectrum data source.
 * Supports:
 * 1. Direct hardware/native FFT feeds via `updateFromFFT(bandMagnitudes)`
 * 2. 60fps UI-thread acoustic physics simulator driven by playback state & active 5-band EQ gains
 */
export function useSpectrumData(
	barCount: number = 36,
	overrideConfig?: Partial<BeatPulseConfig>
): SpectrumDataResult {
	const isPlaying = usePlayerStore((s) => s.isPlaying)
	const bands = useEQStore((s) => s.bands)
	const isEQEnabled = useEQStore((s) => s.isEnabled)
	const storeConfig = useEQStore((s) => s.beatPulse)

	const config = {
		...storeConfig,
		...overrideConfig,
	}

	const magnitudes = useSharedValue<number[]>(new Array(barCount).fill(0))
	const lastNativeUpdate = useSharedValue<number>(0)
	const isPlayingShared = useSharedValue<boolean>(isPlaying)
	const barCountShared = useSharedValue<number>(barCount)

	// Keep shared values in sync with React state
	useEffect(() => {
		isPlayingShared.value = isPlaying
	}, [isPlaying, isPlayingShared])

	useEffect(() => {
		barCountShared.value = barCount
		if (magnitudes.value.length !== barCount) {
			magnitudes.value = new Array(barCount).fill(0)
		}
	}, [barCount, barCountShared, magnitudes])

	// EQ Gain multipliers mapped to 3 frequency zones
	const subBassGain = useSharedValue(1.0)
	const midGain = useSharedValue(1.0)
	const trebleGain = useSharedValue(1.0)
	const intensityMultiplier = useSharedValue(1.0)

	useEffect(() => {
		const mult =
			config.intensity === 'chill'
				? 0.65
				: config.intensity === 'beast'
				? 1.35
				: config.intensity === 'overdrive' || config.intensity === 'hellcat'
				? 1.6
				: 1.0
		intensityMultiplier.value = mult
	}, [config.intensity, intensityMultiplier])

	useEffect(() => {
		if (isEQEnabled && bands && bands.length >= 5) {
			subBassGain.value = Math.max(0.4, 1 + (bands[0]?.gain ?? 0) / 14)
			midGain.value = Math.max(0.4, 1 + (((bands[1]?.gain ?? 0) + (bands[2]?.gain ?? 0)) / 2) / 14)
			trebleGain.value = Math.max(0.4, 1 + (((bands[3]?.gain ?? 0) + (bands[4]?.gain ?? 0)) / 2) / 14)
		} else {
			subBassGain.value = 1.0
			midGain.value = 1.0
			trebleGain.value = 1.0
		}
	}, [bands, isEQEnabled, subBassGain, midGain, trebleGain])

	// Worklet to accept raw native audio-tap FFT
	const updateFromFFT = (bandMagnitudes: Float32Array | number[]) => {
		'worklet'
		const count = barCountShared.value
		const resampled = resampleBands(bandMagnitudes, count)
		magnitudes.value = resampled
		lastNativeUpdate.value = Date.now()
	}

	// 60fps UI-thread acoustic physics simulator (active when no external native FFT is streaming)
	const frameCallback = useFrameCallback((frameInfo) => {
		'worklet'
		const now = Date.now()
		// If native FFT is actively pumping within last 250ms, yield to real native data
		if (now - lastNativeUpdate.value < 250) {
			return
		}

		const count = barCountShared.value
		const current = magnitudes.value
		const next = new Array(count).fill(0)
		const active = isPlayingShared.value

		if (!active) {
			// Decay smoothly to zero when paused
			let hasEnergy = false
			for (let i = 0; i < count; i++) {
				const v = (current[i] ?? 0) * 0.88
				next[i] = v < 0.005 ? 0 : v
				if (next[i] > 0) hasEnergy = true
			}
			if (hasEnergy || current.some((v) => v > 0)) {
				magnitudes.value = next
			}
			return
		}

		const t = frameInfo.timestamp / 1000 // seconds
		const bassBoost = subBassGain.value
		const midBoost = midGain.value
		const highBoost = trebleGain.value

		// Rhythmic base pulse (~128 BPM = 2.13 Hz)
		const beatPhase = (t * 2.13 * Math.PI * 2)
		const kick = Math.pow(Math.max(0, Math.sin(beatPhase)), 4) * 0.9 * bassBoost
		const snare = Math.pow(Math.max(0, Math.sin(beatPhase + Math.PI)), 3) * 0.65 * midBoost
		const hat = Math.pow(Math.max(0, Math.sin(beatPhase * 2)), 2) * 0.5 * highBoost

		for (let i = 0; i < count; i++) {
			const normIdx = i / count // 0 to 1
			let targetMag = 0

			// Frequency zone weighting with harmonic micro-jitter
			if (normIdx < 0.28) {
				// Sub & bass
				const jitter = 0.8 + 0.2 * Math.sin(t * 12 + i * 2.5)
				targetMag = (kick * 0.75 + 0.25 * Math.sin(t * 8 + i * 1.5)) * bassBoost * jitter
			} else if (normIdx < 0.7) {
				// Mids & vocals
				const jitter = 0.75 + 0.25 * Math.cos(t * 15 + i * 3.1)
				targetMag = (snare * 0.6 + 0.3 * Math.sin(t * 11 + i * 2)) * midBoost * jitter
			} else {
				// Highs / cymbals
				const jitter = 0.7 + 0.3 * Math.sin(t * 22 + i * 4.3)
				targetMag = (hat * 0.55 + 0.35 * Math.cos(t * 18 + i * 2.8)) * highBoost * jitter
			}

			// Clamp 0 to 1 with active intensity scale
			targetMag = Math.max(0.04, Math.min(1.0, targetMag * intensityMultiplier.value))

			// Studio peak decay physics (snappy attack, exponential gravity decay)
			const prev = current[i] ?? 0
			if (targetMag > prev) {
				next[i] = prev + (targetMag - prev) * 0.65 // attack
			} else {
				next[i] = prev * 0.87 // decay
			}
		}

		magnitudes.value = next
	}, true)

	// Clean up frame callback on unmount
	useEffect(() => {
		return () => {
			frameCallback.setActive(false)
		}
	}, [frameCallback])

	return { magnitudes, updateFromFFT }
}
