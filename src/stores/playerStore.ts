import { create } from 'zustand'
import TrackPlayer, { RepeatMode as TPRepeatMode } from 'react-native-track-player'
import type { Track, RepeatMode } from '../types'
import { useSpectrumStore } from './spectrumStore'

interface PlayerStore {
	// State
	currentTrack: Track | null
	queue: Track[]
	isPlaying: boolean
	isLoading: boolean
	position: number
	duration: number
	buffered: number
	volume: number
	repeatMode: RepeatMode
	shuffleEnabled: boolean

	// Actions
	play: (track?: Track, newQueue?: Track[]) => Promise<void>
	pause: () => Promise<void>
	resume: () => Promise<void>
	next: () => Promise<void>
	previous: () => Promise<void>
	seekTo: (position: number) => Promise<void>
	setVolume: (volume: number) => Promise<void>
	addToQueue: (track: Track) => Promise<void>
	removeFromQueue: (index: number) => Promise<void>
	clearQueue: () => Promise<void>
	setRepeatMode: (mode: RepeatMode) => void
	toggleShuffle: () => void

	// Internal state setters (called by TrackPlayer event listeners)
	setPosition: (position: number) => void
	setDuration: (duration: number) => void
	setProgress: (position: number, duration: number, buffered: number) => void
	setIsPlaying: (isPlaying: boolean) => void
	setIsLoading: (isLoading: boolean) => void
	setCurrentTrack: (track: Track | null) => void
	setBuffered: (buffered: number) => void
}

/**
 * Convert our RepeatMode to TrackPlayer's RepeatMode.
 */
function toTPRepeatMode(mode: RepeatMode): TPRepeatMode {
	switch (mode) {
		case 'off':
			return TPRepeatMode.Off
		case 'one':
			return TPRepeatMode.Track
		case 'all':
			return TPRepeatMode.Queue
	}
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	// Initial state
	currentTrack: null,
	queue: [],
	isPlaying: false,
	isLoading: false,
	position: 0,
	duration: 0,
	buffered: 0,
	volume: 1.0,
	repeatMode: 'off',
	shuffleEnabled: false,

	// Play a track (or resume if no track provided), optionally setting the category queue
	play: async (track, newQueue) => {
		try {
			if (track) {
				set({ isLoading: true })
				// Trigger background spectrum analysis/load in parallel with stream buffering
				useSpectrumStore.getState().loadSpectrum(track.id).catch(() => {})

				// If track.url is empty or missing, attempt to resolve from API
				if (!track.url || typeof track.url !== 'string' || track.url.trim() === '') {
					try {
						const { getStreamUrl } = await import('../services/api')
						const stream = await getStreamUrl(track.id)
						track.url = stream.streamUrl
					} catch (streamErr) {
						console.warn('Cannot resolve stream URL for track:', track.id, streamErr)
					}
				}

				if (!track.url || typeof track.url !== 'string' || track.url.trim() === '') {
					console.warn('Cannot play track: URL is empty or invalid', track)
					set({ isLoading: false })
					return
				}

				// Determine queue:
				// If newQueue is passed and non-empty, use it.
				// Otherwise, if existing queue already contains this track, preserve existing queue!
				// Otherwise fallback to [track].
				let updatedQueue = newQueue
				if (!updatedQueue || updatedQueue.length === 0) {
					const existingQueue = get().queue
					if (existingQueue.some((t) => t.id === track.id)) {
						updatedQueue = existingQueue
					} else {
						updatedQueue = [track]
					}
				}

				// Check if TrackPlayer already has this exact queue loaded
				const validTracks = updatedQueue.filter(
					(t) => t.url && typeof t.url === 'string' && t.url.trim() !== ''
				)
				const trackIndex = validTracks.findIndex((t) => t.id === track.id)

				let queueAlreadyLoaded = false
				try {
					const currentTPQueue = await TrackPlayer.getQueue()
					if (
						currentTPQueue.length === validTracks.length &&
						currentTPQueue.length > 1 &&
						currentTPQueue.every((t, i) => String(t.id) === String(validTracks[i].id))
					) {
						queueAlreadyLoaded = true
					}
				} catch (e) {}

				if (queueAlreadyLoaded && trackIndex !== -1) {
					await TrackPlayer.skip(trackIndex)
				} else {
					await TrackPlayer.reset()
					if (validTracks.length > 1 && trackIndex !== -1) {
						await TrackPlayer.add(
							validTracks.map((t) => ({
								id: t.id,
								url: t.url,
								title: t.title,
								artist: t.artist,
								artwork: t.artwork,
								duration: t.duration,
							}))
						)
						await TrackPlayer.skip(trackIndex)
					} else {
						await TrackPlayer.add({
							id: track.id,
							url: track.url,
							title: track.title,
							artist: track.artist,
							artwork: track.artwork,
							duration: track.duration,
						})
					}
				}

				set({ currentTrack: track, queue: updatedQueue })
				await TrackPlayer.play()
				set({ isPlaying: true, isLoading: false })

				// Ensure equalizer settings persist to the newly loaded track/ExoPlayer session
				try {
					const { useEQStore, applyEQToPlayer } = await import('./eqStore')
					const { bands, isEnabled } = useEQStore.getState()
					if (isEnabled) {
						await new Promise((resolve) => setTimeout(resolve, 500))
						await applyEQToPlayer(bands, isEnabled)
					}
				} catch (eqErr) {
					// silent catch
				}
			} else {
				await TrackPlayer.play()
				set({ isPlaying: true })
			}
		} catch (error) {
			console.error('Error playing track:', error)
			set({ isLoading: false })
		}
	},

	pause: async () => {
		await TrackPlayer.pause()
		set({ isPlaying: false })
	},

	resume: async () => {
		await TrackPlayer.play()
		set({ isPlaying: true })
	},

	next: async () => {
		try {
			const queue = get().queue
			const currentTrack = get().currentTrack
			if (!currentTrack || queue.length === 0) return

			const currentIndex = queue.findIndex((t) => t.id === currentTrack.id)
			let nextIndex: number

			if (get().shuffleEnabled) {
				nextIndex = Math.floor(Math.random() * queue.length)
			} else {
				nextIndex = currentIndex + 1
				if (nextIndex >= queue.length) {
					if (get().repeatMode === 'all') {
						nextIndex = 0
					} else {
						return // End of queue
					}
				}
			}

			const nextTrack = queue[nextIndex]
			if (nextTrack) {
				await get().play(nextTrack)
			}
		} catch (error) {
			console.error('Error skipping to next:', error)
		}
	},

	previous: async () => {
		try {
			const position = get().position
			// If past 3 seconds, restart the current track
			if (position > 3) {
				await TrackPlayer.seekTo(0)
				return
			}

			const queue = get().queue
			const currentTrack = get().currentTrack
			if (!currentTrack || queue.length === 0) return

			const currentIndex = queue.findIndex((t) => t.id === currentTrack.id)
			let prevIndex = currentIndex - 1

			if (prevIndex < 0) {
				if (get().repeatMode === 'all') {
					prevIndex = queue.length - 1
				} else {
					await TrackPlayer.seekTo(0)
					return
				}
			}

			const prevTrack = queue[prevIndex]
			if (prevTrack) {
				await get().play(prevTrack)
			}
		} catch (error) {
			console.error('Error skipping to previous:', error)
		}
	},

	seekTo: async (position) => {
		await TrackPlayer.seekTo(position)
		set({ position })
	},

	setVolume: async (volume) => {
		await TrackPlayer.setVolume(volume)
		set({ volume })
	},

	addToQueue: async (track) => {
		const queue = get().queue
		set({ queue: [...queue, track] })
		await TrackPlayer.add({
			id: track.id,
			url: track.url,
			title: track.title,
			artist: track.artist,
			artwork: track.artwork,
			duration: track.duration,
		})
	},

	removeFromQueue: async (index) => {
		const queue = [...get().queue]
		queue.splice(index, 1)
		set({ queue })
		await TrackPlayer.remove(index)
	},

	clearQueue: async () => {
		set({ queue: [] })
		await TrackPlayer.reset()
	},

	setRepeatMode: (mode) => {
		set({ repeatMode: mode })
		TrackPlayer.setRepeatMode(toTPRepeatMode(mode))
	},

	toggleShuffle: () => {
		set((state) => ({ shuffleEnabled: !state.shuffleEnabled }))
	},

	// Internal setters
	setPosition: (position) => set({ position }),
	setDuration: (duration) => set({ duration }),
	setProgress: (position, duration, buffered) => set({ position, duration, buffered }),
	setIsPlaying: (isPlaying) => set({ isPlaying }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setCurrentTrack: (currentTrack) => set({ currentTrack }),
	setBuffered: (buffered) => set({ buffered }),
}))
