import React from 'react'
import { StyleSheet, View, ViewStyle, StyleProp, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface NeumorphicSurfaceProps {
	children?: React.ReactNode
	style?: StyleProp<ViewStyle>
	borderRadius?: number
	pressed?: boolean
	surfaceColor?: string
	lightShadowColor?: string
	darkShadowColor?: string
	elevation?: number
	highlightAlpha?: number
}

/**
 * Cross-platform dual-shadow Neumorphic surface.
 * Emits light highlight (top-left) and dark shadow (bottom-right).
 * On Android, augments elevation with a directional highlight gradient.
 */
export function NeumorphicSurface({
	children,
	style,
	borderRadius = 20,
	pressed = false,
	surfaceColor = '#E6E9F2',
	lightShadowColor = '#FFFFFF',
	darkShadowColor = '#A3B1C6',
	elevation = 6,
	highlightAlpha = 0.8,
}: NeumorphicSurfaceProps) {
	if (pressed) {
		// Inset / Concave pressed state
		return (
			<View
				style={[
					styles.pressedOuter,
					{
						borderRadius,
						backgroundColor: surfaceColor,
					},
					style,
				]}
			>
				{/* Inner inset shadow simulation */}
				<LinearGradient
					colors={['rgba(154, 167, 189, 0.45)', 'rgba(255, 255, 255, 0.25)']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={[StyleSheet.absoluteFill, { borderRadius, opacity: 0.9 }]}
				/>
				<View style={[styles.innerContent, { borderRadius, backgroundColor: 'transparent' }]}>
					{children}
				</View>
			</View>
		)
	}

	// Raised / Convex state
	return (
		<View
			style={[
				styles.darkShadow,
				{
					borderRadius,
					shadowColor: darkShadowColor,
					elevation,
				},
				style,
			]}
		>
			<View
				style={[
					styles.lightShadow,
					{
						borderRadius,
						shadowColor: lightShadowColor,
					},
				]}
			>
				<View
					style={[
						styles.surface,
						{
							borderRadius,
							backgroundColor: surfaceColor,
						},
					]}
				>
					{/* Android specular highlight fallback */}
					{Platform.OS === 'android' && (
						<LinearGradient
							colors={[`rgba(255, 255, 255, ${highlightAlpha})`, 'transparent']}
							start={{ x: 0, y: 0 }}
							end={{ x: 0.6, y: 0.6 }}
							style={[
								StyleSheet.absoluteFill,
								{
									borderRadius,
									borderTopWidth: 1.5,
									borderLeftWidth: 1.5,
									borderColor: 'rgba(255, 255, 255, 0.85)',
									borderBottomWidth: 1,
									borderRightWidth: 1,
									borderBottomColor: 'rgba(154, 167, 189, 0.3)',
									borderRightColor: 'rgba(154, 167, 189, 0.3)',
								},
							]}
							pointerEvents="none"
						/>
					)}
					{children}
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	darkShadow: {
		...Platform.select({
			ios: {
				shadowOffset: { width: 6, height: 6 },
				shadowOpacity: 0.6,
				shadowRadius: 10,
			},
			android: {},
		}),
	},
	lightShadow: {
		...Platform.select({
			ios: {
				shadowOffset: { width: -6, height: -6 },
				shadowOpacity: 0.95,
				shadowRadius: 10,
			},
			android: {},
		}),
	},
	surface: {
		overflow: 'hidden',
		position: 'relative',
	},
	pressedOuter: {
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(154, 167, 189, 0.4)',
	},
	innerContent: {
		justifyContent: 'center',
		alignItems: 'center',
	},
})
