import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from 'react-native'
import { Image } from 'expo-image'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	withSequence,
} from 'react-native-reanimated'
import { useTheme } from './ThemeProvider'
import { useDownloadStore, selectIsDownloaded } from '../stores/downloadStore'
import { formatTime } from '../utils/formatTime'
import { EditSongTagsModal } from './EditSongTagsModal'
import type { Song } from '../types'

/** Fixed row height — lets FlatList skip measuring (getItemLayout) and keeps scrolling smooth. */
export const SONG_ROW_HEIGHT = 60

interface SongListItemProps {
	song: Song
	onPress: (song: Song) => void
	isActive?: boolean
	showDuration?: boolean
	index?: number
	onMenuAction?: (action: 'download' | 'playlist', song: Song) => void
}

/** Pulsing "now playing" note. Own component so idle rows carry no animation state. */
function PulsingNote() {
	const opacity = useSharedValue(1)

	React.useEffect(() => {
		opacity.value = withRepeat(
			withSequence(withTiming(0.4, { duration: 1000 }), withTiming(1, { duration: 1000 })),
			-1,
			true
		)
	}, [opacity])

	const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

	return (
		<Animated.View style={style}>
			<Ionicons name="musical-notes" size={14} color="rgba(0,220,255,0.9)" />
		</Animated.View>
	)
}

/**
 * Song row component used in search results, library, and queue.
 * Shows thumbnail, title, artist, duration, and play indicator.
 *
 * Performance notes: the action-menu and tag-editor modals are mounted lazily
 * (only after the row's menu is first opened). Mounting them in every row ran
 * the tag editor's metadata-init effect for every song in the list, which
 * rewrote the persisted playlist-metadata store once per row.
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
	const isAero = theme.id === 'frutiger-aero'
	const isDownloaded = useDownloadStore((s) => selectIsDownloaded(s, song.id))
	const downloadProgress = useDownloadStore((s) => s.activeDownloads[song.id])
	const isDownloading = downloadProgress !== undefined

	const [menuVisible, setMenuVisible] = React.useState(false)
	const [editTagsVisible, setEditTagsVisible] = React.useState(false)
	// Becomes true on first open and stays true so close animations still play.
	const [menuMounted, setMenuMounted] = React.useState(false)
	const [tagsMounted, setTagsMounted] = React.useState(false)

	const openMenu = React.useCallback(() => {
		setMenuMounted(true)
		setMenuVisible(true)
	}, [])
	const closeMenu = React.useCallback(() => setMenuVisible(false), [])
	const openTags = React.useCallback(() => {
		setTagsMounted(true)
		setEditTagsVisible(true)
	}, [])
	const closeTags = React.useCallback(() => setEditTagsVisible(false), [])
	const handlePress = React.useCallback(() => onPress(song), [onPress, song])

	const menuIconColor = isAero ? 'rgba(180,240,255,0.95)' : theme.colors.textPrimary
	const menuTextStyle = { color: menuIconColor }

	return (
		<TouchableOpacity
			style={[
				styles.container,
				isAero
					? {
							backgroundColor: isActive ? 'rgba(0,160,255,0.2)' : 'transparent',
							borderBottomWidth: 1,
							borderBottomColor: 'rgba(255,255,255,0.07)',
							borderLeftWidth: 2,
							borderLeftColor: isActive ? 'rgba(0,200,255,0.8)' : 'transparent',
						}
					: {
							backgroundColor: isActive ? theme.colors.controlBackgroundActive : 'transparent',
							borderRadius: theme.metrics.borderRadiusSmall,
						},
			]}
			onPress={handlePress}
			activeOpacity={0.7}
		>
			{/* Index number (for queue view) */}
			{index !== undefined && (
				<View style={styles.indexContainer}>
					{isActive && isAero ? (
						<PulsingNote />
					) : (
						<Text
							style={[
								styles.index,
								isAero
									? {
											color: isActive ? 'rgba(0,220,255,0.9)' : 'rgba(0,150,200,0.5)',
											fontSize: 9,
											fontFamily: 'Orbitron_600SemiBold',
										}
									: {
											color: theme.colors.textMuted,
											fontSize: theme.typography.captionSize,
										},
							]}
						>
							{isAero ? String(index + 1).padStart(2, '0') : index + 1}
						</Text>
					)}
				</View>
			)}

			{/* Thumbnail */}
			<View style={[styles.thumbnailContainer, { borderRadius: theme.metrics.borderRadiusSmall }]}>
				{song.thumbnail ? (
					<Image
						source={{ uri: song.thumbnail }}
						style={[styles.thumbnail, { borderRadius: theme.metrics.borderRadiusSmall }]}
						contentFit="cover"
						transition={150}
						recyclingKey={song.id}
						cachePolicy="memory-disk"
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
					<View style={[styles.playingOverlay, { borderRadius: theme.metrics.borderRadiusSmall }]}>
						<Ionicons name="play" size={16} color={theme.colors.textOnAccent} />
					</View>
				)}
			</View>

			{/* Song info */}
			<View style={styles.info}>
				<Text
					style={[
						styles.title,
						{
							color: isActive ? theme.colors.accentPrimary : theme.colors.textPrimary,
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

			<View style={styles.trailing}>
				{/* Downloaded Indicator */}
				{isDownloaded && (
					<Ionicons
						name="checkmark-circle"
						size={14}
						color={isAero ? 'rgba(0,255,100,0.8)' : theme.colors.accentPrimary}
						style={styles.downloadedIcon}
					/>
				)}

				{/* Download Progress or Duration */}
				{isDownloading ? (
					<Text
						style={[
							styles.duration,
							{ color: theme.colors.accentPrimary, fontSize: 10, fontWeight: '600' },
						]}
					>
						{Math.round(downloadProgress * 100)}%
					</Text>
				) : (
					showDuration && (
						<Text
							style={[
								styles.duration,
								isAero
									? {
											color: isActive ? 'rgba(0,200,255,0.8)' : 'rgba(0,150,200,0.5)',
											fontSize: 9,
											fontFamily: 'Orbitron_600SemiBold',
											letterSpacing: 1,
										}
									: {
											color: theme.colors.textMuted,
											fontSize: theme.typography.captionSize,
										},
							]}
						>
							{formatTime(song.duration)}
						</Text>
					)
				)}

				{/* Action Menu (hide while downloading) */}
				{!isDownloading && (
					<>
						<TouchableOpacity style={styles.menuButton} onPress={openMenu}>
							<Ionicons
								name="ellipsis-vertical"
								size={16}
								color={isAero ? 'rgba(0,200,255,0.7)' : theme.colors.textMuted}
							/>
						</TouchableOpacity>

						{menuMounted && (
							<Modal
								visible={menuVisible}
								transparent={true}
								animationType="fade"
								onRequestClose={closeMenu}
							>
								<Pressable style={styles.modalOverlay} onPress={closeMenu}>
									<View
										style={[
											styles.modalContent,
											isAero
												? {
														backgroundColor: 'rgba(0,30,70,0.95)',
														borderColor: 'rgba(0,180,255,0.4)',
														borderWidth: 1,
													}
												: { backgroundColor: theme.colors.controlBackground },
										]}
									>
										<TouchableOpacity
											style={styles.modalOption}
											onPress={() => {
												closeMenu()
												onMenuAction?.('playlist', song)
											}}
										>
											<Ionicons name="list" size={20} color={menuIconColor} />
											<Text style={[styles.modalOptionText, menuTextStyle]}>Add to Playlist</Text>
										</TouchableOpacity>

										<TouchableOpacity
											style={styles.modalOption}
											onPress={() => {
												closeMenu()
												openTags()
											}}
										>
											<Ionicons name="sparkles-outline" size={20} color={menuIconColor} />
											<Text style={[styles.modalOptionText, menuTextStyle]}>Edit Mood & Energy</Text>
										</TouchableOpacity>

										{!song.id.startsWith('local_') && (
											<TouchableOpacity
												style={styles.modalOption}
												onPress={() => {
													closeMenu()
													onMenuAction?.('download', song)
												}}
											>
												<Ionicons
													name={isDownloaded ? 'trash-outline' : 'download-outline'}
													size={20}
													color={menuIconColor}
												/>
												<Text style={[styles.modalOptionText, menuTextStyle]}>
													{isDownloaded ? 'Remove Download' : 'Download for Offline'}
												</Text>
											</TouchableOpacity>
										)}
									</View>
								</Pressable>
							</Modal>
						)}

						{tagsMounted && (
							<EditSongTagsModal visible={editTagsVisible} song={song} onClose={closeTags} />
						)}
					</>
				)}
			</View>
		</TouchableOpacity>
	)
})

const styles = StyleSheet.create({
	container: {
		height: SONG_ROW_HEIGHT,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
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
	playingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
		justifyContent: 'center',
		alignItems: 'center',
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
	trailing: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	downloadedIcon: {
		marginRight: 6,
	},
	duration: {
		fontWeight: '500',
		marginLeft: 8,
	},
	menuButton: {
		padding: 8,
		marginLeft: 4,
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
