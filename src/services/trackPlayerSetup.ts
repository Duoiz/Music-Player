import TrackPlayer, {
	Capability,
	AppKilledPlaybackBehavior,
} from 'react-native-track-player'

/**
 * Initialize the TrackPlayer instance.
 * Must be called only ONCE at app startup (in root _layout.tsx).
 */
export async function setupTrackPlayer(): Promise<boolean> {
	try {
		await TrackPlayer.setupPlayer({
			// Reduce buffer for faster start
			minBuffer: 15,
			maxBuffer: 50,
			playBuffer: 2,
			backBuffer: 5,
		})

		await TrackPlayer.updateOptions({
			// Capabilities shown in the lock-screen / notification controls
			capabilities: [
				Capability.Play,
				Capability.Pause,
				Capability.SkipToNext,
				Capability.SkipToPrevious,
				Capability.SeekTo,
				Capability.Stop,
			],
			// Compact capabilities shown when notification is collapsed
			compactCapabilities: [
				Capability.Play,
				Capability.Pause,
				Capability.SkipToNext,
			],
			// Android notification options
			android: {
				appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
				alwaysPauseOnInterruption: true,
			},
		})

		return true
	} catch (error) {
		console.error('Error setting up TrackPlayer:', error)
		return false
	}
}
