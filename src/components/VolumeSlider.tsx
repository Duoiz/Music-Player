import React, { useCallback, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { Slider } from 'react-native-awesome-slider'
import { useSharedValue } from 'react-native-reanimated'
import { useTheme } from './ThemeProvider'
import { usePlayerStore } from '../stores/playerStore'

/**
 * Interactive volume slider wired to TrackPlayer.setVolume().
 */
export function VolumeSlider() {
	const theme = useTheme()
	const volume = usePlayerStore((s) => s.volume)
	const setVolume = usePlayerStore((s) => s.setVolume)

	const progress = useSharedValue(volume)
	const min = useSharedValue(0)
	const max = useSharedValue(1)

	useEffect(() => {
		progress.value = volume
	}, [volume, progress])

	const handleSlidingComplete = useCallback(
		(value: number) => {
			setVolume(value)
		},
		[setVolume]
	)

	const volumeIcon = volume === 0 ? 'volume-mute' : volume < 0.3 ? 'volume-low' : volume < 0.7 ? 'volume-medium' : 'volume-high'

	return (
		<View style={[styles.container, theme.id === 'frutiger-aero' && styles.containerFrutiger]}>
			{theme.id === 'frutiger-aero' ? (
				<Text style={styles.volLabel}>VOL</Text>
			) : (
				<Ionicons name={volumeIcon as keyof typeof Ionicons.glyphMap} size={24} color={theme.colors.textPrimary} style={styles.icon} />
			)}
			<Slider
				progress={progress}
				minimumValue={min}
				maximumValue={max}
				onSlidingComplete={handleSlidingComplete}
				theme={{
					maximumTrackTintColor: theme.id === 'frutiger-aero' ? 'rgba(0,50,100,0.45)' : theme.colors.progressTrack,
					minimumTrackTintColor: theme.id === 'frutiger-aero' ? '#00bfff' : theme.colors.accentPrimary,
					bubbleBackgroundColor: theme.id === 'frutiger-aero' ? '#0078d4' : theme.colors.accentPrimary,
					bubbleTextColor: theme.colors.textOnAccent,
				}}
				containerStyle={[
					styles.slider,
					theme.id === 'frutiger-aero' && {
						borderRadius: 3,
						borderWidth: 1,
						borderColor: 'rgba(0,100,180,0.35)',
					}
				]}
				renderThumb={() => (
					<View
						style={[
							styles.thumb,
							theme.id === 'frutiger-aero' && {
								backgroundColor: '#fff',
								borderColor: 'rgba(0,150,220,0.5)',
								borderWidth: 1,
								shadowColor: 'rgba(0,180,255,0.9)',
								shadowOffset: { width: 0, height: 0 },
								shadowOpacity: 1,
								shadowRadius: 8,
								elevation: 8,
							}
						]}
					/>
				)}
				thumbWidth={14}
				bubble={(value: number) => `${Math.round(value * 100)}%`}
				style={styles.sliderOuter}
			/>
			{theme.id === 'frutiger-aero' ? (
				<Text style={styles.volValue}>{Math.round(volume * 100)}%</Text>
			) : null}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 4,
	},
	containerFrutiger: {
		backgroundColor: 'rgba(0,30,70,0.4)',
		borderRadius: 6,
		borderWidth: 1,
		borderColor: 'rgba(0,100,180,0.3)',
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	volLabel: {
		fontFamily: 'Orbitron_600SemiBold',
		fontSize: 10,
		color: 'rgba(0,180,255,0.7)',
		letterSpacing: 1,
		minWidth: 26,
	},
	volValue: {
		fontFamily: 'Orbitron_600SemiBold',
		fontSize: 10,
		color: 'rgba(0,180,255,0.7)',
		minWidth: 32,
		textAlign: 'right',
	},
	icon: {
		fontSize: 16,
	},
	sliderOuter: {
		flex: 1,
	},
	slider: {
		height: 6,
		borderRadius: 3,
	},
	thumb: {
		width: 14,
		height: 14,
		borderRadius: 7,
		backgroundColor: '#fff',
	},
})


