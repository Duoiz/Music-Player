import React, { useEffect } from 'react'
import { StyleSheet, View, Dimensions, Platform } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withRepeat,
	cancelAnimation,
	Easing,
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SLEEVE_SIZE = Math.min(SCREEN_WIDTH * 0.65, 270)
const VINYL_SIZE = SLEEVE_SIZE * 0.95

interface VinylAlbumArtProps {
	artwork?: string
	isPlaying: boolean
	themeId?: string
	accentColor?: string
}

/**
 * Skeuomorphic Vinyl Record Hero Component.
 * Features an album art jacket with a bevel border and a realistic grooved
 * vinyl disc that slips out and spins continuously during playback,
 * freezing in place upon pause (true turntable physics).
 */
export function VinylAlbumArt({
	artwork,
	isPlaying,
	themeId = 'skeuomorphism',
	accentColor = '#FF9F0A',
}: VinylAlbumArtProps) {
	const rotation = useSharedValue(0)
	const discOffset = useSharedValue(0)

	useEffect(() => {
		if (isPlaying) {
			// Slide the vinyl out slightly from the sleeve
			discOffset.value = withTiming(SLEEVE_SIZE * 0.28, { duration: 600, easing: Easing.out(Easing.cubic) })
			// Spin continuously (8 seconds per rotation)
			rotation.value = withRepeat(
				withTiming(rotation.value + 360, {
					duration: 8000,
					easing: Easing.linear,
				}),
				-1,
				false
			)
		} else {
			// Slide back slightly into the sleeve
			discOffset.value = withTiming(SLEEVE_SIZE * 0.16, { duration: 500, easing: Easing.out(Easing.cubic) })
			// Freeze in place at current rotation angle (cancel ongoing animation)
			cancelAnimation(rotation)
		}
	}, [isPlaying])

	const vinylAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: discOffset.value },
			{ rotate: `${rotation.value}deg` },
		],
	}))

	const isNeumorphic = themeId === 'neomorphism'

	return (
		<View style={styles.container}>
			{/* Vinyl Disc (sits behind the album sleeve) */}
			<Animated.View style={[styles.vinylDisc, vinylAnimatedStyle]}>
				{/* Concentric sound grooves */}
				<View style={styles.grooveOuter} />
				<View style={styles.grooveMiddle} />
				<View style={styles.grooveInner} />

				{/* Specular sheen on vinyl grooves */}
				<LinearGradient
					colors={['rgba(255, 255, 255, 0.14)', 'transparent', 'rgba(255, 255, 255, 0.08)', 'transparent']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={StyleSheet.absoluteFill}
					pointerEvents="none"
				/>

				{/* Center Record Label */}
				<View style={[styles.centerLabel, { backgroundColor: accentColor }]}>
					{artwork ? (
						<Image source={{ uri: artwork }} style={styles.centerLabelImage} contentFit="cover" />
					) : (
						<Ionicons name="disc" size={24} color="#FFFFFF" />
					)}
					{/* Turntable spindle hole */}
					<View style={styles.spindleHole} />
				</View>
			</Animated.View>

			{/* Album Jacket / Sleeve Mount */}
			<View
				style={[
					styles.sleeveMount,
					isNeumorphic ? styles.sleeveMountNeumorphic : styles.sleeveMountSkeuo,
				]}
			>
				{/* Beveled frame */}
				<LinearGradient
					colors={
						isNeumorphic
							? ['rgba(255, 255, 255, 0.9)', 'rgba(154, 167, 189, 0.3)']
							: ['rgba(255, 255, 255, 0.25)', 'rgba(0, 0, 0, 0.5)']
					}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.bezelBorder}
				>
					{artwork ? (
						<Image source={{ uri: artwork }} style={styles.albumArtImage} contentFit="cover" transition={300} />
					) : (
						<LinearGradient
							colors={isNeumorphic ? ['#E6E9F2', '#DCE0EB'] : ['#343438', '#222226']}
							style={[styles.albumArtImage, styles.placeholder]}
						>
							<Ionicons
								name="musical-notes"
								size={64}
								color={isNeumorphic ? '#8A94A6' : '#FF9F0A'}
							/>
						</LinearGradient>
					)}
				</LinearGradient>

				{/* Subtle gloss reflection overlay on sleeve */}
				<LinearGradient
					colors={['rgba(255, 255, 255, 0.15)', 'transparent']}
					start={{ x: 0, y: 0 }}
					end={{ x: 0.6, y: 0.6 }}
					style={StyleSheet.absoluteFill}
					pointerEvents="none"
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: SLEEVE_SIZE + SLEEVE_SIZE * 0.32,
		height: SLEEVE_SIZE,
		alignSelf: 'center',
		justifyContent: 'center',
		marginVertical: 12,
	},
	vinylDisc: {
		position: 'absolute',
		width: VINYL_SIZE,
		height: VINYL_SIZE,
		borderRadius: VINYL_SIZE / 2,
		backgroundColor: '#121214',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: 'rgba(255, 255, 255, 0.08)',
		// Shadow cast by the vinyl
		...Platform.select({
			ios: {
				shadowColor: '#000000',
				shadowOffset: { width: 4, height: 6 },
				shadowOpacity: 0.5,
				shadowRadius: 10,
			},
			android: {
				elevation: 6,
			},
		}),
	},
	grooveOuter: {
		position: 'absolute',
		width: VINYL_SIZE * 0.86,
		height: VINYL_SIZE * 0.86,
		borderRadius: (VINYL_SIZE * 0.86) / 2,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.06)',
	},
	grooveMiddle: {
		position: 'absolute',
		width: VINYL_SIZE * 0.72,
		height: VINYL_SIZE * 0.72,
		borderRadius: (VINYL_SIZE * 0.72) / 2,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.06)',
	},
	grooveInner: {
		position: 'absolute',
		width: VINYL_SIZE * 0.56,
		height: VINYL_SIZE * 0.56,
		borderRadius: (VINYL_SIZE * 0.56) / 2,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.06)',
	},
	centerLabel: {
		width: VINYL_SIZE * 0.36,
		height: VINYL_SIZE * 0.36,
		borderRadius: (VINYL_SIZE * 0.36) / 2,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: '#121214',
	},
	centerLabelImage: {
		width: '100%',
		height: '100%',
		borderRadius: (VINYL_SIZE * 0.36) / 2,
	},
	spindleHole: {
		position: 'absolute',
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#121214',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.3)',
	},
	sleeveMount: {
		width: SLEEVE_SIZE,
		height: SLEEVE_SIZE,
		borderRadius: 14,
		overflow: 'hidden',
	},
	sleeveMountNeumorphic: {
		backgroundColor: '#E6E9F2',
		...Platform.select({
			ios: {
				shadowColor: '#A3B1C6',
				shadowOffset: { width: 8, height: 10 },
				shadowOpacity: 0.6,
				shadowRadius: 14,
			},
			android: {
				elevation: 8,
			},
		}),
	},
	sleeveMountSkeuo: {
		backgroundColor: '#28282B',
		...Platform.select({
			ios: {
				shadowColor: '#000000',
				shadowOffset: { width: 0, height: 12 },
				shadowOpacity: 0.7,
				shadowRadius: 16,
			},
			android: {
				elevation: 10,
			},
		}),
	},
	bezelBorder: {
		flex: 1,
		padding: 3.5,
		borderRadius: 14,
	},
	albumArtImage: {
		flex: 1,
		borderRadius: 11,
	},
	placeholder: {
		justifyContent: 'center',
		alignItems: 'center',
	},
})
