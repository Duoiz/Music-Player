import { useCallback } from 'react'
import { Platform } from 'react-native'

/**
 * Simple haptic feedback for control interactions.
 * Uses Expo Haptics when available, falls back to no-op.
 *
 * Usage:
 *   const haptic = useHapticFeedback()
 *   haptic.light()  // button tap
 *   haptic.medium() // slider snap
 *   haptic.heavy()  // action confirmation
 */

let Haptics: typeof import('expo-haptics') | null = null

// Lazy-load expo-haptics to avoid crashes when not installed
try {
	Haptics = require('expo-haptics')
} catch {
	Haptics = null
}

export function useHapticFeedback() {
	const light = useCallback(() => {
		if (Platform.OS === 'web' || !Haptics) return
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
	}, [])

	const medium = useCallback(() => {
		if (Platform.OS === 'web' || !Haptics) return
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
	}, [])

	const heavy = useCallback(() => {
		if (Platform.OS === 'web' || !Haptics) return
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
	}, [])

	const selection = useCallback(() => {
		if (Platform.OS === 'web' || !Haptics) return
		Haptics.selectionAsync()
	}, [])

	const notification = useCallback((type: 'success' | 'warning' | 'error') => {
		if (Platform.OS === 'web' || !Haptics) return
		const map = {
			success: Haptics.NotificationFeedbackType.Success,
			warning: Haptics.NotificationFeedbackType.Warning,
			error: Haptics.NotificationFeedbackType.Error,
		}
		Haptics.notificationAsync(map[type])
	}, [])

	return { light, medium, heavy, selection, notification }
}
