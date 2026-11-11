import type {
	Track,
	PlaylistSongMetadata,
	PlaylistMood,
	EnergyCurve,
	PlaylistGenerationConfig,
	GeneratedPlaylistResult,
} from '../types'

/**
 * Heuristically infers mood tags and an energy level (1-10) from song title, artist, and duration.
 * Ensures the auto-playlist generator works immediately without manual tagging.
 */
export function inferHeuristicMetadata(track: Track): PlaylistSongMetadata {
	const text = `${track.title} ${track.artist} ${track.album || ''}`.toLowerCase()
	const tags: string[] = []
	let energy = 5

	// Mood & Energy Patterns
	const chillRegex = /\b(chill|lofi|lo-fi|acoustic|piano|sleep|rain|night|relax|ambient|slow|peace|calm|meditation|soft|dream|cozy|breeze)\b/i
	const workoutRegex = /\b(workout|gym|pump|lift|run|fitness|hype|hard|phonk|bass|drill|trap|rage|fight|beast|power|speed|fast|anthem)\b/i
	const studyRegex = /\b(study|focus|instrumental|classical|jazz|coding|flow|read|work|synthwave|vaporwave|studybeats|chillhop)\b/i
	const partyRegex = /\b(party|dance|club|festival|remix|edm|house|techno|disco|electro|bounce|celebrate|groove|shake|dj)\b/i
	const rockRegex = /\b(rock|metal|punk|heavy|guitar|band|screamo|alternative)\b/i
	const nightRegex = /\b(night|midnight|moon|star|bed|evening|sunset|dusk|quiet)\b/i

	if (chillRegex.test(text)) {
		tags.push('chill')
		energy = Math.min(energy, 3)
	}
	if (workoutRegex.test(text)) {
		tags.push('workout', 'hype')
		energy = Math.max(energy, 8)
	}
	if (studyRegex.test(text)) {
		tags.push('study')
		if (!tags.includes('chill')) tags.push('chill')
		energy = Math.min(Math.max(energy, 3), 5)
	}
	if (partyRegex.test(text)) {
		tags.push('party', 'hype')
		energy = Math.max(energy, 7)
	}
	if (rockRegex.test(text)) {
		tags.push('workout', 'hype')
		energy = Math.max(energy, 8)
	}
	if (nightRegex.test(text)) {
		tags.push('night', 'chill')
		energy = Math.min(energy, 3)
	}

	// Duration modifiers
	if (track.duration > 360) {
		// Long track: often ambient, acoustic, or progressive
		energy = Math.max(1, energy - 1)
	} else if (track.duration > 0 && track.duration < 140) {
		// Short track: often fast-paced, punk, phonk, or pop
		energy = Math.min(10, energy + 1)
	}

	// Fallback tags if none matched
	if (tags.length === 0) {
		tags.push('chill', 'study')
	}

	// Deduplicate tags
	const uniqueTags = Array.from(new Set(tags))

	return {
		id: track.id,
		tags: uniqueTags,
		energy: Math.max(1, Math.min(10, Math.round(energy))),
		durationSec: track.duration || 180,
		addedAt: new Date().toISOString(),
		playCount: 0,
		userCustomized: false,
	}
}

/**
 * Calculates anti-staleness weight:
 * - High weight for songs not played in a long time (or never played)
 * - Lower weight for heavily played tracks to prevent loops
 * Formula: weight = (1 / (1 + playCount * 0.4)) * daysSincePlayed
 */
export function calculateAntiStalenessWeight(meta: PlaylistSongMetadata, now: number): number {
	const daysSincePlayed = meta.lastPlayedAt
		? Math.max(0.1, (now - new Date(meta.lastPlayedAt).getTime()) / (1000 * 60 * 60 * 24))
		: 14 // Never played bonus (equivalent to 2 weeks)

	const playCountFactor = 1 / (1 + (meta.playCount || 0) * 0.4)
	const recencyFactor = Math.min(30, daysSincePlayed)

	return Math.max(0.05, playCountFactor * recencyFactor)
}

/**
 * Generates an array of target energy values (1-10) for each slot in the playlist.
 */
export function generateEnergyCurveTargets(curve: EnergyCurve, count: number): number[] {
	if (count <= 0) return []
	if (count === 1) return [5]

	const targets: number[] = new Array(count)

	switch (curve) {
		case 'ramp-up':
			// Starts moderate (4.0), climbs smoothly to high peak (9.0), with brief 1-track cooldown
			for (let i = 0; i < count; i++) {
				const progress = i / (count - 1)
				if (progress < 0.85) {
					// Climbing phase: 4.0 -> 9.2
					targets[i] = 4.0 + (progress / 0.85) * 5.2
				} else {
					// Brief cooldown: 9.0 -> 6.5
					const coolProgress = (progress - 0.85) / 0.15
					targets[i] = 9.2 - coolProgress * 2.7
				}
			}
			break

		case 'steady':
			// Uniform flow with very subtle natural variation
			for (let i = 0; i < count; i++) {
				targets[i] = 4.8 + 0.4 * Math.sin(i * 1.3)
			}
			break

		case 'chill-down':
			// Starts comfortable (5.5) and steadily winds down to gentle (2.0)
			for (let i = 0; i < count; i++) {
				const progress = i / (count - 1)
				targets[i] = 5.5 - progress * 3.5
			}
			break

		case 'rollercoaster':
			// Dynamic energy peaks and valleys
			for (let i = 0; i < count; i++) {
				const wave = Math.sin((i / (count - 1)) * Math.PI * 3.5)
				targets[i] = 5.5 + wave * 3.2
			}
			break

		case 'smart-shuffle':
		default:
			// Balanced varied distribution across the track list
			for (let i = 0; i < count; i++) {
				targets[i] = 4.0 + ((i * 7) % 5) * 1.1
			}
			break
	}

	return targets.map((v) => Math.max(1, Math.min(10, Math.round(v * 10) / 10)))
}

/**
 * Filter pool according to mood and energy constraints.
 */
export function filterSongPool(
	pool: Track[],
	metadataMap: Record<string, PlaylistSongMetadata>,
	config: PlaylistGenerationConfig
): Array<{ track: Track; meta: PlaylistSongMetadata }> {
	const enriched = pool.map((track) => {
		const meta = metadataMap[track.id] || inferHeuristicMetadata(track)
		return { track, meta }
	})

	if (config.mood === 'all') {
		return enriched
	}

	// Filter by mood tag or matching energy range
	const filtered = enriched.filter(({ meta }) => {
		if (meta.tags.includes(config.mood)) return true

		// Secondary fallback by energy rating
		if (config.mood === 'workout' || config.mood === 'hype') return meta.energy >= 7
		if (config.mood === 'party') return meta.energy >= 6
		if (config.mood === 'chill' || config.mood === 'night') return meta.energy <= 4
		if (config.mood === 'study') return meta.energy >= 2 && meta.energy <= 6
		return false
	})

	// If filtered pool is too narrow (< 3 songs), fall back to whole pool to avoid empty playlists
	return filtered.length >= 3 ? filtered : enriched
}

/**
 * Sequences candidate tracks into a playlist matching the target energy curve,
 * incorporating anti-staleness weighting and preventing back-to-back same artist repeats.
 */
export function sequenceByEnergyCurve(
	candidates: Array<{ track: Track; meta: PlaylistSongMetadata }>,
	curve: EnergyCurve,
	count: number,
	now: number = Date.now()
): { tracks: Track[]; slotEnergies: number[] } {
	const available = [...candidates]
	const selectedTracks: Track[] = []
	const slotEnergies: number[] = []

	const targetCurve = generateEnergyCurveTargets(curve, Math.min(count, available.length))
	let lastArtist = ''

	for (let i = 0; i < targetCurve.length; i++) {
		if (available.length === 0) break
		const targetEnergy = targetCurve[i]

		// Score each available track
		let totalWeight = 0
		const weightedItems = available.map((item) => {
			const stalenessWeight = calculateAntiStalenessWeight(item.meta, now)
			const energyDelta = Math.abs(item.meta.energy - targetEnergy)
			const proximityScore = 1 / (1 + energyDelta * 1.3)

			// Artist anti-clustering: penalize same artist back-to-back
			const isSameArtist =
				item.track.artist &&
				lastArtist &&
				item.track.artist.toLowerCase() === lastArtist.toLowerCase()
			const artistPenalty = isSameArtist ? 0.08 : 1.0

			const weight = stalenessWeight * proximityScore * artistPenalty
			totalWeight += weight
			return { item, weight }
		})

		// Weighted random selection
		let pick = weightedItems[0].item
		if (totalWeight > 0) {
			let randomRoll = Math.random() * totalWeight
			for (const entry of weightedItems) {
				randomRoll -= entry.weight
				if (randomRoll <= 0) {
					pick = entry.item
					break
				}
			}
		}

		// Push selection
		selectedTracks.push(pick.track)
		slotEnergies.push(pick.meta.energy)
		lastArtist = pick.track.artist || ''

		// Remove chosen track from available pool
		const idx = available.findIndex((a) => a.track.id === pick.track.id)
		if (idx !== -1) {
			available.splice(idx, 1)
		}
	}

	return { tracks: selectedTracks, slotEnergies }
}

/**
 * Generates an automated descriptive name for the curated playlist.
 */
export function generatePlaylistName(config: PlaylistGenerationConfig): string {
	const moodNames: Record<PlaylistMood, string> = {
		chill: 'Chill Out',
		workout: 'Workout Pump',
		study: 'Deep Focus',
		hype: 'High Energy',
		party: 'Weekend Party',
		night: 'Evening Wind-Down',
		all: 'Curated Mix',
	}

	const curveNames: Record<EnergyCurve, string> = {
		'ramp-up': 'Ramp-Up',
		steady: 'Steady Flow',
		'chill-down': 'Wind Down',
		rollercoaster: 'Rollercoaster',
		'smart-shuffle': 'Smart Shuffle',
	}

	const moodLabel = moodNames[config.mood] || 'Smart Mix'
	const curveLabel = curveNames[config.energyCurve] || 'Mix'
	return `${moodLabel} (${curveLabel})`
}

/**
 * Master generator function:
 * Filters the song pool, sequences according to the energy curve & anti-staleness,
 * and produces a ready-to-play playlist result.
 */
export function generateAutoPlaylist(
	pool: Track[],
	metadataMap: Record<string, PlaylistSongMetadata>,
	config: PlaylistGenerationConfig,
	now: number = Date.now()
): GeneratedPlaylistResult {
	if (!pool || pool.length === 0) {
		return {
			name: generatePlaylistName(config),
			tracks: [],
			slotEnergies: [],
			totalDurationSec: 0,
			config,
		}
	}

	const filtered = filterSongPool(pool, metadataMap, config)
	const { tracks, slotEnergies } = sequenceByEnergyCurve(
		filtered,
		config.energyCurve,
		config.targetCount,
		now
	)

	const totalDurationSec = tracks.reduce((acc, t) => acc + (t.duration || 180), 0)

	return {
		name: generatePlaylistName(config),
		tracks,
		slotEnergies,
		totalDurationSec,
		config,
	}
}
