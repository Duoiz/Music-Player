import React, { useState } from 'react'
import { StyleSheet, Pressable, Platform, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

interface NeumorphicPlayButtonProps {
	isPlaying: boolean
	onPress: () => void
	size?: number
	accentColor?: string
	themeId?: string
}

/**
 * Tactile Neumorphic / Skeuomorphic Play/Pause Button.
 * Features an extruded surface that visibly depresses into an inset well on press.
 */
export function NeumorphicPlayButton({
	isPlaying,
	onPress,
	size = 76,
	accentColor = '#FF5A5F',
	themeId = 'neomorphism',
}: NeumorphicPlayButtonProps) {
	const [isPressed, setIsPressed] = useState(false)

	const isNeumorphic = themeId === 'neomorphism'
	const isSkeuo = themeId === 'skeuomorphism'

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: withTiming(isPressed ? 0.94 : 1.0, { duration: 160 }) }],
	}))

	return (
		<Pressable
			onPressIn={() => setIsPressed(true)}
			onPressOut={() => setIsPressed(false)}
			onPress={onPress}
			style={styles.pressable}
			accessibilityRole="button"
			accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
		>
			<Animated.View style={[{ width: size, height: size }, animatedStyle]}>
				{isPressed ? (
					// Inset Pressed State
					<View
						style={[
							styles.pressedWell,
							{
								borderRadius: size / 2,
								backgroundColor: isNeumorphic ? '#DCE0EB' : '#1C1C20',
								borderColor: isNeumorphic ? 'rgba(154, 167, 189, 0.5)' : '#121214',
							},
						]}
					>
						<LinearGradient
							colors={
								isNeumorphic
									? ['rgba(154, 167, 189, 0.55)', 'rgba(255, 255, 255, 0.3)']
									: ['rgba(0, 0, 0, 0.8)', 'rgba(255, 255, 255, 0.08)']
							}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
						/>
						<Ionicons
							name={isPlaying ? 'pause' : 'play'}
							size={size * 0.44}
							color={accentColor}
							style={!isPlaying ? styles.playIconOffset : undefined}
						/>
					</View>
				) : (
					// Raised Extruded State
					<View
						style={[
							styles.raisedDark,
							{
								borderRadius: size / 2,
								shadowColor: isNeumorphic ? '#A3B1C6' : '#000000',
							},
						]}
					>
						<View
							style={[
								styles.raisedLight,
								{
									borderRadius: size / 2,
									shadowColor: isNeumorphic ? '#FFFFFF' : 'rgba(255, 255, 255, 0.25)',
								},
							]}
						>
							<LinearGradient
								colors={
									isNeumorphic
										? ['#FFFFFF', '#E6E9F2', '#DCE0EB']
										: ['#444448', '#2E2E32', '#202024']
								}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={[
									styles.raisedCap,
									{
										borderRadius: size / 2,
										borderColor: isNeumorphic
											? 'rgba(255, 255, 255, 0.9)'
											: 'rgba(255, 255, 255, 0.2)',
									},
								]}
							>
								{/* Android Highlight Bezel */}
								{Platform.OS === 'android' && (
									<LinearGradient
										colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
										start={{ x: 0, y: 0 }}
										end={{ x: 0.5, y: 0.5 }}
										style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
										pointerEvents="none"
									/>
								)}
								<Ionicons
									name={isPlaying ? 'pause' : 'play'}
									size={size * 0.44}
									color={accentColor}
									style={!isPlaying ? styles.playIconOffset : undefined}
								/>
							</LinearGradient>
						</View>
					</View>
				)}
			</Animated.View>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	pressable: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	playIconOffset: {
		marginLeft: 3,
	},
	raisedDark: {
		width: '100%',
		height: '100%',
		...Platform.select({
			ios: {
				shadowOffset: { width: 6, height: 6 },
				shadowOpacity: 0.55,
				shadowRadius: 10,
			},
			android: { elevation: 8 },
		}),
	},
	raisedLight: {
		width: '100%',
		height: '100%',
		...Platform.select({
			ios: {
				shadowOffset: { width: -5, height: -5 },
				shadowOpacity: 0.9,
				shadowRadius: 8,
			},
			android: {},
		}),
	},
	raisedCap: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1.5,
	},
	pressedWell: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1.5,
		overflow: 'hidden',
	},
})
