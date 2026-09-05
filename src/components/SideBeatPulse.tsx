import React, { useMemo } from 'react'
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native'
import Animated, {
	useAnimatedStyle,
	interpolate,
	SharedValue,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from './ThemeProvider'
import { useBeatPulseReactivity } from '../hooks/useBeatPulseReactivity'
import type { BeatPulseColor, BeatPulseConfig, ThemeStyle } from '../types'

export interface SideBeatPulseProps {
	style?: StyleProp<ViewStyle>
	artworkColor?: string
	overrideConfig?: Partial<BeatPulseConfig>
}

/**
 * Resolves color palette tokens for the active beat pulse mode
 */
export function getBeatPulsePalette(
	colorMode: BeatPulseColor,
	theme: ThemeStyle,
	customColor?: string,
	artworkColor?: string
): { primary: string; secondary: string; glow: string; flare: string } {
	switch (colorMode) {
		case 'cyber-violet':
		case 'monstercat-purple':
			return {
				primary: '#9B5DE5',
				secondary: '#8E44AD',
				glow: 'rgba(155, 93, 229, 0.75)',
				flare: 'rgba(176, 114, 255, 0.95)',
			}
		case 'electric-cyan':
		case 'monstercat-cyan':
			return {
				primary: '#00E5FF',
				secondary: '#00D4FF',
				glow: 'rgba(0, 229, 255, 0.75)',
				flare: 'rgba(56, 189, 248, 0.95)',
			}
		case 'crimson-drive':
		case 'monstercat-red':
		case 'hellcat-red':
			return {
				primary: '#FF1E27',
				secondary: '#E74C3C',
				glow: 'rgba(255, 30, 39, 0.75)',
				flare: 'rgba(255, 71, 87, 0.95)',
			}
		case 'acid-lime':
		case 'monstercat-green':
			return {
				primary: '#10F489',
				secondary: '#2ECC71',
				glow: 'rgba(16, 244, 137, 0.75)',
				flare: 'rgba(52, 211, 153, 0.95)',
			}
		case 'solar-amber':
		case 'monstercat-orange':
			return {
				primary: '#FF6B35',
				secondary: '#E67E22',
				glow: 'rgba(255, 107, 53, 0.75)',
				flare: 'rgba(249, 115, 22, 0.95)',
			}
		case 'theme-accent':
			return {
				primary: theme.colors.accentPrimary,
				secondary: theme.colors.accentSecondary || theme.colors.accentPrimary,
				glow: theme.colors.glowColor || `${theme.colors.accentPrimary}99`,
				flare: `${theme.colors.accentPrimary}EE`,
			}
		case 'album-art': {
			const color = artworkColor || theme.colors.accentPrimary
			return {
				primary: color,
				secondary: color,
				glow: `${color}99`,
				flare: `${color}EE`,
			}
		}
		case 'solar-gold':
			return {
				primary: '#F59E0B',
				secondary: '#F1C40F',
				glow: 'rgba(245, 158, 11, 0.75)',
				flare: 'rgba(251, 191, 36, 0.95)',
			}
		default:
			return {
				primary: customColor || '#FF1E27',
				secondary: customColor || '#FF4757',
				glow: `${customColor || '#FF1E27'}99`,
				flare: `${customColor || '#FF1E27'}EE`,
			}
	}
}

/**
 * Helper component for a single VU meter segment
 */
function VUSegment({
	index,
	total,
	pulseVal,
	color,
}: {
	index: number
	total: number
	pulseVal: SharedValue<number>
	color: string
}) {
	const threshold = (index / total) * 0.85
	const animStyle = useAnimatedStyle(() => {
		const active = pulseVal.value >= threshold
		const opacity = active
			? interpolate(pulseVal.value, [threshold, 1], [0.4, 1.0])
			: 0.12
		const scaleX = active
			? interpolate(pulseVal.value, [threshold, 1], [1.0, 1.35])
			: 1.0

		return {
			opacity,
			transform: [{ scaleX }],
			backgroundColor: color,
		}
	})

	return <Animated.View style={[styles.vuSegment, animStyle]} />
}

/**
 * Audio-reactive side beat pulse visualizer.
 * Flanks the screen borders with customizable beat pulses, VU columns, shockwaves, or laser beams.
 */
export function SideBeatPulse({
	style,
	artworkColor,
	overrideConfig,
}: SideBeatPulseProps) {
	const theme = useTheme()
	const {
		pulseVal,
		leftFlankStyle,
		rightFlankStyle,
		flareAnimatedStyle,
		shockwaveAnimatedStyle,
		config,
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

	if (!config.enabled || config.type === 'off') {
		return null
	}

	return (
		<View style={[StyleSheet.absoluteFillObject, styles.container, style]} pointerEvents="none">
			{/* 1. SIDE FLANKS (Dynamic border flares + bloom bleed) */}
			{(config.type === 'side-flanks' || config.type === 'hellcat-flanks') && (
				<>
					{/* Left Flank Gradient */}
					<Animated.View style={[styles.flankLeft, leftFlankStyle]}>
						<LinearGradient
							colors={[palette.glow, 'rgba(0,0,0,0)']}
							start={{ x: 0, y: 0.5 }}
							end={{ x: 1, y: 0.5 }}
							style={StyleSheet.absoluteFill}
						/>
					</Animated.View>

					{/* Left Razor Edge */}
					<View
						style={[
							styles.razorEdgeLeft,
							{
								backgroundColor: palette.primary,
								shadowColor: palette.primary,
							},
						]}
					/>

					{/* Left Mid-Height Center Flare */}
					<Animated.View style={[styles.flareLeft, flareAnimatedStyle]}>
						<LinearGradient
							colors={['transparent', palette.flare, 'transparent']}
							start={{ x: 0, y: 0 }}
							end={{ x: 0, y: 1 }}
							style={StyleSheet.absoluteFill}
						/>
					</Animated.View>

					{/* Right Flank Gradient */}
					<Animated.View style={[styles.flankRight, rightFlankStyle]}>
						<LinearGradient
							colors={['rgba(0,0,0,0)', palette.glow]}
							start={{ x: 0, y: 0.5 }}
							end={{ x: 1, y: 0.5 }}
							style={StyleSheet.absoluteFill}
						/>
					</Animated.View>

					{/* Right Razor Edge */}
					<View
						style={[
							styles.razorEdgeRight,
							{
								backgroundColor: palette.primary,
								shadowColor: palette.primary,
							},
						]}
					/>

					{/* Right Mid-Height Center Flare */}
					<Animated.View style={[styles.flareRight, flareAnimatedStyle]}>
						<LinearGradient
							colors={['transparent', palette.flare, 'transparent']}
							start={{ x: 0, y: 0 }}
							end={{ x: 0, y: 1 }}
							style={StyleSheet.absoluteFill}
						/>
					</Animated.View>
				</>
			)}

			{/* 2. VU SPECTRUM PILLARS (Segmented LED Towers along screen flanks) */}
			{config.type === 'spectrum-pillars' && (
				<>
					{/* Left VU Column */}
					<View style={styles.vuColumnLeft}>
						{Array.from({ length: 12 }).map((_, i) => (
							<VUSegment
								key={`left-vu-${i}`}
								index={11 - i}
								total={12}
								pulseVal={pulseVal}
								color={i < 3 ? palette.flare : palette.primary}
							/>
						))}
					</View>

					{/* Right VU Column */}
					<View style={styles.vuColumnRight}>
						{Array.from({ length: 12 }).map((_, i) => (
							<VUSegment
								key={`right-vu-${i}`}
								index={11 - i}
								total={12}
								pulseVal={pulseVal}
								color={i < 3 ? palette.flare : palette.primary}
							/>
						))}
					</View>
				</>
			)}

			{/* 3. SHOCKWAVE ARCS (Expanding acoustic ripples from left & right) */}
			{config.type === 'shockwave-arcs' && (
				<>
					<Animated.View
						style={[
							styles.shockwaveLeft,
							{ borderColor: palette.primary, shadowColor: palette.primary },
							shockwaveAnimatedStyle,
						]}
					/>
					<Animated.View
						style={[
							styles.shockwaveRight,
							{ borderColor: palette.primary, shadowColor: palette.primary },
							shockwaveAnimatedStyle,
						]}
					/>
				</>
			)}

			{/* 4. LASER LIGHT-PIPES (High-tech neon edge beams) */}
			{config.type === 'laser-beams' && (
				<>
					<Animated.View
						style={[
							styles.laserLeft,
							{
								backgroundColor: palette.primary,
								shadowColor: palette.primary,
							},
							leftFlankStyle,
						]}
					>
						<View style={styles.laserCore} />
					</Animated.View>

					<Animated.View
						style={[
							styles.laserRight,
							{
								backgroundColor: palette.primary,
								shadowColor: palette.primary,
							},
							rightFlankStyle,
						]}
					>
						<View style={styles.laserCore} />
					</Animated.View>
				</>
			)}

			{/* 5. AMBIENT DRIFT (Smooth, mellow atmospheric flank breathing) */}
			{config.type === 'ambient-breath' && (
				<>
					<Animated.View style={[styles.flankLeft, leftFlankStyle]}>
						<LinearGradient
							colors={[palette.glow, 'rgba(0,0,0,0)']}
							start={{ x: 0, y: 0.5 }}
							end={{ x: 1, y: 0.5 }}
							style={StyleSheet.absoluteFill}
						/>
					</Animated.View>

					<Animated.View style={[styles.flankRight, rightFlankStyle]}>
						<LinearGradient
							colors={['rgba(0,0,0,0)', palette.glow]}
							start={{ x: 0, y: 0.5 }}
							end={{ x: 1, y: 0.5 }}
							style={StyleSheet.absoluteFill}
						/>
					</Animated.View>
				</>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		zIndex: 99,
		overflow: 'hidden',
	},
	flankLeft: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
	},
	flankRight: {
		position: 'absolute',
		right: 0,
		top: 0,
		bottom: 0,
	},
	razorEdgeLeft: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: 3.5,
		shadowOffset: { width: 3, height: 0 },
		shadowOpacity: 0.9,
		shadowRadius: 6,
		elevation: 6,
	},
	razorEdgeRight: {
		position: 'absolute',
		right: 0,
		top: 0,
		bottom: 0,
		width: 3.5,
		shadowOffset: { width: -3, height: 0 },
		shadowOpacity: 0.9,
		shadowRadius: 6,
		elevation: 6,
	},
	flareLeft: {
		position: 'absolute',
		left: 0,
		top: '38%',
		width: 32,
		height: 180,
		marginTop: -90,
	},
	flareRight: {
		position: 'absolute',
		right: 0,
		top: '38%',
		width: 32,
		height: 180,
		marginTop: -90,
	},
	vuColumnLeft: {
		position: 'absolute',
		left: 4,
		top: '25%',
		bottom: '25%',
		width: 8,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	vuColumnRight: {
		position: 'absolute',
		right: 4,
		top: '25%',
		bottom: '25%',
		width: 8,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	vuSegment: {
		width: 6,
		height: 12,
		borderRadius: 3,
		marginVertical: 1.5,
	},
	shockwaveLeft: {
		position: 'absolute',
		left: -40,
		top: '50%',
		width: 120,
		height: 120,
		marginTop: -60,
		borderRadius: 60,
		borderWidth: 3,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 10,
	},
	shockwaveRight: {
		position: 'absolute',
		right: -40,
		top: '50%',
		width: 120,
		height: 120,
		marginTop: -60,
		borderRadius: 60,
		borderWidth: 3,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 10,
	},
	laserLeft: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		alignItems: 'flex-start',
		justifyContent: 'center',
		shadowOffset: { width: 4, height: 0 },
		shadowOpacity: 1,
		shadowRadius: 8,
		elevation: 8,
	},
	laserRight: {
		position: 'absolute',
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'flex-end',
		justifyContent: 'center',
		shadowOffset: { width: -4, height: 0 },
		shadowOpacity: 1,
		shadowRadius: 8,
		elevation: 8,
	},
	laserCore: {
		width: 2,
		height: '100%',
		backgroundColor: '#FFFFFF',
		opacity: 0.9,
	},
})
