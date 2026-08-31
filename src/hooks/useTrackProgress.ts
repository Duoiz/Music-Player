import { useEffect, useRef, useState } from 'react'
import TrackPlayer, { useProgress, Event, useTrackPlayerEvents } from 'react-native-track-player'
import { usePlayerStore } from '../stores/playerStore'

/**
 * Custom hook that syncs TrackPlayer progress to our Zustand store
 * and provides real-time position/duration/buffered values.
 *
 * Uses TrackPlayer.useProgress() internally with a configurable update interval.
 */
export function useTrackProgress(updateInterval = 500) {
	const progress = useProgress(updateInterval)
	const setPosition = usePlayerStore((s) => s.setPosition)
	const setDuration = usePlayerStore((s) => s.setDuration)
	const setBuffered = usePlayerStore((s) => s.setBuffered)

	useEffect(() => {
		setPosition(progress.position)
		setDuration(progress.duration)
		setBuffered(progress.buffered)
	}, [progress.position, progress.duration, progress.buffered, setPosition, setDuration, setBuffered])

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
