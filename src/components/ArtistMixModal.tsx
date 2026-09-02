import React, { useState } from 'react'
import { Modal, StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from './ThemeProvider'
import { GlassCard } from './GlassCard'
import { useArtistMixStore } from '../stores/artistMixStore'

interface ArtistMixModalProps {
	visible: boolean
	onClose: () => void
}

export function ArtistMixModal({ visible, onClose }: ArtistMixModalProps) {
	const theme = useTheme()
	const { createMix } = useArtistMixStore()
	
	const [mixName, setMixName] = useState('')
	const [currentArtist, setCurrentArtist] = useState('')
	const [artists, setArtists] = useState<string[]>([])

	const handleAddArtist = () => {
		const trimmed = currentArtist.trim()
		if (trimmed && !artists.includes(trimmed)) {
			setArtists([...artists, trimmed])
			setCurrentArtist('')
		}
	}

	const handleRemoveArtist = (artistToRemove: string) => {
		setArtists(artists.filter(a => a !== artistToRemove))
	}

	const handleCreate = () => {
		if (mixName.trim() && artists.length > 0) {
			createMix(mixName.trim(), artists)
			// Reset state
			setMixName('')
			setArtists([])
			setCurrentArtist('')
			onClose()
		}
	}

	const handleClose = () => {
		setMixName('')
		setArtists([])
		setCurrentArtist('')
		onClose()
	}

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
			<KeyboardAvoidingView 
				style={styles.overlay} 
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<GlassCard
					style={styles.card}
					intensity="medium"
					variant="default"
				>
					<View style={styles.header}>
						<Text style={[styles.title, { color: theme.colors.textPrimary }]}>
							New Artist Mix
						</Text>
						<TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
							<Ionicons name="close" size={24} color={theme.colors.textSecondary} />
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.colors.textSecondary }]}>Mix Name</Text>
							<TextInput
								style={[
									styles.input,
									{
										color: theme.colors.textPrimary,
										borderColor: theme.colors.controlBackgroundActive,
										backgroundColor: theme.colors.controlBackground,
									},
								]}
								placeholder="e.g. Chill Pop Mix"
								placeholderTextColor={theme.colors.textMuted}
								value={mixName}
								onChangeText={setMixName}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.colors.textSecondary }]}>Add Artists</Text>
							<View style={styles.addArtistRow}>
								<TextInput
									style={[
										styles.input,
										styles.artistInput,
										{
											color: theme.colors.textPrimary,
											borderColor: theme.colors.controlBackgroundActive,
											backgroundColor: theme.colors.controlBackground,
										},
									]}
									placeholder="e.g. Taylor Swift"
									placeholderTextColor={theme.colors.textMuted}
									value={currentArtist}
									onChangeText={setCurrentArtist}
									onSubmitEditing={handleAddArtist}
								/>
								<TouchableOpacity 
									style={[styles.addBtn, { backgroundColor: theme.colors.accentPrimary }]}
									onPress={handleAddArtist}
								>
									<Ionicons name="add" size={24} color={theme.colors.textOnAccent} />
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.tagsContainer}>
							{artists.map((artist, index) => (
								<View 
									key={`${artist}-${index}`} 
									style={[styles.tag, { backgroundColor: theme.colors.controlBackgroundActive }]}
								>
									<Text style={[styles.tagText, { color: theme.colors.textPrimary }]}>{artist}</Text>
									<TouchableOpacity onPress={() => handleRemoveArtist(artist)}>
										<Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
									</TouchableOpacity>
								</View>
							))}
							{artists.length === 0 && (
								<Text style={[styles.emptyTags, { color: theme.colors.textMuted }]}>
									Add at least one artist to create a mix.
								</Text>
							)}
						</View>
					</ScrollView>

					<View style={styles.footer}>
						<TouchableOpacity 
							style={[
								styles.createBtn, 
								{ 
									backgroundColor: mixName.trim() && artists.length > 0 
										? theme.colors.accentPrimary 
										: theme.colors.controlBackground 
								}
							]}
							onPress={handleCreate}
							disabled={!mixName.trim() || artists.length === 0}
						>
							<Text style={[
								styles.createBtnText, 
								{ 
									color: mixName.trim() && artists.length > 0 
										? theme.colors.textOnAccent 
										: theme.colors.textMuted 
								}
							]}>
								Create Mix
							</Text>
						</TouchableOpacity>
					</View>
				</GlassCard>
			</KeyboardAvoidingView>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		padding: 20,
	},
	card: {
		maxHeight: '80%',
		padding: 20,
		borderRadius: 16,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
	},
	closeBtn: {
		padding: 4,
	},
	content: {
		flexGrow: 0,
		maxHeight: 300,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: '500',
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
	},
	addArtistRow: {
		flexDirection: 'row',
		gap: 8,
	},
	artistInput: {
		flex: 1,
	},
	addBtn: {
		width: 48,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 8,
		marginBottom: 16,
	},
	tag: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 16,
		gap: 6,
	},
	tagText: {
		fontSize: 14,
	},
	emptyTags: {
		fontSize: 14,
		fontStyle: 'italic',
	},
	footer: {
		marginTop: 16,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: 'rgba(255,255,255,0.1)',
	},
	createBtn: {
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
	},
	createBtnText: {
		fontSize: 16,
		fontWeight: '600',
	},
})
