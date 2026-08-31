import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { useTheme } from './ThemeProvider'
import { usePlayerStore } from '../stores/playerStore'
import { formatTime } from '../utils/formatTime'

/**
 * Persistent mini-player bar at the bottom of tab screens.
 * Shows current track info, play/pause, and a thin progress indicator.
 * Tap to navigate to full Now Playing screen.
 */
export function MiniPlayer() {
	const theme = useTheme()
	const router = useRouter()
	const currentTrack = usePlayerStore((s) => s.currentTrack)
	const isPlaying = usePlayerStore((s) => s.isPlaying)
	const position = usePlayerStore((s) => s.position)
	const duration = usePlayerStore((s) => s.duration)
	const play = usePlayerStore((s) => s.resume)
	const pause = usePlayerStore((s) => s.pause)

	const pulseOpacity = useSharedValue(1)

	React.useEffect(() => {
		if (theme.id === 'frutiger-aero' && isPlaying) {
			pulseOpacity.value = withRepeat(
				withSequence(
					withTiming(0.4, { duration: 1000 }),
					withTiming(1, { duration: 1000 })
				),
				-1,
				true
			)
		} else {
			pulseOpacity.value = 1
		}
	}, [isPlaying, theme.id])

	const pulseStyle = useAnimatedStyle(() => ({
		opacity: pulseOpacity.value,
	}))

	// Don't render if nothing is playing
	if (!currentTrack) return null

	const progress = duration > 0 ? (position / duration) * 100 : 0

	return (
		<TouchableOpacity
			style={[
				styles.container,
				theme.id === 'frutiger-aero' ? {
					backgroundColor: 'rgba(0,30,70,0.85)',
					borderTopWidth: 1,
					borderTopColor: 'rgba(0,180,255,0.4)',
					borderBottomWidth: 1,
					borderBottomColor: 'rgba(0,180,255,0.4)',
				} : {
					backgroundColor: theme.colors.tabBarBackground,
					borderTopWidth: 0.5,
					borderTopColor: theme.colors.divider,
				},
			]}
			onPress={() => router.push('/player')}
			activeOpacity={0.9}
		>
			{/* Progress bar (thin line at the top) */}
			<View style={[styles.progressBar, { backgroundColor: theme.colors.progressTrack }]}>
				<LinearGradient
					colors={theme.colors.progressFillGradient as [string, string, ...string[]]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={[styles.progressFill, { width: `${progress}%` }]}
				/>
			</View>

			{/* Content */}
			<View style={styles.content}>
				{/* Thumbnail */}
				{currentTrack.artwork ? (
					<Image
						source={{ uri: currentTrack.artwork }}
						style={[
							styles.thumbnail,
							{ borderRadius: theme.metrics.borderRadiusSmall },
						]}
						contentFit="cover"
						transition={200}
					/>
				) : (
					<View
						style={[
							styles.thumbnailPlaceholder,
							{
								backgroundColor: theme.colors.controlBackground,
								borderRadius: theme.metrics.borderRadiusSmall,
							},
						]}
					>
						<Ionicons name="musical-note" size={18} color={theme.colors.textSecondary} />
					</View>
				)}

				{/* Track info */}
				<View style={styles.info}>
					<Text
						style={[
							styles.title,
							theme.id === 'frutiger-aero' ? {
								color: 'rgba(180,240,255,0.95)',
								fontSize: 13,
								fontFamily: 'Rajdhani_700Bold',
								textTransform: 'lowercase',
								letterSpacing: 0.3,
								textShadowColor: 'rgba(0,200,255,0.5)',
								textShadowOffset: { width: 0, height: 0 },
								textShadowRadius: 10,
							} : {
								color: theme.colors.textPrimary,
								fontSize: theme.typography.bodySize - 1,
							},
						]}
						numberOfLines={1}
					>
						{currentTrack.title}
					</Text>
					<Text
						style={[
							styles.artist,
							theme.id === 'frutiger-aero' ? {
								color: 'rgba(120,200,240,0.75)',
								fontSize: 11,
								fontFamily: 'Rajdhani_600SemiBold',
								textTransform: 'lowercase',
							} : {
								color: theme.colors.textSecondary,
								fontSize: theme.typography.captionSize,
							},
						]}
						numberOfLines={1}
					>
						{currentTrack.artist}
					</Text>
				</View>

				{/* Play/Pause button */}
				{theme.id === 'frutiger-aero' ? (
					<TouchableOpacity
						onPress={(e) => {
							e.stopPropagation?.()
							isPlaying ? pause() : play()
						}}
						style={{
							paddingHorizontal: 16,
							paddingVertical: 6,
							borderRadius: 5,
							borderWidth: 1,
							borderColor: 'rgba(255,255,255,0.7)',
							backgroundColor: isPlaying ? 'rgba(200,40,40,0.8)' : 'rgba(20,180,80,0.8)',
							shadowColor: isPlaying ? 'rgba(255,80,80,0.5)' : 'rgba(0,220,100,0.5)',
							shadowOffset: { width: 0, height: 0 },
							shadowOpacity: 1,
							shadowRadius: 10,
							elevation: 4,
						}}
					>
						<Text style={{
							color: 'rgba(255,255,255,0.95)',
							fontFamily: 'Rajdhani_700Bold',
							fontSize: 12,
							textShadowColor: 'rgba(0,0,0,0.3)',
							textShadowOffset: { width: 0, height: 1 },
							textShadowRadius: 2,
						}}>
							{isPlaying ? '⏸' : '▶'}
						</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						onPress={(e) => {
							e.stopPropagation?.()
							isPlaying ? pause() : play()
						}}
						style={[
							styles.playButton,
							{
								backgroundColor: theme.colors.controlBackground,
								borderRadius: 20,
							},
						]}
					>
						<Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={theme.colors.controlIcon} />
					</TouchableOpacity>
				)}
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	progressBar: {
		height: 2,
		width: '100%',
	},
	progressFill: {
		height: '100%',
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		gap: 10,
	},
	thumbnail: {
		width: 40,
		height: 40,
	},
	thumbnailPlaceholder: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	info: {
		flex: 1,
		gap: 1,
	},
	title: {
		fontWeight: '600',
	},
	artist: {
		fontWeight: '400',
	},
	playButton: {
		width: 36,
		height: 36,
		justifyContent: 'center',
		alignItems: 'center',
	},
	playIcon: {
		fontSize: 16,
	},
})


