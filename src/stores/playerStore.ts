import { create } from 'zustand'
import TrackPlayer, { State, RepeatMode as TPRepeatMode } from 'react-native-track-player'
import type { Track, RepeatMode } from '../types'

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
	play: (track?: Track) => Promise<void>
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

	// Play a track (or resume if no track provided)
	play: async (track) => {
		try {
			if (track) {
				set({ isLoading: true })

				// Reset queue and add the new track
				await TrackPlayer.reset()
				await TrackPlayer.add({
					id: track.id,
					url: track.url,
					title: track.title,
					artist: track.artist,
					artwork: track.artwork,
					duration: track.duration,
				})

				set({ currentTrack: track, queue: [track] })
				await TrackPlayer.play()
				set({ isPlaying: true, isLoading: false })
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
	setIsPlaying: (isPlaying) => set({ isPlaying }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setCurrentTrack: (currentTrack) => set({ currentTrack }),
	setBuffered: (buffered) => set({ buffered }),
}))
