import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Slider } from 'react-native-awesome-slider'
import { useSharedValue } from 'react-native-reanimated'
import { useTheme } from './ThemeProvider'
import { usePlayerStore } from '../stores/playerStore'
import { useTrackProgress } from '../hooks/useTrackProgress'
import { formatTime } from '../utils/formatTime'

/**
 * Seekable progress bar synced with TrackPlayer.
 * Uses react-native-awesome-slider for smooth dragging + reanimated.
 */
export function ProgressBar() {
	const theme = useTheme()
	const { position, duration } = useTrackProgress(250)
	const seekTo = usePlayerStore((s) => s.seekTo)

	const progress = useSharedValue(position)
	const min = useSharedValue(0)
	const max = useSharedValue(Math.max(duration, 1))

	// Update shared values when progress changes
	React.useEffect(() => {
		progress.value = position
		max.value = Math.max(duration, 1)
	}, [position, duration, progress, max])

	const handleSlidingComplete = useCallback(
		(value: number) => {
			seekTo(value)
		},
		[seekTo]
	)

	return (
		<View style={styles.container}>
			<Slider
				progress={progress}
				minimumValue={min}
				maximumValue={max}
				onSlidingComplete={handleSlidingComplete}
				theme={{
					maximumTrackTintColor: theme.id === 'frutiger-aero' ? 'rgba(0,40,80,0.55)' : theme.colors.progressTrack,
					minimumTrackTintColor: theme.id === 'frutiger-aero' ? '#00ffc8' : theme.colors.accentPrimary,
					bubbleBackgroundColor: theme.id === 'frutiger-aero' ? '#0090ff' : theme.colors.accentPrimary,
					bubbleTextColor: theme.colors.textOnAccent,
					cacheTrackTintColor: theme.colors.progressTrack,
				}}
				containerStyle={[
					styles.slider,
					{ borderRadius: 4 },
					theme.id === 'frutiger-aero' && {
						borderWidth: 1,
						borderColor: 'rgba(0,100,180,0.35)',
						shadowColor: 'rgba(0,200,255,0.7)',
						shadowOffset: { width: 0, height: 0 },
						shadowOpacity: 0.5,
						shadowRadius: 8,
						elevation: 4,
					}
				]}
				renderThumb={() => (
					<View
						style={[
							styles.thumb,
							theme.id === 'frutiger-aero' && {
								backgroundColor: '#fff',
								borderColor: '#80e8ff',
								borderWidth: 2,
								shadowColor: '#00dcff',
								shadowOffset: { width: 0, height: 0 },
								shadowOpacity: 1,
								shadowRadius: 8,
								elevation: 8,
							}
						]}
					/>
				)}
				thumbWidth={14}
				bubble={(value: number) => formatTime(value)}
				style={styles.sliderOuter}
			/>
			<View style={styles.timeRow}>
				<Text
					style={[
						styles.time,
						{
							color: theme.id === 'frutiger-aero' ? 'rgba(0,180,255,0.7)' : theme.colors.textSecondary,
							fontSize: 10,
							fontFamily: theme.id === 'frutiger-aero' ? 'Orbitron_600SemiBold' : theme.typography.fontFamily,
						},
					]}
				>
					{formatTime(position)}
				</Text>
				<Text
					style={[
						styles.time,
						{
							color: theme.id === 'frutiger-aero' ? 'rgba(0,150,220,0.5)' : theme.colors.textSecondary,
							fontSize: 10,
							fontFamily: theme.id === 'frutiger-aero' ? 'Orbitron_600SemiBold' : theme.typography.fontFamily,
						},
					]}
				>
					{formatTime(duration)}
				</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	sliderOuter: {
		width: '100%',
	},
	slider: {
		height: 8,
	},
	thumb: {
		width: 14,
		height: 14,
		borderRadius: 7,
		backgroundColor: '#fff',
	},
	timeRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 6,
	},
	time: {
		fontWeight: '500',
	},
})
