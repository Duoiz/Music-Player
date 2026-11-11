import React, { useState, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	ActivityIndicator,
	Platform,
} from 'react-native'
import { useIsFocused } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated'
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
 * Animated "gas" backdrop for the empty-state hero card (Frutiger Aero only).
 * Owns its own shared values and stops entirely when the tab is not focused or
 * the hero is gone, so nothing keeps animating in the background.
 */
function HeroBlobs() {
	const isFocused = useIsFocused()
	const rotation1 = useSharedValue(0)
	const rotation2 = useSharedValue(0)
	const scale1 = useSharedValue(1)
	const scale2 = useSharedValue(1)

	React.useEffect(() => {
		if (!isFocused) return
		rotation1.value = withRepeat(withTiming(360, { duration: 15000, easing: Easing.linear }), -1, false)
		rotation2.value = withRepeat(withTiming(-360, { duration: 20000, easing: Easing.linear }), -1, false)
		scale1.value = withRepeat(
			withSequence(
				withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
				withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
			),
			-1,
			true
		)
		scale2.value = withRepeat(
			withSequence(
				withTiming(1.4, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
				withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
			),
			-1,
			true
		)
	}, [isFocused, rotation1, rotation2, scale1, scale2])

	const animatedBlob1 = useAnimatedStyle(() => ({
		transform: [
			{ rotate: `${rotation1.value}deg` },
			{ scaleX: 1.5 * scale1.value },
			{ scaleY: scale1.value },
		],
	}))

	const animatedBlob2 = useAnimatedStyle(() => ({
		transform: [
			{ rotate: `${rotation2.value}deg` },
			{ scaleX: scale2.value },
			{ scaleY: 1.2 * scale2.value },
		],
	}))

	if (!isFocused) return null

	return (
		<>
			<Animated.View style={[{ position: 'absolute', top: -60, left: -60, width: 320, height: 320 }, animatedBlob1]}>
				<LinearGradient
					colors={['rgba(0, 255, 200, 0.75)', 'transparent']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={{ width: '100%', height: '100%', borderRadius: 160 }}
				/>
			</Animated.View>
			<Animated.View style={[{ position: 'absolute', bottom: -120, right: -80, width: 400, height: 400 }, animatedBlob2]}>
				<LinearGradient
					colors={['rgba(0, 150, 255, 0.85)', 'transparent']}
					start={{ x: 1, y: 1 }}
					end={{ x: 0, y: 0 }}
					style={{ width: '100%', height: '100%', borderRadius: 200 }}
				/>
			</Animated.View>
			{/* Glossy overlay to simulate refraction thickness */}
			<LinearGradient
				colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0)']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFillObject}
				pointerEvents="none"
			/>
		</>
	)
}

/**
 * Home / Search screen.
 * - Hero search bar at the top
 * - Search results from YouTube Music
 * - Trending / recent plays placeholder
 */
export default function SearchScreen() {
	const theme = useTheme()
	const play = usePlayerStore((s) => s.play)
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
				const searchQueue: Track[] = results.map((s: Song) => ({
					id: s.id,
					url: s.id === song.id ? stream.streamUrl : '',
					title: s.title,
					artist: s.artist,
					artwork: s.thumbnail,
					duration: s.duration,
				}))
				await play(track, searchQueue)
			} catch (err) {
				console.error('Error playing song:', err)
				setError('Failed to load song. Try again.')
			}
		},
		[play, results]
	)

	const keyExtractor = useCallback((item: Song) => item.id, [])

	const currentTrackId = currentTrack?.id
	const renderItem = useCallback(
		({ item }: { item: Song }) => (
			<SongListItem
				song={item}
				onPress={handleSongPress}
				isActive={currentTrackId === item.id}
				onMenuAction={handleMenuAction}
			/>
		),
		[handleSongPress, currentTrackId, handleMenuAction]
	)

	const renderSubHeader = () => (
		<View style={styles.subHeader}>
			{/* Empty state */}
			{!hasSearched && (
				<GlassCard style={[styles.heroCard, { overflow: 'hidden' as const }]} intensity="light">
					{theme.id === 'frutiger-aero' && <HeroBlobs />}
					<Ionicons name="headset" size={48} color={theme.id === 'frutiger-aero' ? 'rgba(0,120,200,0.8)' : theme.colors.accentPrimary} />
					<Text
						style={[
							styles.heroTitle,
							{ 
								color: theme.colors.textPrimary,
								fontWeight: '600',
							},
						]}
					>
						Ready to play
					</Text>
					<Text
						style={[
							styles.heroSubtitle,
							{ 
								color: theme.colors.textSecondary,
								fontWeight: '400',
							},
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
				{/* Fixed Search Header — never unmounts, preserves focus and keyboard state */}
				<View style={styles.fixedHeader}>
					<Text
						style={[
							styles.title,
							{
								color: theme.colors.textPrimary,
								fontSize: 32,
								fontWeight: theme.typography.titleWeight,
								fontFamily: theme.typography.fontFamily,
								textShadowColor: theme.typography.textShadowColor,
								textShadowOffset: theme.typography.textShadowOffset,
								textShadowRadius: theme.typography.textShadowRadius,
							},
						]}
					>
						Discover
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
				</View>

				<FlatList
					data={results}
					extraData={currentTrack?.id}
					keyExtractor={keyExtractor}
					ListHeaderComponent={renderSubHeader}
					renderItem={renderItem}
					initialNumToRender={12}
					maxToRenderPerBatch={8}
					updateCellsBatchingPeriod={40}
					windowSize={7}
					removeClippedSubviews={Platform.OS === 'android'}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
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
	fixedHeader: {
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 4,
		gap: 4,
	},
	subHeader: {
		paddingBottom: 8,
	},
	title: {

		letterSpacing: -0.5,
	},
	subtitle: {
		marginBottom: 16,
	},
	searchContainer: {
		marginTop: 12,
		marginBottom: 8,
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
		marginTop: 12,
		paddingVertical: 28,
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
