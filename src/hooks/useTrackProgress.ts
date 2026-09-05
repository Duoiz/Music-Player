import { useEffect } from 'react'
import { useProgress, Event, useTrackPlayerEvents } from 'react-native-track-player'
import { usePlayerStore } from '../stores/playerStore'

/**
 * Custom hook that syncs TrackPlayer progress to our Zustand store
 * and provides real-time position/duration/buffered values.
 *
 * Uses TrackPlayer.useProgress() internally with a configurable update interval.
 */
export function useTrackProgress(updateInterval = 500) {
	const progress = useProgress(updateInterval)
	const setProgress = usePlayerStore((s) => s.setProgress)

	useEffect(() => {
		setProgress(progress.position, progress.duration, progress.buffered)
	}, [progress.position, progress.duration, progress.buffered, setProgress])

	return progress
}

/**
 * Hook that listens for TrackPlayer playback state changes
 * and syncs them to the Zustand store.
 */
export function useTrackPlayerSync() {
	const setIsPlaying = usePlayerStore((s) => s.setIsPlaying)
	const setIsLoading = usePlayerStore((s) => s.setIsLoading)
	const setCurrentTrack = usePlayerStore((s) => s.setCurrentTrack)

	useTrackPlayerEvents(
		[Event.PlaybackState, Event.PlaybackActiveTrackChanged, Event.PlaybackQueueEnded],
		async (event) => {
			if (event.type === Event.PlaybackState) {
				const state = event.state
				setIsPlaying(state === 'playing')
				setIsLoading(state === 'loading' || state === 'buffering')
			}

			if (event.type === Event.PlaybackActiveTrackChanged) {
				if (event.track) {
					setCurrentTrack({
						id: String(event.track.id ?? event.index),
						url: String(event.track.url ?? ''),
						title: String(event.track.title ?? 'Unknown'),
						artist: String(event.track.artist ?? 'Unknown'),
						artwork: String(event.track.artwork ?? ''),
						duration: Number(event.track.duration ?? 0),
					})
				}
			}

			if (event.type === Event.PlaybackQueueEnded) {
				setIsPlaying(false)
			}
		}
	)
}
