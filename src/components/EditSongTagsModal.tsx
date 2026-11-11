import React, { useState, useEffect } from 'react'
import {
	Modal,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	TextInput,
	ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from './ThemeProvider'
import { GlassCard } from './GlassCard'
import { useAutoPlaylistStore } from '../stores/autoPlaylistStore'
import { useHapticFeedback } from '../hooks/useHapticFeedback'
import type { Song } from '../types'

interface EditSongTagsModalProps {
	visible: boolean
	song: Song | null
	onClose: () => void
}

const COMMON_TAGS = ['chill', 'workout', 'study', 'hype', 'party', 'night', 'acoustic', 'electronic']

export function EditSongTagsModal({ visible, song, onClose }: EditSongTagsModalProps) {
	const theme = useTheme()
	const haptic = useHapticFeedback()

	const getOrInitMetadata = useAutoPlaylistStore((s) => s.getOrInitMetadata)
	const updateSongMetadata = useAutoPlaylistStore((s) => s.updateSongMetadata)

	const [energy, setEnergy] = useState<number>(5)
	const [tags, setTags] = useState<string[]>([])
	const [customTag, setCustomTag] = useState<string>('')

	useEffect(() => {
		if (song) {
			const meta = getOrInitMetadata({
				id: song.id,
				title: song.title,
				artist: song.artist,
				url: '',
				artwork: song.thumbnail || '',
				duration: song.duration,
			})
			setEnergy(meta.energy)
			setTags(meta.tags || [])
		}
	}, [song, getOrInitMetadata])

	const handleToggleTag = (tag: string) => {
		haptic.selection()
		if (tags.includes(tag)) {
			setTags(tags.filter((t) => t !== tag))
		} else {
			setTags([...tags, tag])
		}
	}

	const handleAddCustomTag = () => {
		const trimmed = customTag.trim().toLowerCase()
		if (trimmed && !tags.includes(trimmed)) {
			haptic.light()
			setTags([...tags, trimmed])
			setCustomTag('')
		}
	}

	const handleSave = () => {
		if (song) {
			haptic.notification('success')
			updateSongMetadata(song.id, {
				energy,
				tags,
				userCustomized: true,
			})
		}
		onClose()
	}

	if (!song) return null

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<GlassCard
					style={styles.card}
					intensity="heavy"
					variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}
				>
					{/* Header */}
					<View style={styles.header}>
						<View style={{ flex: 1 }}>
							<Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>
								{song.title}
							</Text>
							<Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
								{song.artist}
							</Text>
						</View>
						<TouchableOpacity onPress={onClose} style={styles.closeBtn}>
							<Ionicons name="close" size={20} color={theme.colors.textSecondary} />
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
						{/* Energy Level (1-10) */}
						<View style={styles.section}>
							<View style={styles.sectionHeaderRow}>
								<Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
									Energy Rating
								</Text>
								<Text style={[styles.energyValue, { color: theme.colors.accentPrimary }]}>
									⚡ {energy} / 10
								</Text>
							</View>
							<Text style={[styles.sectionDesc, { color: theme.colors.textMuted }]}>
								{energy <= 3
									? 'Calm & mellow (ambient, sleep, acoustic)'
									: energy <= 6
									? 'Mid-tempo & balanced (pop, study, groove)'
									: energy <= 8
									? 'High energy & driving (rock, workout, dance)'
									: 'Maximum intensity (hardstyle, EDM peak, heavy)'}
							</Text>

							{/* 10-step clickable energy bar */}
							<View style={styles.energySelector}>
								{Array.from({ length: 10 }).map((_, i) => {
									const val = i + 1
									const selected = val <= energy
									const isCurrent = val === energy
									const barColor =
										val >= 8
											? '#FF5A5F'
											: val >= 6
											? '#FFA000'
											: val >= 4
											? theme.colors.accentPrimary
											: '#4ADE80'

									return (
										<TouchableOpacity
											key={`energy-step-${val}`}
											style={[
												styles.energyStepBtn,
												{
													backgroundColor: selected
														? barColor
														: theme.colors.controlBackground,
													borderWidth: isCurrent ? 2 : 1,
													borderColor: isCurrent
														? '#FFFFFF'
														: theme.colors.divider,
												},
											]}
											onPress={() => {
												haptic.selection()
												setEnergy(val)
											}}
										>
											<Text
												style={[
													styles.energyStepText,
													{
														color: selected
															? '#FFFFFF'
															: theme.colors.textSecondary,
														fontWeight: isCurrent ? '800' : '500',
													},
												]}
											>
												{val}
											</Text>
										</TouchableOpacity>
									)
								})}
							</View>
						</View>

						{/* Mood Tags */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
								Mood & Vibe Tags
							</Text>
							<View style={styles.tagsContainer}>
								{COMMON_TAGS.map((t) => {
									const isSelected = tags.includes(t)
									return (
										<TouchableOpacity
											key={t}
											style={[
												styles.tagChip,
												{
													backgroundColor: isSelected
														? theme.colors.accentPrimary
														: theme.colors.controlBackground,
													borderColor: isSelected
														? theme.colors.accentPrimary
														: theme.colors.divider,
												},
											]}
											onPress={() => handleToggleTag(t)}
										>
											<Text
												style={[
													styles.tagChipText,
													{
														color: isSelected
															? theme.colors.textOnAccent
															: theme.colors.textSecondary,
														fontWeight: isSelected ? '700' : '500',
													},
												]}
											>
												{t}
											</Text>
										</TouchableOpacity>
									)
								})}
							</View>

							{/* Custom tag input */}
							<View style={styles.customTagRow}>
								<TextInput
									value={customTag}
									onChangeText={setCustomTag}
									placeholder="Add custom tag (e.g. lofi)..."
									placeholderTextColor={theme.colors.textMuted}
									style={[
										styles.customTagInput,
										{
											color: theme.colors.textPrimary,
											backgroundColor: theme.colors.controlBackground,
											borderColor: theme.colors.divider,
										},
									]}
									onSubmitEditing={handleAddCustomTag}
								/>
								<TouchableOpacity
									style={[
										styles.addTagBtn,
										{ backgroundColor: theme.colors.accentPrimary },
									]}
									onPress={handleAddCustomTag}
								>
									<Ionicons name="add" size={18} color={theme.colors.textOnAccent} />
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>

					{/* Save button */}
					<TouchableOpacity
						style={[styles.saveBtn, { backgroundColor: theme.colors.accentPrimary }]}
						onPress={handleSave}
					>
						<Text style={[styles.saveBtnText, { color: theme.colors.textOnAccent }]}>
							Save Mood & Energy
						</Text>
					</TouchableOpacity>
				</GlassCard>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.65)',
		justifyContent: 'center',
		padding: 20,
	},
	card: {
		borderRadius: 20,
		maxHeight: '80%',
		padding: 20,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.1)',
	},
	title: {
		fontSize: 16,
		fontWeight: '700',
	},
	subtitle: {
		fontSize: 12,
		marginTop: 2,
	},
	closeBtn: {
		padding: 4,
	},
	content: {
		flexGrow: 0,
	},
	section: {
		marginBottom: 18,
	},
	sectionHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: '700',
	},
	energyValue: {
		fontSize: 14,
		fontWeight: '800',
	},
	sectionDesc: {
		fontSize: 11,
		marginBottom: 12,
	},
	energySelector: {
		flexDirection: 'row',
		gap: 5,
	},
	energyStepBtn: {
		flex: 1,
		aspectRatio: 0.8,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
	},
	energyStepText: {
		fontSize: 11,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 8,
		marginBottom: 12,
	},
	tagChip: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 14,
		borderWidth: 1,
	},
	tagChipText: {
		fontSize: 12,
	},
	customTagRow: {
		flexDirection: 'row',
		gap: 8,
	},
	customTagInput: {
		flex: 1,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		fontSize: 13,
	},
	addTagBtn: {
		width: 38,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	saveBtn: {
		paddingVertical: 13,
		borderRadius: 14,
		alignItems: 'center',
		marginTop: 14,
	},
	saveBtnText: {
		fontSize: 14,
		fontWeight: '700',
	},
})
