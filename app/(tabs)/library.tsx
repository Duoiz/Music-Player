import React, { useState, useCallback, useMemo } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/components/ThemeProvider'
import { GlassCard } from '../../src/components/GlassCard'
import { BackgroundParticles } from '../../src/components/BackgroundParticles'
import { SongListItem } from '../../src/components/SongListItem'
import { PlaylistModal } from '../../src/components/PlaylistModal'
import { AutoPlaylistModal } from '../../src/components/AutoPlaylistModal'
import { usePlayerStore } from '../../src/stores/playerStore'
import { usePlaylistStore } from '../../src/stores/playlistStore'
import { useDownloadStore } from '../../src/stores/downloadStore'
import { useDeviceMediaStore } from '../../src/stores/deviceMediaStore'
import { useHapticFeedback } from '../../src/hooks/useHapticFeedback'
import { downloadSong, deleteDownloadedSong } from '../../src/services/downloadService'
import type { Song, Track } from '../../src/types'

type TabType = 'device' | 'downloads' | 'playlists' | 'queue'

export default function LibraryScreen() {
	const theme = useTheme()
	const haptic = useHapticFeedback()
	const queue = usePlayerStore((s) => s.queue)
	const currentTrack = usePlayerStore((s) => s.currentTrack)
	const clearQueue = usePlayerStore((s) => s.clearQueue)
	const play = usePlayerStore((s) => s.play)

	const playlists = usePlaylistStore((s) => s.playlists)
	const downloadedTracks = useDownloadStore((s) => s.downloadedTracks)
	const isDownloaded = useDownloadStore((s) => s.isDownloaded)

	// Device Media Store
	const deviceTracks = useDeviceMediaStore((s) => s.deviceTracks)
	const isScanning = useDeviceMediaStore((s) => s.isScanning)
	const scanTracks = useDeviceMediaStore((s) => s.scanTracks)

	const [activeTab, setActiveTab] = useState<TabType>('device')
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedSong, setSelectedSong] = useState<Song | null>(null)
	const [viewingPlaylistId, setViewingPlaylistId] = useState<string | null>(null)
	const [deviceSearchQuery, setDeviceSearchQuery] = useState('')
	const [autoPlaylistVisible, setAutoPlaylistVisible] = useState(false)

	const queueAsSongs: Song[] = useMemo(
		() =>
			queue.map((t) => ({
				id: t.id,
				title: t.title,
				artist: t.artist,
				thumbnail: t.artwork,
				duration: t.duration,
				videoId: '',
			})),
		[queue]
	)

	// Filtered device tracks
	const filteredDeviceTracks = useMemo(() => {
		if (!deviceSearchQuery.trim()) return deviceTracks
		const q = deviceSearchQuery.toLowerCase()
		return deviceTracks.filter(
			(t) =>
				t.title.toLowerCase().includes(q) ||
				t.artist.toLowerCase().includes(q) ||
				(t.album && t.album.toLowerCase().includes(q))
		)
	}, [deviceTracks, deviceSearchQuery])

	const handleMenuAction = useCallback(
		(action: 'download' | 'playlist', song: Song) => {
			if (action === 'playlist') {
				setSelectedSong(song)
				setModalVisible(true)
			} else if (action === 'download') {
				if (isDownloaded(song.id)) {
					deleteDownloadedSong(song.id)
				} else {
					downloadSong(song)
				}
			}
		},
		[isDownloaded]
	)

	const handleScanDevice = useCallback(async () => {
		haptic.medium()
		await scanTracks()
	}, [haptic, scanTracks])

	const handlePlayAllDevice = useCallback(() => {
		if (filteredDeviceTracks.length > 0) {
			haptic.light()
			play(filteredDeviceTracks[0], filteredDeviceTracks)
		}
	}, [filteredDeviceTracks, haptic, play])

	const handleShuffleDevice = useCallback(() => {
		if (filteredDeviceTracks.length > 0) {
			haptic.light()
			const shuffled = [...filteredDeviceTracks].sort(() => Math.random() - 0.5)
			play(shuffled[0], shuffled)
		}
	}, [filteredDeviceTracks, haptic, play])

	const renderTabs = () => (
		<View style={styles.tabsContainer}>
			{(['device', 'downloads', 'playlists', 'queue'] as TabType[]).map((tab) => {
				const isActive = activeTab === tab
				let label = tab.charAt(0).toUpperCase() + tab.slice(1)
				if (tab === 'device') label = 'Device MP3s'

				return (
					<TouchableOpacity
						key={tab}
						style={[
							styles.tab,
							isActive && { backgroundColor: theme.colors.accentPrimary },
						]}
						onPress={() => {
							haptic.selection()
							setActiveTab(tab)
							setViewingPlaylistId(null)
						}}
					>
						<Text
							style={[
								styles.tabText,
								isActive
									? { color: theme.colors.textOnAccent, fontWeight: 'bold' }
									: { color: theme.colors.textSecondary },
							]}
						>
							{label}
						</Text>
					</TouchableOpacity>
				)
			})}
		</View>
	)

	const renderHeader = () => (
		<View style={styles.header}>
			<Text
				style={[
					styles.title,
					theme.id === 'frutiger-aero'
						? {
								color: 'rgba(230,250,255,1)',
								fontSize: 32,
								fontFamily: 'Rajdhani_700Bold',
								textShadowColor: 'rgba(0,0,0,0.6)',
								textShadowOffset: { width: 0, height: 2 },
								textShadowRadius: 6,
								textTransform: 'lowercase',
							}
						: {
								color: theme.colors.textPrimary,
								fontSize: 28,
								fontWeight: '800',
							},
				]}
			>
				Library
			</Text>
			{renderTabs()}
		</View>
	)

	const renderEmpty = (title: string, subtitle: string, icon: any, actionButton?: React.ReactNode) => (
		<GlassCard
			style={styles.emptyCard}
			intensity="light"
			variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}
		>
			<Ionicons
				name={icon}
				size={48}
				color={theme.id === 'frutiger-aero' ? 'rgba(0,180,255,0.7)' : theme.colors.textMuted}
			/>
			<Text
				style={[
					styles.emptyTitle,
					{
						color: theme.colors.textPrimary,
						fontFamily: theme.typography.fontFamily,
						textShadowColor: theme.typography.textShadowColor,
						textShadowOffset: theme.typography.textShadowOffset,
						textShadowRadius: theme.typography.textShadowRadius,
					},
				]}
			>
				{title}
			</Text>
			<Text
				style={[
					styles.emptySubtitle,
					{
						color: theme.colors.textSecondary,
						fontFamily: theme.typography.fontFamily,
						textShadowColor: theme.typography.textShadowColor,
						textShadowOffset: theme.typography.textShadowOffset,
						textShadowRadius: theme.typography.textShadowRadius,
					},
				]}
			>
				{subtitle}
			</Text>
			{actionButton}
		</GlassCard>
	)

	const renderDevice = () => (
		<>
			<View style={styles.sectionHeader}>
				<View>
					<Text
						style={[
							styles.sectionTitle,
							{
								color: theme.colors.textPrimary,
								fontFamily: theme.typography.fontFamily,
								textShadowColor: theme.typography.textShadowColor,
								textShadowOffset: theme.typography.textShadowOffset,
								textShadowRadius: theme.typography.textShadowRadius,
							},
						]}
					>
						Device Audio
					</Text>
					<Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>
						{deviceTracks.length} {deviceTracks.length === 1 ? 'song' : 'songs'} on device
					</Text>
				</View>

				<TouchableOpacity
					style={[
						styles.scanButton,
						{
							backgroundColor:
								theme.id === 'frutiger-aero'
									? 'rgba(0, 180, 255, 0.25)'
									: theme.colors.accentPrimary + '25',
							borderColor: theme.colors.accentPrimary,
						},
					]}
					onPress={handleScanDevice}
					disabled={isScanning}
				>
					{isScanning ? (
						<ActivityIndicator size="small" color={theme.colors.accentPrimary} />
					) : (
						<Ionicons name="refresh" size={16} color={theme.colors.accentPrimary} />
					)}
					<Text
						style={[
							styles.scanButtonText,
							{ color: theme.colors.accentPrimary, fontWeight: '700' },
						]}
					>
						{isScanning ? 'Scanning...' : 'Scan MP3s'}
					</Text>
				</TouchableOpacity>
			</View>

			{deviceTracks.length > 0 && (
				<>
					{/* Search & Actions Bar */}
					<View style={styles.deviceActionsRow}>
						<View
							style={[
								styles.searchInputContainer,
								{
									backgroundColor:
										theme.id === 'frutiger-aero'
											? 'rgba(10, 45, 75, 0.55)'
											: theme.colors.controlBackground,
									borderColor: theme.colors.divider,
								},
							]}
						>
							<Ionicons
								name="search"
								size={16}
								color={theme.colors.textSecondary}
								style={{ marginRight: 6 }}
							/>
							<TextInput
								value={deviceSearchQuery}
								onChangeText={setDeviceSearchQuery}
								placeholder="Filter on-device tracks..."
								placeholderTextColor={theme.colors.textMuted}
								style={[styles.searchInput, { color: theme.colors.textPrimary }]}
							/>
							{deviceSearchQuery.length > 0 && (
								<TouchableOpacity onPress={() => setDeviceSearchQuery('')}>
									<Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
								</TouchableOpacity>
							)}
						</View>

						<View style={styles.quickPlayButtons}>
							<TouchableOpacity
								style={[
									styles.quickPlayBtn,
									{ backgroundColor: theme.colors.accentPrimary },
								]}
								onPress={handlePlayAllDevice}
							>
								<Ionicons name="play" size={14} color={theme.colors.textOnAccent} />
								<Text style={[styles.quickPlayBtnText, { color: theme.colors.textOnAccent }]}>
									Play All
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.quickPlayBtn,
									{
										backgroundColor:
											theme.id === 'frutiger-aero'
												? 'rgba(0, 180, 255, 0.2)'
												: theme.colors.controlBackground,
										borderColor: theme.colors.divider,
										borderWidth: 1,
									},
								]}
								onPress={handleShuffleDevice}
							>
								<Ionicons name="shuffle" size={14} color={theme.colors.accentPrimary} />
								<Text style={[styles.quickPlayBtnText, { color: theme.colors.accentPrimary }]}>
									Shuffle
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</>
			)}

			{isScanning && deviceTracks.length === 0 ? (
				<GlassCard
					style={styles.emptyCard}
					intensity="light"
					variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}
				>
					<ActivityIndicator size="large" color={theme.colors.accentPrimary} />
					<Text style={[styles.emptyTitle, { color: theme.colors.textPrimary, marginTop: 12 }]}>
						Scanning Device Storage...
					</Text>
					<Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
						Searching for local MP3, M4A, and FLAC audio files.
					</Text>
				</GlassCard>
			) : deviceTracks.length === 0 ? (
				renderEmpty(
					'No MP3s Detected',
					'Scan your device to detect and play local music files stored in your Downloads or Music folders.',
					'musical-notes-outline',
					<TouchableOpacity
						style={[
							styles.prominentScanBtn,
							{ backgroundColor: theme.colors.accentPrimary },
						]}
						onPress={handleScanDevice}
					>
						<Ionicons name="scan-outline" size={18} color={theme.colors.textOnAccent} />
						<Text style={[styles.prominentScanBtnText, { color: theme.colors.textOnAccent }]}>
							Scan Device for MP3s
						</Text>
					</TouchableOpacity>
				)
			) : filteredDeviceTracks.length === 0 ? (
				renderEmpty('No Matching Songs', 'Try searching for a different title or artist.', 'search')
			) : (
				filteredDeviceTracks.map((track, index) => {
					const song: Song = {
						...track,
						videoId: track.id,
						thumbnail: track.artwork || '',
					}
					return (
						<SongListItem
							key={track.id}
							song={song}
							index={index}
							isActive={currentTrack?.id === track.id}
							onMenuAction={handleMenuAction}
							onPress={() => play(track, filteredDeviceTracks)}
						/>
					)
				})
			)}
		</>
	)

	const renderQueue = () => (
		<>
			<View style={styles.sectionHeader}>
				<Text
					style={[
						styles.sectionTitle,
						{
							color: theme.colors.textPrimary,
							fontFamily: theme.typography.fontFamily,
							textShadowColor: theme.typography.textShadowColor,
							textShadowOffset: theme.typography.textShadowOffset,
							textShadowRadius: theme.typography.textShadowRadius,
						},
					]}
				>
					Current Queue
				</Text>
				{queue.length > 0 && (
					<TouchableOpacity onPress={clearQueue}>
						<Text style={{ color: theme.colors.accentPrimary, fontWeight: '600' }}>Clear</Text>
					</TouchableOpacity>
				)}
			</View>
			{queue.length === 0
				? renderEmpty('Queue is empty', 'Play a song to see it here.', 'list')
				: queueAsSongs.map((song, index) => (
						<SongListItem
							key={`${song.id}-${index}`}
							song={song}
							index={index}
							isActive={currentTrack?.id === song.id}
							onMenuAction={handleMenuAction}
							onPress={() => play(queue[index], queue)}
						/>
					))}
		</>
	)

	const renderDownloads = () => (
		<>
			<View style={styles.sectionHeader}>
				<Text
					style={[
						styles.sectionTitle,
						{
							color: theme.colors.textPrimary,
							fontFamily: theme.typography.fontFamily,
							textShadowColor: theme.typography.textShadowColor,
							textShadowOffset: theme.typography.textShadowOffset,
							textShadowRadius: theme.typography.textShadowRadius,
						},
					]}
				>
					Offline Songs
				</Text>
			</View>
			{downloadedTracks.length === 0
				? renderEmpty('No downloads', 'Download songs to listen offline.', 'cloud-offline')
				: downloadedTracks.map((track, index) => {
						const song: Song = { ...track, videoId: track.id, thumbnail: track.artwork || '' }
						return (
							<SongListItem
								key={song.id}
								song={song}
								index={index}
								isActive={currentTrack?.id === song.id}
								onMenuAction={handleMenuAction}
								onPress={() => play(track, downloadedTracks)}
							/>
						)
					})}
		</>
	)

	const renderPlaylists = () => {
		if (viewingPlaylistId) {
			const playlist = playlists.find((p) => p.id === viewingPlaylistId)
			if (!playlist) return null
			return (
				<>
					<View style={styles.sectionHeader}>
						<TouchableOpacity
							onPress={() => setViewingPlaylistId(null)}
							style={{ flexDirection: 'row', alignItems: 'center' }}
						>
							<Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
							<Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginLeft: 8 }]}>
								{playlist.name}
							</Text>
						</TouchableOpacity>
					</View>
					{playlist.tracks.length === 0
						? renderEmpty('Playlist is empty', 'Add songs to this playlist.', 'musical-notes')
						: playlist.tracks.map((track, index) => {
								const song: Song = { ...track, videoId: track.id, thumbnail: track.artwork || '' }
								return (
									<SongListItem
										key={song.id}
										song={song}
										index={index}
										isActive={currentTrack?.id === song.id}
										onMenuAction={handleMenuAction}
										onPress={() => play(track, playlist.tracks)}
									/>
								)
							})}
				</>
			)
		}

		return (
			<>
				<View style={styles.sectionHeader}>
					<Text
						style={[
							styles.sectionTitle,
							{
								color: theme.colors.textPrimary,
								fontFamily: theme.typography.fontFamily,
								textShadowColor: theme.typography.textShadowColor,
								textShadowOffset: theme.typography.textShadowOffset,
								textShadowRadius: theme.typography.textShadowRadius,
							},
						]}
					>
						Your Playlists
					</Text>
					<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
						<TouchableOpacity
							style={[
								styles.smartMixHeaderBtn,
								{
									backgroundColor:
										theme.id === 'frutiger-aero'
											? 'rgba(0, 180, 255, 0.25)'
											: theme.colors.accentPrimary + '20',
									borderColor: theme.colors.accentPrimary,
								},
							]}
							onPress={() => {
								haptic.medium()
								setAutoPlaylistVisible(true)
							}}
						>
							<Ionicons name="sparkles" size={13} color={theme.colors.accentPrimary} />
							<Text style={[styles.smartMixHeaderBtnText, { color: theme.colors.accentPrimary }]}>
								Smart Mix
							</Text>
						</TouchableOpacity>

						<TouchableOpacity onPress={() => setModalVisible(true)}>
							<Text style={{ color: theme.colors.accentPrimary, fontWeight: '600' }}>New</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Smart Mix Hero Banner */}
				<TouchableOpacity
					style={[
						styles.smartMixBanner,
						{
							backgroundColor:
								theme.id === 'frutiger-aero'
									? 'rgba(10, 50, 85, 0.65)'
									: theme.colors.controlBackground,
							borderColor:
								theme.id === 'frutiger-aero'
									? 'rgba(0, 200, 255, 0.4)'
									: theme.colors.divider,
						},
					]}
					onPress={() => {
						haptic.medium()
						setAutoPlaylistVisible(true)
					}}
					activeOpacity={0.8}
				>
					<View
						style={[
							styles.smartMixIconCircle,
							{ backgroundColor: theme.colors.accentPrimary },
						]}
					>
						<Ionicons name="sparkles" size={20} color={theme.colors.textOnAccent} />
					</View>
					<View style={{ flex: 1, gap: 2 }}>
						<Text style={[styles.smartMixBannerTitle, { color: theme.colors.textPrimary }]}>
							Auto-Playlist Generator
						</Text>
						<Text style={[styles.smartMixBannerSubtitle, { color: theme.colors.textSecondary }]}>
							Generate instant mood, workout, or chill mixes from your song pool
						</Text>
					</View>
					<Ionicons name="chevron-forward" size={18} color={theme.colors.accentPrimary} />
				</TouchableOpacity>
				{playlists.length === 0
					? renderEmpty('No playlists', 'Create a playlist to organize your music.', 'list')
					: playlists.map((playlist) => (
							<TouchableOpacity
								key={playlist.id}
								style={styles.playlistRow}
								onPress={() => setViewingPlaylistId(playlist.id)}
							>
								<Ionicons name="list" size={24} color={theme.colors.accentPrimary} />
								<View style={styles.playlistInfo}>
									<Text style={[styles.playlistName, { color: theme.colors.textPrimary }]}>
										{playlist.name}
									</Text>
									<Text style={[styles.playlistCount, { color: theme.colors.textSecondary }]}>
										{playlist.tracks.length} songs
									</Text>
								</View>
								<Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
							</TouchableOpacity>
						))}
			</>
		)
	}

	return (
		<LinearGradient
			colors={theme.colors.backgroundGradient as [string, string, ...string[]]}
			start={theme.colors.backgroundGradientStart}
			end={theme.colors.backgroundGradientEnd}
			style={styles.container}
		>
			<BackgroundParticles />
			<SafeAreaView style={styles.safeArea} edges={['top']}>
				<ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
					{renderHeader()}
					{activeTab === 'device' && renderDevice()}
					{activeTab === 'downloads' && renderDownloads()}
					{activeTab === 'playlists' && renderPlaylists()}
					{activeTab === 'queue' && renderQueue()}
					<View style={{ height: 140 }} />
				</ScrollView>
			</SafeAreaView>

			<PlaylistModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				song={selectedSong}
			/>

			<AutoPlaylistModal
				visible={autoPlaylistVisible}
				onClose={() => setAutoPlaylistVisible(false)}
			/>
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	safeArea: { flex: 1 },
	listContent: { paddingHorizontal: 16 },
	header: { paddingTop: 16, paddingBottom: 16, gap: 16 },
	title: { letterSpacing: -0.5 },
	tabsContainer: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
	tab: {
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 20,
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
	tabText: { fontSize: 13 },
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 14,
		marginTop: 8,
	},
	sectionTitle: { fontSize: 18, fontWeight: '700' },
	scanButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		borderWidth: 1,
		gap: 6,
	},
	scanButtonText: {
		fontSize: 12,
	},
	deviceActionsRow: {
		gap: 10,
		marginBottom: 14,
	},
	searchInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 12,
		borderWidth: 1,
	},
	searchInput: {
		flex: 1,
		fontSize: 13,
		padding: 0,
	},
	quickPlayButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	quickPlayBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderRadius: 14,
		gap: 6,
	},
	quickPlayBtnText: {
		fontSize: 12,
		fontWeight: '600',
	},
	prominentScanBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 20,
		gap: 8,
		marginTop: 8,
	},
	prominentScanBtnText: {
		fontSize: 14,
		fontWeight: '700',
	},
	emptyCard: { alignItems: 'center', paddingVertical: 40, gap: 12, marginTop: 20 },
	emptyTitle: { fontSize: 18, fontWeight: '700' },
	emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 16 },
	playlistRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.05)',
		gap: 12,
	},
	playlistInfo: { flex: 1 },
	playlistName: { fontSize: 16, fontWeight: '500' },
	playlistCount: { fontSize: 12, marginTop: 2 },
	smartMixHeaderBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 14,
		borderWidth: 1,
		gap: 4,
	},
	smartMixHeaderBtnText: {
		fontSize: 12,
		fontWeight: '700',
	},
	smartMixBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 16,
		borderWidth: 1,
		gap: 12,
		marginBottom: 16,
	},
	smartMixIconCircle: {
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: 'center',
		justifyContent: 'center',
	},
	smartMixBannerTitle: {
		fontSize: 14,
		fontWeight: '700',
	},
	smartMixBannerSubtitle: {
		fontSize: 11,
		lineHeight: 15,
	},
})
