import React, { useCallback, useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	TouchableOpacity,
	Alert,
	Modal,
	TextInput,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTheme } from '../../src/components/ThemeProvider'
import { ThemeCard } from '../../src/components/ThemeCard'
import { BackgroundParticles } from '../../src/components/BackgroundParticles'
import { useThemeStore } from '../../src/stores/themeStore'
import { allThemes, freeThemes, premiumThemes } from '../../src/themes'
import { importThemeFromJSON } from '../../src/utils/themeBuilder'
import * as Haptics from 'expo-haptics'
import type { ThemeStyle } from '../../src/types'

type Filter = 'all' | 'mine' | 'builtin' | 'specialty'

const featuredTheme: ThemeStyle | undefined =
	allThemes.find((t) => t.isFeatured) || allThemes.find((t) => t.id === 'steampunk-chronograph')

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

	const [filter, setFilter] = useState<Filter>('all')

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

	const customIds = useMemo(() => new Set(customThemes.map((t) => t.id)), [customThemes])

	const data = useMemo<ThemeStyle[]>(() => {
		switch (filter) {
			case 'mine':
				return customThemes
			case 'builtin':
				return freeThemes
			case 'specialty':
				return premiumThemes
			default:
				return [...customThemes, ...freeThemes, ...premiumThemes]
		}
	}, [filter, customThemes])

	const filters: { id: Filter; label: string }[] = [
		{ id: 'all', label: 'All' },
		...(customThemes.length > 0 ? [{ id: 'mine' as Filter, label: `Mine (${customThemes.length})` }] : []),
		{ id: 'builtin', label: 'Built-in' },
		{ id: 'specialty', label: 'Specialty' },
	]

	const accent = theme.colors.accentPrimary
	const isAero = theme.id === 'frutiger-aero'

	const renderItem = useCallback(
		({ item }: { item: ThemeStyle }) => {
			const isCustom = customIds.has(item.id)
			return (
				<View style={styles.cell}>
					<ThemeCard
						themeStyle={item}
						isActive={activeThemeId === item.id}
						isLocked={!isCustom && !!item.isPremium && !isThemeUnlocked(item.id)}
						onPress={() => handleThemePress(item.id)}
						onRemix={() => handleRemixTheme(item.id)}
					/>
					{isCustom && (
						<View style={styles.customCardActions}>
							<TouchableOpacity
								onPress={() => handleEditCustomTheme(item.id)}
								style={styles.customActionBtn}
								hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
							>
								<Ionicons name="pencil" size={14} color="#38bdf8" />
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => handleDeleteCustomTheme(item.id, item.name)}
								style={styles.customActionBtn}
								hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
							>
								<Ionicons name="trash-outline" size={14} color="#f87171" />
							</TouchableOpacity>
						</View>
					)}
				</View>
			)
		},
		[
			customIds,
			activeThemeId,
			isThemeUnlocked,
			handleThemePress,
			handleRemixTheme,
			handleEditCustomTheme,
			handleDeleteCustomTheme,
		]
	)

	const renderListHeader = () => {
		if (filter === 'specialty' && !isPremiumUser) {
			return (
				<TouchableOpacity
					style={[styles.unlockRow, { borderColor: accent }]}
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
					<Ionicons name="lock-open-outline" size={16} color={accent} />
					<Text style={[styles.unlockText, { color: accent }]}>Unlock all specialty skins</Text>
				</TouchableOpacity>
			)
		}

		if (filter === 'all' && featuredTheme) {
			const isFeaturedActive = activeThemeId === featuredTheme.id
			return (
				<LinearGradient
					colors={['#2E1E14', '#19110B']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.featuredRow}
				>
					<Ionicons name="flame" size={18} color="#F5D061" />
					<View style={styles.featuredInfo}>
						<Text style={styles.featuredBadgeText}>SKIN OF THE WEEK</Text>
						<Text style={styles.featuredTitle} numberOfLines={1}>
							{featuredTheme.name}
						</Text>
					</View>
					<TouchableOpacity
						activeOpacity={0.85}
						onPress={() => {
							Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
							setTheme(featuredTheme.id)
						}}
						style={[styles.featuredBtn, isFeaturedActive && styles.featuredBtnActive]}
					>
						<Text style={[styles.featuredBtnText, isFeaturedActive && styles.featuredBtnTextActive]}>
							{isFeaturedActive ? 'Active' : 'Apply'}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						activeOpacity={0.85}
						onPress={() => handleRemixTheme(featuredTheme.id)}
						style={styles.featuredBtn}
						accessibilityLabel="Remix this skin"
					>
						<Ionicons name="git-branch-outline" size={15} color="#FFE082" />
					</TouchableOpacity>
				</LinearGradient>
			)
		}

		return null
	}

	return (
		<LinearGradient
			colors={theme.colors.backgroundGradient as [string, string, ...string[]]}
			start={theme.colors.backgroundGradientStart}
			end={theme.colors.backgroundGradientEnd}
			style={styles.container}
		>
			<BackgroundParticles />
			<SafeAreaView style={styles.safeArea} edges={['top']}>
				{/* Pinned header: title, actions and filters stay visible while the grid scrolls */}
				<View style={styles.header}>
					<View style={styles.titleRow}>
						<Text
							style={[
								styles.title,
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
							Themes
						</Text>
						<View style={styles.headerActions}>
							<TouchableOpacity
								onPress={() => setImportModalVisible(true)}
								style={[styles.headerBtn, { borderColor: accent }]}
								accessibilityLabel="Import skin code"
							>
								<Ionicons name="download-outline" size={16} color={accent} />
								<Text style={[styles.headerBtnText, { color: accent }]}>Import</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => router.push('/skin-creator')}
								style={[styles.headerBtn, { backgroundColor: accent, borderColor: accent }]}
								accessibilityLabel="Open Skin Studio"
							>
								<Ionicons name="sparkles" size={16} color={theme.colors.textOnAccent} />
								<Text style={[styles.headerBtnText, { color: theme.colors.textOnAccent }]}>Studio</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.filterRow}>
						{filters.map((f) => {
							const active = filter === f.id
							return (
								<TouchableOpacity
									key={f.id}
									onPress={() => {
										Haptics.selectionAsync()
										setFilter(f.id)
									}}
									style={[
										styles.filterChip,
										active
											? { backgroundColor: accent }
											: { backgroundColor: isAero ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)' },
									]}
								>
									<Text
										numberOfLines={1}
										style={[
											styles.filterText,
											active
												? { color: theme.colors.textOnAccent, fontWeight: '700' }
												: { color: theme.colors.textSecondary },
										]}
									>
										{f.label}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>
				</View>

				<FlatList
					key={filter}
					data={data}
					numColumns={2}
					keyExtractor={(t) => t.id}
					renderItem={renderItem}
					ListHeaderComponent={renderListHeader}
					columnWrapperStyle={styles.columnWrapper}
					contentContainerStyle={styles.gridContent}
					initialNumToRender={6}
					windowSize={5}
					showsVerticalScrollIndicator={false}
				/>
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
							<TouchableOpacity onPress={() => setImportModalVisible(false)} style={styles.modalCancelBtn}>
								<Text style={styles.modalCancelText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={handleImportSkin} style={styles.modalConfirmBtn}>
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
	container: { flex: 1 },
	safeArea: { flex: 1 },

	header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 10 },
	titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
	title: { fontSize: 26, letterSpacing: -0.5 },
	headerActions: { flexDirection: 'row', gap: 8 },
	headerBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 16,
		borderWidth: 1,
	},
	headerBtnText: { fontSize: 12, fontWeight: '700' },

	filterRow: { flexDirection: 'row', gap: 6 },
	filterChip: { flex: 1, paddingVertical: 8, borderRadius: 18, alignItems: 'center' },
	filterText: { fontSize: 12 },

	// Room for the floating mini-player + tab bar
	gridContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 150 },
	columnWrapper: { justifyContent: 'space-between' },
	cell: { width: '48%', marginBottom: 12 },
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

	unlockRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 10,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 12,
		backgroundColor: 'rgba(0,0,0,0.15)',
	},
	unlockText: { fontSize: 13, fontWeight: '700' },

	/* Skin of the Week (slim row) */
	featuredRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: 'rgba(218, 165, 32, 0.4)',
		marginBottom: 12,
	},
	featuredInfo: { flex: 1 },
	featuredBadgeText: { color: '#D4AF37', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
	featuredTitle: { color: '#F5D061', fontSize: 15, fontWeight: '800' },
	featuredBtn: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: 'rgba(218, 165, 32, 0.6)',
		backgroundColor: 'rgba(218, 165, 32, 0.15)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	featuredBtnActive: { backgroundColor: '#F5D061', borderColor: '#F5D061' },
	featuredBtnText: { color: '#F5D061', fontSize: 12, fontWeight: '700' },
	featuredBtnTextActive: { color: '#1A120B' },

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
})
