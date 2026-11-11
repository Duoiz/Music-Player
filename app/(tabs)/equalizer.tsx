import React, { useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/components/ThemeProvider'
import { GlassCard } from '../../src/components/GlassCard'
import { EQVisualizer } from '../../src/components/EQVisualizer'
import { VisualizerStudio } from '../../src/components/VisualizerStudio'
import { BackgroundParticles } from '../../src/components/BackgroundParticles'
import { usePlayerStore } from '../../src/stores/playerStore'
import { useHapticFeedback } from '../../src/hooks/useHapticFeedback'

type Section = 'eq' | 'visualizer'

const SECTIONS: { id: Section; label: string }[] = [
	{ id: 'eq', label: 'EQ' },
	{ id: 'visualizer', label: 'Visualizer' },
]

/**
 * Equalizer screen — split into two tabs so each fits on one screen:
 *  - EQ: 5-band equalizer + presets
 *  - Visualizer: album-edge visualizer studio (pinned preview, one option group at a time)
 */
export default function EqualizerScreen() {
	const theme = useTheme()
	const isFrutiger = theme.id === 'frutiger-aero'
	const haptic = useHapticFeedback()
	const hasTrack = usePlayerStore((s) => s.currentTrack !== null)
	const [section, setSection] = useState<Section>('eq')

	// Keep content clear of the floating tab bar (+ mini-player when something is playing)
	const bottomInset = hasTrack ? 140 : 84

	return (
		<LinearGradient
			colors={theme.colors.backgroundGradient as [string, string, ...string[]]}
			start={theme.colors.backgroundGradientStart}
			end={theme.colors.backgroundGradientEnd}
			style={styles.container}
		>
			<BackgroundParticles />
			<SafeAreaView style={styles.safeArea} edges={['top']}>
				<View style={styles.header}>
					<Text
						style={[
							styles.title,
							{
								color: isFrutiger ? '#FFFFFF' : theme.colors.textPrimary,
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

					<View style={styles.segment}>
						{SECTIONS.map((s) => {
							const active = section === s.id
							return (
								<TouchableOpacity
									key={s.id}
									onPress={() => {
										haptic.selection()
										setSection(s.id)
									}}
									style={[styles.segmentBtn, active && { backgroundColor: theme.colors.accentPrimary }]}
								>
									<Text
										style={[
											styles.segmentText,
											active
												? { color: theme.colors.textOnAccent, fontWeight: '700' }
												: { color: isFrutiger ? 'rgba(225, 245, 255, 0.95)' : theme.colors.textSecondary },
										]}
									>
										{s.label}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>
				</View>

				{section === 'eq' ? (
					<ScrollView
						contentContainerStyle={[styles.eqContent, { paddingBottom: bottomInset }]}
						showsVerticalScrollIndicator={false}
					>
						<GlassCard intensity="medium" variant={isFrutiger ? 'dark' : 'default'}>
							<EQVisualizer />
						</GlassCard>
					</ScrollView>
				) : (
					<View style={[styles.studioWrap, { marginBottom: bottomInset }]}>
						<GlassCard
							fill
							style={styles.studioCard}
							intensity="medium"
							variant={isFrutiger ? 'dark' : 'default'}
						>
							<VisualizerStudio />
						</GlassCard>
					</View>
				)}
			</SafeAreaView>
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	safeArea: { flex: 1 },
	header: {
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	title: { fontSize: 26, letterSpacing: -0.5 },
	segment: {
		flexDirection: 'row',
		backgroundColor: 'rgba(255,255,255,0.12)',
		borderRadius: 18,
		padding: 3,
	},
	segmentBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 15 },
	segmentText: { fontSize: 13 },
	eqContent: { paddingHorizontal: 16 },
	studioWrap: { flex: 1, paddingHorizontal: 16 },
	studioCard: { flex: 1, padding: 14, borderRadius: 18 },
})
