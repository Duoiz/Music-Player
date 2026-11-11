import * as FileSystem from 'expo-file-system/legacy'
import { Alert } from 'react-native'
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

		// 3. Download the full file (avoiding any partial preview truncation)
		const downloadUrl = streamInfo.streamUrl.includes('?')
			? `${streamInfo.streamUrl}&download=true&full=true`
			: `${streamInfo.streamUrl}?download=true&full=true`

		const downloadResumable = FileSystem.createDownloadResumable(
			downloadUrl,
			fileUri,
			{
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
					'x-download': 'true',
				}
			},

			(downloadProgress) => {
				const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
				store.setDownloadProgress(songId, progress)
			}
		)

		let result;
		let retries = 5; // Retry up to 5 times if the connection drops

		while (retries > 0) {
			try {
				// If we haven't started, or if we need to restart from scratch, use downloadAsync
				// Wait, if it threw, we should use resumeAsync to pick up where it dropped!
				if (!result) {
					result = await downloadResumable.downloadAsync()
				} else {
					console.log(`[DOWNLOAD] Resuming download... (${retries} retries left)`)
					result = await downloadResumable.resumeAsync()
				}

				if (result && (result.status === 200 || result.status === 206)) {
					break; // Success!
				} else if (result) {
					throw new Error(`Download failed with status ${result.status}`)
				}
			} catch (err) {
				console.log(`[DOWNLOAD] Interrupted at ${store.activeDownloads[songId] || 0}%`, err);
				retries--;
				if (retries === 0) {
					throw new Error(`Download failed after multiple retries. URL was: ${streamInfo.streamUrl.substring(0, 50)}...`)
				}
				// Wait 2 seconds before resuming
				await new Promise(resolve => setTimeout(resolve, 2000));
				// Set result to something truthy so the next loop triggers resumeAsync()
				result = 'resume_needed';
			}
		}

		// 4. Save to store
		const downloadedUri = typeof result === 'object' && result && 'uri' in result ? (result as any).uri : fileUri
		store.addDownloadedTrack({
			id: song.id,
			url: downloadedUri, // Use the local URI
			title: song.title,
			artist: song.artist,
			artwork: ('thumbnail' in song ? song.thumbnail : song.artwork) || '',
			duration: song.duration,
			localFileUri: downloadedUri,
			downloadedAt: Date.now(),
		})

		store.removeActiveDownload(songId)
		return true
	} catch (error: any) {
		console.error('Error downloading song:', error)
		Alert.alert('Download Failed', error?.message || 'Unknown error')
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
