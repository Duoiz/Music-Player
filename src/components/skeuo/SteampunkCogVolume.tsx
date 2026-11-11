import React, { useRef } from 'react'
import {
	StyleSheet,
	View,
	Text,
	PanResponder,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Animated from 'react-native-reanimated'
import { usePlayerStore } from '../../stores/playerStore'
import { useAudioReactivity } from '../../hooks/useAudioReactivity'
import type { ThemeAudioReactivityConfig } from '../../types'

const MAIN_COG_SIZE = 92
const PINION_COG_SIZE = 42
const NUM_MAIN_TEETH = 14
const NUM_PINION_TEETH = 8

const MIN_DEG = -135
const MAX_DEG = 135

interface SteampunkCogVolumeProps {
	accentColor?: string
	themeId?: string
	audioReactive?: ThemeAudioReactivityConfig
}

/**
 * ⚙️ Steampunk Clockwork Cog & Pinion Gear Volume Assembly
 * Features interlocking brass gears, realistic gear ratio rotation,
 * mechanical tooth-by-tooth haptics, and audio-reactive beat twitch.
 */
export function SteampunkCogVolume({
	accentColor = '#DAA520',
	audioReactive,
}: SteampunkCogVolumeProps) {
	const volume = usePlayerStore((s) => s.volume)
	const setVolume = usePlayerStore((s) => s.setVolume)
	const volumeRef = useRef(volume)
	volumeRef.current = volume

	const cogCenterRef = useRef({ x: MAIN_COG_SIZE / 2, y: MAIN_COG_SIZE / 2 })
	const lastAngleRef = useRef<number | null>(null)
	const lastToothClick = useRef(Math.round(volume * 24))

	// Reanimated audio-reactivity hook
	const { wobbleVal } = useAudioReactivity(audioReactive)

	// Rotation calculations
	const mainAngle = MIN_DEG + volume * (MAX_DEG - MIN_DEG)
	const pinionAngle = -mainAngle * 2.33 // Interlocking gear ratio

	const volumeThrottleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const pendingVolumeRef = useRef<number | null>(null)

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: (evt) => {
				const { locationX, locationY } = evt.nativeEvent
				const dx = locationX - cogCenterRef.current.x
				const dy = locationY - cogCenterRef.current.y
				lastAngleRef.current = Math.atan2(dy, dx)
			},
			onPanResponderMove: (evt) => {
				const { locationX, locationY } = evt.nativeEvent
				const dx = locationX - cogCenterRef.current.x
				const dy = locationY - cogCenterRef.current.y
				const currentAngle = Math.atan2(dy, dx)

				if (lastAngleRef.current !== null) {
					let dAngle = currentAngle - lastAngleRef.current
					if (dAngle > Math.PI) dAngle -= 2 * Math.PI
					if (dAngle < -Math.PI) dAngle += 2 * Math.PI

					const totalRadians = ((MAX_DEG - MIN_DEG) * Math.PI) / 180
					const dVol = dAngle / totalRadians

					if (Math.abs(dVol) > 0.0008) {
						const nextVol = Math.min(Math.max(volumeRef.current + dVol, 0), 1)
						volumeRef.current = nextVol
						pendingVolumeRef.current = nextVol

						if (!volumeThrottleTimer.current) {
							setVolume(nextVol)
							volumeThrottleTimer.current = setTimeout(() => {
								volumeThrottleTimer.current = null
								if (pendingVolumeRef.current !== null) {
									setVolume(pendingVolumeRef.current)
								}
							}, 45)
						}

						// Tooth-by-tooth mechanical haptic click
						const currentTooth = Math.round(nextVol * 24)
						if (currentTooth !== lastToothClick.current) {
							lastToothClick.current = currentTooth
							try {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
							} catch {
								// Fallback
							}
						}
					}
				}

				lastAngleRef.current = currentAngle
			},
			onPanResponderRelease: () => {
				if (volumeThrottleTimer.current) {
					clearTimeout(volumeThrottleTimer.current)
					volumeThrottleTimer.current = null
				}
				setVolume(volumeRef.current)
				lastAngleRef.current = null
				lastToothClick.current = Math.round(volumeRef.current * 24)
			},
			onPanResponderTerminate: () => {
				if (volumeThrottleTimer.current) {
					clearTimeout(volumeThrottleTimer.current)
					volumeThrottleTimer.current = null
				}
				setVolume(volumeRef.current)
				lastAngleRef.current = null
			},
		})
	).current

	const volumePercent = Math.round(volume * 100)

	return (
		<View style={styles.container}>
			{/* Left Volume Mute / Low Icon */}
			<Ionicons
				name={volume === 0 ? 'volume-mute' : 'volume-low'}
				size={18}
				color="rgba(218, 165, 32, 0.7)"
				style={styles.soundIcon}
			/>

			{/* Center Gear Mechanism Assembly */}
			<View style={styles.gearAssemblyWrapper}>
				{/* Secondary Interlocking Pinion Gear (Top-Right) */}
				<View
					style={[
						styles.pinionGear,
						{
							transform: [{ rotate: `${pinionAngle}deg` }],
						},
					]}
				>
					{Array.from({ length: NUM_PINION_TEETH }).map((_, i) => (
						<View
							key={i}
							style={[
								styles.pinionTooth,
								{
									transform: [
										{ rotate: `${(360 / NUM_PINION_TEETH) * i}deg` },
										{ translateY: -(PINION_COG_SIZE / 2) },
									],
								},
							]}
						/>
					))}
					<LinearGradient
						colors={['#8B5A2B', '#CD7F32', '#5C3818']}
						style={styles.pinionBody}
					>
						<View style={styles.pinionRivet} />
					</LinearGradient>
				</View>

				{/* Primary Drive Cog */}
				<Animated.View
					{...panResponder.panHandlers}
					style={[
						styles.mainCogTouchTarget,
						{
							transform: [
								{ rotate: `${mainAngle}deg` },
								{ rotate: audioReactive?.target === 'wobble' ? `${wobbleVal.value}deg` : '0deg' },
							],
						},
					]}
				>
					{/* Radial Gear Teeth */}
					{Array.from({ length: NUM_MAIN_TEETH }).map((_, i) => (
						<View
							key={i}
							style={[
								styles.mainTooth,
								{
									transform: [
										{ rotate: `${(360 / NUM_MAIN_TEETH) * i}deg` },
										{ translateY: -(MAIN_COG_SIZE / 2) },
									],
								},
							]}
						>
							<LinearGradient
								colors={['#E5A93C', '#996515', '#4A3510']}
								style={styles.toothGradient}
							/>
						</View>
					))}

					{/* Outer Brass Wheel Rim */}
					<LinearGradient
						colors={['#F5D061', '#C68B1C', '#6E470B', '#B8860B']}
						start={{ x: 0.1, y: 0.1 }}
						end={{ x: 0.9, y: 0.9 }}
						style={styles.mainCogWheel}
					>
						{/* Beveled Inner Brass Ring */}
						<LinearGradient
							colors={['#2A1E14', '#473322', '#1A120B']}
							style={styles.innerGearPlate}
						>
							{/* Embossed Cardinal Screws / Rivets */}
							<View style={[styles.rivet, styles.rivetNorth]} />
							<View style={[styles.rivet, styles.rivetEast]} />
							<View style={[styles.rivet, styles.rivetSouth]} />
							<View style={[styles.rivet, styles.rivetWest]} />

							{/* Center Hub with Indicator Notch */}
							<LinearGradient
								colors={['#D4AF37', '#996515', '#5C3A10']}
								style={styles.centerHub}
							>
								{/* Active Volume Notch Indicator */}
								<View style={[styles.notch, { backgroundColor: accentColor }]} />
							</LinearGradient>
						</LinearGradient>
					</LinearGradient>
				</Animated.View>

				{/* Mechanical Digital Readout Plate */}
				<View style={styles.readoutBadge}>
					<Text style={styles.readoutText}>{volumePercent}%</Text>
				</View>
			</View>

			{/* Right Volume High Icon */}
			<Ionicons
				name="volume-high"
				size={18}
				color="rgba(218, 165, 32, 0.9)"
				style={styles.soundIcon}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 12,
		marginVertical: 4,
	},
	soundIcon: {
		marginHorizontal: 14,
	},
	gearAssemblyWrapper: {
		width: MAIN_COG_SIZE + 28,
		height: MAIN_COG_SIZE + 24,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	/* Pinion Gear (interlocking top-right) */
	pinionGear: {
		position: 'absolute',
		top: -4,
		right: 4,
		width: PINION_COG_SIZE,
		height: PINION_COG_SIZE,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1,
	},
	pinionTooth: {
		position: 'absolute',
		width: 7,
		height: 9,
		backgroundColor: '#8B5A2B',
		borderRadius: 1.5,
		borderWidth: 0.5,
		borderColor: '#DAA520',
	},
	pinionBody: {
		width: PINION_COG_SIZE - 12,
		height: PINION_COG_SIZE - 12,
		borderRadius: (PINION_COG_SIZE - 12) / 2,
		borderWidth: 1,
		borderColor: '#DAA520',
		alignItems: 'center',
		justifyContent: 'center',
	},
	pinionRivet: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#3E2714',
		borderWidth: 1,
		borderColor: '#F5D061',
	},
	/* Main Drive Cog */
	mainCogTouchTarget: {
		width: MAIN_COG_SIZE,
		height: MAIN_COG_SIZE,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 2,
	},
	mainTooth: {
		position: 'absolute',
		width: 11,
		height: 14,
		borderRadius: 2,
		overflow: 'hidden',
	},
	toothGradient: {
		flex: 1,
		borderWidth: 0.8,
		borderColor: '#FFE082',
	},
	mainCogWheel: {
		width: MAIN_COG_SIZE - 10,
		height: MAIN_COG_SIZE - 10,
		borderRadius: (MAIN_COG_SIZE - 10) / 2,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1.5,
		borderColor: '#FFE082',
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 6,
		elevation: 6,
	},
	innerGearPlate: {
		width: MAIN_COG_SIZE - 28,
		height: MAIN_COG_SIZE - 28,
		borderRadius: (MAIN_COG_SIZE - 28) / 2,
		borderWidth: 1,
		borderColor: '#8C6221',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	/* Brass Rivets */
	rivet: {
		position: 'absolute',
		width: 5,
		height: 5,
		borderRadius: 2.5,
		backgroundColor: '#E5A93C',
		borderWidth: 0.5,
		borderColor: '#4A3510',
	},
	rivetNorth: { top: 4 },
	rivetEast: { right: 4 },
	rivetSouth: { bottom: 4 },
	rivetWest: { left: 4 },
	/* Center Hub */
	centerHub: {
		width: 32,
		height: 32,
		borderRadius: 16,
		borderWidth: 1.5,
		borderColor: '#F5D061',
		alignItems: 'center',
		justifyContent: 'flex-start',
		paddingTop: 2,
	},
	notch: {
		width: 4,
		height: 8,
		borderRadius: 2,
		shadowColor: '#FFD700',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.9,
		shadowRadius: 3,
	},
	/* Readout Badge */
	readoutBadge: {
		position: 'absolute',
		bottom: -16,
		paddingHorizontal: 8,
		paddingVertical: 2,
		backgroundColor: 'rgba(26, 18, 11, 0.85)',
		borderRadius: 6,
		borderWidth: 1,
		borderColor: 'rgba(218, 165, 32, 0.5)',
		zIndex: 3,
	},
	readoutText: {
		color: '#F5D061',
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
})
