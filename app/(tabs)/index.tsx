import React, { useState, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/components/ThemeProvider'
import { GlassCard } from '../../src/components/GlassCard'
import { SearchBar } from '../../src/components/SearchBar'
import { BackgroundParticles } from '../../src/components/BackgroundParticles'
import { SongListItem } from '../../src/components/SongListItem'
import { usePlayerStore } from '../../src/stores/playerStore'
import { searchSongs, getStreamUrl } from '../../src/services/api'
import { downloadSong, deleteDownloadedSong } from '../../src/services/downloadService'
import { useDownloadStore } from '../../src/stores/downloadStore'
import { PlaylistModal } from '../../src/components/PlaylistModal'
import type { Song, Track } from '../../src/types'

/**
 * Home / Search screen.
 * - Hero search bar at the top
 * - Search results from YouTube Music
 * - Trending / recent plays placeholder
 */
export default function SearchScreen() {
	const theme = useTheme()
	const play = usePlayerStore((s) => s.play)
	const addToQueue = usePlayerStore((s) => s.addToQueue)
	const currentTrack = usePlayerStore((s) => s.currentTrack)

	const [results, setResults] = useState<Song[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [hasSearched, setHasSearched] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedSong, setSelectedSong] = useState<Song | null>(null)
	const isDownloaded = useDownloadStore((s) => s.isDownloaded)

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

	const handleSearch = useCallback(async (query: string) => {
		if (!query.trim()) {
			setResults([])
			setHasSearched(false)
			setError(null)
			return
		}

		setIsSearching(true)
		setError(null)
		setHasSearched(true)

		try {
			const songs = await searchSongs(query)
			setResults(songs)
		} catch (err) {
			console.error('Search error:', err)
			setError('Could not connect to server. Make sure the backend is running.')
			setResults([])
		} finally {
			setIsSearching(false)
		}
	}, [])

	const handleSongPress = useCallback(
		async (song: Song) => {
			try {
				const stream = await getStreamUrl(song.videoId)
				const track: Track = {
					id: song.id,
					url: stream.streamUrl,
					title: song.title,
					artist: song.artist,
					artwork: song.thumbnail,
					duration: song.duration,
				}
				await play(track)
			} catch (err) {
				console.error('Error playing song:', err)
				setError('Failed to load song. Try again.')
			}
		},
		[play]
	)

	const renderHeader = () => (
		<View style={styles.header}>
			<Text
				style={[
					styles.title,
					theme.id === 'frutiger-aero' ? {
						color: 'rgba(120,230,255,0.95)',
						fontSize: 28,
						fontFamily: 'Rajdhani_700Bold',
						textShadowColor: 'rgba(0,200,255,0.7)',
						textShadowOffset: { width: 0, height: 0 },
						textShadowRadius: 14,
						textTransform: 'lowercase',
					} : {
						color: theme.colors.textPrimary,
						fontSize: 28,
						fontWeight: '800',
					},
				]}
			>
				Discover
			</Text>
			<Text
				style={[
					styles.subtitle,
					theme.id === 'frutiger-aero' ? {
						color: 'rgba(100,190,255,0.6)',
						fontSize: 10,
						fontFamily: 'Orbitron_600SemiBold',
						letterSpacing: 2,
						textTransform: 'uppercase',
					} : {
						color: theme.colors.textSecondary,
						fontSize: theme.typography.bodySize,
					},
				]}
			>
				Search millions of songs
			</Text>

			<View style={styles.searchContainer}>
				<SearchBar
					onSearch={handleSearch}
					isLoading={isSearching}
					placeholder="Search YouTube Music..."
				/>
			</View>

			{/* Error message */}
			{error && (
				<GlassCard style={styles.errorCard} intensity="light">
					<Text style={[styles.errorText, { color: '#FF6B6B' }]}>
						<Ionicons name="warning" size={14} color="#FF6B6B" /> {error}
					</Text>
				</GlassCard>
			)}

			{/* Empty state */}
			{!hasSearched && (
				<GlassCard style={styles.heroCard} intensity="light" variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}>
					<Ionicons name="headset" size={48} color={theme.id === 'frutiger-aero' ? 'rgba(0,180,255,0.7)' : theme.colors.accentPrimary} />
					<Text
						style={[
							styles.heroTitle,
							theme.id === 'frutiger-aero' ? {
								color: 'rgba(120,230,255,0.95)',
								fontFamily: 'Rajdhani_600SemiBold',
							} : { color: theme.colors.textPrimary },
						]}
					>
						Ready to play
					</Text>
					<Text
						style={[
							styles.heroSubtitle,
							theme.id === 'frutiger-aero' ? {
								color: 'rgba(100,190,255,0.6)',
								fontFamily: 'Orbitron_400Regular',
								fontSize: 10,
							} : { color: theme.colors.textSecondary },
						]}
					>
						Search for your favorite songs above.{'\n'}
						Make sure the backend server is running.
					</Text>
				</GlassCard>
			)}

			{/* No results */}
			{hasSearched && !isSearching && results.length === 0 && !error && (
				<View style={styles.noResults}>
					<Ionicons name="search" size={36} color={theme.colors.textMuted} />
					<Text
						style={[
							styles.noResultsText,
							{ color: theme.colors.textSecondary },
						]}
					>
						No songs found. Try a different search.
					</Text>
				</View>
			)}

			{/* Results count */}
			{results.length > 0 && (
				<Text
					style={[
						styles.resultsCount,
						{
							color: theme.colors.textSecondary,
							fontSize: theme.typography.captionSize,
						},
					]}
				>
					{results.length} result{results.length !== 1 ? 's' : ''}
				</Text>
			)}
		</View>
	)

	return (
		<LinearGradient
			colors={theme.colors.backgroundGradient as [string, string, ...string[]]}
			start={theme.colors.backgroundGradientStart}
			end={theme.colors.backgroundGradientEnd}
			style={styles.container}
		>
			<BackgroundParticles />
			<SafeAreaView style={styles.safeArea} edges={['top']}>
				<FlatList
					data={results}
					keyExtractor={(item) => item.id}
					ListHeaderComponent={renderHeader}
					renderItem={({ item }) => (
						<SongListItem
							song={item}
							onPress={handleSongPress}
							isActive={currentTrack?.id === item.id}
							onMenuAction={handleMenuAction}
						/>
					)}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					// Extra padding at the bottom for the tab bar + mini player
					ListFooterComponent={<View style={{ height: 140 }} />}
				/>

				{/* Loading overlay */}
				{isSearching && results.length === 0 && (
					<View style={styles.loadingOverlay}>
						<ActivityIndicator
							size="large"
							color={theme.colors.accentPrimary}
						/>
					</View>
				)}
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
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 16,
	},
	header: {
		paddingTop: 16,
		paddingBottom: 8,
		gap: 4,
	},
	title: {
		letterSpacing: -0.5,
	},
	subtitle: {
		marginBottom: 16,
	},
	searchContainer: {
		marginBottom: 16,
	},
	errorCard: {
		marginBottom: 16,
	},
	errorText: {
		fontSize: 13,
		fontWeight: '500',
		textAlign: 'center',
	},
	heroCard: {
		alignItems: 'center',
		marginTop: 24,
		paddingVertical: 40,
		gap: 12,
	},
	heroEmoji: {
		fontSize: 48,
	},
	heroTitle: {
		fontSize: 20,
		fontWeight: '700',
	},
	heroSubtitle: {
		fontSize: 14,
		textAlign: 'center',
		lineHeight: 20,
	},
	noResults: {
		alignItems: 'center',
		paddingVertical: 40,
		gap: 12,
	},
	noResultsEmoji: {
		fontSize: 36,
	},
	noResultsText: {
		fontSize: 14,
		textAlign: 'center',
	},
	resultsCount: {
		fontWeight: '600',
		marginBottom: 8,
		marginLeft: 4,
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
	},
})
