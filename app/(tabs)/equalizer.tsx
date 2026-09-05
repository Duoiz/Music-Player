import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/components/ThemeProvider'
import { GlassCard } from '../../src/components/GlassCard'
import { EQVisualizer } from '../../src/components/EQVisualizer'
import { BackgroundParticles } from '../../src/components/BackgroundParticles'
import { AlbumBeatVisualizer } from '../../src/components/AlbumBeatVisualizer'
import { useEQStore } from '../../src/stores/eqStore'
import { usePlayerStore } from '../../src/stores/playerStore'
import { useHapticFeedback } from '../../src/hooks/useHapticFeedback'
import type {
	BeatPulseType,
	BeatPulseColor,
	BeatPulseIntensity,
	BeatPulseTrigger,
} from '../../src/types'

const PULSE_STYLES: { id: BeatPulseType; label: string; desc: string; icon: any }[] = [
	{
		id: 'acoustic-shockwave',
		label: 'Acoustic Shockwave',
		desc: 'Proportional concentric ripples scaling with album size',
		icon: 'radio',
	},
	{
		id: 'perimeter-spectrum',
		label: 'Perimeter Spectrum',
		desc: 'Dense perimeter equalizer bars bursting outward',
		icon: 'barcode-outline',
	},
	{
		id: 'radial-burst',
		label: 'Radial Burst',
		desc: 'Dynamic 360° radiating circle spectrum bars',
		icon: 'radio-button-on',
	},
	{
		id: 'neon-blades',
		label: 'Neon Blades',
		desc: 'Heavy neon perimeter beams & corner flares',
		icon: 'flame',
	},
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

/**
 * Equalizer screen — 5-band EQ with presets + Dynamic Album Edge Visualizer Studio.
 * Full audio controls and reactive visual freedom.
 */
export default function EqualizerScreen() {
	const theme = useTheme()
	const isFrutiger = theme.id === 'frutiger-aero'
	const isDarkPanel = isFrutiger
	const haptic = useHapticFeedback()

	const currentTrack = usePlayerStore((s) => s.currentTrack)
	const beatPulse = useEQStore((s) => s.beatPulse)
	const setBeatPulseConfig = useEQStore((s) => s.setBeatPulseConfig)
	const [previewAlbumBox, setPreviewAlbumBox] = useState({ width: 0, height: 0, borderRadius: 0 })

	const handleTogglePulse = useCallback(() => {
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

	return (
		<LinearGradient
			colors={theme.colors.backgroundGradient as [string, string, ...string[]]}
			start={theme.colors.backgroundGradientStart}
			end={theme.colors.backgroundGradientEnd}
			style={styles.container}
		>
			<BackgroundParticles />
			<SafeAreaView style={styles.safeArea} edges={['top']}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<Text
						style={[
							styles.title,
							{
								color: isFrutiger ? '#FFFFFF' : theme.colors.textPrimary,
								fontSize: 28,
								fontWeight: theme.typography.titleWeight,
								fontFamily: theme.typography.fontFamily,
								textShadowColor: isFrutiger ? 'rgba(0, 40, 90, 0.6)' : theme.typography.textShadowColor,
								textShadowOffset: isFrutiger ? { width: 0, height: 1 } : theme.typography.textShadowOffset,
								textShadowRadius: isFrutiger ? 3 : theme.typography.textShadowRadius,
							},
						]}
					>
						Equalizer
					</Text>
					<Text
						style={[
							styles.subtitle,
							{
								color: isFrutiger ? 'rgba(225, 245, 255, 0.95)' : theme.colors.textSecondary,
								fontSize: theme.typography.bodySize,
								fontWeight: theme.typography.bodyWeight,
								fontFamily: theme.typography.fontFamily,
								textShadowColor: isFrutiger ? 'rgba(0, 40, 90, 0.5)' : theme.typography.textShadowColor,
								textShadowOffset: isFrutiger ? { width: 0, height: 1 } : theme.typography.textShadowOffset,
								textShadowRadius: isFrutiger ? 2 : theme.typography.textShadowRadius,
							},
						]}
					>
						Fine-tune your audio & reactive album-edge visualizer
					</Text>

					{/* 5-Band Frequency Display & Presets */}
					<GlassCard
						style={styles.eqCard}
						intensity="medium"
						variant={isDarkPanel ? 'dark' : 'default'}
					>
						<EQVisualizer />
					</GlassCard>

					{/* Dynamic Album Edge Visualizer Studio */}
					<GlassCard
						style={styles.pulseStudioCard}
						intensity="medium"
						variant={isDarkPanel ? 'dark' : 'default'}
					>
						{/* Header with Master Toggle */}
						<View style={styles.pulseHeaderRow}>
							<View style={styles.pulseHeaderInfo}>
								<View style={styles.pulseTitleRow}>
									<Ionicons name="disc" size={20} color={theme.colors.accentPrimary} />
									<Text
										style={[
											styles.pulseSectionTitle,
											{
												color: isDarkPanel ? '#FFFFFF' : theme.colors.textPrimary,
												textShadowColor: isDarkPanel ? 'rgba(0, 200, 255, 0.4)' : undefined,
												textShadowOffset: isDarkPanel ? { width: 0, height: 1 } : undefined,
												textShadowRadius: isDarkPanel ? 2 : undefined,
											},
										]}
										numberOfLines={1}
									>
										Album Visualizer
									</Text>
									<View style={styles.reactiveBadge}>
										<Text style={styles.reactiveBadgeText}>AUDIO REACTIVE</Text>
									</View>
								</View>
								<Text
									style={[
										styles.pulseSectionHint,
										{
											color: isDarkPanel
												? 'rgba(215, 240, 255, 0.92)'
												: theme.colors.textSecondary,
										},
									]}
								>
									Acoustic shockwaves, perimeter bars & radiating 360° spectrum
								</Text>
							</View>

							<TouchableOpacity
								onPress={handleTogglePulse}
								style={[
									styles.togglePill,
									beatPulse.enabled
										? {
												backgroundColor: isDarkPanel ? '#00c8ff' : theme.colors.accentPrimary,
												borderColor: isDarkPanel ? '#40ffd0' : theme.colors.accentPrimary,
										  }
										: {
												backgroundColor: isDarkPanel
													? 'rgba(255, 255, 255, 0.12)'
													: theme.colors.controlBackground,
												borderColor: isDarkPanel
													? 'rgba(255, 255, 255, 0.3)'
													: theme.colors.divider,
										  },
								]}
							>
								<Text
									style={[
										styles.togglePillText,
										{
											color: beatPulse.enabled
												? isDarkPanel
													? '#002B48'
													: '#FFFFFF'
												: isDarkPanel
												? 'rgba(200, 230, 255, 0.85)'
												: theme.colors.textSecondary,
										},
									]}
								>
									{beatPulse.enabled ? 'ACTIVE' : 'OFF'}
								</Text>
							</TouchableOpacity>
						</View>

						{beatPulse.enabled && (
							<View style={styles.studioControlsContainer}>
								{/* Live Album Visualizer Preview Stage */}
								<View style={styles.previewStage}>
									<View style={styles.previewAlbumCenter}>
										{/* 1. Absolute Visualizer Layer — Sits BEHIND the Album Art */}
										{previewAlbumBox.width > 0 && (
											<AlbumBeatVisualizer
												albumWidth={previewAlbumBox.width}
												albumHeight={previewAlbumBox.height}
												albumBorderRadius={previewAlbumBox.borderRadius}
												isCircle={beatPulse.type === 'radial-burst' || beatPulse.type === 'ncs-circle'}
											/>
										)}

										{/* 2. Measured Album Art Element — Sits in FRONT of the Visualizer */}
										<View
											onLayout={(e) => {
												const { width, height } = e.nativeEvent.layout
												if (width > 0 && height > 0) {
													const isCircleMode = beatPulse.type === 'radial-burst' || beatPulse.type === 'ncs-circle'
													const radius = isCircleMode ? width / 2 : 16
													const roundedW = Math.round(width)
													const roundedH = Math.round(height)
													const roundedR = Math.round(radius)
													setPreviewAlbumBox((prev) => {
														if (
															prev.width === roundedW &&
															prev.height === roundedH &&
															prev.borderRadius === roundedR
														) {
															return prev
														}
														return { width: roundedW, height: roundedH, borderRadius: roundedR }
													})
												}
											}}
											style={[
												styles.previewAlbumCover,
												(beatPulse.type === 'radial-burst' || beatPulse.type === 'ncs-circle') && { borderRadius: 55 },
											]}
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
													<Ionicons name="musical-notes" size={36} color="#FFFFFF" />
												</LinearGradient>
											)}
										</View>
									</View>
									<Text
										style={[
											styles.previewHint,
											{ color: isDarkPanel ? 'rgba(180, 225, 255, 0.75)' : theme.colors.textMuted },
										]}
									>
										LIVE ALBUM EDGE PREVIEW
									</Text>
								</View>

								{/* 1. Pulse Style Selector */}
								<Text
									style={[
										styles.subSectionLabel,
										{ color: isDarkPanel ? '#7AE3FF' : theme.colors.textPrimary },
									]}
								>
									VISUALIZER STYLE
								</Text>
								<View style={styles.styleOptionsGrid}>
									{PULSE_STYLES.map((st) => {
										const isSelected =
											beatPulse.type === st.id ||
											(st.id === 'acoustic-shockwave' &&
												(beatPulse.type === 'monstercat-shockwave' ||
													beatPulse.type === 'ncs-shockwave')) ||
											(st.id === 'perimeter-spectrum' &&
												(beatPulse.type === 'monstercat-bars' ||
													beatPulse.type === 'ncs-edge-bars')) ||
											(st.id === 'radial-burst' && beatPulse.type === 'ncs-circle') ||
											(st.id === 'neon-blades' &&
												(beatPulse.type === 'monstercat-blades' ||
													beatPulse.type === 'hellcat-blades'))
										return (
											<TouchableOpacity
												key={st.id}
												onPress={() => handleSelectStyle(st.id)}
												style={[
													styles.styleCard,
													{
														backgroundColor: isSelected
															? isDarkPanel
																? 'rgba(0, 200, 255, 0.22)'
																: theme.colors.accentPrimary + '24'
															: isDarkPanel
															? 'rgba(12, 48, 78, 0.75)'
															: theme.colors.controlBackground,
														borderColor: isSelected
															? isDarkPanel
																? '#00E5FF'
																: theme.colors.accentPrimary
															: isDarkPanel
															? 'rgba(120, 200, 255, 0.28)'
															: theme.colors.divider,
													},
												]}
											>
												<View
													style={[
														styles.styleIconWrap,
														{
															backgroundColor: isSelected
																? theme.colors.accentPrimary
																: isDarkPanel
																? 'rgba(20, 60, 95, 0.9)'
																: theme.colors.controlBackground,
														},
													]}
												>
													<Ionicons
														name={st.icon}
														size={16}
														color={isSelected ? '#FFFFFF' : isDarkPanel ? '#7AE3FF' : theme.colors.controlIcon}
													/>
												</View>
												<View style={styles.styleTextCol}>
													<Text
														style={[
															styles.styleCardTitle,
															{
																color: isSelected
																	? isDarkPanel
																		? '#00E5FF'
																		: theme.colors.accentPrimary
																	: isDarkPanel
																	? '#FFFFFF'
																	: theme.colors.textPrimary,
															},
														]}
													>
														{st.label}
													</Text>
													<Text
														style={[
															styles.styleCardDesc,
															{
																color: isDarkPanel
																	? isSelected
																		? 'rgba(225, 245, 255, 0.95)'
																		: 'rgba(185, 225, 248, 0.85)'
																	: theme.colors.textMuted,
															},
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

								{/* 2. Color Freedom */}
								<Text
									style={[
										styles.subSectionLabel,
										{ color: isDarkPanel ? '#7AE3FF' : theme.colors.textPrimary },
									]}
								>
									NEON COLOR
								</Text>
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={styles.colorRow}
								>
									{COLOR_OPTIONS.map((c) => {
										const isSelected =
											beatPulse.colorMode === c.id ||
											(c.id === 'cyber-violet' && beatPulse.colorMode === 'monstercat-purple') ||
											(c.id === 'electric-cyan' && beatPulse.colorMode === 'monstercat-cyan') ||
											(c.id === 'crimson-drive' &&
												(beatPulse.colorMode === 'monstercat-red' ||
													beatPulse.colorMode === 'hellcat-red')) ||
											(c.id === 'acid-lime' && beatPulse.colorMode === 'monstercat-green') ||
											(c.id === 'solar-amber' && beatPulse.colorMode === 'monstercat-orange')
										const previewColor =
											c.id === 'theme-accent'
												? theme.colors.accentPrimary
												: c.preview

										return (
											<TouchableOpacity
												key={c.id}
												onPress={() => handleSelectColor(c.id)}
												style={[
													styles.colorChip,
													{
														borderColor: isSelected
															? isDarkPanel
																? '#00E5FF'
																: theme.colors.accentPrimary
															: isDarkPanel
															? 'rgba(120, 200, 255, 0.25)'
															: 'transparent',
														backgroundColor: isSelected
															? isDarkPanel
																? 'rgba(0, 200, 255, 0.25)'
																: theme.colors.accentPrimary + '1E'
															: isDarkPanel
															? 'rgba(12, 48, 78, 0.75)'
															: theme.colors.controlBackground,
													},
												]}
											>
												<View
													style={[
														styles.colorCircle,
														{ backgroundColor: previewColor },
													]}
												/>
												<Text
													style={[
														styles.colorChipLabel,
														{
															color: isSelected
																? isDarkPanel
																	? '#00E5FF'
																	: theme.colors.accentPrimary
																: isDarkPanel
																? 'rgba(215, 240, 255, 0.9)'
																: theme.colors.textSecondary,
														},
													]}
												>
													{c.label}
												</Text>
											</TouchableOpacity>
										)
									})}
								</ScrollView>

								{/* 3. Intensity */}
								<Text
									style={[
										styles.subSectionLabel,
										{ color: isDarkPanel ? '#7AE3FF' : theme.colors.textPrimary },
									]}
								>
									PULSE INTENSITY
								</Text>
								<View style={styles.segmentedRow}>
									{(
										[
											{ id: 'chill', label: 'Chill' },
											{ id: 'dynamic', label: 'Dynamic' },
											{ id: 'beast', label: 'Beast' },
											{ id: 'overdrive', label: 'Overdrive' },
										] as const
									).map((lvl) => {
										const isSelected =
											beatPulse.intensity === lvl.id ||
											(lvl.id === 'overdrive' && beatPulse.intensity === 'hellcat')
										return (
											<TouchableOpacity
												key={lvl.id}
												onPress={() => handleSelectIntensity(lvl.id)}
												style={[
													styles.segmentBtn,
													{
														backgroundColor: isSelected
															? isDarkPanel
																? '#00c8ff'
																: theme.colors.accentPrimary
															: isDarkPanel
															? 'rgba(12, 48, 78, 0.75)'
															: theme.colors.controlBackground,
														borderColor: isSelected
															? isDarkPanel
																? '#40ffd0'
																: theme.colors.accentPrimary
															: isDarkPanel
															? 'rgba(120, 200, 255, 0.28)'
															: theme.colors.divider,
													},
												]}
											>
												<Text
													style={[
														styles.segmentBtnText,
														{
															color: isSelected
																? isDarkPanel
																	? '#002B48'
																	: '#FFFFFF'
																: isDarkPanel
																? 'rgba(215, 240, 255, 0.9)'
																: theme.colors.textSecondary,
															fontWeight: isSelected ? '700' : '500',
														},
													]}
												>
													{lvl.label}
												</Text>
											</TouchableOpacity>
										)
									})}
								</View>

								{/* 4. Frequency Trigger */}
								<Text
									style={[
										styles.subSectionLabel,
										{ color: isDarkPanel ? '#7AE3FF' : theme.colors.textPrimary },
									]}
								>
									AUDIO FREQUENCY TRIGGER
								</Text>
								<View style={styles.segmentedRow}>
									{(
										[
											{ id: 'sub-bass', label: 'Sub-Bass (60Hz)' },
											{ id: 'mid-punch', label: 'Mid-Punch' },
											{ id: 'full-range', label: 'Full Spectrum' },
										] as const
									).map((trig) => {
										const isSelected = beatPulse.trigger === trig.id
										return (
											<TouchableOpacity
												key={trig.id}
												onPress={() => handleSelectTrigger(trig.id)}
												style={[
													styles.segmentBtn,
													{
														backgroundColor: isSelected
															? isDarkPanel
																? '#00c8ff'
																: theme.colors.accentPrimary
															: isDarkPanel
															? 'rgba(12, 48, 78, 0.75)'
															: theme.colors.controlBackground,
														borderColor: isSelected
															? isDarkPanel
																? '#40ffd0'
																: theme.colors.accentPrimary
															: isDarkPanel
															? 'rgba(120, 200, 255, 0.28)'
															: theme.colors.divider,
													},
												]}
											>
												<Text
													style={[
														styles.segmentBtnText,
														{
															color: isSelected
																? isDarkPanel
																	? '#002B48'
																	: '#FFFFFF'
																: isDarkPanel
																? 'rgba(215, 240, 255, 0.9)'
																: theme.colors.textSecondary,
															fontWeight: isSelected ? '700' : '500',
														},
													]}
												>
													{trig.label}
												</Text>
											</TouchableOpacity>
										)
									})}
								</View>
							</View>
						)}
					</GlassCard>

					{/* Audio Tips */}
					<GlassCard
						style={styles.tipsCard}
						intensity="light"
						variant={isDarkPanel ? 'dark' : 'default'}
					>
						<Text
							style={[
								styles.tipsTitle,
								{
									color: isDarkPanel ? '#FFFFFF' : theme.colors.textPrimary,
									fontWeight: theme.typography.titleWeight,
									fontFamily: theme.typography.fontFamily,
									textShadowColor: isDarkPanel ? 'rgba(0, 40, 90, 0.6)' : theme.typography.textShadowColor,
									textShadowOffset: isDarkPanel ? { width: 0, height: 1 } : theme.typography.textShadowOffset,
									textShadowRadius: isDarkPanel ? 3 : theme.typography.textShadowRadius,
								},
							]}
						>
							Audio & Visualizer Tips
						</Text>
						<View style={styles.tipsList}>
							<Text
								style={[
									styles.tip,
									{ color: isDarkPanel ? 'rgba(215, 240, 255, 0.9)' : theme.colors.textSecondary },
								]}
							>
								•{' '}
								<Text style={{ fontWeight: '600', color: isDarkPanel ? '#FFFFFF' : undefined }}>
									Acoustic Shockwaves
								</Text>{' '}
								— Expanding acoustic ripples scale 100% proportionally to your album dimensions across all skins
							</Text>
							<Text
								style={[
									styles.tip,
									{ color: isDarkPanel ? 'rgba(215, 240, 255, 0.9)' : theme.colors.textSecondary },
								]}
							>
								•{' '}
								<Text style={{ fontWeight: '600', color: isDarkPanel ? '#FFFFFF' : undefined }}>
									Spectral Palettes
								</Text>{' '}
								— Cyber Violet, Electric Cyan, Crimson Drive, Acid Lime, Solar Amber
							</Text>
							<Text
								style={[
									styles.tip,
									{ color: isDarkPanel ? 'rgba(215, 240, 255, 0.9)' : theme.colors.textSecondary },
								]}
							>
								•{' '}
								<Text style={{ fontWeight: '600', color: isDarkPanel ? '#FFFFFF' : undefined }}>
									Bass Boost
								</Text>{' '}
								— Boosting the 60Hz slider makes the shockwaves and spectrum bars burst further outward
							</Text>
						</View>
					</GlassCard>

					<View style={{ height: 140 }} />
				</ScrollView>
			</SafeAreaView>
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	title: {
		letterSpacing: -0.5,
	},
	subtitle: {
		marginBottom: 18,
	},
	eqCard: {
		marginBottom: 16,
	},
	pulseStudioCard: {
		marginBottom: 16,
		padding: 16,
		borderRadius: 18,
	},
	pulseHeaderRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 10,
	},
	pulseHeaderInfo: {
		flex: 1,
		minWidth: 0,
	},
	pulseTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 6,
		marginBottom: 4,
	},
	pulseSectionTitle: {
		fontSize: 16,
		fontWeight: '700',
		flexShrink: 1,
	},
	reactiveBadge: {
		backgroundColor: '#9B5DE5',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
		alignSelf: 'center',
	},
	reactiveBadgeText: {
		color: '#FFFFFF',
		fontSize: 9,
		fontWeight: '900',
		letterSpacing: 0.8,
	},
	pulseSectionHint: {
		fontSize: 12,
		lineHeight: 16,
	},
	togglePill: {
		flexShrink: 0,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 14,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 2,
	},
	togglePillText: {
		fontSize: 11,
		fontWeight: '800',
		letterSpacing: 0.8,
	},
	studioControlsContainer: {
		marginTop: 18,
		gap: 12,
	},
	previewStage: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 28,
		backgroundColor: 'rgba(0,0,0,0.15)',
		borderRadius: 16,
		marginVertical: 4,
		overflow: 'visible',
	},
	previewAlbumCenter: {
		width: 110,
		height: 110,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	previewAlbumCover: {
		width: 110,
		height: 110,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		zIndex: 2,
	},
	previewPlaceholder: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	previewHint: {
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 1.5,
		marginTop: 20,
	},
	subSectionLabel: {
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 1,
		marginTop: 6,
	},
	styleOptionsGrid: {
		gap: 8,
	},
	styleCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		borderRadius: 12,
		borderWidth: 1,
		gap: 12,
	},
	styleIconWrap: {
		width: 32,
		height: 32,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	styleTextCol: {
		flex: 1,
	},
	styleCardTitle: {
		fontSize: 13,
		fontWeight: '700',
	},
	styleCardDesc: {
		fontSize: 11,
		marginTop: 2,
	},
	colorRow: {
		flexDirection: 'row',
		gap: 8,
		paddingVertical: 4,
	},
	colorChip: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 12,
		borderWidth: 1.5,
		gap: 8,
	},
	colorCircle: {
		width: 14,
		height: 14,
		borderRadius: 7,
	},
	colorChipLabel: {
		fontSize: 12,
		fontWeight: '600',
	},
	segmentedRow: {
		flexDirection: 'row',
		gap: 8,
	},
	segmentBtn: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	segmentBtnText: {
		fontSize: 11,
		textAlign: 'center',
	},
	tipsCard: {
		gap: 12,
		padding: 16,
		borderRadius: 16,
	},
	tipsTitle: {
		fontSize: 15,
	},
	tipsList: {
		gap: 8,
	},
	tip: {
		fontSize: 13,
		lineHeight: 18,
	},
})
