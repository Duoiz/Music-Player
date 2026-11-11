import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
	Modal,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	ScrollView,
	Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from './ThemeProvider'
import { GlassCard } from './GlassCard'
import { usePlayerStore } from '../stores/playerStore'
import { usePlaylistStore } from '../stores/playlistStore'
import { useDownloadStore } from '../stores/downloadStore'
import { useDeviceMediaStore } from '../stores/deviceMediaStore'
import { useAutoPlaylistStore } from '../stores/autoPlaylistStore'
import { usePillMetrics } from '../stores/layoutStore'
import { useHapticFeedback } from '../hooks/useHapticFeedback'
import { generateAutoPlaylist } from '../utils/playlistGenerator'
import { formatTime } from '../utils/formatTime'
import type {
	Track,
	PlaylistMood,
	EnergyCurve,
	SongPoolSource,
	PlaylistGenerationConfig,
	GeneratedPlaylistResult,
} from '../types'

interface AutoPlaylistModalProps {
	visible: boolean
	onClose: () => void
}

const MOODS: Array<{ id: PlaylistMood; label: string; icon: any }> = [
	{ id: 'all', label: 'All Vibes', icon: 'sparkles' },
	{ id: 'chill', label: 'Chill', icon: 'cafe' },
	{ id: 'workout', label: 'Workout', icon: 'barbell' },
	{ id: 'study', label: 'Focus', icon: 'book' },
	{ id: 'hype', label: 'Hype', icon: 'flame' },
	{ id: 'party', label: 'Party', icon: 'musical-notes' },
	{ id: 'night', label: 'Night', icon: 'moon' },
]

const ENERGY_CURVES: Array<{
	id: EnergyCurve
	label: string
	desc: string
	icon: any
}> = [
	{ id: 'ramp-up', label: 'Ramp-Up', desc: 'Gradually builds intensity to peak', icon: 'trending-up' },
	{ id: 'steady', label: 'Steady', desc: 'Even, distraction-free flow', icon: 'remove' },
	{ id: 'chill-down', label: 'Wind-Down', desc: 'Descends toward calm and quiet', icon: 'trending-down' },
	{ id: 'rollercoaster', label: 'Waves', desc: 'Alternating peaks and breathers', icon: 'pulse' },
	{ id: 'smart-shuffle', label: 'Smart Mix', desc: 'Balanced anti-staleness shuffle', icon: 'shuffle' },
]

const COUNTS = [10, 15, 25, 40]

export function AutoPlaylistModal({ visible, onClose }: AutoPlaylistModalProps) {
	const theme = useTheme()
	const pm = usePillMetrics()
	const haptic = useHapticFeedback()

	const play = usePlayerStore((s) => s.play)
	const playlists = usePlaylistStore((s) => s.playlists)
	const downloadedTracks = useDownloadStore((s) => s.downloadedTracks)
	const deviceTracks = useDeviceMediaStore((s) => s.deviceTracks)
	const queue = usePlayerStore((s) => s.queue)

	const songMetadata = useAutoPlaylistStore((s) => s.songMetadata)
	const batchEnsureMetadata = useAutoPlaylistStore((s) => s.batchEnsureMetadata)

	// Configuration state
	const [selectedMood, setSelectedMood] = useState<PlaylistMood>('workout')
	const [selectedCurve, setSelectedCurve] = useState<EnergyCurve>('ramp-up')
	const [selectedCount, setSelectedCount] = useState<number>(15)
	const [selectedSource, setSelectedSource] = useState<SongPoolSource>('all')
	const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('')

	const defaultConfig = useAutoPlaylistStore((s) => s.defaultConfig)
	useEffect(() => {
		if (!visible || !defaultConfig) return
		setSelectedMood(defaultConfig.mood)
		setSelectedCurve(defaultConfig.energyCurve)
		setSelectedCount(defaultConfig.targetCount)
		setSelectedSource(defaultConfig.sourcePool === 'playlist' ? 'all' : defaultConfig.sourcePool)
	}, [visible, defaultConfig])

	// Generated result
	const [result, setResult] = useState<GeneratedPlaylistResult | null>(null)

	// Combine available tracks according to selected source
	const activePool = useMemo(() => {
		let pool: Track[] = []
		if (selectedSource === 'device') {
			pool = [...deviceTracks]
		} else if (selectedSource === 'downloads') {
			pool = [...downloadedTracks]
		} else if (selectedSource === 'playlist') {
			const target = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0]
			pool = target ? [...target.tracks] : []
		} else {
			// 'all': deduplicate across device, downloads, and playlists
			const map = new Map<string, Track>()
			deviceTracks.forEach((t) => map.set(t.id, t))
			downloadedTracks.forEach((t) => map.set(t.id, t))
			playlists.forEach((p) => p.tracks.forEach((t) => map.set(t.id, t)))
			queue.forEach((t) => map.set(t.id, t))
			pool = Array.from(map.values())
		}
		return pool
	}, [selectedSource, selectedPlaylistId, deviceTracks, downloadedTracks, playlists, queue])

	const handleGenerate = useCallback(() => {
		haptic.medium()
		if (activePool.length === 0) {
			Alert.alert(
				'Song Pool Empty',
				'No songs found in the selected source. Scan your device for MP3s or download songs first!'
			)
			return
		}

		// Ensure heuristic metadata exists for all tracks in pool
		batchEnsureMetadata(activePool)

		const config: PlaylistGenerationConfig = {
			mood: selectedMood,
			energyCurve: selectedCurve,
			targetCount: selectedCount,
			sourcePool: selectedSource,
			sourcePlaylistId: selectedPlaylistId,
		}

		const generated = generateAutoPlaylist(activePool, songMetadata, config)
		setResult(generated)
	}, [
		haptic,
		activePool,
		batchEnsureMetadata,
		selectedMood,
		selectedCurve,
		selectedCount,
		selectedSource,
		selectedPlaylistId,
		songMetadata,
	])

	const handlePlayNow = useCallback(() => {
		if (!result || result.tracks.length === 0) return
		haptic.notification('success')
		play(result.tracks[0], result.tracks)
		onClose()
	}, [result, haptic, play, onClose])

	const handleSavePlaylist = useCallback(() => {
		if (!result || result.tracks.length === 0) return
		haptic.notification('success')
		usePlaylistStore.getState().createPlaylist(result.name)
		const created = usePlaylistStore.getState().playlists.slice(-1)[0]
		if (created) {
			result.tracks.forEach((t) => {
				usePlaylistStore.getState().addTrackToPlaylist(created.id, t)
			})
		}
		Alert.alert('Playlist Saved!', `"${result.name}" has been added to your playlists.`)
	}, [result, haptic])

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<GlassCard
					style={styles.card}
					intensity="heavy"
					variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}
				>
					{/* Header */}
					<View style={styles.header}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
							<Ionicons name="sparkles" size={22} color={theme.colors.accentPrimary} />
							<Text style={[styles.title, { color: theme.colors.textPrimary }]}>
								Smart Auto-Mix
							</Text>
						</View>
						<TouchableOpacity onPress={onClose} style={styles.closeBtn}>
							<Ionicons name="close" size={22} color={theme.colors.textSecondary} />
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
						{/* 1. Vibe / Mood Selector */}
						<Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
							1. Pick a Mood / Vibe
						</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.pillsRow}
						>
							{MOODS.map((m) => {
								const active = selectedMood === m.id
								return (
									<TouchableOpacity
										key={m.id}
										style={[
											styles.pill,
											{
												paddingHorizontal: pm.paddingHorizontal,
												paddingVertical: pm.paddingVertical,
												borderRadius: pm.borderRadius,
												backgroundColor: active
													? theme.colors.accentPrimary
													: theme.colors.controlBackground,
												borderColor: active
													? theme.colors.accentPrimary
													: theme.colors.divider,
											},
										]}
										onPress={() => {
											haptic.selection()
											setSelectedMood(m.id)
										}}
									>
										<Ionicons
											name={m.icon}
											size={pm.iconSize - 1}
											color={active ? theme.colors.textOnAccent : theme.colors.textSecondary}
										/>
										<Text
											style={[
												styles.pillText,
												{
													fontSize: pm.fontSize,
										color: active
														? theme.colors.textOnAccent
														: theme.colors.textPrimary,
													fontWeight: active ? '700' : '500',
												},
											]}
										>
											{m.label}
										</Text>
									</TouchableOpacity>
								)
							})}
						</ScrollView>

						{/* 2. Energy Curve Selector */}
						<Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
							2. Energy Trajectory
						</Text>
						<View style={styles.curvesGrid}>
							{ENERGY_CURVES.map((c) => {
								const active = selectedCurve === c.id
								return (
									<TouchableOpacity
										key={c.id}
										style={[
											styles.curveCard,
											{
												backgroundColor: active
													? theme.colors.accentPrimary + '20'
													: theme.colors.controlBackground,
												borderColor: active
													? theme.colors.accentPrimary
													: theme.colors.divider,
											},
										]}
										onPress={() => {
											haptic.selection()
											setSelectedCurve(c.id)
										}}
									>
										<View style={styles.curveHeader}>
											<Ionicons
												name={c.icon}
												size={16}
												color={active ? theme.colors.accentPrimary : theme.colors.textSecondary}
											/>
											<Text
												style={[
													styles.curveTitle,
													{
														color: active
															? theme.colors.accentPrimary
															: theme.colors.textPrimary,
														fontWeight: active ? '700' : '600',
													},
												]}
											>
												{c.label}
											</Text>
										</View>
										<Text style={[styles.curveDesc, { color: theme.colors.textMuted }]}>
											{c.desc}
										</Text>
									</TouchableOpacity>
								)
							})}
						</View>

						{/* 3. Song Pool Source & Count */}
						<View style={styles.rowSelectors}>
							<View style={{ flex: 1 }}>
								<Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
									3. Song Source
								</Text>
								<View style={styles.sourceButtons}>
									{(['all', 'device', 'downloads'] as SongPoolSource[]).map((src) => {
										const active = selectedSource === src
										return (
											<TouchableOpacity
												key={src}
												style={[
													styles.smallOptionBtn,
													{
														backgroundColor: active
															? theme.colors.accentPrimary
															: theme.colors.controlBackground,
													},
												]}
												onPress={() => {
													haptic.selection()
													setSelectedSource(src)
												}}
											>
												<Text
													style={[
														styles.smallOptionBtnText,
														{
															color: active
																? theme.colors.textOnAccent
																: theme.colors.textSecondary,
															fontWeight: active ? '700' : '500',
														},
													]}
												>
													{src === 'all' ? 'All' : src === 'device' ? 'Device' : 'Saved'}
												</Text>
											</TouchableOpacity>
										)
									})}
								</View>
							</View>

							<View style={{ flex: 1 }}>
								<Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
									Length
								</Text>
								<View style={styles.sourceButtons}>
									{COUNTS.map((cnt) => {
										const active = selectedCount === cnt
										return (
											<TouchableOpacity
												key={cnt}
												style={[
													styles.smallOptionBtn,
													{
														backgroundColor: active
															? theme.colors.accentPrimary
															: theme.colors.controlBackground,
													},
												]}
												onPress={() => {
													haptic.selection()
													setSelectedCount(cnt)
												}}
											>
												<Text
													style={[
														styles.smallOptionBtnText,
														{
															color: active
																? theme.colors.textOnAccent
																: theme.colors.textSecondary,
															fontWeight: active ? '700' : '500',
														},
													]}
												>
													{cnt}
												</Text>
											</TouchableOpacity>
										)
									})}
								</View>
							</View>
						</View>

						<Text style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 4 }}>
							Pool size: {activePool.length} available tracks
						</Text>

						{/* Generate Button */}
						<TouchableOpacity
							style={[styles.generateBtn, { backgroundColor: theme.colors.accentPrimary }]}
							onPress={handleGenerate}
						>
							<Ionicons name="sparkles" size={18} color={theme.colors.textOnAccent} />
							<Text style={[styles.generateBtnText, { color: theme.colors.textOnAccent }]}>
								{result ? 'Re-Generate Mix' : 'Generate Playlist'}
							</Text>
						</TouchableOpacity>

						{/* 4. Result Preview & Actions */}
						{result && result.tracks.length > 0 && (
							<View style={styles.resultContainer}>
								<View style={styles.resultHeader}>
									<View style={{ flex: 1 }}>
										<Text style={[styles.resultTitle, { color: theme.colors.textPrimary }]}>
											{result.name}
										</Text>
										<Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
											{result.tracks.length} tracks • {formatTime(result.totalDurationSec)}
										</Text>
									</View>
								</View>

								{/* Energy Curve Visualizer Chart */}
								<View
									style={[
										styles.energyChartContainer,
										{ backgroundColor: theme.colors.controlBackground },
									]}
								>
									<Text style={[styles.energyChartLabel, { color: theme.colors.textMuted }]}>
										Energy Curve Profile
									</Text>
									<View style={styles.energyBarsRow}>
										{result.slotEnergies.map((eng, idx) => {
											const barHeight = Math.max(8, (eng / 10) * 36)
											const barColor =
												eng >= 8
													? '#FF5A5F'
													: eng >= 6
													? '#FFA000'
													: eng >= 4
													? theme.colors.accentPrimary
													: '#4ADE80'

											return (
												<View key={`slot-${idx}`} style={styles.energyBarColumn}>
													<View
														style={[
															styles.energyBar,
															{ height: barHeight, backgroundColor: barColor },
														]}
													/>
												</View>
											)
										})}
									</View>
								</View>

								{/* Sequenced Track List Preview */}
								<View style={styles.previewList}>
									{result.tracks.slice(0, 8).map((t, idx) => {
										const eng = result.slotEnergies[idx] || 5
										return (
											<View key={`${t.id}-${idx}`} style={styles.previewRow}>
												<Text
													style={[
														styles.previewIndex,
														{ color: theme.colors.textSecondary },
													]}
												>
													{idx + 1}
												</Text>
												<View style={{ flex: 1 }}>
													<Text
														style={[styles.previewTrackTitle, { color: theme.colors.textPrimary }]}
														numberOfLines={1}
													>
														{t.title}
													</Text>
													<Text
														style={[styles.previewTrackArtist, { color: theme.colors.textSecondary }]}
														numberOfLines={1}
													>
														{t.artist}
													</Text>
												</View>
												<View
													style={[
														styles.energyBadge,
														{
															backgroundColor:
																eng >= 8
																	? 'rgba(255,90,95,0.2)'
																	: 'rgba(56,189,248,0.2)',
														},
													]}
												>
													<Text
														style={[
															styles.energyBadgeText,
															{
																color:
																	eng >= 8 ? '#FF5A5F' : theme.colors.accentPrimary,
															},
														]}
													>
														⚡ {eng}
													</Text>
												</View>
											</View>
										)
									})}
									{result.tracks.length > 8 && (
										<Text
											style={[styles.moreText, { color: theme.colors.textMuted }]}
										>
											+ {result.tracks.length - 8} more tracks
										</Text>
									)}
								</View>

								{/* Action Buttons */}
								<View style={styles.resultActionsRow}>
									<TouchableOpacity
										style={[
											styles.actionBtn,
											{ backgroundColor: theme.colors.accentPrimary, flex: 1.2 },
										]}
										onPress={handlePlayNow}
									>
										<Ionicons name="play" size={16} color={theme.colors.textOnAccent} />
										<Text
											style={[
												styles.actionBtnText,
												{ color: theme.colors.textOnAccent },
											]}
										>
											Play Mix Now
										</Text>
									</TouchableOpacity>

									<TouchableOpacity
										style={[
											styles.actionBtn,
											{
												backgroundColor: theme.colors.controlBackground,
												borderColor: theme.colors.divider,
												borderWidth: 1,
												flex: 1,
											},
										]}
										onPress={handleSavePlaylist}
									>
										<Ionicons
											name="bookmark-outline"
											size={16}
											color={theme.colors.accentPrimary}
										/>
										<Text
											style={[
												styles.actionBtnText,
												{ color: theme.colors.accentPrimary },
											]}
										>
											Save Playlist
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}
					</ScrollView>
				</GlassCard>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.65)',
		justifyContent: 'flex-end',
	},
	card: {
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		maxHeight: '90%',
		padding: 20,
		paddingBottom: 32,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: '800',
		letterSpacing: -0.5,
	},
	closeBtn: {
		padding: 6,
	},
	scrollContent: {
		flexGrow: 0,
	},
	sectionLabel: {
		fontSize: 13,
		fontWeight: '700',
		marginBottom: 8,
		marginTop: 12,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	pillsRow: {
		flexDirection: 'row',
		gap: 8,
		paddingBottom: 4,
	},
	pill: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 16,
		borderWidth: 1,
		gap: 6,
	},
	pillText: {
		fontSize: 12,
	},
	curvesGrid: {
		gap: 8,
	},
	curveCard: {
		padding: 10,
		borderRadius: 12,
		borderWidth: 1,
		gap: 2,
	},
	curveHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	curveTitle: {
		fontSize: 13,
	},
	curveDesc: {
		fontSize: 11,
		paddingLeft: 22,
	},
	rowSelectors: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 8,
	},
	sourceButtons: {
		flexDirection: 'row',
		gap: 6,
	},
	smallOptionBtn: {
		flex: 1,
		paddingVertical: 8,
		alignItems: 'center',
		borderRadius: 10,
	},
	smallOptionBtnText: {
		fontSize: 12,
	},
	generateBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 14,
		borderRadius: 16,
		gap: 8,
		marginTop: 18,
		marginBottom: 12,
	},
	generateBtnText: {
		fontSize: 15,
		fontWeight: '700',
	},
	resultContainer: {
		marginTop: 12,
		paddingTop: 14,
		borderTopWidth: 1,
		borderTopColor: 'rgba(255,255,255,0.1)',
		gap: 12,
	},
	resultHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	resultTitle: {
		fontSize: 16,
		fontWeight: '700',
	},
	energyChartContainer: {
		padding: 10,
		borderRadius: 12,
		gap: 6,
	},
	energyChartLabel: {
		fontSize: 10,
		textTransform: 'uppercase',
		fontWeight: '600',
	},
	energyBarsRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		height: 38,
		gap: 4,
	},
	energyBarColumn: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-end',
		height: '100%',
	},
	energyBar: {
		width: '80%',
		borderRadius: 3,
	},
	previewList: {
		gap: 6,
	},
	previewRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 4,
		gap: 8,
	},
	previewIndex: {
		fontSize: 11,
		width: 18,
		textAlign: 'center',
	},
	previewTrackTitle: {
		fontSize: 13,
		fontWeight: '600',
	},
	previewTrackArtist: {
		fontSize: 11,
	},
	energyBadge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 6,
	},
	energyBadgeText: {
		fontSize: 10,
		fontWeight: '700',
	},
	moreText: {
		fontSize: 11,
		textAlign: 'center',
		marginTop: 4,
	},
	resultActionsRow: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 8,
		marginBottom: 16,
	},
	actionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		borderRadius: 14,
		gap: 6,
	},
	actionBtnText: {
		fontSize: 13,
		fontWeight: '700',
	},
})
