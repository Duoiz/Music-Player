import TrackPlayer, { Event } from 'react-native-track-player'

/**
 * Background playback service.
 * This is registered at the app entry point and handles remote events
 * (lock-screen controls, Bluetooth, notification taps, etc.)
 */
export async function PlaybackService() {
	TrackPlayer.addEventListener(Event.RemotePause, () => {
		TrackPlayer.pause()
	})

	TrackPlayer.addEventListener(Event.RemotePlay, () => {
		TrackPlayer.play()
	})

	TrackPlayer.addEventListener(Event.RemoteNext, () => {
		TrackPlayer.skipToNext()
	})

	TrackPlayer.addEventListener(Event.RemotePrevious, () => {
		TrackPlayer.skipToPrevious()
	})

	TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
		TrackPlayer.seekTo(event.position)
	})

	TrackPlayer.addEventListener(Event.RemoteStop, () => {
		TrackPlayer.reset()
	})

	// Duck audio when another app plays audio (e.g. navigation)
	TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
		if (event.paused) {
			await TrackPlayer.pause()
		} else if (event.permanent) {
			await TrackPlayer.stop()
		} else {
			// Volume was ducked, let TrackPlayer handle it internally
			// if it doesn't, we'd normally check event.ducking, but it's deprecated/removed in some RNTP versions
		}
	})
}
