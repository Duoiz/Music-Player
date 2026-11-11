import React, { useCallback, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useIsFocused } from 'expo-router'
import { useTheme } from './ThemeProvider'
import { AlbumBeatVisualizer } from './AlbumBeatVisualizer'
import { useAlbumGeometry } from '../hooks/useAlbumGeometry'
import { useEQStore } from '../stores/eqStore'
import { usePlayerStore } from '../stores/playerStore'
import { useHapticFeedback } from '../hooks/useHapticFeedback'
import type {
	BeatPulseType,
	BeatPulseColor,
	BeatPulseIntensity,
	BeatPulseTrigger,
} from '../types'

const PULSE_STYLES: { id: BeatPulseType; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
	{ id: 'radial', label: 'Radial Burst', desc: '360° bars around the album', icon: 'radio-button-on' },
	{ id: 'circle', label: 'Circle Core', desc: 'Concentric circle spectrum', icon: 'disc' },
	{ id: 'linear-upper', label: 'Linear Upper', desc: 'Upward-rising spectrum', icon: 'stats-chart' },
	{ id: 'linear-full', label: 'Linear Mirrored', desc: 'Symmetrical dual-sided bars', icon: 'swap-vertical' },
	{ id: 'acoustic-shockwave', label: 'Shockwave', desc: 'Ripples scaling with the album', icon: 'radio' },
	{ id: 'neon-blades', label: 'Neon Blades', desc: 'Perimeter beams & corner flares', icon: 'flame' },
]

const COLOR_OPTIONS: { id: BeatPulseColor; label: string; preview: string }[] = [
	{ id: 'cyber-violet', label: 'Cyber Violet', preview: '#9B5DE5' },
	{ id: 'electric-cyan', label: 'Electric Cyan', preview: '#00E5FF' },
	{ id: 'crimson-drive', label: 'Crimson Drive', preview: '#FF1E27' },
	{ id: 'acid-lime', label: 'Acid Lime', preview: '#10F489' },
	{ id: 'solar-amber', label: 'Solar Amber', preview: '#FF6B35' },
	{ id: 'theme-accent', label: 'Theme Accent', preview: '#38BDF8' },
	{ id: 'album-art', label: 'Album Art', preview: '#A855F7' },
	{ id: 'solar-gold', label: 'Solar Gold', preview: '#F59E0B' },
]

const INTENSITY_OPTIONS = [
	{ id: 'chill', label: 'Chill' },
	{ id: 'dynamic', label: 'Dynamic' },
	{ id: 'beast', label: 'Beast' },
	{ id: 'overdrive', label: 'Overdrive' },
] as const

const TRIGGER_OPTIONS = [
	{ id: 'sub-bass', label: 'Sub-Bass' },
	{ id: 'mid-punch', label: 'Mid-Punch' },
	{ id: 'full-range', label: 'Full Spectrum' },
] as const

const SIZE_OPTIONS = [0.6, 0.8, 1.0, 1.2, 1.4]
const BAR_OPTIONS = [16, 24, 36, 48, 64]

type Category = 'style' | 'color' | 'intensity' | 'trigger' | 'size' | 'bars'

const CATEGORIES: { id: Category; label: string; hint: string }[] = [
	{ id: 'style', label: 'Style', hint: 'Shape of the reactive spectrum around your album art.' },
	{ id: 'color', label: 'Color', hint: 'Neon color of the bars and shockwaves.' },
	{ id: 'intensity', label: 'Power', hint: 'How hard the visuals react to the beat.' },
	{ id: 'trigger', label: 'Trigger', hint: 'Which part of the sound drives the pulse.' },
	{ id: 'size', label: 'Size', hint: 'Scale of the visualizer relative to the album.' },
	{ id: 'bars', label: 'Bars', hint: 'Number of spectrum bars. Boosting 60Hz in the EQ makes bass bursts bigger.' },
]

const isCircleType = (t: BeatPulseType) =>
	t === 'radial' || t === 'circle' || t === 'radial-burst' || t === 'ncs-circle'

interface ChipsProps<T extends string | number> {
	options: readonly { id: T; label: string }[]
	selected: (id: T) => boolean
	onSelect: (id: T) => void
	chipStyle: (selected: boolean) => { backgroundColor: string; borderColor: string }
	textStyle: (selected: boolean) => { color: string; fontWeight: '700' | '500' }
}

/** Equal-width segmented row — replaces four copy-pasted button blocks. */
function SegmentedChips<T extends string | number>({
	options,
	selected,
	onSelect,
	chipStyle,
	textStyle,
}: ChipsProps<T>) {
	return (
		<View style={styles.segmentedRow}>
			{options.map((o) => {
				const sel = selected(o.id)
				return (
					<TouchableOpacity
						key={String(o.id)}
						onPress={() => onSelect(o.id)}
						style={[styles.segmentBtn, chipStyle(sel)]}
					>
						<Text style={[styles.segmentBtnText, textStyle(sel)]} numberOfLines={1}>
							{o.label}
						</Text>
					</TouchableOpacity>
				)
			})}
		</View>
	)
}

/**
 * Album-edge visualizer settings.
 *
 * Fits on one screen: the live preview and category tabs are pinned, and only
 * the active category's options are shown beneath them (instead of six stacked
 * sections you had to scroll through).
 */
export function VisualizerStudio() {
	const theme = useTheme()
	const haptic = useHapticFeedback()
	const isFocused = useIsFocused()
	const isDark = theme.id === 'frutiger-aero'
	const accent = theme.colors.accentPrimary

	const currentTrack = usePlayerStore((s) => s.currentTrack)
	const beatPulse = useEQStore((s) => s.beatPulse)
	const setBeatPulseConfig = useEQStore((s) => s.setBeatPulseConfig)

	const [category, setCategory] = useState<Category>('style')
	const [previewBox, setPreviewBox] = useState({ width: 0, height: 0, borderRadius: 0 })
	const previewGeometry = useAlbumGeometry()
	const circle = isCircleType(beatPulse.type)

	const handleToggle = useCallback(() => {
		haptic.medium()
		setBeatPulseConfig({ enabled: !beatPulse.enabled })
	}, [beatPulse.enabled, setBeatPulseConfig, haptic])

	const handleSelectStyle = useCallback(
		(type: BeatPulseType) => {
			haptic.selection()
			setBeatPulseConfig({ type })
		},
		[setBeatPulseConfig, haptic]
	)
	const handleSelectColor = useCallback(
		(colorMode: BeatPulseColor) => {
			haptic.selection()
			setBeatPulseConfig({ colorMode })
		},
		[setBeatPulseConfig, haptic]
	)
	const handleSelectIntensity = useCallback(
		(intensity: BeatPulseIntensity) => {
			haptic.selection()
			setBeatPulseConfig({ intensity })
		},
		[setBeatPulseConfig, haptic]
	)
	const handleSelectTrigger = useCallback(
		(trigger: BeatPulseTrigger) => {
			haptic.selection()
			setBeatPulseConfig({ trigger })
		},
		[setBeatPulseConfig, haptic]
	)
	const handleSelectSize = useCallback(
		(sizeScale: number) => {
			haptic.selection()
			setBeatPulseConfig({ sizeScale })
		},
		[setBeatPulseConfig, haptic]
	)
	const handleSelectBars = useCallback(
		(barCount: number) => {
			haptic.selection()
			setBeatPulseConfig({ barCount })
		},
		[setBeatPulseConfig, haptic]
	)

	const labelColor = isDark ? '#7AE3FF' : theme.colors.textPrimary
	const mutedColor = isDark ? 'rgba(180, 225, 255, 0.75)' : theme.colors.textMuted

	const chipStyle = (sel: boolean) => ({
		backgroundColor: sel
			? isDark
				? '#00c8ff'
				: accent
			: isDark
			? 'rgba(12, 48, 78, 0.75)'
			: theme.colors.controlBackground,
		borderColor: sel
			? isDark
				? '#40ffd0'
				: accent
			: isDark
			? 'rgba(120, 200, 255, 0.28)'
			: theme.colors.divider,
	})
	const textStyle = (sel: boolean) => ({
		color: sel
			? isDark
				? '#002B48'
				: '#FFFFFF'
			: isDark
			? 'rgba(215, 240, 255, 0.9)'
			: theme.colors.textSecondary,
		fontWeight: (sel ? '700' : '500') as '700' | '500',
	})
	const cardStyle = (sel: boolean) => ({
		backgroundColor: sel
			? isDark
				? 'rgba(0, 200, 255, 0.22)'
				: accent + '24'
			: isDark
			? 'rgba(12, 48, 78, 0.75)'
			: theme.colors.controlBackground,
		borderColor: sel
			? isDark
				? '#00E5FF'
				: accent
			: isDark
			? 'rgba(120, 200, 255, 0.28)'
			: theme.colors.divider,
	})

	const isStyleSelected = (id: BeatPulseType) =>
		beatPulse.type === id ||
		(id === 'radial' && (beatPulse.type === 'radial-burst' || beatPulse.type === 'perimeter-spectrum')) ||
		(id === 'circle' && beatPulse.type === 'ncs-circle') ||
		(id === 'acoustic-shockwave' &&
			(beatPulse.type === 'monstercat-shockwave' || beatPulse.type === 'ncs-shockwave')) ||
		(id === 'neon-blades' &&
			(beatPulse.type === 'monstercat-blades' || beatPulse.type === 'hellcat-blades'))

	const isColorSelected = (id: BeatPulseColor) =>
		beatPulse.colorMode === id ||
		(id === 'cyber-violet' && beatPulse.colorMode === 'monstercat-purple') ||
		(id === 'electric-cyan' && beatPulse.colorMode === 'monstercat-cyan') ||
		(id === 'crimson-drive' &&
			(beatPulse.colorMode === 'monstercat-red' || beatPulse.colorMode === 'hellcat-red')) ||
		(id === 'acid-lime' && beatPulse.colorMode === 'monstercat-green') ||
		(id === 'solar-amber' && beatPulse.colorMode === 'monstercat-orange')

	const renderOptions = () => {
		switch (category) {
			case 'style':
				return (
					<View style={styles.styleGrid}>
						{PULSE_STYLES.map((st) => {
							const sel = isStyleSelected(st.id)
							return (
								<TouchableOpacity
									key={st.id}
									onPress={() => handleSelectStyle(st.id)}
									style={[styles.styleCard, cardStyle(sel)]}
								>
									<View
										style={[
											styles.styleIconWrap,
											{
												backgroundColor: sel
													? accent
													: isDark
													? 'rgba(20, 60, 95, 0.9)'
													: theme.colors.controlBackground,
											},
										]}
									>
										<Ionicons
											name={st.icon}
											size={16}
											color={sel ? '#FFFFFF' : isDark ? '#7AE3FF' : theme.colors.controlIcon}
										/>
									</View>
									<View style={styles.styleTextCol}>
										<Text
											style={[
												styles.styleCardTitle,
												{
													color: sel
														? isDark
															? '#00E5FF'
															: accent
														: isDark
														? '#FFFFFF'
														: theme.colors.textPrimary,
												},
											]}
											numberOfLines={1}
										>
											{st.label}
										</Text>
										<Text
											style={[
												styles.styleCardDesc,
												{ color: isDark ? 'rgba(185, 225, 248, 0.85)' : theme.colors.textMuted },
											]}
											numberOfLines={2}
										>
											{st.desc}
										</Text>
									</View>
								</TouchableOpacity>
							)
						})}
					</View>
				)
			case 'color':
				return (
					<View style={styles.colorGrid}>
						{COLOR_OPTIONS.map((c) => {
							const sel = isColorSelected(c.id)
							return (
								<TouchableOpacity
									key={c.id}
									onPress={() => handleSelectColor(c.id)}
									style={[styles.colorChip, cardStyle(sel), { borderWidth: 1.5 }]}
								>
									<View
										style={[
											styles.colorCircle,
											{ backgroundColor: c.id === 'theme-accent' ? accent : c.preview },
										]}
									/>
									<Text
										style={[
											styles.colorChipLabel,
											{
												color: sel
													? isDark
														? '#00E5FF'
														: accent
													: isDark
													? 'rgba(215, 240, 255, 0.9)'
													: theme.colors.textSecondary,
											},
										]}
										numberOfLines={1}
									>
										{c.label}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>
				)
			case 'intensity':
				return (
					<SegmentedChips
						options={INTENSITY_OPTIONS}
						selected={(id) =>
							beatPulse.intensity === id || (id === 'overdrive' && beatPulse.intensity === 'hellcat')
						}
						onSelect={handleSelectIntensity}
						chipStyle={chipStyle}
						textStyle={textStyle}
					/>
				)
			case 'trigger':
				return (
					<SegmentedChips
						options={TRIGGER_OPTIONS}
						selected={(id) => beatPulse.trigger === id}
						onSelect={handleSelectTrigger}
						chipStyle={chipStyle}
						textStyle={textStyle}
					/>
				)
			case 'size':
				return (
					<SegmentedChips
						options={SIZE_OPTIONS.map((n) => ({ id: n, label: `${n}x` }))}
						selected={(id) => Math.abs((beatPulse.sizeScale || 1.0) - id) < 0.05}
						onSelect={handleSelectSize}
						chipStyle={chipStyle}
						textStyle={textStyle}
					/>
				)
			case 'bars':
				return (
					<SegmentedChips
						options={BAR_OPTIONS.map((n) => ({ id: n, label: String(n) }))}
						selected={(id) => (beatPulse.barCount || 36) === id}
						onSelect={handleSelectBars}
						chipStyle={chipStyle}
						textStyle={textStyle}
					/>
				)
		}
	}

	const activeHint = CATEGORIES.find((c) => c.id === category)?.hint

	return (
		<View style={styles.root}>
			{/* Master toggle */}
			<View style={styles.headerRow}>
				<View style={styles.titleRow}>
					<Ionicons name="disc" size={20} color={accent} />
					<Text
						style={[
							styles.title,
							{
								color: isDark ? '#FFFFFF' : theme.colors.textPrimary,
								textShadowColor: isDark ? 'rgba(0, 200, 255, 0.4)' : undefined,
								textShadowOffset: isDark ? { width: 0, height: 1 } : undefined,
								textShadowRadius: isDark ? 2 : undefined,
							},
						]}
					>
						Album Visualizer
					</Text>
				</View>
				<TouchableOpacity
					onPress={handleToggle}
					style={[
						styles.togglePill,
						beatPulse.enabled
							? {
									backgroundColor: isDark ? '#00c8ff' : accent,
									borderColor: isDark ? '#40ffd0' : accent,
								}
							: {
									backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.controlBackground,
									borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : theme.colors.divider,
								},
					]}
				>
					<Text
						style={[
							styles.togglePillText,
							{
								color: beatPulse.enabled
									? isDark
										? '#002B48'
										: '#FFFFFF'
									: isDark
									? 'rgba(200, 230, 255, 0.85)'
									: theme.colors.textSecondary,
							},
						]}
					>
						{beatPulse.enabled ? 'ACTIVE' : 'OFF'}
					</Text>
				</TouchableOpacity>
			</View>

			{!beatPulse.enabled ? (
				<Text style={[styles.offHint, { color: mutedColor }]}>
					Turn the visualizer on to see audio-reactive effects around your album art and customize them here.
				</Text>
			) : (
				<>
					{/* Pinned live preview */}
					<View style={styles.previewStage}>
						<View style={styles.previewAlbumCenter}>
							{/* Visualizer sits BEHIND the album art. Only runs while this screen is on top. */}
							{isFocused && previewBox.width > 0 && (
								<AlbumBeatVisualizer
									albumGeometry={previewGeometry}
									albumWidth={previewBox.width}
									albumHeight={previewBox.height}
									albumBorderRadius={previewBox.borderRadius}
									isCircle={circle}
								/>
							)}

							<View
								onLayout={(e) => {
									const { width, height } = e.nativeEvent.layout
									if (width > 0 && height > 0) {
										const radius = circle ? width / 2 : 16
										previewGeometry.onAlbumLayout(e, radius)
										const w = Math.round(width)
										const h = Math.round(height)
										const r = Math.round(radius)
										setPreviewBox((prev) =>
											prev.width === w && prev.height === h && prev.borderRadius === r
												? prev
												: { width: w, height: h, borderRadius: r }
										)
									}
								}}
								style={[styles.previewAlbumCover, circle && { borderRadius: 44 }]}
							>
								{currentTrack?.artwork ? (
									<Image
										source={{ uri: currentTrack.artwork }}
										style={StyleSheet.absoluteFill}
										contentFit="cover"
									/>
								) : (
									<LinearGradient
										colors={theme.colors.accentGradient as [string, string, ...string[]]}
										style={[StyleSheet.absoluteFill, styles.previewPlaceholder]}
									>
										<Ionicons name="musical-notes" size={32} color="#FFFFFF" />
									</LinearGradient>
								)}
							</View>
						</View>
					</View>

					{/* Category tabs — one group of options at a time */}
					<View style={styles.categoryRow}>
						{CATEGORIES.map((c) => {
							const sel = category === c.id
							return (
								<TouchableOpacity
									key={c.id}
									onPress={() => {
										haptic.selection()
										setCategory(c.id)
									}}
									style={[styles.categoryBtn, chipStyle(sel)]}
								>
									<Text style={[styles.categoryText, textStyle(sel)]} numberOfLines={1}>
										{c.label}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>

					<ScrollView
						style={styles.optionsScroll}
						contentContainerStyle={styles.optionsContent}
						showsVerticalScrollIndicator={false}
					>
						<Text style={[styles.hint, { color: labelColor }]}>{activeHint}</Text>
						{renderOptions()}
					</ScrollView>
				</>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	root: { flex: 1, gap: 10 },
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
	},
	titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
	title: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
	togglePill: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 14,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	togglePillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
	offHint: { fontSize: 13, lineHeight: 19, paddingVertical: 8 },

	previewStage: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 26,
		backgroundColor: 'rgba(0,0,0,0.15)',
		borderRadius: 16,
		overflow: 'visible',
	},
	previewAlbumCenter: {
		width: 88,
		height: 88,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	previewAlbumCover: {
		width: 88,
		height: 88,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		zIndex: 2,
	},
	previewPlaceholder: { alignItems: 'center', justifyContent: 'center' },

	categoryRow: { flexDirection: 'row', gap: 6 },
	categoryBtn: {
		flex: 1,
		paddingVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
	},
	categoryText: { fontSize: 11 },

	optionsScroll: { flex: 1 },
	optionsContent: { gap: 10, paddingBottom: 8 },
	hint: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },

	styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	styleCard: {
		width: '48.5%',
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		borderRadius: 12,
		borderWidth: 1,
		gap: 8,
	},
	styleIconWrap: {
		width: 30,
		height: 30,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	styleTextCol: { flex: 1 },
	styleCardTitle: { fontSize: 12, fontWeight: '700' },
	styleCardDesc: { fontSize: 10, marginTop: 1 },

	colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	colorChip: {
		width: '48.5%',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 10,
		borderRadius: 12,
		gap: 8,
	},
	colorCircle: { width: 14, height: 14, borderRadius: 7 },
	colorChipLabel: { fontSize: 12, fontWeight: '600', flexShrink: 1 },

	segmentedRow: { flexDirection: 'row', gap: 8 },
	segmentBtn: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	segmentBtnText: { fontSize: 12, textAlign: 'center' },
})
