import { useEffect } from 'react'
import {
	useSharedValue,
	useFrameCallback,
	SharedValue,
} from 'react-native-reanimated'
import { usePlayerStore } from '../stores/playerStore'
import { useEQStore } from '../stores/eqStore'
import { useSpectrumStore } from '../stores/spectrumStore'
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
	isRealAudio: SharedValue<boolean>
}

/**
 * High-performance UI-thread spectrum data source.
 * Supports:
 * 1. Synchronized real audio 16-band pre-analysis envelope from backend
 * 2. Direct hardware/native FFT feeds via `updateFromFFT(bandMagnitudes)`
 * 3. 60fps UI-thread acoustic physics simulator fallback when loading/offline
 */
export function useSpectrumData(
	barCount: number = 36,
	overrideConfig?: Partial<BeatPulseConfig>
): SpectrumDataResult {
	const currentTrack = usePlayerStore((s) => s.currentTrack)
	const isPlaying = usePlayerStore((s) => s.isPlaying)
	const position = usePlayerStore((s) => s.position)

	const bands = useEQStore((s) => s.bands)
	const isEQEnabled = useEQStore((s) => s.isEnabled)
	const storeConfig = useEQStore((s) => s.beatPulse)

	const currentEnvelope = useSpectrumStore((s) => s.currentEnvelope)
	const loadSpectrum = useSpectrumStore((s) => s.loadSpectrum)

	const config = {
		...storeConfig,
		...overrideConfig,
	}

	const magnitudes = useSharedValue<number[]>(new Array(barCount).fill(0))
	const lastNativeUpdate = useSharedValue<number>(0)
	const isPlayingShared = useSharedValue<boolean>(isPlaying)
	const barCountShared = useSharedValue<number>(barCount)
	const isRealAudio = useSharedValue<boolean>(false)

	// Shared values for continuous audio position interpolation at 60fps
	const audioPosition = useSharedValue<number>(0)
	const audioSyncTime = useSharedValue<number>(0)
	const hasEnvelope = useSharedValue<boolean>(false)
	const envelopeData = useSharedValue<number[]>([])
	const envelopeFps = useSharedValue<number>(20)
	const envelopeBands = useSharedValue<number>(16)

	// Preload spectrum whenever current track changes
	useEffect(() => {
		if (currentTrack?.id) {
			loadSpectrum(currentTrack.id)
		}
	}, [currentTrack?.id, loadSpectrum])

	// Sync playback state with UI-thread shared values
	useEffect(() => {
		isPlayingShared.value = isPlaying
	}, [isPlaying, isPlayingShared])

	// Track sub-millisecond continuous audio progress
	useEffect(() => {
		audioPosition.value = position
		audioSyncTime.value = Date.now()
	}, [position, audioPosition, audioSyncTime])

	// Upload decoded spectrum envelope to UI thread
	useEffect(() => {
		if (currentEnvelope && currentEnvelope.data.length > 0) {
			envelopeData.value = currentEnvelope.data
			envelopeFps.value = currentEnvelope.fps
			envelopeBands.value = currentEnvelope.bands
			hasEnvelope.value = true
		} else {
			hasEnvelope.value = false
			envelopeData.value = []
		}
	}, [currentEnvelope, envelopeData, envelopeFps, envelopeBands, hasEnvelope])

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

	// Worklet to accept raw native audio-tap FFT if provided
	const updateFromFFT = (bandMagnitudes: Float32Array | number[]) => {
		'worklet'
		const count = barCountShared.value
		const resampled = resampleBands(bandMagnitudes, count)
		magnitudes.value = resampled
		lastNativeUpdate.value = Date.now()
		isRealAudio.value = true
	}

	// 60fps UI-thread acoustic physics simulator & real audio pipeline
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

		const bassBoost = subBassGain.value
		const midBoost = midGain.value
		const highBoost = trebleGain.value
		const intensity = intensityMultiplier.value

		// ----------------------------------------------------
		// 1. REAL AUDIO SPECTRUM PIPELINE
		// ----------------------------------------------------
		if (hasEnvelope.value) {
			const elapsedSec = Math.max(0, (now - audioSyncTime.value) / 1000)
			const currentPosSec = audioPosition.value + elapsedSec

			const fps = envelopeFps.value
			const bandsCount = envelopeBands.value
			const frameIdx = Math.floor(currentPosSec * fps)
			const offset = frameIdx * bandsCount
			const data = envelopeData.value

			if (offset >= 0 && offset + bandsCount <= data.length) {
				isRealAudio.value = true
				const rawBands = new Array(bandsCount)
				for (let b = 0; b < bandsCount; b++) {
					rawBands[b] = (data[offset + b] ?? 0) / 255.0
				}

				const resampled = resampleBands(rawBands, count)

				for (let i = 0; i < count; i++) {
					const normIdx = i / count
					let boost = 1.0
					if (normIdx < 0.28) {
						boost = bassBoost
					} else if (normIdx < 0.7) {
						boost = midBoost
					} else {
						boost = highBoost
					}

					let targetMag = resampled[i] * boost * intensity
					targetMag = Math.max(0.04, Math.min(1.0, targetMag))

					const prev = current[i] ?? 0
					if (targetMag > prev) {
						next[i] = prev + (targetMag - prev) * 0.75
					} else {
						next[i] = prev * 0.86
					}
				}

				magnitudes.value = next
				return
			}
		}

		// ----------------------------------------------------
		// 2. SYNTHETIC SIMULATOR FALLBACK (loading or offline)
		// ----------------------------------------------------
		isRealAudio.value = false
		const t = frameInfo.timestamp / 1000 // seconds

		// Rhythmic base pulse (~128 BPM = 2.13 Hz)
		const beatPhase = t * 2.13 * Math.PI * 2
		const kick = Math.pow(Math.max(0, Math.sin(beatPhase)), 4) * 0.9 * bassBoost
		const snare = Math.pow(Math.max(0, Math.sin(beatPhase + Math.PI)), 3) * 0.65 * midBoost
		const hat = Math.pow(Math.max(0, Math.sin(beatPhase * 2)), 2) * 0.5 * highBoost

		for (let i = 0; i < count; i++) {
			const normIdx = i / count
			let targetMag = 0

			if (normIdx < 0.28) {
				const jitter = 0.8 + 0.2 * Math.sin(t * 12 + i * 2.5)
				targetMag = (kick * 0.75 + 0.25 * Math.sin(t * 8 + i * 1.5)) * bassBoost * jitter
			} else if (normIdx < 0.7) {
				const jitter = 0.75 + 0.25 * Math.cos(t * 15 + i * 3.1)
				targetMag = (snare * 0.6 + 0.3 * Math.sin(t * 11 + i * 2)) * midBoost * jitter
			} else {
				const jitter = 0.7 + 0.3 * Math.sin(t * 22 + i * 4.3)
				targetMag = (hat * 0.55 + 0.35 * Math.cos(t * 18 + i * 2.8)) * highBoost * jitter
			}

			targetMag = Math.max(0.04, Math.min(1.0, targetMag * intensity))

			const prev = current[i] ?? 0
			if (targetMag > prev) {
				next[i] = prev + (targetMag - prev) * 0.65
			} else {
				next[i] = prev * 0.87
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

	return { magnitudes, updateFromFFT, isRealAudio }
}
