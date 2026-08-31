import { getColors } from 'react-native-image-colors'

/**
 * Extract dominant colors from an album art image URL.
 * Returns primary + secondary colors for tinting the player UI.
 */
export async function extractImageColors(imageUrl: string): Promise<{
	primary: string
	secondary: string
	background: string
	text: string
}> {
	const defaults = {
		primary: '#87CEEB',
		secondary: '#E0F6FF',
		background: '#B0E0E6',
		text: '#1a1a1a',
	}

	try {
		if (!imageUrl) return defaults

		const result = await getColors(imageUrl, {
			fallback: '#87CEEB',
			cache: true,
			key: imageUrl,
		})

		if (result.platform === 'android') {
			return {
				primary: result.dominant || defaults.primary,
				secondary: result.vibrant || defaults.secondary,
				background: result.muted || defaults.background,
				text: result.darkVibrant || defaults.text,
			}
		} else if (result.platform === 'ios') {
			return {
				primary: result.primary || defaults.primary,
				secondary: result.secondary || defaults.secondary,
				background: result.background || defaults.background,
				text: result.detail || defaults.text,
			}
		}

		return defaults
	} catch {
		return defaults
	}
}
