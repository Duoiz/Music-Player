import React, { useState, useCallback, useMemo, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	FlatList,
	TextInput,
	ActivityIndicator,
	Platform,
	type GestureResponderEvent,
	type LayoutChangeEvent,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/components/ThemeProvider'
import { GlassCard } from '../../src/components/GlassCard'
import { BackgroundParticles } from '../../src/components/BackgroundParticles'
import { SongListItem, SONG_ROW_HEIGHT } from '../../src/components/SongListItem'
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

const TABS: { id: TabType; label: string }[] = [
	{ id: 'device', label: 'Device' },
	{ id: 'downloads', label: 'Downloads' },
	{ id: 'playlists', label: 'Playlists' },
	{ id: 'queue', label: 'Queue' },
]

const RAIL_LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]
/** Only show the A–Z jump rail when the list is long enough to need it. */
const RAIL_MIN_TRACKS = 30

const toSong = (track: Track): Song => ({
	...track,
	videoId: track.id,
	thumbnail: track.artwork || '',
})

const letterOf = (title: string): string => {
	const c = title.trim().charAt(0).toUpperCase()
	return c >= 'A' && c <= 'Z' ? c : '#'
}

const shuffleCopy = <T,>(items: T[]): T[] => {
	const copy = items.slice()
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[copy[i], copy[j]] = [copy[j], copy[i]]
	}
	return copy
}

/* -------------------------------------------------------------------------- */
/*  Virtualized track list                                                     */
/* -------------------------------------------------------------------------- */

interface TrackListProps {
	tracks: Track[]
	showIndex?: boolean
	empty: React.ReactElement
	listRef?: React.Ref<FlatList<Song>>
	onMenuAction: (action: 'download' | 'playlist', song: Song) => void
}

const getItemLayout = (_: unknown, index: number) => ({
	length: SONG_ROW_HEIGHT,
	offset: SONG_ROW_HEIGHT * index,
	index,
})

/**
 * Windowed list of songs. Only the rows near the viewport are mounted, so a
 * library with thousands of tracks opens instantly (the old ScrollView + map
 * mounted every row up-front).
 */
const TrackList = React.memo(function TrackList({
	tracks,
	showIndex = false,
	empty,
	listRef,
	onMenuAction,
}: TrackListProps) {
	const play = usePlayerStore((s) => s.play)
	const currentId = usePlayerStore((s) => s.currentTrack?.id)

	const songs = useMemo(() => tracks.map(toSong), [tracks])

	const handlePress = useCallback(
		(song: Song) => {
			const track = tracks.find((t) => t.id === song.id)
			if (track) play(track, tracks)
		},
		[tracks, play]
	)

	const renderItem = useCallback(
		({ item, index }: { item: Song; index: number }) => (
			<SongListItem
				song={item}
				index={showIndex ? index : undefined}
				isActive={currentId === item.id}
				onMenuAction={onMenuAction}
				onPress={handlePress}
			/>
		),
		[showIndex, currentId, onMenuAction, handlePress]
	)

	const keyExtractor = useCallback(
		(item: Song, index: number) => (showIndex ? `${item.id}-${index}` : item.id),
		[showIndex]
	)

	return (
		<FlatList
			ref={listRef}
			data={songs}
			extraData={currentId}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			getItemLayout={getItemLayout}
			initialNumToRender={14}
			maxToRenderPerBatch={10}
			updateCellsBatchingPeriod={40}
			windowSize={7}
			removeClippedSubviews={Platform.OS === 'android'}
			ListEmptyComponent={empty}
			contentContainerStyle={styles.listContent}
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps="handled"
		/>
	)
})

/* -------------------------------------------------------------------------- */
/*  A–Z jump rail                                                              */
/* -------------------------------------------------------------------------- */

interface AlphaRailProps {
	available: Set<string>
	onSelect: (letter: string) => void
	color: string
	dimColor: string
	bubbleBackground: string
	bubbleColor: string
}

/** Touch/drag strip on the right edge that jumps the list to a letter. */
function AlphaRail({ available, onSelect, color, dimColor, bubbleBackground, bubbleColor }: AlphaRailProps) {
	const [height, setHeight] = useState(0)
	const [active, setActive] = useState<string | null>(null)
	const lastLetter = useRef<string | null>(null)

	const handleTouch = useCallback(
		(e: GestureResponderEvent) => {
			if (height <= 0) return
			const y = Math.min(Math.max(e.nativeEvent.locationY, 0), height - 1)
			const letter = RAIL_LETTERS[Math.floor((y / height) * RAIL_LETTERS.length)]
			if (letter !== lastLetter.current) {
				lastLetter.current = letter
				setActive(letter)
				onSelect(letter)
			}
		},
		[height, onSelect]
	)

	const handleRelease = useCallback(() => {
		lastLetter.current = null
		setActive(null)
	}, [])

	return (
		<>
			{active && (
				<View pointerEvents="none" style={styles.railBubbleWrap}>
					<View style={[styles.railBubble, { backgroundColor: bubbleBackground }]}>
						<Text style={[styles.railBubbleText, { color: bubbleColor }]}>{active}</Text>
					</View>
				</View>
			)}
			<View
				style={styles.rail}
				onLayout={(e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height)}
				onStartShouldSetResponder={() => true}
				onMoveShouldSetResponder={() => true}
				onResponderTerminationRequest={() => false}
				onResponderGrant={handleTouch}
				onResponderMove={handleTouch}
				onResponderRelease={handleRelease}
				onResponderTerminate={handleRelease}
			>
				{/* pointerEvents none so locationY is relative to the rail, not a letter */}
				<View pointerEvents="none" style={styles.railLetters}>
					{RAIL_LETTERS.map((l) => (
						<Text
							key={l}
							style={[styles.railLetter, { color: available.has(l) ? color : dimColor }]}
						>
							{l}
						</Text>
					))}
				</View>
			</View>
		</>
	)
}

/* -------------------------------------------------------------------------- */
/*  Screen                                                                     */
/* -------------------------------------------------------------------------- */

export default function LibraryScreen() {
	const theme = useTheme()
	const isAero = theme.id === 'frutiger-aero'
	const haptic = useHapticFeedback()
	const queue = usePlayerStore((s) => s.queue)
	const clearQueue = usePlayerStore((s) => s.clearQueue)
	const play = usePlayerStore((s) => s.play)

	const playlists = usePlaylistStore((s) => s.playlists)
	const downloadedTracks = useDownloadStore((s) => s.downloadedTracks)
	const isDownloaded = useDownloadStore((s) => s.isDownloaded)

	const deviceTracks = useDeviceMediaStore((s) => s.deviceTracks)
	const isScanning = useDeviceMediaStore((s) => s.isScanning)
	const scanTracks = useDeviceMediaStore((s) => s.scanTracks)

	const [activeTab, setActiveTab] = useState<TabType>('device')
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedSong, setSelectedSong] = useState<Song | null>(null)
	const [viewingPlaylistId, setViewingPlaylistId] = useState<string | null>(null)
	const [deviceSearchQuery, setDeviceSearchQuery] = useState('')
	const [autoPlaylistVisible, setAutoPlaylistVisible] = useState(false)

	const deviceListRef = useRef<FlatList<Song>>(null)

	// Alphabetical, so the A–Z rail maps letters to list positions.
	const sortedDeviceTracks = useMemo(
		() => [...deviceTracks].sort((a, b) => a.title.localeCompare(b.title)),
		[deviceTracks]
	)

	const filteredDeviceTracks = useMemo(() => {
		const q = deviceSearchQuery.trim().toLowerCase()
		if (!q) return sortedDeviceTracks
		return sortedDeviceTracks.filter(
			(t) =>
				t.title.toLowerCase().includes(q) ||
				t.artist.toLowerCase().includes(q) ||
				(t.album && t.album.toLowerCase().includes(q))
		)
	}, [sortedDeviceTracks, deviceSearchQuery])

	// First list index for each letter, for the jump rail.
	const letterIndex = useMemo(() => {
		const map = new Map<string, number>()
		filteredDeviceTracks.forEach((t, i) => {
			const l = letterOf(t.title)
			if (!map.has(l)) map.set(l, i)
		})
		return map
	}, [filteredDeviceTracks])
	const availableLetters = useMemo(() => new Set(letterIndex.keys()), [letterIndex])

	const handleRailSelect = useCallback(
		(letter: string) => {
			// Land on the requested letter, or the next one that has songs.
			const start = RAIL_LETTERS.indexOf(letter)
			for (let i = start; i < RAIL_LETTERS.length; i++) {
				const index = letterIndex.get(RAIL_LETTERS[i])
				if (index !== undefined) {
					deviceListRef.current?.scrollToIndex({ index, animated: false })
					return
				}
			}
			// Past the last populated letter — jump to the end.
			const last = filteredDeviceTracks.length - 1
			if (last >= 0) deviceListRef.current?.scrollToIndex({ index: last, animated: false })
		},
		[letterIndex, filteredDeviceTracks.length]
	)

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
			const shuffled = shuffleCopy(filteredDeviceTracks)
			play(shuffled[0], shuffled)
		}
	}, [filteredDeviceTracks, haptic, play])

	const handleSelectTab = useCallback(
		(tab: TabType) => {
			haptic.selection()
			setActiveTab(tab)
			setViewingPlaylistId(null)
		},
		[haptic]
	)

	const viewingPlaylist = viewingPlaylistId
		? playlists.find((p) => p.id === viewingPlaylistId)
		: undefined

	const accent = theme.colors.accentPrimary
	const pillBackground = isAero ? 'rgba(0, 180, 255, 0.25)' : accent + '25'
	const fieldBackground = isAero ? 'rgba(10, 45, 75, 0.55)' : theme.colors.controlBackground
	const titleStyle = isAero
		? {
				color: 'rgba(230,250,255,1)',
				fontSize: 30,
				fontFamily: 'Rajdhani_700Bold',
				textShadowColor: 'rgba(0,0,0,0.6)',
				textShadowOffset: { width: 0, height: 2 },
				textShadowRadius: 6,
				textTransform: 'lowercase' as const,
			}
		: { color: theme.colors.textPrimary, fontSize: 26, fontWeight: '800' as const }

	const renderEmpty = (
		title: string,
		subtitle: string,
		icon: keyof typeof Ionicons.glyphMap,
		actionButton?: React.ReactNode
	) => (
		<GlassCard style={styles.emptyCard} intensity="light" variant={isAero ? 'dark' : 'default'}>
			<Ionicons name={icon} size={44} color={isAero ? 'rgba(0,180,255,0.7)' : theme.colors.textMuted} />
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
			<Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
			{actionButton}
		</GlassCard>
	)

	/* ----------------------------- header actions ---------------------------- */

	const pill = (
		icon: keyof typeof Ionicons.glyphMap,
		label: string,
		onPress: () => void,
		opts?: { loading?: boolean; disabled?: boolean }
	) => (
		<TouchableOpacity
			style={[styles.pill, { backgroundColor: pillBackground, borderColor: accent }]}
			onPress={onPress}
			disabled={opts?.disabled}
		>
			{opts?.loading ? (
				<ActivityIndicator size="small" color={accent} />
			) : (
				<Ionicons name={icon} size={15} color={accent} />
			)}
			<Text style={[styles.pillText, { color: accent }]}>{label}</Text>
		</TouchableOpacity>
	)

	const renderHeaderActions = () => {
		if (activeTab === 'device') {
			return pill('refresh', isScanning ? 'Scanning' : 'Scan', handleScanDevice, {
				loading: isScanning,
				disabled: isScanning,
			})
		}
		if (activeTab === 'queue' && queue.length > 0) {
			return pill('trash-outline', 'Clear', () => clearQueue())
		}
		if (activeTab === 'playlists' && !viewingPlaylistId) {
			return (
				<View style={styles.headerActionsRow}>
					{pill('sparkles', 'Smart Mix', () => {
						haptic.medium()
						setAutoPlaylistVisible(true)
					})}
					{pill('add', 'New', () => setModalVisible(true))}
				</View>
			)
		}
		return null
	}

	/* ------------------------------- tab bodies ------------------------------ */

	const renderDeviceToolbar = () =>
		deviceTracks.length > 0 ? (
			<View style={styles.toolbar}>
				<View style={[styles.searchBox, { backgroundColor: fieldBackground, borderColor: theme.colors.divider }]}>
					<Ionicons name="search" size={16} color={theme.colors.textSecondary} />
					<TextInput
						value={deviceSearchQuery}
						onChangeText={setDeviceSearchQuery}
						placeholder={`Search ${deviceTracks.length.toLocaleString()} songs`}
						placeholderTextColor={theme.colors.textMuted}
						style={[styles.searchInput, { color: theme.colors.textPrimary }]}
						returnKeyType="search"
					/>
					{deviceSearchQuery.length > 0 && (
						<TouchableOpacity onPress={() => setDeviceSearchQuery('')} hitSlop={8}>
							<Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
						</TouchableOpacity>
					)}
				</View>
				<TouchableOpacity
					style={[styles.iconBtn, { backgroundColor: accent }]}
					onPress={handlePlayAllDevice}
					accessibilityLabel="Play all"
				>
					<Ionicons name="play" size={18} color={theme.colors.textOnAccent} />
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.iconBtn, { backgroundColor: pillBackground, borderColor: accent, borderWidth: 1 }]}
					onPress={handleShuffleDevice}
					accessibilityLabel="Shuffle all"
				>
					<Ionicons name="shuffle" size={18} color={accent} />
				</TouchableOpacity>
			</View>
		) : null

	const renderDeviceBody = () => {
		if (isScanning && deviceTracks.length === 0) {
			return (
				<View style={styles.emptyWrap}>
					<GlassCard style={styles.emptyCard} intensity="light" variant={isAero ? 'dark' : 'default'}>
						<ActivityIndicator size="large" color={accent} />
						<Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
							Scanning device storage…
						</Text>
						<Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
							Searching for local MP3, M4A and FLAC files.
						</Text>
					</GlassCard>
				</View>
			)
		}
		if (deviceTracks.length === 0) {
			return (
				<View style={styles.emptyWrap}>
					{renderEmpty(
						'No MP3s detected',
						'Scan your device to find music in your Downloads or Music folders.',
						'musical-notes-outline',
						<TouchableOpacity
							style={[styles.prominentBtn, { backgroundColor: accent }]}
							onPress={handleScanDevice}
						>
							<Ionicons name="scan-outline" size={18} color={theme.colors.textOnAccent} />
							<Text style={[styles.prominentBtnText, { color: theme.colors.textOnAccent }]}>Scan device</Text>
						</TouchableOpacity>
					)}
				</View>
			)
		}
		return (
			<View style={styles.listArea}>
				<TrackList
					tracks={filteredDeviceTracks}
					empty={renderEmpty('No matching songs', 'Try a different title or artist.', 'search')}
					listRef={deviceListRef}
					onMenuAction={handleMenuAction}
				/>
				{filteredDeviceTracks.length >= RAIL_MIN_TRACKS && (
					<AlphaRail
						available={availableLetters}
						onSelect={handleRailSelect}
						color={accent}
						dimColor={theme.colors.textMuted + '66'}
						bubbleBackground={accent}
						bubbleColor={theme.colors.textOnAccent}
					/>
				)}
			</View>
		)
	}

	const renderPlaylistsBody = () => {
		if (viewingPlaylistId) {
			if (!viewingPlaylist) return null
			return (
				<View style={styles.listArea}>
					<TrackList
						tracks={viewingPlaylist.tracks}
						showIndex
						empty={renderEmpty('Playlist is empty', 'Add songs to this playlist.', 'musical-notes')}
						onMenuAction={handleMenuAction}
					/>
				</View>
			)
		}
		return (
			<FlatList
				data={playlists}
				keyExtractor={(p) => p.id}
				renderItem={({ item }) => (
					<TouchableOpacity style={styles.playlistRow} onPress={() => setViewingPlaylistId(item.id)}>
						<Ionicons name="list" size={24} color={accent} />
						<View style={styles.playlistInfo}>
							<Text style={[styles.playlistName, { color: theme.colors.textPrimary }]}>{item.name}</Text>
							<Text style={[styles.playlistCount, { color: theme.colors.textSecondary }]}>
								{item.tracks.length} {item.tracks.length === 1 ? 'song' : 'songs'}
							</Text>
						</View>
						<Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
					</TouchableOpacity>
				)}
				ListEmptyComponent={renderEmpty(
					'No playlists',
					'Create one with New, or let Smart Mix build one for you.',
					'list'
				)}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
			/>
		)
	}

	const renderBody = () => {
		switch (activeTab) {
			case 'device':
				return renderDeviceBody()
			case 'downloads':
				return (
					<View style={styles.listArea}>
						<TrackList
							tracks={downloadedTracks}
							empty={renderEmpty('No downloads', 'Download songs to listen offline.', 'cloud-offline')}
							onMenuAction={handleMenuAction}
						/>
					</View>
				)
			case 'playlists':
				return renderPlaylistsBody()
			case 'queue':
				return (
					<View style={styles.listArea}>
						<TrackList
							tracks={queue}
							showIndex
							empty={renderEmpty('Queue is empty', 'Play a song to see it here.', 'list')}
							onMenuAction={handleMenuAction}
						/>
					</View>
				)
		}
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
				{/* Pinned header: stays on screen while the list scrolls */}
				<View style={styles.header}>
					<View style={styles.titleRow}>
						{viewingPlaylist ? (
							<TouchableOpacity
								onPress={() => setViewingPlaylistId(null)}
								style={styles.backRow}
								hitSlop={8}
							>
								<Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
								<Text style={[styles.title, titleStyle, { flexShrink: 1 }]} numberOfLines={1}>
									{viewingPlaylist.name}
								</Text>
							</TouchableOpacity>
						) : (
							<Text style={[styles.title, titleStyle]}>Library</Text>
						)}
						{renderHeaderActions()}
					</View>

					<View style={styles.tabsContainer}>
						{TABS.map((tab) => {
							const isActive = activeTab === tab.id
							return (
								<TouchableOpacity
									key={tab.id}
									style={[styles.tab, isActive && { backgroundColor: accent }]}
									onPress={() => handleSelectTab(tab.id)}
								>
									<Text
										numberOfLines={1}
										style={[
											styles.tabText,
											isActive
												? { color: theme.colors.textOnAccent, fontWeight: '700' }
												: { color: theme.colors.textSecondary },
										]}
									>
										{tab.label}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>

					{activeTab === 'device' && renderDeviceToolbar()}
				</View>

				<View style={styles.body}>{renderBody()}</View>
			</SafeAreaView>

			<PlaylistModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				song={selectedSong}
			/>

			<AutoPlaylistModal visible={autoPlaylistVisible} onClose={() => setAutoPlaylistVisible(false)} />
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	safeArea: { flex: 1 },
	body: { flex: 1 },
	listArea: { flex: 1 },
	// Room for the floating mini-player + tab bar
	listContent: { paddingHorizontal: 16, paddingBottom: 150 },

	header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, gap: 10 },
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		minHeight: 38,
		gap: 8,
	},
	title: { letterSpacing: -0.5 },
	backRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
	headerActionsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },

	pill: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 16,
		borderWidth: 1,
		gap: 6,
	},
	pillText: { fontSize: 12, fontWeight: '700' },

	tabsContainer: { flexDirection: 'row', gap: 6 },
	tab: {
		flex: 1,
		paddingVertical: 8,
		borderRadius: 18,
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
	tabText: { fontSize: 12 },

	toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	searchBox: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		height: 38,
		borderRadius: 19,
		borderWidth: 1,
		gap: 6,
	},
	searchInput: { flex: 1, fontSize: 13, padding: 0 },
	iconBtn: {
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: 'center',
		justifyContent: 'center',
	},

	// A–Z rail
	rail: {
		position: 'absolute',
		right: 0,
		top: 8,
		bottom: 150,
		width: 26,
		justifyContent: 'center',
	},
	railLetters: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
	railLetter: { fontSize: 10, fontWeight: '700', lineHeight: 12 },
	railBubbleWrap: {
		...StyleSheet.absoluteFillObject,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 5,
	},
	railBubble: {
		width: 72,
		height: 72,
		borderRadius: 36,
		alignItems: 'center',
		justifyContent: 'center',
		opacity: 0.92,
	},
	railBubbleText: { fontSize: 34, fontWeight: '800' },

	emptyCard: { alignItems: 'center', paddingVertical: 32, gap: 10, marginTop: 12 },
	emptyWrap: { paddingHorizontal: 16 },
	emptyTitle: { fontSize: 17, fontWeight: '700' },
	emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 16 },
	prominentBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 20,
		gap: 8,
		marginTop: 6,
	},
	prominentBtnText: { fontSize: 14, fontWeight: '700' },

	playlistRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.05)',
		gap: 12,
	},
	playlistInfo: { flex: 1 },
	playlistName: { fontSize: 16, fontWeight: '500' },
	playlistCount: { fontSize: 12, marginTop: 2 },
})
