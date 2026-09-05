import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from 'react-native'
import { Image } from 'expo-image'
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
export const SongListItem = React.memo(function SongListItem({
	song,
	onPress,
	isActive = false,
	showDuration = true,
	index,
	onMenuAction,
}: SongListItemProps) {
	const theme = useTheme()
	const isDownloaded = useDownloadStore((s) => s.downloadedTracks.some((t) => t.id === song.id))
	const downloadProgress = useDownloadStore((s) => s.activeDownloads[song.id])
	const isDownloading = downloadProgress !== undefined

	const pulseOpacity = useSharedValue(1)
	const [menuVisible, setMenuVisible] = React.useState(false)

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
						<Animated.View style={pulseStyle}>
							<Ionicons name="musical-notes" size={14} color="rgba(0,220,255,0.9)" />
						</Animated.View>
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
							{
								color: isActive
									? theme.colors.accentPrimary
									: theme.colors.textPrimary,
								fontSize: theme.typography.bodySize,
								fontWeight: theme.typography.bodyWeight,
								fontFamily: theme.typography.fontFamily,
								textShadowColor: theme.typography.textShadowColor,
								textShadowOffset: theme.typography.textShadowOffset,
								textShadowRadius: theme.typography.textShadowRadius,
							},
						]}
						numberOfLines={1}
					>
						{song.title}
					</Text>
					<Text
						style={[
							styles.artist,
							{
								color: theme.colors.textSecondary,
								fontSize: theme.typography.captionSize,
								fontWeight: theme.typography.captionWeight,
								fontFamily: theme.typography.fontFamily,
								textShadowColor: theme.typography.textShadowColor,
								textShadowOffset: theme.typography.textShadowOffset,
								textShadowRadius: theme.typography.textShadowRadius,
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
					<>
						<TouchableOpacity 
							style={{ padding: 8, marginLeft: 4 }}
							onPress={() => setMenuVisible(true)}
						>
							<Ionicons
								name="ellipsis-vertical"
								size={16}
								color={theme.id === 'frutiger-aero' ? 'rgba(0,200,255,0.7)' : theme.colors.textMuted}
							/>
						</TouchableOpacity>

						<Modal
							visible={menuVisible}
							transparent={true}
							animationType="fade"
							onRequestClose={() => setMenuVisible(false)}
						>
							<Pressable 
								style={styles.modalOverlay}
								onPress={() => setMenuVisible(false)}
							>
								<View style={[
									styles.modalContent,
									theme.id === 'frutiger-aero' ? {
										backgroundColor: 'rgba(0,30,70,0.95)',
										borderColor: 'rgba(0,180,255,0.4)',
										borderWidth: 1,
									} : {
										backgroundColor: theme.colors.controlBackground,
									}
								]}>
									<TouchableOpacity 
										style={styles.modalOption}
										onPress={() => {
											setMenuVisible(false)
											if (onMenuAction) onMenuAction('playlist', song)
										}}
									>
										<Ionicons name="list" size={20} color={theme.id === 'frutiger-aero' ? 'rgba(180,240,255,0.95)' : theme.colors.textPrimary} />
										<Text style={[styles.modalOptionText, theme.id === 'frutiger-aero' ? { color: 'rgba(180,240,255,0.95)' } : { color: theme.colors.textPrimary }]}>
											Add to Playlist
										</Text>
									</TouchableOpacity>
									
									<TouchableOpacity 
										style={styles.modalOption}
										onPress={() => {
											setMenuVisible(false)
											if (onMenuAction) onMenuAction('download', song)
										}}
									>
										<Ionicons name={isDownloaded ? "trash-outline" : "download-outline"} size={20} color={theme.id === 'frutiger-aero' ? 'rgba(180,240,255,0.95)' : theme.colors.textPrimary} />
										<Text style={[styles.modalOptionText, theme.id === 'frutiger-aero' ? { color: 'rgba(180,240,255,0.95)' } : { color: theme.colors.textPrimary }]}>
											{isDownloaded ? 'Remove Download' : 'Download for Offline'}
										</Text>
									</TouchableOpacity>
								</View>
							</Pressable>
						</Modal>
					</>
				)}
			</View>
		</TouchableOpacity>
	)
})

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
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		width: '80%',
		borderRadius: 12,
		padding: 8,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	modalOption: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		gap: 12,
	},
	modalOptionText: {
		fontSize: 16,
		fontWeight: '500',
	},
})


