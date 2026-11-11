import { NativeModules, PermissionsAndroid, Platform } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import type { Track } from '../types'

const { MediaScannerModule } = NativeModules

/**
 * Requests device media audio permissions according to Android version.
 */
export async function requestMediaPermissions(): Promise<boolean> {
	if (Platform.OS !== 'android') {
		return true
	}

	try {
		const androidVersion = Platform.Version
		if (typeof androidVersion === 'number' && androidVersion >= 33) {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
				{
					title: 'Music Access Permission',
					message: 'This app needs access to your audio files to scan and play MP3 songs stored on your device.',
					buttonPositive: 'Allow',
					buttonNegative: 'Deny',
				}
			)
			return granted === PermissionsAndroid.RESULTS.GRANTED
		} else {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
				{
					title: 'Storage Access Permission',
					message: 'This app needs access to your storage to scan and play MP3 songs stored on your device.',
					buttonPositive: 'Allow',
					buttonNegative: 'Deny',
				}
			)
			return granted === PermissionsAndroid.RESULTS.GRANTED
		}
	} catch (err) {
		console.warn('[MediaScanner] Error requesting audio permissions:', err)
		return false
	}
}

/**
 * Scans the device for audio files (.mp3, .m4a, .flac, .wav).
 * Uses high-performance native MediaStore query when available,
 * and falls back to local app directories when native module is unavailable.
 */
export async function scanDeviceAudio(): Promise<Track[]> {
	const hasPermission = await requestMediaPermissions()
	if (!hasPermission && Platform.OS === 'android') {
		console.warn('[MediaScanner] Permission to read media audio was denied')
		return []
	}

	// 1. Try native MediaScannerModule
	if (MediaScannerModule?.scanAudioFiles) {
		try {
			const rawTracks: any[] = await MediaScannerModule.scanAudioFiles()
			if (Array.isArray(rawTracks) && rawTracks.length > 0) {
				return rawTracks.map((item, idx) => ({
					id: item.id || `local_${idx}`,
					url: item.url || item.filePath,
					title: item.title || 'Unknown Title',
					artist: item.artist || 'Unknown Artist',
					album: item.album || 'Unknown Album',
					duration: item.duration || 0,
					artwork: item.artwork && item.artwork.length > 0 ? item.artwork : '',
				}))
			}
		} catch (err) {
			console.warn('[MediaScanner] Native scanAudioFiles error, falling back to FS scan:', err)
		}
	}

	// 2. Fallback: Scan app downloads and document directory
	const fallbackTracks: Track[] = []
	try {
		const downloadsDir = `${FileSystem.documentDirectory}downloads/`
		const dirInfo = await FileSystem.getInfoAsync(downloadsDir)
		if (dirInfo.exists && dirInfo.isDirectory) {
			const files = await FileSystem.readDirectoryAsync(downloadsDir)
			for (const file of files) {
				if (file.toLowerCase().endsWith('.mp3') || file.toLowerCase().endsWith('.m4a')) {
					const fileUri = `${downloadsDir}${file}`
					const nameWithoutExt = file.replace(/\.[^/.]+$/, '')
					fallbackTracks.push({
						id: `local_fs_${file}`,
						url: fileUri,
						title: nameWithoutExt,
						artist: 'Offline Audio',
						album: 'Downloads',
						duration: 180,
						artwork: '',
					})
				}
			}
		}
	} catch (fsErr) {
		console.warn('[MediaScanner] Fallback FS scan error:', fsErr)
	}

	return fallbackTracks
}
