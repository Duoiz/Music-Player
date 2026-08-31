import React, { useState } from 'react'
import { Modal, StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from './ThemeProvider'
import { GlassCard } from './GlassCard'
import { usePlaylistStore } from '../stores/playlistStore'
import type { Track, Song } from '../types'

interface PlaylistModalProps {
	visible: boolean
	onClose: () => void
	song: Song | Track | null
}

export function PlaylistModal({ visible, onClose, song }: PlaylistModalProps) {
	const theme = useTheme()
	const { playlists, createPlaylist, addTrackToPlaylist } = usePlaylistStore()
	const [newPlaylistName, setNewPlaylistName] = useState('')
	const [isCreating, setIsCreating] = useState(false)

	const handleCreate = () => {
		if (newPlaylistName.trim()) {
			createPlaylist(newPlaylistName.trim())
			setNewPlaylistName('')
			setIsCreating(false)
		}
	}

	const handleAddToPlaylist = (playlistId: string) => {
		if (song) {
			const track: Track = {
				id: song.id,
				url: 'url' in song ? song.url : '',
				title: song.title,
				artist: song.artist,
				artwork: song.thumbnail || ('artwork' in song ? song.artwork : ''),
				duration: song.duration,
			}
			addTrackToPlaylist(playlistId, track)
		}
		onClose()
	}

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<GlassCard
					style={styles.card}
					intensity="strong"
					variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}
				>
					<View style={styles.header}>
						<Text style={[styles.title, { color: theme.colors.textPrimary }]}>
							Add to Playlist
						</Text>
						<TouchableOpacity onPress={onClose} style={styles.closeBtn}>
							<Ionicons name="close" size={24} color={theme.colors.textSecondary} />
						</TouchableOpacity>
					</View>

					{isCreating ? (
						<View style={styles.createContainer}>
							<TextInput
								style={[
									styles.input,
									{
										color: theme.colors.textPrimary,
										borderColor: theme.colors.controlBackgroundActive,
										backgroundColor: theme.colors.controlBackground,
									},
								]}
								placeholder="Playlist Name"
								placeholderTextColor={theme.colors.textMuted}
								value={newPlaylistName}
								onChangeText={setNewPlaylistName}
								autoFocus
							/>
							<View style={styles.createActions}>
								<TouchableOpacity onPress={() => setIsCreating(false)} style={styles.btn}>
									<Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
								</TouchableOpacity>
								<TouchableOpacity onPress={handleCreate} style={styles.btnPrimary}>
									<Text style={{ color: theme.colors.textOnAccent }}>Create</Text>
								</TouchableOpacity>
							</View>
						</View>
					) : (
						<TouchableOpacity
							style={[styles.createBtn, { borderColor: theme.colors.accentPrimary }]}
							onPress={() => setIsCreating(true)}
						>
							<Ionicons name="add" size={20} color={theme.colors.accentPrimary} />
							<Text style={{ color: theme.colors.accentPrimary, fontWeight: '500' }}>
								New Playlist
							</Text>
						</TouchableOpacity>
					)}

					<FlatList
						data={playlists}
						keyExtractor={(item) => item.id}
						style={styles.list}
						renderItem={({ item }) => (
							<TouchableOpacity
								style={styles.playlistItem}
								onPress={() => handleAddToPlaylist(item.id)}
							>
								<Ionicons name="list" size={20} color={theme.colors.textSecondary} />
								<Text style={[styles.playlistName, { color: theme.colors.textPrimary }]}>
									{item.name}
								</Text>
								<Text style={[styles.trackCount, { color: theme.colors.textMuted }]}>
									{item.tracks.length}
								</Text>
							</TouchableOpacity>
						)}
						ListEmptyComponent={
							<Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
								No playlists yet
							</Text>
						}
					/>
				</GlassCard>
			</View>
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
	createBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderStyle: 'dashed',
		marginBottom: 16,
		gap: 8,
	},
	createContainer: {
		marginBottom: 16,
		gap: 12,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
	},
	createActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 12,
	},
	btn: {
		padding: 8,
	},
	btnPrimary: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: 'rgba(0,160,255,0.8)',
		borderRadius: 6,
	},
	list: {
		maxHeight: 400,
	},
	playlistItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.05)',
		gap: 12,
	},
	playlistName: {
		flex: 1,
		fontSize: 16,
	},
	trackCount: {
		fontSize: 12,
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 20,
	},
})
