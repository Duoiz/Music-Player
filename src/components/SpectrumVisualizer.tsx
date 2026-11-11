import React, { useEffect, useState } from 'react'
import { AccessibilityInfo, StyleSheet, StyleProp, ViewStyle, View } from 'react-native'
import { Canvas, Path, Skia } from '@shopify/react-native-skia'
import { useDerivedValue, SharedValue } from 'react-native-reanimated'
import type { AlbumGeometry } from '../hooks/useAlbumGeometry'
import type { VisualizerMode } from '../types'

export interface SpectrumVisualizerProps {
	mode?: VisualizerMode
	albumGeometry?: AlbumGeometry
	magnitudes: SharedValue<number[]>
	barCount?: number
	sizeScale?: number // 0.5 to 1.5
	color?: string
	glowColor?: string
	canvasWidth: number
	canvasHeight: number
	style?: StyleProp<ViewStyle>
}

/**
 * High-performance Skia audio spectrum visualizer.
 * Supports 4 modes:
 * - 'radial': Dense bars radiating 360° around the measured album card perimeter
 * - 'circle': Concentric circular spectrum ring
 * - 'linear-upper': Rising equalizer bars anchored to the baseline
 * - 'linear-full': Mirrored spectrum bars expanding symmetrically across center line
 *
 * Implements single-Path GPU batching inside useDerivedValue to batch all bars
 * into a single GPU draw call per frame without React scene graph re-creation.
 */
export function SpectrumVisualizer({
	mode = 'radial',
	albumGeometry,
	magnitudes,
	barCount = 36,
	sizeScale = 1.0,
	color = '#38BDF8',
	glowColor,
	canvasWidth,
	canvasHeight,
	style,
}: SpectrumVisualizerProps) {
	// Reduce motion accessibility guardrail
	const [reduceMotion, setReduceMotion] = useState(false)
	useEffect(() => {
		AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {})
		const subscription = AccessibilityInfo.addEventListener(
			'reduceMotionChanged',
			setReduceMotion
		)
		return () => subscription?.remove()
	}, [])

	// Guardrail: clamp bar count dynamically by size to prevent overcrowding
	const maxBarsForSize = Math.floor(16 + (Math.max(0.5, Math.min(1.5, sizeScale)) - 0.5) * 48)
	const effectiveBarCount = Math.min(barCount, maxBarsForSize)
	const effectiveScale = Math.max(0.5, Math.min(1.5, sizeScale))
	const effectiveColor = color || '#38BDF8'
	const effectiveGlowColor = glowColor || effectiveColor

	const cx = canvasWidth / 2
	const cy = canvasHeight / 2
	const strokeW = 3.2 * effectiveScale

	// UI-thread derived SkPath batching all bars in 1 draw call
	const batchedPath = useDerivedValue(() => {
		const path = Skia.Path.Make()
		const mags = magnitudes.value
		const count = effectiveBarCount
		const isReduced = reduceMotion

		if (mode === 'radial' || mode === 'circle') {
			const albumW = albumGeometry ? albumGeometry.width.value : canvasWidth * 0.6
			const baseRadius =
				mode === 'radial'
					? albumW / 2 + 12 * effectiveScale
					: 38 * effectiveScale
			const maxLen = (mode === 'radial' ? 38 : 68) * effectiveScale

			for (let i = 0; i < count; i++) {
				const a = isReduced ? 0.2 : (mags[i] ?? 0)
				const len = 8 * effectiveScale + a * maxLen
				const ang = (i / count) * Math.PI * 2 - Math.PI / 2

				const x1 = cx + Math.cos(ang) * baseRadius
				const y1 = cy + Math.sin(ang) * baseRadius
				const x2 = cx + Math.cos(ang) * (baseRadius + len)
				const y2 = cy + Math.sin(ang) * (baseRadius + len)

				path.moveTo(x1, y1)
				path.lineTo(x2, y2)
			}
		} else {
			// Linear modes ('linear-upper' and 'linear-full')
			const maxW = Math.min(canvasWidth - 28, 280 * effectiveScale)
			const gap = Math.max(2, Math.min(5, 4 * effectiveScale))
			const barW = Math.max(2, (maxW - gap * (count - 1)) / count)
			const startX = cx - maxW / 2
			const maxH = (mode === 'linear-upper' ? 120 : 80) * effectiveScale
			const baseY = mode === 'linear-upper' ? canvasHeight - 16 : cy

			for (let i = 0; i < count; i++) {
				const a = isReduced ? 0.2 : (mags[i] ?? 0)
				const h = 6 * effectiveScale + a * maxH
				const x = startX + i * (barW + gap)

				if (mode === 'linear-upper') {
					const y = baseY - h
					path.addRRect(Skia.RRectXY(Skia.XYWHRect(x, y, barW, h), 2, 2))
				} else {
					// 'linear-full' (mirrored expansion from center baseline)
					const y = baseY - h
					const fullH = h * 2
					path.addRRect(Skia.RRectXY(Skia.XYWHRect(x, y, barW, fullH), 2, 2))
				}
			}
		}

		return path
	}, [mode, effectiveBarCount, effectiveScale, cx, cy, reduceMotion])

	if (canvasWidth <= 0 || canvasHeight <= 0) {
		return null
	}

	const isStrokeMode = mode === 'radial' || mode === 'circle'

	return (
		<View
			style={[
				styles.container,
				{ width: canvasWidth, height: canvasHeight },
				style,
			]}
			pointerEvents="none"
		>
			<Canvas style={StyleSheet.absoluteFill}>
				{isStrokeMode ? (
					<>
						{/* Ambient Glow Stroke */}
						<Path
							path={batchedPath}
							color={effectiveGlowColor}
							style="stroke"
							strokeWidth={strokeW * 2.2}
							strokeCap="round"
							opacity={0.35}
						/>
						{/* Core High-Definition Stroke */}
						<Path
							path={batchedPath}
							color={effectiveColor}
							style="stroke"
							strokeWidth={strokeW}
							strokeCap="round"
						/>
					</>
				) : (
					<>
						{/* Linear Mode Filled Rounded Bars */}
						<Path path={batchedPath} color={effectiveColor} style="fill" />
					</>
				)}
			</Canvas>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		overflow: 'visible',
	},
})
