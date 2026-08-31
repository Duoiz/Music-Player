/**
 * Format seconds to mm:ss display string.
 * e.g. 80 → "1:20", 3661 → "61:01"
 */
export function formatTime(seconds: number): string {
	if (!seconds || seconds < 0) return '0:00'

	const mins = Math.floor(seconds / 60)
	const secs = Math.floor(seconds % 60)
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format seconds to a human-readable duration.
 * e.g. 80 → "1 min 20 sec", 3661 → "1 hr 1 min"
 */
export function formatDuration(seconds: number): string {
	if (!seconds || seconds < 0) return '0 sec'

	const hrs = Math.floor(seconds / 3600)
	const mins = Math.floor((seconds % 3600) / 60)
	const secs = Math.floor(seconds % 60)

	if (hrs > 0) {
		return `${hrs} hr ${mins} min`
	}
	if (mins > 0) {
		return `${mins} min ${secs} sec`
	}
	return `${secs} sec`
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max)
}
