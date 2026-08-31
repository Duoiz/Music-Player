import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { MenuView } from '@react-native-menu/menu'
import { useTheme } from './ThemeProvider'
import { useDownloadStore } from '../stores/downloadStore'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated'
import { formatTime } from '../utils/formatTime'
import type { Song } from '../types'

interface SongListItemProps {
	song: Song
	onPress: (song: Song) => void
	isActive?: boolean
	showDuration?: boolean
	index?: number
	onMenuAction?: (action: 'download' | 'playlist', song: Song) => void
}

/**
 * Song row component used in search results, library, and queue.
 * Shows thumbnail, title, artist, duration, and play indicator.
 */
export function SongListItem({
	song,
	onPress,
	isActive = false,
	showDuration = true,
	index,
	onMenuAction,
}: SongListItemProps) {
	const theme = useTheme()
	const isDownloaded = useDownloadStore((s) => s.isDownloaded(song.id))
	const activeDownloads = useDownloadStore((s) => s.activeDownloads)
	const downloadProgress = activeDownloads[song.id]
	const isDownloading = downloadProgress !== undefined

	const pulseOpacity = useSharedValue(1)

	React.useEffect(() => {
		if (theme.id === 'frutiger-aero' && isActive) {
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
	}, [isActive, theme.id])

	const pulseStyle = useAnimatedStyle(() => ({
		opacity: pulseOpacity.value,
	}))

	return (
		<TouchableOpacity
			style={[
				styles.container,
				theme.id === 'frutiger-aero' ? {
					backgroundColor: isActive ? 'rgba(0,160,255,0.2)' : 'transparent',
					borderBottomWidth: 1,
					borderBottomColor: 'rgba(255,255,255,0.07)',
					borderLeftWidth: isActive ? 2 : 2,
					borderLeftColor: isActive ? 'rgba(0,200,255,0.8)' : 'transparent',
				} : {
					backgroundColor: isActive
						? theme.colors.controlBackgroundActive
						: 'transparent',
					borderRadius: theme.metrics.borderRadiusSmall,
				},
			]}
			onPress={() => onPress(song)}
			activeOpacity={0.7}
		>
			{/* Index number (for queue view) */}
			{index !== undefined && (
				<View style={styles.indexContainer}>
					{isActive && theme.id === 'frutiger-aero' ? (
						<Animated.Text style={[{ color: 'rgba(0,220,255,0.9)', fontSize: 14 }, pulseStyle]}>♫</Animated.Text>
					) : (
						<Text
							style={[
								styles.index,
								theme.id === 'frutiger-aero' ? {
									color: isActive ? 'rgba(0,220,255,0.9)' : 'rgba(0,150,200,0.5)',
									fontSize: 9,
									fontFamily: 'Orbitron_600SemiBold',
								} : { 
									color: theme.colors.textMuted, 
									fontSize: theme.typography.captionSize 
								},
							]}
						>
							{theme.id === 'frutiger-aero' ? String(index + 1).padStart(2, '0') : index + 1}
						</Text>
					)}
				</View>
			)}

			{/* Thumbnail */}
			<View
				style={[
					styles.thumbnailContainer,
					{
						borderRadius: theme.metrics.borderRadiusSmall,
						shadowColor: theme.metrics.shadowLight.color,
						shadowOffset: theme.metrics.shadowLight.offset,
						shadowOpacity: theme.metrics.shadowLight.opacity,
						shadowRadius: theme.metrics.shadowLight.radius,
						elevation: theme.metrics.shadowLight.elevation,
					},
				]}
			>
				{song.thumbnail ? (
					<Image
						source={{ uri: song.thumbnail }}
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
						<Ionicons name="musical-note" size={20} color={theme.colors.textSecondary} />
					</View>
				)}

				{/* Playing indicator */}
				{isActive && (
					<View
						style={[
							styles.playingOverlay,
							{ borderRadius: theme.metrics.borderRadiusSmall },
						]}
					>
						<Ionicons name="play" size={16} color={theme.colors.textOnAccent} style={styles.playingIcon} />
					</View>
				)}
			</View>

			{/* Song info */}
				<View style={styles.info}>
					<Text
						style={[
							styles.title,
							theme.id === 'frutiger-aero' ? {
								color: isActive ? 'rgba(180,240,255,0.95)' : 'rgba(120,200,240,0.75)',
								fontSize: 13,
								fontFamily: 'Rajdhani_600SemiBold',
								textTransform: 'lowercase',
								letterSpacing: 0.3,
								textShadowColor: isActive ? 'rgba(0,200,255,0.5)' : undefined,
								textShadowOffset: isActive ? { width: 0, height: 0 } : undefined,
								textShadowRadius: isActive ? 10 : undefined,
							} : {
								color: isActive
									? theme.colors.accentPrimary
									: theme.colors.textPrimary,
								fontSize: theme.typography.bodySize,
								fontWeight: theme.typography.bodyWeight,
							},
						]}
						numberOfLines={1}
					>
						{song.title}
					</Text>
					<Text
						style={[
							styles.artist,
							theme.id === 'frutiger-aero' ? {
								color: isActive ? 'rgba(0,200,255,0.8)' : 'rgba(0,150,200,0.5)',
								fontSize: 11,
								fontFamily: 'Rajdhani_500Medium',
								textTransform: 'lowercase',
							} : {
								color: theme.colors.textSecondary,
								fontSize: theme.typography.captionSize,
							},
						]}
						numberOfLines={1}
					>
						{song.artist}
					</Text>
				</View>

			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				{/* Downloaded Indicator */}
				{isDownloaded && (
					<Ionicons
						name="checkmark-circle"
						size={14}
						color={theme.id === 'frutiger-aero' ? 'rgba(0,255,100,0.8)' : theme.colors.accentPrimary}
						style={{ marginRight: 6 }}
					/>
				)}

				{/* Download Progress or Duration */}
				{isDownloading ? (
					<Text
						style={[
							styles.duration,
							{
								color: theme.colors.accentPrimary,
								fontSize: 10,
								fontWeight: '600',
							},
						]}
					>
						{Math.round(downloadProgress * 100)}%
					</Text>
				) : showDuration && (
					<Text
						style={[
							styles.duration,
							theme.id === 'frutiger-aero' ? {
								color: isActive ? 'rgba(0,200,255,0.8)' : 'rgba(0,150,200,0.5)',
								fontSize: 9,
								fontFamily: 'Orbitron_600SemiBold',
								letterSpacing: 1,
							} : {
								color: theme.colors.textMuted,
								fontSize: theme.typography.captionSize,
							},
						]}
					>
						{formatTime(song.duration)}
					</Text>
				)}

				{/* Action Menu (hide while downloading) */}
				{!isDownloading && (
					<MenuView
						title="Options"
						onPressAction={({ nativeEvent }) => {
							if (onMenuAction) {
								onMenuAction(nativeEvent.event as 'download' | 'playlist', song)
							}
						}}
						actions={[
							{
								id: 'add_playlist',
								title: 'Add to Playlist',
							},
							{
								id: 'download',
								title: isDownloaded ? 'Remove Download' : 'Download for Offline',
							}
						]}
					>
						<TouchableOpacity style={{ padding: 8, marginLeft: 4 }}>
							<Ionicons
								name="ellipsis-vertical"
								size={16}
								color={theme.id === 'frutiger-aero' ? 'rgba(0,200,255,0.7)' : theme.colors.textMuted}
							/>
						</TouchableOpacity>
					</MenuView>
				)}
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 6,
		gap: 10,
	},
	indexContainer: {
		width: 20,
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
	index: {
		textAlign: 'right',
		fontWeight: '500',
	},
	thumbnailContainer: {
		width: 48,
		height: 48,
		overflow: 'hidden',
	},
	thumbnail: {
		width: '100%',
		height: '100%',
	},
	thumbnailPlaceholder: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	placeholderEmoji: {
		fontSize: 20,
	},
	playingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	playingIcon: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	info: {
		flex: 1,
		gap: 2,
	},
	title: {
		fontWeight: '500',
	},
	artist: {
		fontWeight: '400',
	},
	duration: {
		fontWeight: '500',
		marginLeft: 8,
	},
})


