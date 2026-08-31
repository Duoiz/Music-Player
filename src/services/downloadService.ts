import * as FileSystem from 'expo-file-system/legacy'
import { getStreamUrl } from './api'
import { useDownloadStore } from '../stores/downloadStore'
import type { Song, Track } from '../types'

/**
 * Downloads a song for offline playback.
 */
export async function downloadSong(song: Song | Track): Promise<boolean> {
	const store = useDownloadStore.getState()
	const songId = 'videoId' in song && song.videoId ? song.videoId : song.id
	
	try {
		store.setDownloadProgress(songId, 0.01) // Initialize progress

		// 1. Get the actual streaming URL
		const videoId = songId
		const streamInfo = await getStreamUrl(videoId)
		
		if (!streamInfo || !streamInfo.streamUrl) {
			throw new Error('Failed to extract stream URL')
		}

		// 2. Define the local file path
		const fileName = `${videoId}.mp3`
		const fileUri = `${FileSystem.documentDirectory}downloads/${fileName}`

		// Ensure downloads directory exists
		const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}downloads/`)
		if (!dirInfo.exists) {
			await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}downloads/`, { intermediates: true })
		}

		// 3. Download the file
		const downloadResumable = FileSystem.createDownloadResumable(
			streamInfo.streamUrl,
			fileUri,
			{},
			(downloadProgress) => {
				const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
				store.setDownloadProgress(songId, progress)
			}
		)

		const result = await downloadResumable.downloadAsync()
		
		if (!result || result.status !== 200) {
			throw new Error('Download failed')
		}

		// 4. Save to store
		store.addDownloadedTrack({
			id: song.id,
			url: result.uri, // Use the local URI
			title: song.title,
			artist: song.artist,
			artwork: ('thumbnail' in song ? song.thumbnail : song.artwork) || '',
			duration: song.duration,
			localFileUri: result.uri,
			downloadedAt: Date.now(),
		})

		store.removeActiveDownload(songId)
		return true
	} catch (error) {
		console.error('Error downloading song:', error)
		store.removeActiveDownload(songId)
		return false
	}
}

/**
 * Deletes a downloaded song from the file system and store.
 */
export async function deleteDownloadedSong(songId: string): Promise<boolean> {
	try {
		const localUri = useDownloadStore.getState().getLocalUri(songId)
		if (localUri) {
			const fileInfo = await FileSystem.getInfoAsync(localUri)
			if (fileInfo.exists) {
				await FileSystem.deleteAsync(localUri)
			}
		}
		
		useDownloadStore.getState().removeDownloadedTrack(songId)
		return true
	} catch (error) {
		console.error('Error deleting downloaded song:', error)
		return false
	}
}
