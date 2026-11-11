import { useSharedValue, SharedValue } from 'react-native-reanimated'
import { LayoutChangeEvent } from 'react-native'

export interface AlbumGeometry {
	width: SharedValue<number>
	height: SharedValue<number>
	borderRadius: SharedValue<number>
	onAlbumLayout: (e: LayoutChangeEvent, radius?: number) => void
	setGeometry: (w: number, h: number, r?: number) => void
}

/**
 * Shared album geometry hook (single source of truth).
 * Every visualizer mode reads from this — preventing independent guessing of the album's box.
 * Shared values run on the UI thread without triggering React re-renders of the parent screen.
 */
export function useAlbumGeometry(initialWidth = 0, initialHeight = 0, initialRadius = 0): AlbumGeometry {
	const width = useSharedValue(initialWidth)
	const height = useSharedValue(initialHeight)
	const borderRadius = useSharedValue(initialRadius)

	const onAlbumLayout = (e: LayoutChangeEvent, radius?: number) => {
		const { width: w, height: h } = e.nativeEvent.layout
		if (w > 0 && h > 0) {
			width.value = Math.round(w)
			height.value = Math.round(h)
			if (radius !== undefined) {
				borderRadius.value = Math.round(radius)
			}
		}
	}

	const setGeometry = (w: number, h: number, r?: number) => {
		width.value = Math.round(w)
		height.value = Math.round(h)
		if (r !== undefined) {
			borderRadius.value = Math.round(r)
		}
	}

	return { width, height, borderRadius, onAlbumLayout, setGeometry }
}
