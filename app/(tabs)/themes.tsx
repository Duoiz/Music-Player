import React, { useCallback, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	TouchableOpacity,
	Alert,
	Modal,
	TextInput,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTheme } from '../../src/components/ThemeProvider'
import { GlassCard } from '../../src/components/GlassCard'
import { ThemeCard } from '../../src/components/ThemeCard'
import { BackgroundParticles } from '../../src/components/BackgroundParticles'
import { useThemeStore } from '../../src/stores/themeStore'
import { allThemes } from '../../src/themes'
import { importThemeFromJSON } from '../../src/utils/themeBuilder'
import * as Haptics from 'expo-haptics'

/**
 * Theme Store screen — browse and apply visual skins.
 * Free themes + premium themes + In-App Skin Creator for custom skins.
 */
export default function ThemesScreen() {
	const router = useRouter()
	const theme = useTheme()
	const activeThemeId = useThemeStore((s) => s.activeThemeId)
	const setTheme = useThemeStore((s) => s.setTheme)
	const isThemeUnlocked = useThemeStore((s) => s.isThemeUnlocked)
	const isPremiumUser = useThemeStore((s) => s.isPremiumUser)
	const unlockPremium = useThemeStore((s) => s.unlockPremium)
	const customThemes = useThemeStore((s) => s.customThemes)
	const deleteCustomTheme = useThemeStore((s) => s.deleteCustomTheme)
	const addCustomTheme = useThemeStore((s) => s.addCustomTheme)

	const [importModalVisible, setImportModalVisible] = useState(false)
	const [importJsonText, setImportJsonText] = useState('')

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

	const handleEditCustomTheme = useCallback(
		(themeId: string) => {
			router.push({
				pathname: '/skin-creator',
				params: { editingThemeId: themeId },
			})
		},
		[router]
	)

	const handleRemixTheme = useCallback(
		(themeId: string) => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
			router.push({
				pathname: '/skin-creator',
				params: { remixThemeId: themeId },
			})
		},
		[router]
	)

	const handleDeleteCustomTheme = useCallback(
		(themeId: string, themeName: string) => {
			Alert.alert(
				'Delete Skin',
				`Are you sure you want to remove "${themeName}" from your custom skins?`,
				[
					{ text: 'Cancel', style: 'cancel' },
					{
						text: 'Delete',
						style: 'destructive',
						onPress: () => {
							Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
							deleteCustomTheme(themeId)
						},
					},
				]
			)
		},
		[deleteCustomTheme]
	)

	const handleImportSkin = useCallback(async () => {
		const parsed = importThemeFromJSON(importJsonText)
		if (!parsed) {
			Alert.alert('Invalid Skin Code', 'The provided JSON code is not a valid music player skin.')
			return
		}

		await addCustomTheme(parsed)
		setTheme(parsed.id)
		setImportModalVisible(false)
		setImportJsonText('')
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
		Alert.alert('Skin Imported!', `"${parsed.name}" has been added and applied.`)
	}, [importJsonText, addCustomTheme, setTheme])

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

					{/* Skin Studio Hero Banner */}
					<TouchableOpacity
						activeOpacity={0.85}
						onPress={() => router.push('/skin-creator')}
						style={styles.studioBannerWrapper}
					>
						<LinearGradient
							colors={
								theme.id === 'frutiger-aero'
									? ['rgba(0, 200, 255, 0.45)', 'rgba(64, 255, 208, 0.35)']
									: ['rgba(56, 189, 248, 0.3)', 'rgba(168, 85, 247, 0.3)']
							}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={[
								styles.studioBanner,
								{
									borderColor: theme.colors.accentPrimary,
									borderRadius: theme.metrics.borderRadiusLarge + 4,
								},
							]}
						>
							<View style={styles.studioBannerLeft}>
								<View style={[styles.studioIconBadge, { backgroundColor: `${theme.colors.accentPrimary}35` }]}>
									<Ionicons name="sparkles" size={24} color={theme.colors.accentPrimary} />
								</View>
								<View style={styles.studioBannerText}>
									<Text style={[styles.studioBannerTitle, { color: theme.colors.textPrimary }]}>
										Skin Studio
									</Text>
									<Text style={[styles.studioBannerSubtitle, { color: theme.colors.textSecondary }]}>
										Create, customize, and preview skins
									</Text>
								</View>
							</View>
							<Ionicons name="chevron-forward-circle" size={28} color={theme.colors.accentPrimary} />
						</LinearGradient>
					</TouchableOpacity>

					{/* Curated Discovery: Skin of the Week Showcase */}
					{(() => {
						const featuredTheme =
							allThemes.find((t) => t.isFeatured) ||
							allThemes.find((t) => t.id === 'steampunk-chronograph')
						if (!featuredTheme) return null

						const isFeaturedActive = activeThemeId === featuredTheme.id

						return (
							<View style={styles.featuredShowcaseContainer}>
								<LinearGradient
									colors={['#2E1E14', '#19110B']}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
									style={styles.featuredCard}
								>
									{/* Top Badge Row */}
									<View style={styles.featuredHeaderRow}>
										<View style={styles.featuredBadge}>
											<Ionicons name="flame" size={13} color="#F5D061" />
											<Text style={styles.featuredBadgeText}>SKIN OF THE WEEK</Text>
										</View>
										<View style={styles.metricsBadge}>
											<Ionicons name="git-branch-outline" size={11} color="#D4AF37" />
											<Text style={styles.metricsText}>
												{featuredTheme.remixCount ?? 3420} Remixes
											</Text>
										</View>
									</View>

									{/* Title & Author */}
									<Text style={styles.featuredTitle}>{featuredTheme.name}</Text>
									<Text style={styles.featuredAuthor}>by {featuredTheme.author}</Text>
									<Text style={styles.featuredDesc}>{featuredTheme.description}</Text>

									{/* Hardware Affordance Chips */}
									<View style={styles.hardwareChipsRow}>
										<View style={styles.chip}>
											<Text style={styles.chipText}>⚙️ Clockwork Cogs</Text>
										</View>
										<View style={styles.chip}>
											<Text style={styles.chipText}>🎵 Turntable Vinyl</Text>
										</View>
										<View style={styles.chip}>
											<Text style={styles.chipText}>🎚️ Audio-Reactive</Text>
										</View>
									</View>

									{/* Actions */}
									<View style={styles.featuredActionsRow}>
										<TouchableOpacity
											activeOpacity={0.85}
											onPress={() => {
												Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
												setTheme(featuredTheme.id)
											}}
											style={[
												styles.featuredApplyBtn,
												isFeaturedActive && styles.featuredApplyBtnActive,
											]}
										>
											<Ionicons
												name={isFeaturedActive ? 'checkmark-circle' : 'color-palette'}
												size={16}
												color={isFeaturedActive ? '#1A120B' : '#F5D061'}
											/>
											<Text
												style={[
													styles.featuredApplyText,
													isFeaturedActive && styles.featuredApplyTextActive,
												]}
											>
												{isFeaturedActive ? 'Active Skin' : 'Apply Skin'}
											</Text>
										</TouchableOpacity>

										<TouchableOpacity
											activeOpacity={0.85}
											onPress={() => handleRemixTheme(featuredTheme.id)}
											style={styles.featuredRemixBtn}
										>
											<Ionicons name="git-branch-outline" size={16} color="#FFE082" />
											<Text style={styles.featuredRemixText}>Remix / Fork</Text>
										</TouchableOpacity>
									</View>
								</LinearGradient>
							</View>
						)
					})()}

					{/* My Custom Skins (If any exist) */}
					{customThemes.length > 0 && (
						<View style={styles.customSection}>
							<View style={styles.sectionHeaderRow}>
								<Text
									style={[
										styles.sectionTitle,
										{
											color: theme.colors.textPrimary,
											fontWeight: theme.typography.titleWeight,
											fontFamily: theme.typography.fontFamily,
										},
									]}
								>
									My Custom Skins ({customThemes.length})
								</Text>
								<TouchableOpacity
									onPress={() => setImportModalVisible(true)}
									style={styles.importSkinHeaderBtn}
								>
									<Ionicons name="download-outline" size={14} color={theme.colors.accentPrimary} />
									<Text style={[styles.importSkinHeaderText, { color: theme.colors.accentPrimary }]}>
										Import
									</Text>
								</TouchableOpacity>
							</View>

							<View style={styles.themeGrid}>
								{customThemes.map((t) => (
									<View key={t.id} style={styles.customThemeCardContainer}>
										<ThemeCard
											themeStyle={t}
											isActive={activeThemeId === t.id}
											isLocked={false}
											onPress={() => handleThemePress(t.id)}
											onRemix={() => handleRemixTheme(t.id)}
										/>
										<View style={styles.customCardActions}>
											<TouchableOpacity
												onPress={() => handleEditCustomTheme(t.id)}
												style={styles.customActionBtn}
												hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
											>
												<Ionicons name="pencil" size={14} color="#38bdf8" />
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => handleDeleteCustomTheme(t.id, t.name)}
												style={styles.customActionBtn}
												hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
											>
												<Ionicons name="trash-outline" size={14} color="#f87171" />
											</TouchableOpacity>
										</View>
									</View>
								))}
							</View>
						</View>
					)}

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
						Built-in Skins
					</Text>
					<View style={styles.themeGrid}>
						{freeThemes.map((t) => (
							<ThemeCard
								key={t.id}
								themeStyle={t}
								isActive={activeThemeId === t.id}
								isLocked={false}
								onPress={() => handleThemePress(t.id)}
								onRemix={() => handleRemixTheme(t.id)}
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
							Specialty Skins
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
										'In the full version, this connects to a payment provider. For now, tap OK to unlock all specialty themes.',
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
								onRemix={() => handleRemixTheme(t.id)}
							/>
						))}
					</View>

					{/* Community Hub Footer */}
					<GlassCard style={styles.ugcCard} intensity="light" variant={theme.id === 'frutiger-aero' ? 'dark' : 'default'}>
						<Ionicons name="globe-outline" size={32} color={theme.colors.accentPrimary} />
						<Text
							style={[
								styles.ugcTitle,
								theme.id === 'frutiger-aero' ? {
									color: 'rgba(120,230,255,0.95)',
									fontFamily: 'Rajdhani_600SemiBold',
								} : { color: theme.colors.textPrimary },
							]}
						>
							Community Sharing
						</Text>
						<Text
							style={[
								styles.ugcSubtitle,
								{ color: theme.colors.textSecondary },
							]}
						>
							Export your custom skins from Skin Studio and share them with other beta testers via JSON code.
						</Text>
						<TouchableOpacity
							onPress={() => setImportModalVisible(true)}
							style={[styles.importBtn, { borderColor: theme.colors.accentPrimary }]}
						>
							<Ionicons name="download-outline" size={16} color={theme.colors.accentPrimary} />
							<Text style={[styles.importBtnText, { color: theme.colors.accentPrimary }]}>
								Import Skin Code
							</Text>
						</TouchableOpacity>
					</GlassCard>

					<View style={{ height: 140 }} />
				</ScrollView>
			</SafeAreaView>

			{/* Import Skin Modal */}
			<Modal
				visible={importModalVisible}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setImportModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Import Skin</Text>
							<TouchableOpacity onPress={() => setImportModalVisible(false)}>
								<Ionicons name="close" size={22} color="#FFFFFF" />
							</TouchableOpacity>
						</View>
						<Text style={styles.modalSubtitle}>
							Paste the skin JSON code exported from another device or tester:
						</Text>
						<TextInput
							style={styles.modalInput}
							value={importJsonText}
							onChangeText={setImportJsonText}
							placeholder="Paste JSON configuration here..."
							placeholderTextColor="#64748b"
							multiline
						/>
						<View style={styles.modalActionRow}>
							<TouchableOpacity
								onPress={() => setImportModalVisible(false)}
								style={styles.modalCancelBtn}
							>
								<Text style={styles.modalCancelText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleImportSkin}
								style={styles.modalConfirmBtn}
							>
								<Text style={styles.modalConfirmText}>Import & Apply</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
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
		marginBottom: 16,
	},
	studioBannerWrapper: {
		marginBottom: 20,
	},
	studioBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderWidth: 1.5,
		shadowColor: '#00e5ff',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 4,
	},
	studioBannerLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	studioIconBadge: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
	},
	studioBannerText: {
		gap: 2,
	},
	studioBannerTitle: {
		fontSize: 16,
		fontWeight: '700',
	},
	studioBannerSubtitle: {
		fontSize: 12,
	},
	customSection: {
		marginBottom: 16,
	},
	sectionHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 18,
		marginBottom: 12,
	},
	importSkinHeaderBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
		backgroundColor: 'rgba(0, 229, 255, 0.12)',
	},
	importSkinHeaderText: {
		fontSize: 12,
		fontWeight: '700',
	},
	themeGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	customThemeCardContainer: {
		width: '48%',
		marginBottom: 12,
	},
	customCardActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 8,
		marginTop: 4,
		paddingHorizontal: 4,
	},
	customActionBtn: {
		padding: 4,
		borderRadius: 6,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
		paddingVertical: 24,
		paddingHorizontal: 16,
		gap: 8,
	},
	ugcTitle: {
		fontSize: 17,
		fontWeight: '700',
	},
	ugcSubtitle: {
		fontSize: 13,
		textAlign: 'center',
		lineHeight: 18,
		marginBottom: 4,
	},
	importBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		backgroundColor: 'rgba(0,0,0,0.15)',
	},
	importBtnText: {
		fontSize: 12,
		fontWeight: '700',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalContent: {
		width: '100%',
		backgroundColor: '#111827',
		borderRadius: 20,
		padding: 20,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)',
		gap: 12,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	modalSubtitle: {
		fontSize: 12,
		color: '#94a3b8',
		lineHeight: 18,
	},
	modalInput: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
		padding: 12,
		color: '#FFFFFF',
		fontFamily: 'Courier',
		fontSize: 11,
		height: 140,
		textAlignVertical: 'top',
	},
	modalActionRow: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 10,
		marginTop: 6,
	},
	modalCancelBtn: {
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 10,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
	},
	modalCancelText: {
		color: '#94a3b8',
		fontSize: 13,
		fontWeight: '600',
	},
	modalConfirmBtn: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 10,
		backgroundColor: '#0284c7',
	},
	modalConfirmText: {
		color: '#FFFFFF',
		fontSize: 13,
		fontWeight: '700',
	},
	/* Skin of the Week Showcase */
	featuredShowcaseContainer: {
		marginBottom: 20,
	},
	featuredCard: {
		padding: 16,
		borderRadius: 18,
		borderWidth: 1.5,
		borderColor: 'rgba(218, 165, 32, 0.4)',
		shadowColor: '#DAA520',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 12,
		elevation: 6,
	},
	featuredHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	featuredBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: 'rgba(218, 165, 32, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 6,
		borderWidth: 0.8,
		borderColor: '#DAA520',
	},
	featuredBadgeText: {
		color: '#F5D061',
		fontSize: 10,
		fontWeight: '800',
		letterSpacing: 0.5,
	},
	metricsBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	metricsText: {
		color: '#D4AF37',
		fontSize: 11,
		fontWeight: '600',
	},
	featuredTitle: {
		color: '#F5D061',
		fontSize: 18,
		fontWeight: '800',
		letterSpacing: 0.5,
	},
	featuredAuthor: {
		color: '#D4AF37',
		fontSize: 12,
		marginTop: 2,
	},
	featuredDesc: {
		color: '#B8860B',
		fontSize: 12,
		lineHeight: 16,
		marginTop: 6,
	},
	hardwareChipsRow: {
		flexDirection: 'row',
		gap: 6,
		marginTop: 10,
		flexWrap: 'wrap',
	},
	chip: {
		backgroundColor: 'rgba(218, 165, 32, 0.12)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
		borderWidth: 0.8,
		borderColor: 'rgba(218, 165, 32, 0.25)',
	},
	chipText: {
		color: '#FFE082',
		fontSize: 10,
		fontWeight: '700',
	},
	featuredActionsRow: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 14,
	},
	featuredApplyBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		backgroundColor: 'rgba(218, 165, 32, 0.2)',
		borderWidth: 1.5,
		borderColor: '#DAA520',
		paddingVertical: 10,
		borderRadius: 10,
	},
	featuredApplyBtnActive: {
		backgroundColor: '#F5D061',
		borderColor: '#F5D061',
	},
	featuredApplyText: {
		color: '#F5D061',
		fontSize: 13,
		fontWeight: '700',
	},
	featuredApplyTextActive: {
		color: '#1A120B',
	},
	featuredRemixBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		paddingVertical: 10,
		borderRadius: 10,
	},
	featuredRemixText: {
		color: '#FFE082',
		fontSize: 13,
		fontWeight: '700',
	},
})

