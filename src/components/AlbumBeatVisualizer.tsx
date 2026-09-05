import React, { useMemo } from 'react'
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native'
import Animated, {
	useAnimatedStyle,
	interpolate,
	SharedValue,
} from 'react-native-reanimated'
import { useTheme } from './ThemeProvider'
import { useBeatPulseReactivity } from '../hooks/useBeatPulseReactivity'
import { getBeatPulsePalette } from './SideBeatPulse'
import type { BeatPulseConfig } from '../types'

export interface AlbumBeatVisualizerProps {
	albumWidth: number
	albumHeight: number
	albumBorderRadius?: number
	artworkColor?: string
	isCircle?: boolean
	overrideConfig?: Partial<BeatPulseConfig>
	style?: StyleProp<ViewStyle>
	// Backwards compatibility fallback prop
	size?: number
}

// 32 radial bars for dense, buttery smooth 60fps circular audio spectrum
const CIRCLE_BAR_COUNT = 32

// Frequency curve multipliers to simulate authentic audio spectrum physics
const FREQ_FACTORS = Array.from({ length: CIRCLE_BAR_COUNT }).map((_, i) => {
	const angle = (i * (360 / CIRCLE_BAR_COUNT) * Math.PI) / 180
	const bassInfluence = Math.pow(Math.abs(Math.sin(angle)), 1.35)
	const harmonicJitter = 0.65 + 0.35 * Math.sin(i * 2.1)
	return 0.4 + 0.6 * bassInfluence * harmonicJitter
})

/**
 * Individual radiating bar for the 360-degree circular visualizer.
 * Uses 100% GPU-accelerated transform scaling (no native layout passes).
 */
const RadialSpectrumBar = React.memo(function RadialSpectrumBar({
	index,
	albumW,
	albumH,
	pulseVal,
	gainMultiplier,
	intensityMultiplier,
	color,
	glowColor,
	barWidth,
	maxBarHeight,
}: {
	index: number
	albumW: number
	albumH: number
	pulseVal: SharedValue<number>
	gainMultiplier: number
	intensityMultiplier: number
	color: string
	glowColor: string
	barWidth: number
	maxBarHeight: number
}) {
	const angleDeg = index * (360 / CIRCLE_BAR_COUNT)
	const factor = FREQ_FACTORS[index] || 0.7
	const radius = Math.min(albumW, albumH) / 2

	const animStyle = useAnimatedStyle(() => {
		const peakScale = factor * gainMultiplier * (intensityMultiplier >= 1.5 ? 1.3 : 1.0)
		const scaleY = interpolate(pulseVal.value, [0, 1], [0.15, Math.max(0.25, peakScale)])
		const opacity = interpolate(pulseVal.value, [0, 1], [0.35, 0.95])

		return {
			opacity,
			transform: [
				{ rotate: `${angleDeg}deg` },
				{ translateY: -radius - maxBarHeight / 2 },
				{ scaleY },
			],
		}
	})

	return (
		<Animated.View
			style={[
				styles.radialBar,
				{
					left: albumW / 2 - barWidth / 2,
					top: albumH / 2 - maxBarHeight / 2,
					width: barWidth,
					height: maxBarHeight,
					backgroundColor: color,
					shadowColor: glowColor,
				},
				animStyle,
			]}
		/>
	)
})

/**
 * Single perpendicular bar for rectangular album card edges.
 * Uses 100% GPU-accelerated scale transforms anchored to card perimeter.
 */
const PerimeterEdgeBar = React.memo(function PerimeterEdgeBar({
	side,
	index,
	total,
	albumW,
	albumH,
	pulseVal,
	gainMultiplier,
	intensityMultiplier,
	color,
	glowColor,
	barWidth,
	maxBarHeight,
}: {
	side: 'top' | 'bottom' | 'left' | 'right'
	index: number
	total: number
	albumW: number
	albumH: number
	pulseVal: SharedValue<number>
	gainMultiplier: number
	intensityMultiplier: number
	color: string
	glowColor: string
	barWidth: number
	maxBarHeight: number
}) {
	const factor = 0.45 + 0.55 * Math.sin((index / (total - 1)) * Math.PI)
	const isHorizontal = side === 'top' || side === 'bottom'
	const dim = isHorizontal ? albumW : albumH
	const offset = (index / (total - 1)) * (dim - 24) + 12

	const staticStyle: ViewStyle = useMemo(() => {
		if (side === 'top') {
			return {
				position: 'absolute',
				left: offset - barWidth / 2,
				top: -maxBarHeight,
				width: barWidth,
				height: maxBarHeight,
			}
		} else if (side === 'bottom') {
			return {
				position: 'absolute',
				left: offset - barWidth / 2,
				top: albumH,
				width: barWidth,
				height: maxBarHeight,
			}
		} else if (side === 'left') {
			return {
				position: 'absolute',
				left: -maxBarHeight,
				top: offset - barWidth / 2,
				width: maxBarHeight,
				height: barWidth,
			}
		} else {
			return {
				position: 'absolute',
				left: albumW,
				top: offset - barWidth / 2,
				width: maxBarHeight,
				height: barWidth,
			}
		}
	}, [side, offset, barWidth, maxBarHeight, albumW, albumH])

	const animStyle = useAnimatedStyle(() => {
		const peakScale = factor * gainMultiplier * (intensityMultiplier >= 1.5 ? 1.3 : 1.0)
		const scale = interpolate(pulseVal.value, [0, 1], [0.12, Math.max(0.22, peakScale)])
		const opacity = interpolate(pulseVal.value, [0, 1], [0.35, 0.95])

		if (side === 'top') {
			return {
				opacity,
				transform: [
					{ translateY: (maxBarHeight / 2) * (1 - scale) },
					{ scaleY: scale },
				],
			}
		} else if (side === 'bottom') {
			return {
				opacity,
				transform: [
					{ translateY: (-maxBarHeight / 2) * (1 - scale) },
					{ scaleY: scale },
				],
			}
		} else if (side === 'left') {
			return {
				opacity,
				transform: [
					{ translateX: (maxBarHeight / 2) * (1 - scale) },
					{ scaleX: scale },
				],
			}
		} else {
			return {
				opacity,
				transform: [
					{ translateX: (-maxBarHeight / 2) * (1 - scale) },
					{ scaleX: scale },
				],
			}
		}
	})

	return (
		<Animated.View
			style={[
				styles.edgeBar,
				staticStyle,
				{
					backgroundColor: color,
					shadowColor: glowColor,
				},
				animStyle,
			]}
		/>
	)
})

/**
 * Dynamic Album Edge Audio Visualizer.
 * High-performance 60fps implementation:
 * - 100% GPU-accelerated transforms (transform: scale / translateX / translateY)
 * - Zero layout recalculations or requestLayout passes
 * - Prevents thread locking and lag during player open and playback
 */
export const AlbumBeatVisualizer = React.memo(function AlbumBeatVisualizer({
	albumWidth: propWidth,
	albumHeight: propHeight,
	albumBorderRadius: propRadius,
	size = 280,
	artworkColor,
	isCircle = false,
	overrideConfig,
	style,
}: AlbumBeatVisualizerProps) {
	const theme = useTheme()
	const {
		pulseVal,
		config,
		gainMultiplier,
		intensityMultiplier,
	} = useBeatPulseReactivity(overrideConfig)

	const palette = useMemo(
		() =>
			getBeatPulsePalette(
				config.colorMode,
				theme,
				config.customColor,
				artworkColor
			),
		[config.colorMode, theme, config.customColor, artworkColor]
	)

	// Resolve exact measured box dimensions
	const targetWidth = Math.round(propWidth || size)
	const targetHeight = Math.round(propHeight || size)
	const effectiveBorderRadius = isCircle
		? Math.min(targetWidth, targetHeight) / 2
		: propRadius !== undefined
		? propRadius
		: Math.min(targetWidth * 0.08, 20)

	// Proportional sizing relative to album dimensions
	const barWidth = Math.max(3.5, Math.min(6, targetWidth * 0.016))
	const maxBarHeight = Math.max(20, Math.min(65, targetWidth * 0.2))
	const borderWidthProportional = Math.max(2.5, Math.min(4.5, targetWidth * 0.014))

	// ============================================================
	// 100% GPU Accelerated Shockwave Animations
	// ============================================================

	// Inner Halo Ring (Hugs the album boundary directly)
	const haloRingStyle = useAnimatedStyle(() => {
		const scale = interpolate(
			pulseVal.value,
			[0, 1],
			[1.005, 1.045 * (gainMultiplier > 1.15 ? 1.05 : 1.0)]
		)
		const opacity = interpolate(pulseVal.value, [0, 1], [0.4, 0.95])
		return {
			transform: [{ scale }],
			opacity,
		}
	})

	// Shockwave Ring 1 (Core Ripple: expands by +24% on GPU)
	const shockwave1Style = useAnimatedStyle(() => {
		const scale = interpolate(
			pulseVal.value,
			[0, 1],
			[1.0, 1.24 * (gainMultiplier > 1.15 ? 1.08 : 1.0)]
		)
		const opacity = interpolate(pulseVal.value, [0, 0.25, 1], [0.85, 0.55, 0])
		return {
			transform: [{ scale }],
			opacity,
		}
	})

	// Shockwave Ring 2 (Mid Ripple: expands by +48% on GPU)
	const shockwave2Style = useAnimatedStyle(() => {
		const scale = interpolate(
			pulseVal.value,
			[0, 1],
			[1.04, 1.48 * (gainMultiplier > 1.15 ? 1.12 : 1.0)]
		)
		const opacity = interpolate(pulseVal.value, [0, 0.35, 1], [0.65, 0.3, 0])
		return {
			transform: [{ scale }],
			opacity,
		}
	})

	// Shockwave Ring 3 (Distant Ripple: expands by +72% on GPU)
	const shockwave3Style = useAnimatedStyle(() => {
		const scale = interpolate(
			pulseVal.value,
			[0, 1],
			[1.08, 1.72 * (gainMultiplier > 1.15 ? 1.16 : 1.0)]
		)
		const opacity = interpolate(pulseVal.value, [0, 0.45, 1], [0.45, 0.12, 0])
		return {
			transform: [{ scale }],
			opacity,
		}
	})

	// Border Blade pulse style
	const bladeAnimStyle = useAnimatedStyle(() => {
		const scale = interpolate(pulseVal.value, [0, 1], [1.0, 1.025])
		const opacity = interpolate(pulseVal.value, [0, 1], [0.45, 1.0])
		return {
			transform: [{ scale }],
			opacity,
		}
	})

	// Base box style for all concentric shockwave rings
	const ringBaseStyle: ViewStyle = useMemo(
		() => ({
			position: 'absolute',
			left: 0,
			top: 0,
			width: targetWidth,
			height: targetHeight,
			borderRadius: effectiveBorderRadius,
		}),
		[targetWidth, targetHeight, effectiveBorderRadius]
	)

	// Guard: Do not render until real dimensions exist
	if (!config.enabled || config.type === 'off' || targetWidth <= 0 || targetHeight <= 0) {
		return null
	}

	return (
		<View style={[styles.container, style]} pointerEvents="none">
			{/* 1. ACOUSTIC SHOCKWAVE (Concentric Ripples Relative to Measured Box) */}
			{(config.type === 'acoustic-shockwave' ||
				config.type === 'monstercat-shockwave' ||
				config.type === 'ncs-shockwave') && (
				<>
					{/* Outer Bloom Glow */}
					<Animated.View
						style={[
							ringBaseStyle,
							{
								backgroundColor: palette.glow,
							},
							haloRingStyle,
						]}
					/>

					{/* Shockwave Ring 3 (Distant Ripple) */}
					<Animated.View
						style={[
							ringBaseStyle,
							{
								borderWidth: borderWidthProportional * 0.8,
								borderColor: palette.primary,
								shadowColor: palette.primary,
							},
							shockwave3Style,
						]}
					/>

					{/* Shockwave Ring 2 (Mid Ripple) */}
					<Animated.View
						style={[
							ringBaseStyle,
							{
								borderWidth: borderWidthProportional,
								borderColor: palette.secondary,
								shadowColor: palette.secondary,
							},
							shockwave2Style,
						]}
					/>

					{/* Shockwave Ring 1 (Core Ripple) */}
					<Animated.View
						style={[
							ringBaseStyle,
							{
								borderWidth: borderWidthProportional * 1.25,
								borderColor: palette.flare,
								shadowColor: palette.flare,
							},
							shockwave1Style,
						]}
					/>

					{/* Boundary Halo Ring hugging the album perimeter */}
					<Animated.View
						style={[
							ringBaseStyle,
							{
								borderWidth: borderWidthProportional,
								borderColor: palette.flare,
								shadowColor: palette.primary,
							},
							haloRingStyle,
						]}
					/>
				</>
			)}

			{/* 2. RADIAL BURST (360-Degree Radiating Bars) */}
			{(config.type === 'radial-burst' ||
				config.type === 'ncs-circle' ||
				config.type === 'hellcat-flanks') && (
				<>
					{/* Outer Bloom */}
					<Animated.View
						style={[
							ringBaseStyle,
							{
								backgroundColor: palette.glow,
							},
							haloRingStyle,
						]}
					/>

					{/* Circular Halo Ring */}
					<Animated.View
						style={[
							ringBaseStyle,
							{
								borderWidth: borderWidthProportional,
								borderColor: palette.flare,
								shadowColor: palette.primary,
							},
							haloRingStyle,
						]}
					/>

					{/* Radiating Bars */}
					{Array.from({ length: CIRCLE_BAR_COUNT }).map((_, i) => (
						<RadialSpectrumBar
							key={`radial-bar-${i}`}
							index={i}
							albumW={targetWidth}
							albumH={targetHeight}
							pulseVal={pulseVal}
							gainMultiplier={gainMultiplier}
							intensityMultiplier={intensityMultiplier}
							color={i % 3 === 0 ? palette.flare : palette.primary}
							glowColor={palette.primary}
							barWidth={barWidth}
							maxBarHeight={maxBarHeight}
						/>
					))}
				</>
			)}

			{/* 3. PERIMETER SPECTRUM BARS (Dense Bars Radiating from 4 Edges) */}
			{(config.type === 'perimeter-spectrum' ||
				config.type === 'monstercat-bars' ||
				config.type === 'ncs-edge-bars' ||
				config.type === 'spectrum-pillars') && (
				<>
					{/* Perimeter Glow */}
					<Animated.View
						style={[
							ringBaseStyle,
							{
								backgroundColor: palette.glow,
							},
							haloRingStyle,
						]}
					/>

					{/* Perimeter Halo Ring */}
					<Animated.View
						style={[
							ringBaseStyle,
							{
								borderWidth: borderWidthProportional,
								borderColor: palette.flare,
								shadowColor: palette.primary,
							},
							haloRingStyle,
						]}
					/>

					{/* Top Edge Bars (8) */}
					{Array.from({ length: 8 }).map((_, i) => (
						<PerimeterEdgeBar
							key={`top-bar-${i}`}
							side="top"
							index={i}
							total={8}
							albumW={targetWidth}
							albumH={targetHeight}
							pulseVal={pulseVal}
							gainMultiplier={gainMultiplier}
							intensityMultiplier={intensityMultiplier}
							color={palette.primary}
							glowColor={palette.primary}
							barWidth={barWidth}
							maxBarHeight={maxBarHeight}
						/>
					))}

					{/* Bottom Edge Bars (8) */}
					{Array.from({ length: 8 }).map((_, i) => (
						<PerimeterEdgeBar
							key={`bottom-bar-${i}`}
							side="bottom"
							index={i}
							total={8}
							albumW={targetWidth}
							albumH={targetHeight}
							pulseVal={pulseVal}
							gainMultiplier={gainMultiplier}
							intensityMultiplier={intensityMultiplier}
							color={palette.primary}
							glowColor={palette.primary}
							barWidth={barWidth}
							maxBarHeight={maxBarHeight}
						/>
					))}

					{/* Left Edge Bars (6) */}
					{Array.from({ length: 6 }).map((_, i) => (
						<PerimeterEdgeBar
							key={`left-bar-${i}`}
							side="left"
							index={i}
							total={6}
							albumW={targetWidth}
							albumH={targetHeight}
							pulseVal={pulseVal}
							gainMultiplier={gainMultiplier}
							intensityMultiplier={intensityMultiplier}
							color={palette.flare}
							glowColor={palette.primary}
							barWidth={barWidth}
							maxBarHeight={maxBarHeight}
						/>
					))}

					{/* Right Edge Bars (6) */}
					{Array.from({ length: 6 }).map((_, i) => (
						<PerimeterEdgeBar
							key={`right-bar-${i}`}
							side="right"
							index={i}
							total={6}
							albumW={targetWidth}
							albumH={targetHeight}
							pulseVal={pulseVal}
							gainMultiplier={gainMultiplier}
							intensityMultiplier={intensityMultiplier}
							color={palette.flare}
							glowColor={palette.primary}
							barWidth={barWidth}
							maxBarHeight={maxBarHeight}
						/>
					))}
				</>
			)}

			{/* 4. NEON BORDER BLADES (Thick Neon Beams framing the Album) */}
			{(config.type === 'neon-blades' ||
				config.type === 'monstercat-blades' ||
				config.type === 'hellcat-blades') && (
				<>
					<Animated.View
						style={[
							ringBaseStyle,
							{
								borderColor: palette.primary,
								shadowColor: palette.primary,
								borderWidth: borderWidthProportional * 1.5,
							},
							bladeAnimStyle,
						]}
					/>
				</>
			)}
		</View>
	)
})

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		overflow: 'visible',
		zIndex: 0,
	},
	radialBar: {
		position: 'absolute',
		borderRadius: 3,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.9,
		shadowRadius: 4,
	},
	edgeBar: {
		position: 'absolute',
		borderRadius: 3,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.9,
		shadowRadius: 4,
	},
})
