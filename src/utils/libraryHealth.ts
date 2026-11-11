import type { Track } from '../types'

export type LibraryIssueKind = 'unplayable' | 'too-short' | 'missing-info' | 'duplicate'

export interface LibraryIssue {
	kind: LibraryIssueKind
	track: Track
	detail?: string
}

const MIN_SONG_SECONDS = 20
const UNKNOWN = /^unknown( title| artist)?$/i

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/**
 * Flags device tracks that are probably broken or messy. Pure and synchronous so it can run on
 * thousands of tracks. Durations from the scanner are in seconds.
 */
export function analyzeLibrary(tracks: Track[]): LibraryIssue[] {
	const issues: LibraryIssue[] = []
	const seen = new Map<string, Track>()

	for (const track of tracks) {
		if (!track.url) {
			issues.push({ kind: 'unplayable', track, detail: 'No file location' })
			continue
		}
		if (!track.duration || track.duration <= 0) {
			issues.push({ kind: 'unplayable', track, detail: 'Zero length, file may be corrupt' })
		} else if (track.duration < MIN_SONG_SECONDS) {
			issues.push({ kind: 'too-short', track, detail: `${Math.round(track.duration)}s, likely a ringtone or clip` })
		}

		if (!track.title || UNKNOWN.test(track.title) || !track.artist || UNKNOWN.test(track.artist)) {
			issues.push({ kind: 'missing-info', track, detail: 'Missing title or artist' })
		}

		const key = `${normalize(track.title)}|${normalize(track.artist)}|${Math.round((track.duration || 0) / 3)}`
		const original = seen.get(key)
		if (original && normalize(track.title)) {
			issues.push({ kind: 'duplicate', track, detail: `Same as "${original.title}"` })
		} else {
			seen.set(key, track)
		}
	}

	return issues
}

export const ISSUE_LABELS: Record<LibraryIssueKind, string> = {
	unplayable: 'Possibly corrupt',
	'too-short': 'Very short',
	'missing-info': 'Missing info',
	duplicate: 'Duplicates',
}
