import { useEffect } from 'react'
import {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withSequence,
	withTiming,
	Easing,
	cancelAnimation,
	interpolate,
} from 'react-native-reanimated'
import { usePlayerStore } from '../stores/playerStore'
import { useEQStore } from '../stores/eqStore'
import type { BeatPulseConfig } from '../types'

/**
 * High-performance UI-thread hook for dynamic audio-reactive beat pulsing.
 * Generates tempo-synced flank expansion, core glow bursts, and VU meter segment heights
 * heavily modulated by active EQ frequency band gains.
 */
export function useBeatPulseReactivity(overrideConfig?: Partial<BeatPulseConfig>) {
	const isPlaying = usePlayerStore((s) => s.isPlaying)
	const bands = useEQStore((s) => s.bands)
	const isEQEnabled = useEQStore((s) => s.isEnabled)
	const storeConfig = useEQStore((s) => s.beatPulse)

	const config: BeatPulseConfig = {
		...storeConfig,
		...overrideConfig,
	}

	// Calculate reactive EQ frequency gain based on trigger configuration
	let targetGain = 0
	if (isEQEnabled && bands && bands.length > 0) {
		if (config.trigger === 'sub-bass') {
			targetGain = bands[0]?.gain ?? 0 // 60Hz
		} else if (config.trigger === 'mid-punch') {
			targetGain = ((bands[1]?.gain ?? 0) + (bands[2]?.gain ?? 0)) / 2 // 230Hz & 910Hz
		} else {
			// full-range: average across all 5 bands
			targetGain = bands.reduce((sum, b) => sum + b.gain, 0) / bands.length
		}
	}

	// EQ Gain multiplier (-12dB = 0.6x, 0dB = 1.0x, +12dB = 1.65x)
	const gainMultiplier = Math.max(0.55, 1 + targetGain / 18)

	// Intensity configuration
	let intensityMultiplier = 1.0
	let baseDuration = 440 // ~136 BPM rhythm
	let restingWidth = 10
	let peakWidth = 52
	let peakOpacity = 0.85
	let restingOpacity = 0.18

	if (config.intensity === 'chill') {
		intensityMultiplier = 0.6
		baseDuration = 520
		restingWidth = 6
		peakWidth = 32
		peakOpacity = 0.6
		restingOpacity = 0.12
	} else if (config.intensity === 'beast') {
		intensityMultiplier = 1.35
		baseDuration = 410
		restingWidth = 12
		peakWidth = 65
		peakOpacity = 0.95
		restingOpacity = 0.22
	} else if (config.intensity === 'overdrive' || config.intensity === 'hellcat') {
		intensityMultiplier = 1.65
		baseDuration = 390
		restingWidth = 14
		peakWidth = 80
		peakOpacity = 1.0
		restingOpacity = 0.28
	}

	const computedPeakWidth = Math.min(110, peakWidth * gainMultiplier * (intensityMultiplier >= 1.5 ? 1.25 : 1.0))
	const computedPeakOpacity = Math.min(1.0, peakOpacity * (gainMultiplier > 1.2 ? 1.0 : gainMultiplier))

	// Animated values on UI Thread
	const pulseVal = useSharedValue(0)
	const flareVal = useSharedValue(1)

	useEffect(() => {
		const isEnabled = config.enabled && config.type !== 'off'

		if (!isPlaying || !isEnabled) {
			cancelAnimation(pulseVal)
			cancelAnimation(flareVal)
			pulseVal.value = withTiming(0, { duration: 250 })
			flareVal.value = withTiming(1, { duration: 250 })
			return
		}

		// Snappy beat attack with smooth exponential decay (like a studio compressor / limiter)
		pulseVal.value = withRepeat(
			withSequence(
				withTiming(1, {
					duration: baseDuration * 0.22,
					easing: Easing.out(Easing.cubic),
				}),
				withTiming(0, {
					duration: baseDuration * 0.78,
					easing: Easing.out(Easing.quad),
				})
			),
			-1,
			false
		)

		flareVal.value = withRepeat(
			withSequence(
				withTiming(1.35 * gainMultiplier, {
					duration: baseDuration * 0.24,
					easing: Easing.out(Easing.back(1.8)),
				}),
				withTiming(1.0, {
					duration: baseDuration * 0.76,
					easing: Easing.inOut(Easing.quad),
				})
			),
			-1,
			false
		)

		return () => {
			cancelAnimation(pulseVal)
			cancelAnimation(flareVal)
		}
	}, [
		isPlaying,
		config.enabled,
		config.type,
		config.intensity,
		config.trigger,
		targetGain,
		gainMultiplier,
		baseDuration,
	])

	// Left flank animated style (interpolates width & opacity)
	const leftFlankStyle = useAnimatedStyle(() => {
		const width = interpolate(pulseVal.value, [0, 1], [restingWidth, computedPeakWidth])
		const opacity = interpolate(pulseVal.value, [0, 1], [restingOpacity, computedPeakOpacity])
		return {
			width,
			opacity,
		}
	})

	// Right flank animated style
	const rightFlankStyle = useAnimatedStyle(() => {
		const width = interpolate(pulseVal.value, [0, 1], [restingWidth, computedPeakWidth])
		const opacity = interpolate(pulseVal.value, [0, 1], [restingOpacity, computedPeakOpacity])
		return {
			width,
			opacity,
		}
	})

	// Mid-height flare scale & opacity for side flanks
	const flareAnimatedStyle = useAnimatedStyle(() => {
		const scale = interpolate(pulseVal.value, [0, 1], [0.85, 1.4 * (flareVal.value || 1)])
		const opacity = interpolate(pulseVal.value, [0, 1], [0.15, 0.95 * computedPeakOpacity])
		return {
			transform: [{ scaleY: scale }, { scaleX: Math.min(2.0, scale * 1.1) }],
			opacity,
		}
	})

	// Shockwave pulse style
	const shockwaveAnimatedStyle = useAnimatedStyle(() => {
		const scale = interpolate(pulseVal.value, [0, 1], [0.9, 1.9])
		const opacity = interpolate(pulseVal.value, [0, 0.4, 1], [0, computedPeakOpacity * 0.8, 0])
		return {
			transform: [{ scale }],
			opacity,
		}
	})

	return {
		pulseVal,
		flareVal,
		leftFlankStyle,
		rightFlankStyle,
		flareAnimatedStyle,
		shockwaveAnimatedStyle,
		config,
		computedPeakWidth,
		gainMultiplier,
		intensityMultiplier,
		computedPeakOpacity,
	}
}
