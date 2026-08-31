import React, { useCallback, useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTheme } from '../src/components/ThemeProvider'
import { GlassCard } from '../src/components/GlassCard'
import { ProgressBar } from '../src/components/ProgressBar'
import { VolumeSlider } from '../src/components/VolumeSlider'
import { BackgroundParticles } from '../src/components/BackgroundParticles'
import { usePlayerStore } from '../src/stores/playerStore'
import { useHapticFeedback } from '../src/hooks/useHapticFeedback'
import { extractImageColors } from '../src/utils/imageColors'
import type { RepeatMode } from '../src/types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const ALBUM_ART_SIZE = SCREEN_WIDTH - 80

/**
 * Full-screen Now Playing modal.
 * Album art, song info, seekable progress bar, controls,
 * volume slider, shuffle/repeat toggles.
 */
export default function PlayerScreen() {
	const theme = useTheme()
	const router = useRouter()
	const haptic = useHapticFeedback()

	const currentTrack = usePlayerStore((s) => s.currentTrack)
	const isPlaying = usePlayerStore((s) => s.isPlaying)
	const repeatMode = usePlayerStore((s) => s.repeatMode)
	const shuffleEnabled = usePlayerStore((s) => s.shuffleEnabled)
	const play = usePlayerStore((s) => s.resume)
	const pause = usePlayerStore((s) => s.pause)
	const next = usePlayerStore((s) => s.next)
	const previous = usePlayerStore((s) => s.previous)
	const setRepeatMode = usePlayerStore((s) => s.setRepeatMode)
	const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)

	const [bgColors, setBgColors] = useState<string[]>(
		theme.colors.backgroundGradient
	)

	// Extract colors from album art for dynamic background
	useEffect(() => {
		if (currentTrack?.artwork) {
			extractImageColors(currentTrack.artwork).then((colors) => {
				setBgColors([colors.primary, colors.secondary, colors.background])
			})
		} else {
			setBgColors(theme.colors.backgroundGradient)
		}
	}, [currentTrack?.artwork, theme.colors.backgroundGradient])

	const handlePlayPause = useCallback(() => {
		haptic.medium()
		isPlaying ? pause() : play()
	}, [isPlaying, play, pause, haptic])

	const handleNext = useCallback(() => {
		haptic.light()
		next()
	}, [next, haptic])

	const handlePrevious = useCallback(() => {
		haptic.light()
		previous()
	}, [previous, haptic])

	const handleRepeat = useCallback(() => {
		haptic.selection()
		const modes: RepeatMode[] = ['off', 'all', 'one']
		const currentIndex = modes.indexOf(repeatMode)
		const nextMode = modes[(currentIndex + 1) % modes.length]
		setRepeatMode(nextMode)
	}, [repeatMode, setRepeatMode, haptic])

	const handleShuffle = useCallback(() => {
		haptic.selection()
		toggleShuffle()
	}, [toggleShuffle, haptic])

	const repeatIconName =
		repeatMode === 'one' ? 'repeat' : 'repeat' as const
	const repeatOpacity = repeatMode === 'off' ? 0.4 : 1.0

	return (
		<LinearGradient
			colors={bgColors as [string, string, ...string[]]}
			start={{ x: 0, y: 0 }}
			end={{ x: 0.5, y: 1 }}
			style={styles.container}
		>
			{theme.id === 'frutiger-aero' && <BackgroundParticles />}
			<SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
				{/* Header with close button */}
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={[
							styles.closeButton,
							{ backgroundColor: theme.colors.controlBackground },
						]}
					>
						<Ionicons name="chevron-down" size={20} color={theme.colors.controlIcon} />
					</TouchableOpacity>
					<Text
						style={[
							styles.headerTitle,
							theme.id === 'frutiger-aero' ? {
								color: 'rgba(100,200,255,0.7)',
								fontFamily: 'Orbitron_600SemiBold',
								fontSize: 10,
								letterSpacing: 2,
							} : {
								color: theme.colors.textPrimary,
								fontSize: theme.typography.captionSize,
								fontWeight: theme.typography.captionWeight,
							},
						]}
					>
						NOW PLAYING
					</Text>
					<View style={styles.closeButton} />
				</View>

				{/* Player Content */}
				<View style={styles.content}>
					{/* Album Art */}
					<GlassCard style={styles.albumCard} intensity="heavy">
						{currentTrack?.artwork ? (
							<Image
								source={{ uri: currentTrack.artwork }}
								style={[
									styles.albumArt,
									{ borderRadius: theme.metrics.borderRadiusMedium },
								]}
								contentFit="cover"
								transition={300}
							/>
						) : (
							<LinearGradient
								colors={theme.colors.accentGradient as [string, string, ...string[]]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={[
									styles.albumArt,
									styles.albumPlaceholder,
									{ borderRadius: theme.metrics.borderRadiusMedium },
								]}
							>
								<Ionicons name="musical-notes" size={80} color="rgba(255,255,255,0.8)" />
							</LinearGradient>
						)}
					</GlassCard>

					{/* Song Info */}
					<View style={styles.songInfo}>
						<Text
							style={[
								styles.songTitle,
								theme.id === 'frutiger-aero' ? {
									color: 'rgba(230,250,255,0.95)',
									fontSize: 24,
									fontFamily: 'Rajdhani_700Bold',
									textTransform: 'lowercase',
									textShadowColor: 'rgba(0,180,255,0.8)',
									textShadowOffset: { width: 0, height: 0 },
									textShadowRadius: 10,
								} : {
									color: theme.colors.textPrimary,
									fontSize: 22,
									fontWeight: '800',
								},
							]}
							numberOfLines={2}
						>
							{currentTrack?.title || 'No track selected'}
						</Text>
						<Text
							style={[
								styles.songArtist,
								theme.id === 'frutiger-aero' ? {
									color: 'rgba(100,190,255,0.8)',
									fontSize: 14,
									fontFamily: 'Rajdhani_500Medium',
									textTransform: 'lowercase',
								} : {
									color: theme.colors.textSecondary,
									fontSize: theme.typography.bodySize,
								},
							]}
							numberOfLines={1}
						>
							{currentTrack?.artist || 'Unknown artist'}
						</Text>
					</View>

					{/* Progress Bar */}
					<View style={styles.progressContainer}>
						<ProgressBar />
					</View>

					{/* Controls */}
					<View style={styles.controlsContainer}>
						{/* Shuffle */}
						<TouchableOpacity
							onPress={handleShuffle}
							style={styles.secondaryControl}
						>
							<Ionicons
								name="shuffle"
								size={22}
								color={theme.colors.controlIcon}
								style={{ opacity: shuffleEnabled ? 1 : 0.4 }}
							/>
						</TouchableOpacity>

						{/* Previous */}
						<TouchableOpacity
							onPress={handlePrevious}
							style={[
								styles.controlButton,
								{
									backgroundColor: theme.colors.controlBackground,
									borderRadius: 28,
								},
							]}
						>
							<Ionicons name="play-skip-back" size={28} color={theme.colors.controlIcon} />
						</TouchableOpacity>

						{/* Play / Pause */}
						<TouchableOpacity
							onPress={handlePlayPause}
							style={[
								styles.playButton,
								theme.id === 'frutiger-aero' ? {
									shadowColor: isPlaying ? 'rgba(255,50,50,0.6)' : 'rgba(0,255,100,0.5)',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 1,
									shadowRadius: 10,
									elevation: 6,
								} : {
									shadowColor: theme.metrics.shadowAccent.color,
									shadowOffset: theme.metrics.shadowAccent.offset,
									shadowOpacity: theme.metrics.shadowAccent.opacity,
									shadowRadius: theme.metrics.shadowAccent.radius,
									elevation: theme.metrics.shadowAccent.elevation,
								},
							]}
						>
							<LinearGradient
								colors={
									theme.id === 'frutiger-aero'
										? isPlaying
											? ['rgba(255,100,100,0.9)', 'rgba(200,30,30,0.95)']
											: ['rgba(100,255,150,0.9)', 'rgba(20,200,80,0.95)']
										: (theme.colors.accentGradient as [string, string, ...string[]])
								}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={[
									styles.playButtonGradient,
									theme.id === 'frutiger-aero' && {
										borderWidth: 1.5,
										borderColor: 'rgba(255,255,255,0.7)',
									}
								]}
							>
								<Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color={theme.colors.textOnAccent} />
							</LinearGradient>
						</TouchableOpacity>

						{/* Next */}
						<TouchableOpacity
							onPress={handleNext}
							style={[
								styles.controlButton,
								{
									backgroundColor: theme.colors.controlBackground,
									borderRadius: 28,
								},
							]}
						>
							<Ionicons name="play-skip-forward" size={28} color={theme.colors.controlIcon} />
						</TouchableOpacity>

						{/* Repeat */}
						<TouchableOpacity
							onPress={handleRepeat}
							style={styles.secondaryControl}
						>
							<Ionicons
								name={repeatIconName}
								size={22}
								color={theme.colors.controlIcon}
								style={{ opacity: repeatOpacity }}
							/>

							{repeatMode === 'one' && (
								<View
									style={[
										styles.repeatOneDot,
										{ backgroundColor: theme.colors.accentPrimary },
									]}
								/>
							)}
						</TouchableOpacity>
					</View>

					{/* Volume */}
					<View style={styles.volumeContainer}>
						<VolumeSlider />
					</View>
				</View>
			</SafeAreaView>
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 8,
	},
	closeButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeIcon: {
		fontSize: 16,
	},
	headerTitle: {
		letterSpacing: 2,
		textTransform: 'uppercase',
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: 'center',
		gap: 20,
	},
	albumCard: {
		alignSelf: 'center',
		padding: 0,
		overflow: 'hidden',
	},
	albumArt: {
		width: ALBUM_ART_SIZE,
		height: ALBUM_ART_SIZE,
		maxWidth: 340,
		maxHeight: 340,
	},
	albumPlaceholder: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	albumPlaceholderEmoji: {
		fontSize: 80,
	},
	songInfo: {
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 16,
	},
	songTitle: {
		textAlign: 'center',
		letterSpacing: -0.3,
	},
	songArtist: {
		textAlign: 'center',
	},
	progressContainer: {
		paddingHorizontal: 4,
	},
	controlsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
	},
	secondaryControl: {
		padding: 8,
		position: 'relative',
	},
	secondaryIcon: {
		fontSize: 20,
	},
	controlButton: {
		width: 56,
		height: 56,
		justifyContent: 'center',
		alignItems: 'center',
	},
	controlIcon: {
		fontSize: 24,
	},
	playButton: {
		width: 72,
		height: 72,
		borderRadius: 36,
	},
	playButtonGradient: {
		width: '100%',
		height: '100%',
		borderRadius: 36,
		justifyContent: 'center',
		alignItems: 'center',
	},
	playIcon: {
		fontSize: 32,
	},
	repeatOneDot: {
		position: 'absolute',
		bottom: 4,
		alignSelf: 'center',
		width: 4,
		height: 4,
		borderRadius: 2,
	},
	volumeContainer: {
		paddingHorizontal: 16,
	},
})
