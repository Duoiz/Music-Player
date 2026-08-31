import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withSequence,
	withTiming,
	withDelay,
	Easing,
} from 'react-native-reanimated'
import { useTheme } from './ThemeProvider'

interface ParticleProps {
	index: number
	color: string
}

function Particle({ index, color }: ParticleProps) {
	const translateY = useSharedValue(0)
	const translateX = useSharedValue(0)
	const opacity = useSharedValue(0.3)

	useEffect(() => {
		const duration = 5000 + index * 1200
		const delay = index * 400

		// Floating up and down
		translateY.value = withDelay(
			delay,
			withRepeat(
				withSequence(
					withTiming(-15, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
					withTiming(15, { duration: duration, easing: Easing.inOut(Easing.ease) }),
					withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
				),
				-1,
				true
			)
		)

		// Swaying left and right
		translateX.value = withDelay(
			delay,
			withRepeat(
				withSequence(
					withTiming(-8, { duration: duration / 2.5, easing: Easing.inOut(Easing.ease) }),
					withTiming(8, { duration: duration / 1.25, easing: Easing.inOut(Easing.ease) }),
					withTiming(0, { duration: duration / 2.5, easing: Easing.inOut(Easing.ease) })
				),
				-1,
				true
			)
		)

		// Pulsing opacity
		opacity.value = withDelay(
			delay,
			withRepeat(
				withSequence(
					withTiming(0.6, { duration: duration / 2 }),
					withTiming(0.3, { duration: duration / 2 })
				),
				-1,
				true
			)
		)
	}, [index])

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
		opacity: opacity.value,
	}))

	const size = index % 2 === 0 ? 8 : 5
	const left = 10 + index * 14
	const top = 20 + index * 11

	return (
		<Animated.View
			style={[
				styles.particle,
				{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: color,
					left: `${left}%`,
					top: `${top}%`,
					shadowColor: color,
				},
				animatedStyle,
			]}
		/>
	)
}

export function BackgroundParticles() {
	const theme = useTheme()
	
	// Only render for Frutiger Aero to save performance on other themes
	if (theme.id !== 'frutiger-aero') return null

	return (
		<>
			{[...Array(6)].map((_, i) => (
				<Particle key={i} index={i} color={theme.colors.glowColor || 'rgba(100,220,255,0.4)'} />
			))}
		</>
	)
}

const styles = StyleSheet.create({
	particle: {
		position: 'absolute',
		zIndex: 1,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.6,
		shadowRadius: 6,
		elevation: 4,
	},
})
