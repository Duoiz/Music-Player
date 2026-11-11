import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated from 'react-native-reanimated'
import type { ThemeStyle } from '../../types'
import { useAudioReactivity } from '../../hooks/useAudioReactivity'
import { SideBeatPulse } from '../SideBeatPulse'

interface SkinPreviewCardProps {
	theme: ThemeStyle
}

/**
 * Live, interactive mini player mockup showing the custom skin in real-time.
 * Displays selected hardware widgets, audio-reactive pulses, and remix lineage.
 */
export function SkinPreviewCard({ theme }: SkinPreviewCardProps) {
	const [isPlaying, setIsPlaying] = useState(true)
	const [progress, setProgress] = useState(0.42)

	const { colors, metrics, typography, widgets, forkedFrom } = theme
	const isCogVolume = widgets?.volumeControl === 'steampunk-cog'
	const isKnobVolume = widgets?.volumeControl === 'rotary-knob'
	const isCylinder = widgets?.artworkDisplay === 'glass-cylinder'

	// UI thread beat pulse animation
	const { glowAnimatedStyle, scaleAnimatedStyle, wobbleAnimatedStyle } = useAudioReactivity(
		widgets?.audioReactivity
	)

	return (
		<View style={styles.outerContainer}>
			{/* Outer Background simulation with audio-reactive glow */}
			<Animated.View
				style={[
					styles.glowWrapper,
					widgets?.audioReactivity?.target === 'glow' ? glowAnimatedStyle : undefined,
				]}
			>
				<LinearGradient
					colors={colors.backgroundGradient as [string, string, ...string[]]}
					start={colors.backgroundGradientStart}
					end={colors.backgroundGradientEnd}
					style={[
						styles.previewBackground,
						{
							borderRadius: metrics.borderRadiusLarge + 4,
							borderColor: colors.cardBorderColor,
						},
					]}
				>
					{widgets?.audioReactivity?.target === 'side-pulse' && (
						<SideBeatPulse
							overrideConfig={{
								enabled: true,
								type: 'side-flanks',
								colorMode: 'theme-accent',
							}}
						/>
					)}

					{/* Glass Player Surface */}
					<LinearGradient
						colors={colors.cardGradient as [string, string, ...string[]]}
						style={[
							styles.glassCard,
							{
								borderRadius: metrics.borderRadiusLarge,
								borderColor: colors.cardBorderColor,
								borderWidth: colors.cardBorderWidth,
								shadowColor: colors.shadowColor,
							},
						]}
					>
						{/* Top Header & Lineage */}
						<View style={styles.topRow}>
							<View style={styles.leftBadge}>
								<Ionicons
									name={isCogVolume ? 'cog' : 'sparkles'}
									size={14}
									color={colors.accentPrimary}
								/>
								<Text
									style={[
										styles.previewBadge,
										{
											color: colors.textSecondary,
											fontFamily: typography.fontFamily,
										},
									]}
								>
									{forkedFrom ? `REMIX OF "${forkedFrom.name.toUpperCase()}"` : 'LIVE HARDWARE PREVIEW'}
								</Text>
							</View>
							<View style={styles.hardwarePill}>
								<Text style={[styles.hardwareText, { color: colors.accentPrimary }]}>
									{isCogVolume ? '⚙️ COG' : isKnobVolume ? '🎛️ KNOB' : '🎚️ SLIDER'}
								</Text>
							</View>
						</View>

						{/* Track Info Row with dynamic Artwork Presentation */}
						<View style={styles.trackRow}>
							{/* Artwork: Vinyl vs Cylinder vs Hologram Card */}
							<Animated.View
								style={[
									widgets?.audioReactivity?.target === 'scale' ? scaleAnimatedStyle : undefined,
								]}
							>
								{isCylinder ? (
									<LinearGradient
										colors={colors.accentGradient as [string, string, ...string[]]}
										style={[
											styles.cylinderArtwork,
											{ borderRadius: metrics.borderRadiusMedium },
										]}
									>
										<Ionicons name="cube-outline" size={20} color={colors.textOnAccent} />
									</LinearGradient>
								) : (
									<View style={[styles.vinylArtwork, { backgroundColor: colors.controlBackground }]}>
										<LinearGradient
											colors={colors.accentGradient as [string, string, ...string[]]}
											style={styles.vinylCenter}
										/>
										<Ionicons name="musical-notes" size={16} color={colors.textOnAccent} />
									</View>
								)}
							</Animated.View>

							{/* Track Details */}
							<View style={styles.trackInfo}>
								<Text
									numberOfLines={1}
									style={[
										styles.trackTitle,
										{
											color: colors.textPrimary,
											fontFamily: typography.fontFamily,
											textShadowColor: typography.textShadowColor,
											textShadowOffset: typography.textShadowOffset,
											textShadowRadius: typography.textShadowRadius,
										},
									]}
								>
									{theme.name || 'Untitled Skin'}
								</Text>
								<Text
									numberOfLines={1}
									style={[
										styles.trackArtist,
										{
											color: colors.textSecondary,
											fontFamily: typography.fontFamily,
										},
									]}
								>
									by {theme.author || 'Creator'}
									{forkedFrom ? ` (Forked @${forkedFrom.author})` : ''}
								</Text>
							</View>

							{/* Play/Pause Button */}
							<TouchableOpacity
								activeOpacity={0.8}
								onPress={() => setIsPlaying(!isPlaying)}
								style={[
									styles.playButtonWrapper,
									{
										shadowColor: colors.accentPrimary,
									},
								]}
							>
								<LinearGradient
									colors={colors.accentGradient as [string, string, ...string[]]}
									style={[
										styles.playButton,
										{
											borderRadius:
												widgets?.playButton === 'neumorphic-convex'
													? 12
													: metrics.borderRadiusMedium,
											borderWidth: widgets?.playButton === 'tactile-toggle' ? 1.5 : 0,
											borderColor: '#FFFFFF',
										},
									]}
								>
									<Ionicons
										name={isPlaying ? 'pause' : 'play'}
										size={16}
										color={colors.textOnAccent}
									/>
								</LinearGradient>
							</TouchableOpacity>
						</View>

						{/* Interactive Volume Control Simulation */}
						<View style={styles.volumeMiniRow}>
							<Ionicons name="volume-low" size={14} color={colors.textMuted} />
							{isCogVolume ? (
								<Animated.View
									style={[
										styles.miniCogCluster,
										widgets?.audioReactivity?.target === 'wobble' ? wobbleAnimatedStyle : undefined,
									]}
								>
									<LinearGradient
										colors={['#F5D061', '#996515', '#4A3510']}
										style={styles.miniCog}
									>
										<Ionicons name="settings" size={16} color="#FFE082" />
									</LinearGradient>
									<Text style={[styles.miniCogLabel, { color: colors.textPrimary }]}>
										Clockwork Cog Active
									</Text>
								</Animated.View>
							) : isKnobVolume ? (
								<View style={styles.miniKnobCluster}>
									<LinearGradient
										colors={['#E0E0E0', '#757575', '#212121']}
										style={styles.miniKnob}
									>
										<View style={[styles.miniKnobNotch, { backgroundColor: colors.accentPrimary }]} />
									</LinearGradient>
									<Text style={[styles.miniCogLabel, { color: colors.textPrimary }]}>
										Rotary Dial Active
									</Text>
								</View>
							) : (
								<View style={[styles.miniSliderTrack, { backgroundColor: colors.progressTrack }]}>
									<LinearGradient
										colors={colors.accentGradient as [string, string, ...string[]]}
										style={styles.miniSliderFill}
									/>
								</View>
							)}
							<Ionicons name="volume-high" size={14} color={colors.textMuted} />
						</View>

						{/* Scrub Bar */}
						<View style={styles.progressContainer}>
							<TouchableOpacity
								activeOpacity={1}
								onPress={(e) => {
									const width = 240
									const x = e.nativeEvent.locationX
									setProgress(Math.max(0.05, Math.min(0.95, x / width)))
								}}
								style={[styles.progressTrack, { backgroundColor: colors.progressTrack }]}
							>
								<LinearGradient
									colors={colors.progressFillGradient as [string, string, ...string[]]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={[styles.progressFill, { width: `${progress * 100}%` }]}
								/>
								<View
									style={[
										styles.progressThumb,
										{
											left: `${progress * 100}%`,
											backgroundColor: colors.accentPrimary,
											borderColor: colors.cardBorderColor,
										},
									]}
								/>
							</TouchableOpacity>
							<View style={styles.timeRow}>
								<Text style={[styles.timeText, { color: colors.textSecondary }]}>01:14</Text>
								<Text style={[styles.timeText, { color: colors.textSecondary }]}>03:45</Text>
							</View>
						</View>

						{/* Simulated Mini Tab Bar */}
						<View
							style={[
								styles.miniTabBar,
								{
									backgroundColor: colors.tabBarBackground,
									borderRadius: metrics.borderRadiusMedium,
									borderColor: colors.divider,
								},
							]}
						>
							<View
								style={[
									styles.activePill,
									{
										backgroundColor: `${colors.accentPrimary}25`,
										borderColor: colors.accentPrimary,
										borderRadius: metrics.borderRadiusSmall,
									},
								]}
							>
								<Ionicons name="search" size={14} color={colors.accentPrimary} />
								<Text style={[styles.tabLabel, { color: colors.accentPrimary }]}>Search</Text>
							</View>
							<Ionicons name="albums" size={14} color={colors.tabBarInactive} />
							<Ionicons name="options" size={14} color={colors.tabBarInactive} />
							<Ionicons name="color-palette" size={14} color={colors.tabBarInactive} />
						</View>
					</LinearGradient>
				</LinearGradient>
			</Animated.View>
		</View>
	)
}

const styles = StyleSheet.create({
	outerContainer: {
		width: '100%',
		marginBottom: 16,
	},
	glowWrapper: {
		width: '100%',
	},
	previewBackground: {
		padding: 12,
		borderWidth: 1,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.25,
		shadowRadius: 16,
		elevation: 6,
	},
	glassCard: {
		padding: 14,
		gap: 10,
	},
	topRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	leftBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	previewBadge: {
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 1,
	},
	hardwarePill: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 10,
		backgroundColor: 'rgba(0,0,0,0.25)',
	},
	hardwareText: {
		fontSize: 9,
		fontWeight: '800',
		letterSpacing: 0.5,
	},
	trackRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	vinylArtwork: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
	},
	cylinderArtwork: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.4)',
	},
	vinylCenter: {
		position: 'absolute',
		width: 16,
		height: 16,
		borderRadius: 8,
	},
	trackInfo: {
		flex: 1,
	},
	trackTitle: {
		fontSize: 14,
		fontWeight: '700',
	},
	trackArtist: {
		fontSize: 12,
		marginTop: 2,
	},
	playButtonWrapper: {
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 8,
		elevation: 4,
	},
	playButton: {
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
	},
	/* Volume Mini Row */
	volumeMiniRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 6,
		paddingVertical: 4,
		backgroundColor: 'rgba(0,0,0,0.15)',
		borderRadius: 8,
	},
	miniCogCluster: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	miniCog: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	miniKnobCluster: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	miniKnob: {
		width: 22,
		height: 22,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'flex-start',
		paddingTop: 2,
	},
	miniKnobNotch: {
		width: 3,
		height: 6,
		borderRadius: 1.5,
	},
	miniCogLabel: {
		fontSize: 11,
		fontWeight: '600',
	},
	miniSliderTrack: {
		flex: 1,
		height: 6,
		borderRadius: 3,
		marginHorizontal: 10,
		overflow: 'hidden',
	},
	miniSliderFill: {
		width: '65%',
		height: '100%',
	},
	/* Progress */
	progressContainer: {
		gap: 4,
	},
	progressTrack: {
		height: 6,
		borderRadius: 3,
		position: 'relative',
		justifyContent: 'center',
	},
	progressFill: {
		height: '100%',
		borderRadius: 3,
	},
	progressThumb: {
		position: 'absolute',
		width: 12,
		height: 12,
		borderRadius: 6,
		borderWidth: 1.5,
		marginLeft: -6,
	},
	timeRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	timeText: {
		fontSize: 10,
		fontWeight: '600',
	},
	miniTabBar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		paddingVertical: 6,
		paddingHorizontal: 8,
		borderWidth: 1,
	},
	activePill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderWidth: 1,
	},
	tabLabel: {
		fontSize: 10,
		fontWeight: '700',
	},
})
