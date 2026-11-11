import { useEffect } from 'react'
import {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withSequence,
	withTiming,
	Easing,
	cancelAnimation,
} from 'react-native-reanimated'
import { usePlayerStore } from '../stores/playerStore'
import { useEQStore } from '../stores/eqStore'
import type { ThemeAudioReactivityConfig } from '../types'

/**
 * High-performance, UI-thread audio-reactive hook.
 * Generates tempo-synced breathing, beat pumping, and mechanical gear wobbles
 * modulated by active EQ bass frequency gains.
 */
export function useAudioReactivity(config?: ThemeAudioReactivityConfig) {
	const isPlaying = usePlayerStore((s) => s.isPlaying)
	const bands = useEQStore((s) => s.bands)
	const isEQEnabled = useEQStore((s) => s.isEnabled)

	// Bass gain modulation (-12dB to +12dB)
	const bassGain = isEQEnabled && bands.length > 0 ? bands[0].gain : 0

	const glowVal = useSharedValue(0.25)
	const scaleVal = useSharedValue(1.0)
	const wobbleVal = useSharedValue(0)

	useEffect(() => {
		const enabled = config?.enabled ?? false

		if (!isPlaying || !enabled) {
			cancelAnimation(glowVal)
			cancelAnimation(scaleVal)
			cancelAnimation(wobbleVal)

			glowVal.value = withTiming(0.25, { duration: 300 })
			scaleVal.value = withTiming(1.0, { duration: 300 })
			wobbleVal.value = withTiming(0, { duration: 300 })
			return
		}

		// Calculate speed and intensity multipliers based on user config & bass boost
		const intensity = config?.intensity || 'dynamic'
		const bassMultiplier = Math.max(0.7, 1 + bassGain / 24) // 0.7x to 1.5x

		let baseDuration = 460 // ~130 BPM
		let maxScale = 1.045
		let maxGlow = 0.85
		let maxWobble = 2.5

		if (intensity === 'subtle') {
			baseDuration = 560
			maxScale = 1.025
			maxGlow = 0.55
			maxWobble = 1.2
		} else if (intensity === 'rave') {
			baseDuration = 380
			maxScale = 1.08
			maxGlow = 1.0
			maxWobble = 4.0
		}

		const scaledScale = 1 + (maxScale - 1) * bassMultiplier
		const scaledGlow = Math.min(1.0, maxGlow * bassMultiplier)
		const scaledWobble = maxWobble * bassMultiplier

		// Beat Pump Animation
		scaleVal.value = withRepeat(
			withSequence(
				withTiming(scaledScale, {
					duration: baseDuration * 0.35,
					easing: Easing.out(Easing.cubic),
				}),
				withTiming(1.0, {
					duration: baseDuration * 0.65,
					easing: Easing.inOut(Easing.quad),
				})
			),
			-1,
			false
		)

		// Ambient Aura Glow Pulse
		glowVal.value = withRepeat(
			withSequence(
				withTiming(scaledGlow, {
					duration: baseDuration * 0.4,
					easing: Easing.out(Easing.quad),
				}),
				withTiming(0.25, {
					duration: baseDuration * 0.6,
					easing: Easing.inOut(Easing.quad),
				})
			),
			-1,
			true
		)

		// Mechanical Gear Twitch / Dial Wobble
		wobbleVal.value = withRepeat(
			withSequence(
				withTiming(scaledWobble, {
					duration: baseDuration * 0.25,
					easing: Easing.out(Easing.back(1.5)),
				}),
				withTiming(-scaledWobble * 0.5, {
					duration: baseDuration * 0.3,
					easing: Easing.inOut(Easing.sin),
				}),
				withTiming(0, {
					duration: baseDuration * 0.45,
					easing: Easing.out(Easing.quad),
				})
			),
			-1,
			false
		)

		return () => {
			cancelAnimation(glowVal)
			cancelAnimation(scaleVal)
			cancelAnimation(wobbleVal)
		}
	}, [isPlaying, config?.enabled, config?.intensity, config?.target, bassGain])

	const glowAnimatedStyle = useAnimatedStyle(() => ({
		opacity: glowVal.value,
	}))

	const scaleAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scaleVal.value }],
	}))

	const wobbleAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${wobbleVal.value}deg` }],
	}))

	return {
		glowVal,
		scaleVal,
		wobbleVal,
		glowAnimatedStyle,
		scaleAnimatedStyle,
		wobbleAnimatedStyle,
	}
}
