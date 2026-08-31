import React from 'react'
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

interface AnimatedButtonProps extends PressableProps {
	children: React.ReactNode
	style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>)
	activeScale?: number
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * A button component that scales down fluidly when pressed,
 * simulating a liquid/squishy glass interface.
 */
export function AnimatedButton({ children, style, activeScale = 0.92, ...rest }: AnimatedButtonProps) {
	const scale = useSharedValue(1)

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: scale.value }],
		}
	})

	return (
		<AnimatedPressable
			{...rest}
			onPressIn={(e) => {
				scale.value = withSpring(activeScale, { damping: 12, stiffness: 200 })
				if (rest.onPressIn) rest.onPressIn(e)
			}}
			onPressOut={(e) => {
				scale.value = withSpring(1, { damping: 10, stiffness: 200 })
				if (rest.onPressOut) rest.onPressOut(e)
			}}
			style={(state) => [
				typeof style === 'function' ? style(state) : style,
				animatedStyle,
			]}
		>
			{children}
		</AnimatedPressable>
	)
}
