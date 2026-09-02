import React, { useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	TouchableOpacity,
	Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/components/ThemeProvider'
import { GlassCard } from '../../src/components/GlassCard'
import { ThemeCard } from '../../src/components/ThemeCard'
import { BackgroundParticles } from '../../src/components/BackgroundParticles'
import { useThemeStore } from '../../src/stores/themeStore'
import { allThemes } from '../../src/themes'

/**
 * Theme Store screen — browse and apply visual skins.
 * Free themes + premium themes behind a paywall flag.
 * UGC community themes placeholder for future expansion.
 */
export default function ThemesScreen() {
	const theme = useTheme()
	const activeThemeId = useThemeStore((s) => s.activeThemeId)
	const setTheme = useThemeStore((s) => s.setTheme)
	const isThemeUnlocked = useThemeStore((s) => s.isThemeUnlocked)
	const isPremiumUser = useThemeStore((s) => s.isPremiumUser)
	const unlockPremium = useThemeStore((s) => s.unlockPremium)

	const freeThemes = allThemes.filter((t) => !t.isPremium)
	const premiumThemes = allThemes.filter((t) => t.isPremium)

	const handleThemePress = useCallback(
		(themeId: string) => {
			const isUnlocked = isThemeUnlocked(themeId)
			if (isUnlocked) {
				setTheme(themeId)
			} else {
				Alert.alert(
					'Premium Theme',
					'This theme requires a premium subscription. Unlock all premium themes?',
					[
						{ text: 'Not now', style: 'cancel' },
						{
							text: 'Unlock Premium',
							onPress: () => {
								// MVP: Just toggle the premium flag
								unlockPremium()
								setTheme(themeId)
							},
						},
					]
				)
			}
		},
		[isThemeUnlocked, setTheme, unlockPremium]
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
						Themes
					</Text>
					<Text
						style={[
							styles.subtitle,
							{
								color: theme.colors.textSecondary,
								fontSize: theme.typography.bodySize,
							},
						]}
					>
						Customize your player's look and feel
					</Text>

					{/* Free Themes */}
					<Text
						style={[
							styles.sectionTitle,
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
						Free Skins
					</Text>
					<View style={styles.themeGrid}>
						{freeThemes.map((t) => (
							<ThemeCard
								key={t.id}
								themeStyle={t}
								isActive={activeThemeId === t.id}
								isLocked={false}
								onPress={() => handleThemePress(t.id)}
							/>
						))}
					</View>

					{/* Premium Themes */}
					<View style={styles.premiumHeader}>
						<Text
							style={[
								styles.sectionTitle,
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
							Premium Skins
						</Text>
						{!isPremiumUser && (
							<TouchableOpacity
								style={[
									styles.unlockAllBtn,
									{ backgroundColor: theme.colors.accentPrimary },
								]}
								onPress={() => {
									Alert.alert(
										'Unlock Premium',
										'In the full version, this connects to a payment provider. For now, tap OK to unlock all premium themes.',
										[
											{ text: 'Cancel', style: 'cancel' },
											{ text: 'OK', onPress: unlockPremium },
										]
									)
								}}
							>
								<Text style={[styles.unlockAllText, { color: theme.colors.textOnAccent }]}>
									Unlock All
								</Text>
							</TouchableOpacity>
						)}
					</View>
					<View style={styles.themeGrid}>
						{premiumThemes.map((t) => (
							<ThemeCard
								key={t.id}
								themeStyle={t}
								isActive={activeThemeId === t.id}
								isLocked={!isThemeUnlocked(t.id)}
								onPress={() => handleThemePress(t.id)}
							/>
						))}
					</View>

					{/* UGC Section */}
					<GlassCard style={styles.ugcCard} intensity="light" variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}>
						<Ionicons name="globe-outline" size={36} color={theme.id === 'frutiger-aero' ? 'rgba(0,180,255,0.7)' : theme.colors.accentPrimary} />
						<Text
							style={[
								styles.ugcTitle,
								theme.id === 'frutiger-aero' ? {
									color: 'rgba(120,230,255,0.95)',
									fontFamily: 'Rajdhani_600SemiBold',
								} : { color: theme.colors.textPrimary },
							]}
						>
							Community Skins
						</Text>
						<Text
							style={[
								styles.ugcSubtitle,
								theme.id === 'frutiger-aero' ? {
									color: 'rgba(100,190,255,0.6)',
									fontFamily: 'Orbitron_400Regular',
									fontSize: 10,
								} : { color: theme.colors.textSecondary },
							]}
						>
							User-created themes are coming soon!{'\n'}
							Share and discover skins from the community.
						</Text>
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
	sectionTitle: {
		fontSize: 18,
		marginBottom: 12,
	},
	themeGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	premiumHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	unlockAllBtn: {
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderRadius: 12,
	},
	unlockAllText: {
		fontSize: 12,
		fontWeight: '700',
	},
	ugcCard: {
		alignItems: 'center',
		paddingVertical: 32,
		gap: 10,
	},
	ugcEmoji: {
		fontSize: 36,
	},
	ugcTitle: {
		fontSize: 18,
		fontWeight: '700',
	},
	ugcSubtitle: {
		fontSize: 14,
		textAlign: 'center',
		lineHeight: 20,
	},
})
