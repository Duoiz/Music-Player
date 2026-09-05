import React, { useRef } from 'react'
import {
	StyleSheet,
	View,
	Text,
	PanResponder,
	Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { usePlayerStore } from '../../stores/playerStore'

const KNOB_SIZE = 84
const MIN_DEG = -135
const MAX_DEG = 135

interface RotaryVolumeKnobProps {
	accentColor?: string
	themeId?: string
}

/**
 * Skeuomorphic Brushed-Metal Rotary Volume Knob.
 * Provides tactile rotary control with haptic detents at 10% intervals.
 */
export function RotaryVolumeKnob({
	accentColor = '#FF9F0A',
	themeId = 'skeuomorphism',
}: RotaryVolumeKnobProps) {
	const volume = usePlayerStore((s) => s.volume)
	const setVolume = usePlayerStore((s) => s.setVolume)
	const volumeRef = useRef(volume)
	volumeRef.current = volume

	const knobCenterRef = useRef({ x: (KNOB_SIZE + 36) / 2, y: (KNOB_SIZE + 36) / 2 })
	const lastAngleRef = useRef<number | null>(null)
	const lastHapticStep = useRef(Math.round(volume * 10))

	// Map volume (0..1) to angle (-135°..+135°)
	const angle = MIN_DEG + volume * (MAX_DEG - MIN_DEG)

	const volumeThrottleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const pendingVolumeRef = useRef<number | null>(null)

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: (evt) => {
				const { locationX, locationY } = evt.nativeEvent
				const dx = locationX - knobCenterRef.current.x
				const dy = locationY - knobCenterRef.current.y
				lastAngleRef.current = Math.atan2(dy, dx)
			},
			onPanResponderMove: (evt, gestureState) => {
				const { locationX, locationY } = evt.nativeEvent
				const dx = locationX - knobCenterRef.current.x
				const dy = locationY - knobCenterRef.current.y
				const currentAngle = Math.atan2(dy, dx)

				if (lastAngleRef.current !== null) {
					let dAngle = currentAngle - lastAngleRef.current
					// Handle wrap-around across -PI / +PI
					if (dAngle > Math.PI) dAngle -= 2 * Math.PI
					if (dAngle < -Math.PI) dAngle += 2 * Math.PI

					// 270 degrees total range = 4.71239 radians
					const totalRadians = ((MAX_DEG - MIN_DEG) * Math.PI) / 180
					const dVol = dAngle / totalRadians

					if (Math.abs(dVol) > 0.0005) {
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
							}, 50)
						}

						// Haptic detent every 10%
						const currentStep = Math.round(nextVol * 10)
						if (currentStep !== lastHapticStep.current) {
							lastHapticStep.current = currentStep
							try {
								Haptics.selectionAsync()
							} catch (e) {}
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
				lastHapticStep.current = Math.round(volumeRef.current * 10)
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

	const isNeumorphic = themeId === 'neomorphism'

	return (
		<View style={styles.wrapper}>
			{/* Top Header Label */}
			<View style={styles.labelRow}>
				<Ionicons
					name={volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-low' : 'volume-high'}
					size={18}
					color={isNeumorphic ? '#4A5568' : '#C7C7CC'}
				/>
				<Text style={[styles.title, { color: isNeumorphic ? '#4A5568' : '#C7C7CC' }]}>VOLUME</Text>
				<Text style={[styles.percentage, { color: accentColor }]}>{Math.round(volume * 100)}%</Text>
			</View>

			{/* Outer Well / Bezel */}
			<View
				style={[
					styles.knobChassis,
					isNeumorphic ? styles.chassisNeumorphic : styles.chassisSkeuo,
				]}
				onLayout={(e) => {
					const { width, height } = e.nativeEvent.layout
					if (width > 0 && height > 0) {
						knobCenterRef.current = { x: width / 2, y: height / 2 }
					}
				}}
				{...panResponder.panHandlers}
			>
				{/* Dial tick markers */}
				<View style={styles.ticksRing} pointerEvents="none">
					{[-135, -90, -45, 0, 45, 90, 135].map((deg) => (
						<View
							key={deg}
							style={[
								styles.tickMark,
								{
									transform: [{ rotate: `${deg}deg` }, { translateY: -(KNOB_SIZE / 2 + 10) }],
									backgroundColor: deg <= angle ? accentColor : isNeumorphic ? '#A3B1C6' : '#55555A',
								},
							]}
						/>
					))}
				</View>

				{/* Brushed Metal Knob Body */}
				<View style={styles.knobShadow} pointerEvents="none">
					<LinearGradient
						colors={
							isNeumorphic
								? ['#FFFFFF', '#E6E9F2', '#D5DAE6']
								: ['#4E4E54', '#38383C', '#242428', '#38383C']
						}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={[
							styles.knobCap,
							{
								transform: [{ rotate: `${angle}deg` }],
							},
						]}
					>
						{/* Concentric knurled machining ring */}
						<View
							style={[
								styles.innerRidge,
								{
									borderColor: isNeumorphic ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.12)',
								},
							]}
						/>

						{/* Indicator Notch */}
						<View style={[styles.indicatorNotch, { backgroundColor: accentColor }]} />
					</LinearGradient>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		alignItems: 'center',
		marginVertical: 8,
	},
	labelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 12,
	},
	title: {
		fontSize: 12,
		fontWeight: '700',
		letterSpacing: 1.5,
	},
	percentage: {
		fontSize: 13,
		fontWeight: '800',
		fontVariant: ['tabular-nums'],
	},
	knobChassis: {
		width: KNOB_SIZE + 36,
		height: KNOB_SIZE + 36,
		borderRadius: (KNOB_SIZE + 36) / 2,
		justifyContent: 'center',
		alignItems: 'center',
	},
	chassisNeumorphic: {
		backgroundColor: '#E6E9F2',
		...Platform.select({
			ios: {
				shadowColor: '#A3B1C6',
				shadowOffset: { width: 4, height: 4 },
				shadowOpacity: 0.5,
				shadowRadius: 8,
			},
			android: { elevation: 4 },
		}),
	},
	chassisSkeuo: {
		backgroundColor: '#1E1E22',
		borderWidth: 1.5,
		borderColor: 'rgba(255, 255, 255, 0.12)',
		...Platform.select({
			ios: {
				shadowColor: '#000000',
				shadowOffset: { width: 0, height: 6 },
				shadowOpacity: 0.6,
				shadowRadius: 10,
			},
			android: { elevation: 6 },
		}),
	},
	ticksRing: {
		position: 'absolute',
		width: KNOB_SIZE + 24,
		height: KNOB_SIZE + 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	tickMark: {
		position: 'absolute',
		width: 3,
		height: 6,
		borderRadius: 1.5,
	},
	knobShadow: {
		width: KNOB_SIZE,
		height: KNOB_SIZE,
		borderRadius: KNOB_SIZE / 2,
		...Platform.select({
			ios: {
				shadowColor: '#000000',
				shadowOffset: { width: 0, height: 6 },
				shadowOpacity: 0.45,
				shadowRadius: 8,
			},
			android: { elevation: 6 },
		}),
	},
	knobCap: {
		width: KNOB_SIZE,
		height: KNOB_SIZE,
		borderRadius: KNOB_SIZE / 2,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: 'rgba(255, 255, 255, 0.3)',
	},
	innerRidge: {
		width: KNOB_SIZE * 0.72,
		height: KNOB_SIZE * 0.72,
		borderRadius: (KNOB_SIZE * 0.72) / 2,
		borderWidth: 1.5,
	},
	indicatorNotch: {
		position: 'absolute',
		top: 6,
		width: 4,
		height: 12,
		borderRadius: 2,
	},
})
