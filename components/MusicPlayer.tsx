import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface Song {
	id: string
	title: string
	artist: string
	duration: number
	currentTime: number
	thumbnail?: string
}

const { width, height } = Dimensions.get('window')

export const MusicPlayer: React.FC = () => {
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentSong] = useState<Song>({
		id: '1',
		title: 'Summer Breeze',
		artist: 'Dream Artist',
		duration: 240,
		currentTime: 80,
		thumbnail: undefined,
	})

	const progress = (currentSong.currentTime / currentSong.duration) * 100

	return (
		<LinearGradient
			colors={['#87CEEB', '#E0F6FF', '#B0E0E6']}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			style={styles.container}
		>
			{/* Main Player Card with Glass Effect */}
			<BlurView intensity={90} style={styles.blurContainer}>
				<LinearGradient
					colors={['rgba(255, 255, 255, 0.95)', 'rgba(220, 240, 255, 0.9)']}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
					style={styles.playerCard}
				>
					{/* Album Art Area */}
					<View style={styles.albumArtContainer}>
						<LinearGradient
							colors={['#87CEEB', '#E0F6FF']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={styles.albumArt}
						>
							<Text style={styles.albumPlaceholder}>🎵</Text>
						</LinearGradient>
					</View>

					{/* Song Info */}
					<View style={styles.songInfo}>
						<Text style={styles.songTitle}>{currentSong.title}</Text>
						<Text style={styles.songArtist}>{currentSong.artist}</Text>
					</View>

					{/* Progress Bar */}
					<View style={styles.progressContainer}>
						<View style={styles.progressTrack}>
							<LinearGradient
								colors={['#00B050', '#92D050']}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={[styles.progressFill, { width: `${progress}%` }]}
							/>
						</View>
					</View>

					{/* Time Display */}
					<View style={styles.timeContainer}>
						<Text style={styles.timeText}>
							{Math.floor(currentSong.currentTime / 60)}:
							{String(currentSong.currentTime % 60).padStart(2, '0')}
						</Text>
						<Text style={styles.timeText}>
							{Math.floor(currentSong.duration / 60)}:
							{String(currentSong.duration % 60).padStart(2, '0')}
						</Text>
					</View>

					{/* Control Buttons */}
					<View style={styles.controlsContainer}>
						<TouchableOpacity style={styles.controlButton}>
							<Text style={styles.controlIcon}>⏮</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.playButton, isPlaying && styles.playButtonActive]}
							onPress={() => setIsPlaying(!isPlaying)}
						>
							<LinearGradient
								colors={['#00B050', '#92D050']}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.playButtonGradient}
							>
								<Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
							</LinearGradient>
						</TouchableOpacity>

						<TouchableOpacity style={styles.controlButton}>
							<Text style={styles.controlIcon}>⏭</Text>
						</TouchableOpacity>
					</View>

					{/* Volume Control */}
					<View style={styles.volumeContainer}>
						<Text style={styles.volumeLabel}>Volume</Text>
						<View style={styles.volumeSlider}>
							<LinearGradient
								colors={['#00B050', '#92D050']}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={styles.volumeFill}
							/>
						</View>
					</View>
				</LinearGradient>
			</BlurView>
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	blurContainer: {
		borderRadius: 30,
		overflow: 'hidden',
		width: '100%',
		maxWidth: 380,
	},
	playerCard: {
		borderRadius: 30,
		padding: 24,
		shadowColor: 'rgba(0, 0, 0, 0.3)',
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 15,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.8)',
	},
	albumArtContainer: {
		marginBottom: 20,
	},
	albumArt: {
		width: '100%',
		aspectRatio: 1,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: 'rgba(0, 0, 0, 0.2)',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 5,
	},
	albumPlaceholder: {
		fontSize: 80,
	},
	songInfo: {
		marginBottom: 20,
	},
	songTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1a1a1a',
		marginBottom: 4,
	},
	songArtist: {
		fontSize: 14,
		color: '#666666',
	},
	progressContainer: {
		marginBottom: 12,
	},
	progressTrack: {
		height: 6,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		borderRadius: 3,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		borderRadius: 3,
	},
	timeContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	timeText: {
		fontSize: 12,
		color: '#666666',
		fontWeight: '500',
	},
	controlsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 24,
		gap: 20,
	},
	controlButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: 'rgba(255, 255, 255, 0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: 'rgba(0, 0, 0, 0.1)',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	controlIcon: {
		fontSize: 24,
	},
	playButton: {
		width: 70,
		height: 70,
		borderRadius: 35,
		shadowColor: 'rgba(0, 176, 80, 0.4)',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.4,
		shadowRadius: 12,
		elevation: 8,
	},
	playButtonActive: {
		shadowOpacity: 0.6,
	},
	playButtonGradient: {
		width: '100%',
		height: '100%',
		borderRadius: 35,
		justifyContent: 'center',
		alignItems: 'center',
	},
	playIcon: {
		fontSize: 32,
		color: 'white',
	},
	volumeContainer: {
		marginTop: 12,
	},
	volumeLabel: {
		fontSize: 12,
		color: '#666666',
		fontWeight: '600',
		marginBottom: 8,
	},
	volumeSlider: {
		height: 4,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		borderRadius: 2,
		overflow: 'hidden',
	},
	volumeFill: {
		height: '100%',
		width: '75%',
		borderRadius: 2,
	},
})
