import React, { useState, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/components/ThemeProvider'
import { GlassCard } from '../../src/components/GlassCard'
import { BackgroundParticles } from '../../src/components/BackgroundParticles'
import { SongListItem } from '../../src/components/SongListItem'
import { PlaylistModal } from '../../src/components/PlaylistModal'
import { usePlayerStore } from '../../src/stores/playerStore'
import { usePlaylistStore } from '../../src/stores/playlistStore'
import { useDownloadStore } from '../../src/stores/downloadStore'
import { downloadSong, deleteDownloadedSong } from '../../src/services/downloadService'
import type { Song, Track } from '../../src/types'

type TabType = 'queue' | 'playlists' | 'downloads'

export default function LibraryScreen() {
	const theme = useTheme()
	const queue = usePlayerStore((s) => s.queue)
	const currentTrack = usePlayerStore((s) => s.currentTrack)
	const clearQueue = usePlayerStore((s) => s.clearQueue)
	const play = usePlayerStore((s) => s.play)

	const playlists = usePlaylistStore((s) => s.playlists)
	const downloadedTracks = useDownloadStore((s) => s.downloadedTracks)
	const isDownloaded = useDownloadStore((s) => s.isDownloaded)

	const [activeTab, setActiveTab] = useState<TabType>('queue')
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedSong, setSelectedSong] = useState<Song | null>(null)
	const [viewingPlaylistId, setViewingPlaylistId] = useState<string | null>(null)

	const queueAsSongs: Song[] = queue.map((t) => ({
		id: t.id,
		title: t.title,
		artist: t.artist,
		thumbnail: t.artwork,
		duration: t.duration,
		videoId: '',
	}))

	const handleMenuAction = useCallback((action: 'download' | 'playlist', song: Song) => {
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
	}, [isDownloaded])

	const renderTabs = () => (
		<View style={styles.tabsContainer}>
			{(['queue', 'playlists', 'downloads'] as TabType[]).map((tab) => {
				const isActive = activeTab === tab
				return (
					<TouchableOpacity
						key={tab}
						style={[
							styles.tab,
							isActive && { backgroundColor: theme.colors.accentPrimary },
						]}
						onPress={() => {
							setActiveTab(tab)
							setViewingPlaylistId(null)
						}}
					>
						<Text
							style={[
								styles.tabText,
								isActive ? { color: theme.colors.textOnAccent, fontWeight: 'bold' } : { color: theme.colors.textSecondary },
							]}
						>
							{tab.charAt(0).toUpperCase() + tab.slice(1)}
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
					theme.id === 'frutiger-aero' ? {
						color: 'rgba(230,250,255,1)',
						fontSize: 32,
						fontFamily: 'Rajdhani_700Bold',
						textShadowColor: 'rgba(0,0,0,0.6)',
						textShadowOffset: { width: 0, height: 2 },
						textShadowRadius: 6,
						textTransform: 'lowercase',
					} : {
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

	const renderEmpty = (title: string, subtitle: string, icon: any) => (
		<GlassCard style={styles.emptyCard} intensity="light" variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}>
			<Ionicons name={icon} size={48} color={theme.id === 'frutiger-aero' ? 'rgba(0,180,255,0.7)' : theme.colors.textMuted} />
			<Text style={[styles.emptyTitle, theme.id === 'frutiger-aero' ? { color: 'rgba(255,255,255,1)', fontFamily: 'Rajdhani_700Bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width:0, height:1}, textShadowRadius:3 } : { color: theme.colors.textPrimary }]}>
				{title}
			</Text>
			<Text style={[styles.emptySubtitle, theme.id === 'frutiger-aero' ? { color: 'rgba(100,190,255,0.6)', fontFamily: 'Orbitron_400Regular', fontSize: 10 } : { color: theme.colors.textSecondary }]}>
				{subtitle}
			</Text>
		</GlassCard>
	)

	const renderQueue = () => (
		<>
			<View style={styles.sectionHeader}>
				<Text style={[styles.sectionTitle, theme.id === 'frutiger-aero' ? { color: '#fff', fontFamily: 'Rajdhani_700Bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 } : { color: theme.colors.textPrimary }]}>Current Queue</Text>
				{queue.length > 0 && (
					<TouchableOpacity onPress={clearQueue}>
						<Text style={{ color: theme.colors.accentPrimary, fontWeight: '600' }}>Clear</Text>
					</TouchableOpacity>
				)}
			</View>
			{queue.length === 0 ? renderEmpty('Queue is empty', 'Play a song to see it here.', 'list') : (
				queueAsSongs.map((song, index) => (
					<SongListItem
						key={`${song.id}-${index}`}
						song={song}
						index={index}
						isActive={currentTrack?.id === song.id}
						onMenuAction={handleMenuAction}
						onPress={() => play(queue[index])}
					/>
				))
			)}
		</>
	)

	const renderDownloads = () => (
		<>
			<View style={styles.sectionHeader}>
				<Text style={[styles.sectionTitle, theme.id === 'frutiger-aero' ? { color: '#fff', fontFamily: 'Rajdhani_700Bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 } : { color: theme.colors.textPrimary }]}>Offline Songs</Text>
			</View>
			{downloadedTracks.length === 0 ? renderEmpty('No downloads', 'Download songs to listen offline.', 'cloud-offline') : (
				downloadedTracks.map((track, index) => {
					const song: Song = { ...track, videoId: track.id, thumbnail: track.artwork || '' }
					return (
						<SongListItem
							key={song.id}
							song={song}
							index={index}
							isActive={currentTrack?.id === song.id}
							onMenuAction={handleMenuAction}
							onPress={() => play(track)}
						/>
					)
				})
			)}
		</>
	)

	const renderPlaylists = () => {
		if (viewingPlaylistId) {
			const playlist = playlists.find(p => p.id === viewingPlaylistId)
			if (!playlist) return null
			return (
				<>
					<View style={styles.sectionHeader}>
						<TouchableOpacity onPress={() => setViewingPlaylistId(null)} style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
							<Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginLeft: 8 }]}>{playlist.name}</Text>
						</TouchableOpacity>
					</View>
					{playlist.tracks.length === 0 ? renderEmpty('Playlist is empty', 'Add songs to this playlist.', 'musical-notes') : (
						playlist.tracks.map((track, index) => {
							const song: Song = { ...track, videoId: track.id, thumbnail: track.artwork || '' }
							return (
								<SongListItem
									key={song.id}
									song={song}
									index={index}
									isActive={currentTrack?.id === song.id}
									onMenuAction={handleMenuAction}
									onPress={() => play(track)}
								/>
							)
						})
					)}
				</>
			)
		}

		return (
			<>
				<View style={styles.sectionHeader}>
					<Text style={[styles.sectionTitle, theme.id === 'frutiger-aero' ? { color: '#fff', fontFamily: 'Rajdhani_700Bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 } : { color: theme.colors.textPrimary }]}>Your Playlists</Text>
					<TouchableOpacity onPress={() => setModalVisible(true)}>
						<Text style={{ color: theme.colors.accentPrimary, fontWeight: '600' }}>New</Text>
					</TouchableOpacity>
				</View>
				{playlists.length === 0 ? renderEmpty('No playlists', 'Create a playlist to organize your music.', 'list') : (
					playlists.map((playlist) => (
						<TouchableOpacity
							key={playlist.id}
							style={styles.playlistRow}
							onPress={() => setViewingPlaylistId(playlist.id)}
						>
							<Ionicons name="list" size={24} color={theme.colors.accentPrimary} />
							<View style={styles.playlistInfo}>
								<Text style={[styles.playlistName, { color: theme.colors.textPrimary }]}>{playlist.name}</Text>
								<Text style={[styles.playlistCount, { color: theme.colors.textSecondary }]}>{playlist.tracks.length} songs</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
						</TouchableOpacity>
					))
				)}
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
					{activeTab === 'queue' && renderQueue()}
					{activeTab === 'downloads' && renderDownloads()}
					{activeTab === 'playlists' && renderPlaylists()}
					<View style={{ height: 140 }} />
				</ScrollView>
			</SafeAreaView>

			<PlaylistModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				song={selectedSong}
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
	tabsContainer: { flexDirection: 'row', gap: 8, marginTop: 8 },
	tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
	tabText: { fontSize: 14 },
	sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
	sectionTitle: { fontSize: 18, fontWeight: '700' },
	emptyCard: { alignItems: 'center', paddingVertical: 40, gap: 12, marginTop: 20 },
	emptyTitle: { fontSize: 20, fontWeight: '700' },
	emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
	playlistRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: 12 },
	playlistInfo: { flex: 1 },
	playlistName: { fontSize: 16, fontWeight: '500' },
	playlistCount: { fontSize: 12, marginTop: 2 },
})
