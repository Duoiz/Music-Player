import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/components/ThemeProvider'
import { GlassCard } from '../../src/components/GlassCard'
import { EQVisualizer } from '../../src/components/EQVisualizer'
import { BackgroundParticles } from '../../src/components/BackgroundParticles'

/**
 * Equalizer screen — 5-band EQ with presets.
 * Full audio controls for the music experience.
 */
export default function EqualizerScreen() {
	const theme = useTheme()

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
								color: theme.colors.textPrimary,
								fontSize: 28,
								fontWeight: theme.typography.titleWeight,
								fontFamily: theme.typography.fontFamily,
								textShadowColor: theme.typography.textShadowColor,
								textShadowOffset: theme.typography.textShadowOffset,
								textShadowRadius: theme.typography.textShadowRadius,
							},
						]}
					>
						Equalizer
					</Text>
					<Text
						style={[
							styles.subtitle,
							{
								color: theme.colors.textSecondary,
								fontSize: theme.typography.bodySize,
								fontWeight: theme.typography.bodyWeight,
								fontFamily: theme.typography.fontFamily,
								textShadowColor: theme.typography.textShadowColor,
								textShadowOffset: theme.typography.textShadowOffset,
								textShadowRadius: theme.typography.textShadowRadius,
							},
						]}
					>
						Fine-tune your audio experience
					</Text>

					<GlassCard style={styles.eqCard} intensity="medium" variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}>
						<EQVisualizer />
					</GlassCard>

					{/* Audio Tips */}
					<GlassCard style={styles.tipsCard} intensity="light" variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}>
						<Text
							style={[
								styles.tipsTitle,
								{
									color: theme.colors.textPrimary,
									fontWeight: theme.typography.titleWeight,
									fontFamily: theme.typography.fontFamily,
									textShadowColor: theme.typography.textShadowColor,
									textShadowOffset: theme.typography.textShadowOffset,
									textShadowRadius: theme.typography.textShadowRadius,
								},
							]}
						>
							Audio Tips
						</Text>
						<View style={styles.tipsList}>
							<Text style={[styles.tip, { color: theme.colors.textSecondary }]}>
								• <Text style={{ fontWeight: '600' }}>Bass Boost</Text> — Great
								for hip-hop, EDM, and bass-heavy genres
							</Text>
							<Text style={[styles.tip, { color: theme.colors.textSecondary }]}>
								• <Text style={{ fontWeight: '600' }}>Vocal</Text> — Perfect for
								podcasts, audiobooks, and vocal tracks
							</Text>
							<Text style={[styles.tip, { color: theme.colors.textSecondary }]}>
								• <Text style={{ fontWeight: '600' }}>Rock</Text> — Enhanced mids
								and highs for guitar-driven music
							</Text>
							<Text style={[styles.tip, { color: theme.colors.textSecondary }]}>
								• <Text style={{ fontWeight: '600' }}>Electronic</Text> — Boosted
								lows and highs for synth-heavy tracks
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
		marginBottom: 20,
	},
	eqCard: {
		marginBottom: 20,
	},
	tipsCard: {
		gap: 12,
	},
	tipsTitle: {
		fontSize: 16,
	},
	tipsList: {
		gap: 8,
	},
	tip: {
		fontSize: 13,
		lineHeight: 18,
	},
})
