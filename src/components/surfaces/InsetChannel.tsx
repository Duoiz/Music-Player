import React from 'react'
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface InsetChannelProps {
	children?: React.ReactNode
	style?: StyleProp<ViewStyle>
	borderRadius?: number
	baseColor?: string
	depthOpacity?: number
}

/**
 * Inset carved-in channel component for scrubbers, sliders, and vertical EQ wells.
 * Casts a concave inner shadow inward from the edges.
 */
export function InsetChannel({
	children,
	style,
	borderRadius = 10,
	baseColor = '#DCE0EB',
	depthOpacity = 0.5,
}: InsetChannelProps) {
	return (
		<View
			style={[
				styles.container,
				{
					borderRadius,
					backgroundColor: baseColor,
				},
				style,
			]}
		>
			{/* Top-left dark inset shadow */}
			<LinearGradient
				colors={[`rgba(154, 167, 189, ${depthOpacity})`, 'transparent']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={[styles.topInset, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]}
				pointerEvents="none"
			/>
			{/* Bottom-right light reflection */}
			<LinearGradient
				colors={['transparent', 'rgba(255, 255, 255, 0.6)']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={[styles.bottomInset, { borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }]}
				pointerEvents="none"
			/>
			{children}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(154, 167, 189, 0.35)',
		position: 'relative',
	},
	topInset: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 6,
	},
	bottomInset: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 6,
	},
})
