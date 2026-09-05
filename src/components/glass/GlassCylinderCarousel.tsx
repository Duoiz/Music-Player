import React, { useRef, useEffect } from 'react'
import {
	StyleSheet,
	View,
	Text,
	PanResponder,
	Dimensions,
	Platform,
	TouchableOpacity,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
	interpolate,
	type SharedValue,
} from 'react-native-reanimated'
import type { Track } from '../../types'
import { formatTime } from '../../utils/formatTime'
import { AlbumBeatVisualizer } from '../AlbumBeatVisualizer'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = 190
const CARD_HEIGHT = 245
const PERSPECTIVE_D = 850

const TRACK_COLORS = [
	'#7c6ff0', // Lavender Blue
	'#ff6f5e', // Warm Coral
	'#2dd4bf', // Mint Aqua
	'#f6dc84', // Golden Amber
	'#f9a8d4', // Rosé Pink
	'#60a5fa', // Electric Sky
]

interface GlassCylinderCarouselProps {
	queue: Track[]
	currentTrack: Track | null
	onSelectTrack: (track: Track) => void
	themeId?: string
	artworkColor?: string
}

/**
 * 3D "See Through the Glass" Cylindrical Drum Carousel.
 *
 * Translucent frosted glass track cards are arranged in true 3D space
 * along a cylindrical drum. At rest, only the active front card is visible.
 * As the user drags horizontally, the 3D drum reveals itself — orbiting
 * back cards shine and bleed their colored silhouettes through the translucent
 * frosted body of the front card as they rotate behind it.
 */
export function GlassCylinderCarousel({
	queue,
	currentTrack,
	onSelectTrack,
	themeId = 'liquid-glass',
	artworkColor,
}: GlassCylinderCarouselProps) {
	const [cardBox, setCardBox] = React.useState({
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		borderRadius: 24,
	})
	// Display the real songs from the category queue in top-to-bottom order
	const tracksList: Track[] = React.useMemo(() => {
		if (queue && queue.length > 0) {
			// If queue has 10 or fewer songs, show the entire category queue around the drum
			if (queue.length <= 10) {
				return queue
			}
			// If queue has more than 10 songs, show an 8-song sliding window around active track
			const activeIdx = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : 0
			const validIdx = activeIdx >= 0 ? activeIdx : 0
			let start = Math.max(0, validIdx - 4)
			const end = Math.min(queue.length, start + 8)
			if (end - start < 8 && queue.length >= 8) {
				start = Math.max(0, end - 8)
			}
			return queue.slice(start, end)
		}
		if (currentTrack) {
			return [currentTrack]
		}
		return []
	}, [queue, currentTrack])

	const N = Math.max(tracksList.length, 1)
	const stepDeg = N === 1 ? 0 : 360 / N
	const radius = N === 1 ? 0 : Math.round((CARD_WIDTH / 2) / Math.tan(Math.PI / Math.max(N, 3))) + 35

	// Current active index
	const currentIndex = Math.max(
		0,
		tracksList.findIndex((t) => t.id === currentTrack?.id)
	)

	// Drum angle tracking
	const drumAngle = useSharedValue(-currentIndex * stepDeg)
	const isDraggingValue = useSharedValue(0) // 0 = resting, 1 = dragging

	const isDraggingRef = useRef(false)
	const currentAngleRef = useRef(-currentIndex * stepDeg)
	const startAngleRef = useRef(-currentIndex * stepDeg)

	// Sync angle when currentTrack changes externally (e.g. next/prev buttons, notification)
	useEffect(() => {
		if (!isDraggingRef.current) {
			const activeIdx = tracksList.findIndex((t) => t.id === currentTrack?.id)
			if (activeIdx >= 0) {
				const targetAngle = -activeIdx * stepDeg
				currentAngleRef.current = targetAngle
				drumAngle.value = withTiming(targetAngle, { duration: 350 })
			}
		}
	}, [currentTrack?.id, stepDeg, tracksList])

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 4,
			onPanResponderGrant: () => {
				startAngleRef.current = currentAngleRef.current
				isDraggingRef.current = true
				isDraggingValue.value = withTiming(1, { duration: 150 })
			},
			onPanResponderMove: (_, gestureState) => {
				// 0.35 deg per pixel drag sensitivity
				const newAngle = startAngleRef.current + gestureState.dx * 0.35
				currentAngleRef.current = newAngle
				drumAngle.value = newAngle
			},
			onPanResponderRelease: () => {
				isDraggingRef.current = false
				isDraggingValue.value = withTiming(0, { duration: 250 })

				if (N > 1 && stepDeg > 0) {
					// Calculate nearest card to center
					const currentAngle = currentAngleRef.current
					const nearest = Math.round(-currentAngle / stepDeg)
					const targetIndex = ((nearest % N) + N) % N
					const targetAngle = -nearest * stepDeg

					currentAngleRef.current = targetAngle
					drumAngle.value = withSpring(targetAngle, { damping: 18, stiffness: 140 })

					// Immediately switch song to selected card
					const chosen = tracksList[targetIndex]
					if (chosen && chosen.id !== currentTrack?.id) {
						try {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
						} catch (e) {}
						onSelectTrack(chosen)
					}
				} else {
					currentAngleRef.current = 0
					drumAngle.value = withSpring(0, { damping: 18, stiffness: 140 })
				}
			},
			onPanResponderTerminate: () => {
				isDraggingRef.current = false
				isDraggingValue.value = withTiming(0, { duration: 250 })
				const targetAngle = -currentIndex * stepDeg
				currentAngleRef.current = targetAngle
				drumAngle.value = withSpring(targetAngle, { damping: 18, stiffness: 140 })
			},
		})
	).current

	const isFrutiger = themeId === 'frutiger-aero'

	const activeCardColor = TRACK_COLORS[currentIndex % TRACK_COLORS.length]
	const visualizerColor = artworkColor || activeCardColor

	// Fade visualizer gracefully when dragging the 3D drum to browse tracks
	const visualizerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: interpolate(isDraggingValue.value, [0, 1], [1, 0]),
	}))

	return (
		<View style={styles.stage}>
			{/* Ambient Glowing Blobs in the background — refracted through the frosted cards */}
			<View style={[styles.blob, styles.blob1, { backgroundColor: isFrutiger ? '#00bfff' : '#7c6ff0' }]} />
			<View style={[styles.blob, styles.blob2, { backgroundColor: isFrutiger ? '#00ffc8' : '#ff6f5e' }]} />
			<View style={[styles.blob, styles.blob3, { backgroundColor: isFrutiger ? '#38ef7d' : '#2dd4bf' }]} />

			{/* 3D Scene Viewport */}
			<View style={styles.scene} {...panResponder.panHandlers}>
				{/* Active Front Card Audio Visualizer Anchor (Measure -> Anchor -> Scale) */}
				<Animated.View
					style={[
						styles.visualizerAnchor,
						visualizerAnimatedStyle,
					]}
					onLayout={(e) => {
						const { width, height } = e.nativeEvent.layout
						if (width > 0 && height > 0) {
							const roundedW = Math.round(width)
							const roundedH = Math.round(height)
							setCardBox((prev) => {
								if (prev.width === roundedW && prev.height === roundedH) {
									return prev
								}
								return { width: roundedW, height: roundedH, borderRadius: 24 }
							})
						}
					}}
					pointerEvents="none"
				>
					<AlbumBeatVisualizer
						albumWidth={cardBox.width}
						albumHeight={cardBox.height}
						albumBorderRadius={cardBox.borderRadius}
						artworkColor={visualizerColor}
						isCircle={false}
					/>
				</Animated.View>

				{tracksList.map((track, i) => {
					const cardColor = TRACK_COLORS[i % TRACK_COLORS.length]
					return (
						<CylinderCard
							key={track.id}
							index={i}
							total={N}
							stepDeg={stepDeg}
							radius={radius}
							drumAngle={drumAngle}
							isDraggingValue={isDraggingValue}
							track={track}
							cardColor={cardColor}
							isFrutiger={isFrutiger}
							onPressCard={() => {
								if (!isDraggingRef.current) {
									const targetAngle = -i * stepDeg
									currentAngleRef.current = targetAngle
									drumAngle.value = withSpring(targetAngle, { damping: 18, stiffness: 140 })

									if (track.id !== currentTrack?.id) {
										try {
											Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
										} catch (e) {}
										onSelectTrack(track)
									}
								}
							}}
						/>
					)
				})}
			</View>
		</View>
	)
}

interface CylinderCardProps {
	index: number
	total: number
	stepDeg: number
	radius: number
	drumAngle: SharedValue<number>
	isDraggingValue: SharedValue<number>
	track: Track
	cardColor: string
	isFrutiger: boolean
	onPressCard: () => void
}

const CylinderCard = React.memo(function CylinderCard({
	index,
	total,
	stepDeg,
	radius,
	drumAngle,
	isDraggingValue,
	track,
	cardColor,
	isFrutiger,
	onPressCard,
}: CylinderCardProps) {
	const animatedStyle = useAnimatedStyle(() => {
		// Calculate effective angle in range [-180, 180]
		let effective = (index * stepDeg + drumAngle.value) % 360
		if (effective > 180) effective -= 360
		if (effective < -180) effective += 360

		const rad = (effective * Math.PI) / 180
		const cosVal = Math.cos(rad)
		const sinVal = Math.sin(rad)

		// 3D Perspective Projection Math
		const X = radius * sinVal
		const Z = radius * cosVal
		const scale = PERSPECTIVE_D / (PERSPECTIVE_D + (radius - Z))
		const translateX = X * scale

		// Distance from front (0 = front center, 1 = directly behind)
		const d = Math.abs(effective) / 180

		// RESTING vs DRAGGING Opacity:
		// At rest, only front card is visible.
		// When dragging, back cards reveal themselves (opacity 0.62..1.0) and bleed color through the front glass.
		const restingOpacity = total === 1 ? 1.0 : Math.abs(effective) < stepDeg * 0.5 ? 1.0 : 0.0
		const draggingOpacity = 1.0 - d * 0.38
		const opacity = restingOpacity * (1 - isDraggingValue.value) + draggingOpacity * isDraggingValue.value

		const zIndex = Math.round(cosVal * 100) + 100

		return {
			opacity,
			zIndex,
			transform: [
				{ translateX },
				{ scale },
				{ rotateY: `${effective}deg` },
			],
		}
	})

	return (
		<Animated.View style={[styles.cardWrapper, animatedStyle]}>
			<TouchableOpacity
				activeOpacity={0.9}
				onPress={onPressCard}
				style={[
					styles.cardBody,
					isFrutiger ? styles.cardFrutiger : styles.cardLiquid,
					{ borderColor: isFrutiger ? 'rgba(0, 220, 255, 0.45)' : 'rgba(255, 255, 255, 0.35)' },
				]}
			>
				{/* Frosted Glass Blur Background */}
				<BlurView
					intensity={Platform.OS === 'ios' ? 45 : 35}
					tint={isFrutiger ? 'light' : 'dark'}
					style={StyleSheet.absoluteFill}
				/>

				{/* Back card color bleed tint (shines through from behind) */}
				<LinearGradient
					colors={[`${cardColor}30`, 'rgba(255, 255, 255, 0.05)']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={StyleSheet.absoluteFill}
				/>

				{/* Specular Top Reflection Bevel */}
				<LinearGradient
					colors={['rgba(255, 255, 255, 0.28)', 'rgba(255, 255, 255, 0.0)']}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
					style={styles.specularTop}
					pointerEvents="none"
				/>

				{/* Album Artwork Thumbnail */}
				<View style={[styles.artContainer, { backgroundColor: cardColor }]}>
					{track.artwork ? (
						<Image source={{ uri: track.artwork }} style={styles.artImage} contentFit="cover" />
					) : (
						<Ionicons name="musical-notes" size={28} color="#FFFFFF" />
					)}
				</View>

				{/* Song Title & Artist */}
				<View style={styles.textContainer}>
					<Text style={styles.cardTitle} numberOfLines={1}>
						{track.title || 'Untitled'}
					</Text>
					<Text style={styles.cardArtist} numberOfLines={1}>
						{track.artist || 'Unknown Artist'}
					</Text>
				</View>

				{/* Duration Badge */}
				<View style={[styles.durBadge, isFrutiger && styles.durBadgeFrutiger]}>
					<Text style={styles.durText}>
						{track.duration ? formatTime(track.duration) : '3:20'}
					</Text>
				</View>
			</TouchableOpacity>
		</Animated.View>
	)
})

const styles = StyleSheet.create({
	stage: {
		width: SCREEN_WIDTH,
		height: 290,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		overflow: 'visible',
	},
	blob: {
		position: 'absolute',
		borderRadius: 150,
		opacity: 0.45,
	},
	blob1: {
		width: 220,
		height: 220,
		top: -20,
		left: 20,
	},
	blob2: {
		width: 200,
		height: 200,
		bottom: -10,
		right: 20,
	},
	blob3: {
		width: 170,
		height: 170,
		bottom: 30,
		left: '35%',
	},
	scene: {
		width: SCREEN_WIDTH,
		height: 270,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		overflow: 'visible',
	},
	visualizerAnchor: {
		position: 'absolute',
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'visible',
		zIndex: 10,
	},
	cardWrapper: {
		position: 'absolute',
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cardBody: {
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		borderRadius: 24,
		padding: 16,
		justifyContent: 'space-between',
		overflow: 'hidden',
		borderWidth: 1,
		...Platform.select({
			ios: {
				shadowColor: '#000000',
				shadowOffset: { width: 0, height: 12 },
				shadowOpacity: 0.35,
				shadowRadius: 18,
			},
			android: {
				elevation: 8,
			},
		}),
	},
	cardLiquid: {
		backgroundColor: 'rgba(255, 255, 255, 0.12)',
	},
	cardFrutiger: {
		backgroundColor: 'rgba(255, 255, 255, 0.22)',
	},
	specularTop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '42%',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	artContainer: {
		width: 58,
		height: 58,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		borderWidth: 1.5,
		borderColor: 'rgba(255, 255, 255, 0.4)',
	},
	artImage: {
		width: '100%',
		height: '100%',
	},
	textContainer: {
		marginVertical: 8,
	},
	cardTitle: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: -0.3,
		textShadowColor: 'rgba(0, 0, 0, 0.6)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	cardArtist: {
		color: 'rgba(255, 255, 255, 0.75)',
		fontSize: 13,
		fontWeight: '500',
		marginTop: 2,
		textShadowColor: 'rgba(0, 0, 0, 0.5)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},
	durBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.18)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.3)',
	},
	durBadgeFrutiger: {
		backgroundColor: 'rgba(0, 200, 255, 0.25)',
		borderColor: 'rgba(120, 240, 255, 0.6)',
	},
	durText: {
		color: '#FFFFFF',
		fontSize: 11,
		fontWeight: '600',
	},
})
