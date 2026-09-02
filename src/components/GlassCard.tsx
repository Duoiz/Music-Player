import React, { useEffect } from 'react'
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated'
import { useTheme } from './ThemeProvider'

interface GlassCardProps {
	children: React.ReactNode
	style?: StyleProp<ViewStyle>
	intensity?: 'light' | 'medium' | 'heavy'
	variant?: 'default' | 'dark'
}

/**
 * Reusable glass-effect card component.
 *
 * Renders differently based on the active theme:
 * - Fruitiger Aero / Liquid Glass / Midnight Aero / RetroWave: BlurView + gradient overlay + border
 * - Neomorphism: Solid bg with dual shadows (no blur)
 * - Skeuomorphism: Solid metallic bg with textured border (no blur)
 */
export function GlassCard({ children, style, intensity = 'medium', variant = 'default' }: GlassCardProps) {
	const theme = useTheme()
	const shadow = intensity === 'light'
		? theme.metrics.shadowLight
		: intensity === 'heavy'
			? theme.metrics.shadowHeavy
			: theme.metrics.shadowMedium

	const containerStyle: ViewStyle = {
		borderRadius: theme.metrics.borderRadiusLarge,
		overflow: 'hidden' as const,
		shadowColor: shadow.color,
		shadowOffset: shadow.offset,
		shadowOpacity: shadow.opacity,
		shadowRadius: shadow.radius,
		elevation: shadow.elevation,
	}

	// Fluid animation for liquid-glass theme reflection
	const fluidOpacity = useSharedValue(0.6)
	
	useEffect(() => {
		if (theme.id === 'liquid-glass') {
			fluidOpacity.value = withRepeat(
				withSequence(
					withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
					withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) })
				),
				-1,
				true
			)
		}
	}, [theme.id])

	const fluidStyle = useAnimatedStyle(() => ({
		opacity: fluidOpacity.value,
	}))

	// For themes that use blur (glass effect)
	if (theme.useBlur) {
		return (
			<View style={[containerStyle, style]}>
				<BlurView intensity={theme.metrics.blurIntensity} style={styles.fill}>
					<LinearGradient
						colors={
							variant === 'dark' && theme.colors.innerPanelBackground
								? [theme.colors.innerPanelBackground, theme.colors.innerPanelBackground]
								: (theme.colors.cardGradient as [string, string, ...string[]])
						}
						start={{ x: 0, y: 0 }}
						end={{ x: 0, y: 1 }}
						style={[
							styles.fill,
							{
								borderRadius: theme.metrics.borderRadiusLarge,
								padding: theme.metrics.cardPadding,
								borderWidth: theme.colors.cardBorderWidth,
								borderColor: theme.colors.cardBorderColor,
								overflow: 'hidden',
							},
						]}
					>
						{/* Glossy top sheen (Frutiger Aero specific) */}
						{theme.id === 'frutiger-aero' && variant !== 'dark' && (
							<LinearGradient
								colors={['rgba(255,255,255,0.25)', 'transparent']}
								start={{ x: 0, y: 0 }}
								end={{ x: 0, y: 1 }}
								style={StyleSheet.absoluteFillObject}
								pointerEvents="none"
							/>
						)}
						{/* Inner Top Shadow for dark panels */}
						{theme.id === 'frutiger-aero' && variant === 'dark' && (
							<View
								style={[
									StyleSheet.absoluteFillObject,
									{
										borderTopWidth: 1,
										borderTopColor: 'rgba(0,0,0,0.4)',
										borderLeftWidth: 1,
										borderLeftColor: 'rgba(0,0,0,0.2)',
									},
								]}
								pointerEvents="none"
							/>
						)}
						{/* Liquid Glass Fluid Reflection */}
						{theme.id === 'liquid-glass' && (
							<Animated.View style={[StyleSheet.absoluteFillObject, fluidStyle]} pointerEvents="none">
								<LinearGradient
									colors={['rgba(255,255,255,0.5)', 'transparent', 'rgba(255,255,255,0.15)']}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
									style={StyleSheet.absoluteFillObject}
								/>
							</Animated.View>
						)}
						{children}
					</LinearGradient>
				</BlurView>
			</View>
		)
	}

	// For neomorphism — solid background with dual shadows
	if (theme.useInnerShadows) {
		return (
			<View
				style={[
					containerStyle,
					{
						backgroundColor: theme.colors.cardGradient[0],
						padding: theme.metrics.cardPadding,
						borderRadius: theme.metrics.borderRadiusLarge,
					},
					style,
				]}
			>
				{children}
			</View>
		)
	}

	// For skeuomorphism / fallback — solid gradient with border
	return (
		<LinearGradient
			colors={theme.colors.cardGradient as [string, string, ...string[]]}
			start={{ x: 0, y: 0 }}
			end={{ x: 0, y: 1 }}
			style={[
				containerStyle,
				{
					padding: theme.metrics.cardPadding,
					borderWidth: theme.colors.cardBorderWidth,
					borderColor: theme.colors.cardBorderColor,
				},
				style,
			]}
		>
			{children}
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	fill: {
		width: '100%',
	},
})
