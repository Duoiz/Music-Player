import React, { useState, useMemo, useCallback } from 'react'
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useThemeStore } from '../src/stores/themeStore'
import { allThemes } from '../src/themes'
import {
	CustomThemeDraft,
	DEFAULT_THEME_DRAFT,
	buildThemeFromDraft,
	exportThemeToJSON,
} from '../src/utils/themeBuilder'
import { SkinPreviewCard } from '../src/components/skin-creator/SkinPreviewCard'
import {
	GradientPicker,
	AccentPicker,
	GlassTintPicker,
} from '../src/components/skin-creator/ColorSwatchPicker'
import * as Haptics from 'expo-haptics'

type CategoryTab = 'palette' | 'accents' | 'hardware' | 'geometry' | 'details'

export default function SkinCreatorScreen() {
	const router = useRouter()
	const { editingThemeId, remixThemeId } = useLocalSearchParams<{
		editingThemeId?: string
		remixThemeId?: string
	}>()
	const customThemes = useThemeStore((s) => s.customThemes)
	const addCustomTheme = useThemeStore((s) => s.addCustomTheme)
	const updateCustomTheme = useThemeStore((s) => s.updateCustomTheme)
	const setTheme = useThemeStore((s) => s.setTheme)

	// If editing an existing theme, prepopulate
	const existingTheme = useMemo(() => {
		if (!editingThemeId) return null
		return customThemes.find((t) => t.id === editingThemeId) || null
	}, [editingThemeId, customThemes])

	// If remixing an existing preset or custom theme
	const remixParent = useMemo(() => {
		if (!remixThemeId) return null
		return (
			allThemes.find((t) => t.id === remixThemeId) ||
			customThemes.find((t) => t.id === remixThemeId) ||
			null
		)
	}, [remixThemeId, customThemes])

	const [draft, setDraft] = useState<CustomThemeDraft>(() => {
		if (existingTheme) {
			return {
				name: existingTheme.name,
				author: existingTheme.author,
				description: existingTheme.description,
				backgroundPresetId: 'frutiger-aqua',
				accentPresetId: 'electric-cyan',
				glassTintId: 'frosted-aqua',
				blurIntensity: existingTheme.metrics.blurIntensity || 25,
				cornerRadius: 'balanced',
				fontChoice: existingTheme.typography.fontFamily?.includes('Orbitron')
					? 'orbitron'
					: existingTheme.typography.fontFamily?.includes('Rajdhani')
					? 'rajdhani'
					: 'system',
				glowIntensity: 'vivid',
				volumeWidget: existingTheme.widgets?.volumeControl || 'slider',
				artworkWidget: existingTheme.widgets?.artworkDisplay || 'glass-cylinder',
				buttonWidget: existingTheme.widgets?.playButton || 'glossy-orb',
				audioReactiveEnabled: existingTheme.widgets?.audioReactivity?.enabled ?? true,
				audioReactiveTarget: existingTheme.widgets?.audioReactivity?.target || 'glow',
				audioReactiveIntensity: existingTheme.widgets?.audioReactivity?.intensity || 'dynamic',
				forkedFrom: existingTheme.forkedFrom,
			}
		}

		if (remixParent) {
			return {
				name: `${remixParent.name} (Remix)`,
				author: 'You',
				description: `Remixed from "${remixParent.name}" by ${remixParent.author}`,
				backgroundPresetId: 'frutiger-aqua',
				accentPresetId: 'electric-cyan',
				glassTintId: 'frosted-aqua',
				blurIntensity: remixParent.metrics.blurIntensity || 25,
				cornerRadius: 'balanced',
				fontChoice: remixParent.typography.fontFamily?.includes('Orbitron')
					? 'orbitron'
					: remixParent.typography.fontFamily?.includes('Rajdhani')
					? 'rajdhani'
					: 'system',
				glowIntensity: 'vivid',
				volumeWidget: remixParent.widgets?.volumeControl || 'slider',
				artworkWidget: remixParent.widgets?.artworkDisplay || 'vinyl',
				buttonWidget: remixParent.widgets?.playButton || 'tactile-toggle',
				audioReactiveEnabled: remixParent.widgets?.audioReactivity?.enabled ?? true,
				audioReactiveTarget: remixParent.widgets?.audioReactivity?.target || 'wobble',
				audioReactiveIntensity: remixParent.widgets?.audioReactivity?.intensity || 'dynamic',
				forkedFrom: {
					id: remixParent.id,
					name: remixParent.name,
					author: remixParent.author,
				},
			}
		}

		return DEFAULT_THEME_DRAFT
	})

	const [activeTab, setActiveTab] = useState<CategoryTab>('palette')
	const [exportModalVisible, setExportModalVisible] = useState(false)

	// Live compiled theme for the preview card
	const previewTheme = useMemo(() => {
		return buildThemeFromDraft(draft, existingTheme?.id)
	}, [draft, existingTheme])

	const handleSaveAndApply = useCallback(async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
		const finalTheme = buildThemeFromDraft(draft, existingTheme?.id)

		if (existingTheme) {
			await updateCustomTheme(finalTheme)
		} else {
			await addCustomTheme(finalTheme)
		}

		setTheme(finalTheme.id)
		Alert.alert(
			'Skin Applied!',
			`"${finalTheme.name}" has been saved and applied to your player.`,
			[{ text: 'Great!', onPress: () => router.back() }]
		)
	}, [draft, existingTheme, addCustomTheme, updateCustomTheme, setTheme, router])

	const handleTestInApp = useCallback(async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		const finalTheme = buildThemeFromDraft(draft, 'temp-preview')
		// Add as temporary theme and apply
		await addCustomTheme(finalTheme)
		setTheme(finalTheme.id)
		Alert.alert(
			'Live App Preview Active',
			'Your skin is now active across all tabs so you can inspect how it feels.',
			[{ text: 'Got It' }]
		)
	}, [draft, addCustomTheme, setTheme])

	const exportedJSON = useMemo(() => {
		return exportThemeToJSON(previewTheme)
	}, [previewTheme])

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
			<View style={styles.container}>
				{/* Top Bar */}
				<View style={styles.navBar}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.navButton}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Ionicons name="close" size={24} color="#FFFFFF" />
					</TouchableOpacity>
					<View style={styles.titleContainer}>
						<Text style={styles.navTitle}>
							{remixParent
								? `Remix: ${remixParent.name}`
								: existingTheme
								? 'Edit Custom Skin'
								: 'Skin Studio'}
						</Text>
						<Text style={styles.navSubtitle}>
							{remixParent
								? `Forked from @${remixParent.author}`
								: 'Craft your player aesthetics'}
						</Text>
					</View>
					<TouchableOpacity
						onPress={() => setExportModalVisible(true)}
						style={styles.navButton}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Ionicons name="share-outline" size={22} color="#38bdf8" />
					</TouchableOpacity>
				</View>

				{/* Scrollable Workspace */}
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					{/* Interactive Live Preview */}
					<SkinPreviewCard theme={previewTheme} />

					{/* Category Tabs */}
					<View style={styles.tabRow}>
						{(
							[
								{ id: 'palette', label: 'Palette', icon: 'color-palette-outline' },
								{ id: 'accents', label: 'Accents', icon: 'flash-outline' },
								{ id: 'hardware', label: 'Widgets', icon: 'hardware-chip-outline' },
								{ id: 'geometry', label: 'Style', icon: 'shapes-outline' },
								{ id: 'details', label: 'Details', icon: 'text-outline' },
							] as const
						).map((tab) => {
							const isActive = activeTab === tab.id
							return (
								<TouchableOpacity
									key={tab.id}
									onPress={() => {
										Haptics.selectionAsync()
										setActiveTab(tab.id)
									}}
									style={[styles.tabButton, isActive && styles.activeTabButton]}
								>
									<Ionicons
										name={tab.icon}
										size={16}
										color={isActive ? '#00e5ff' : '#94a3b8'}
									/>
									<Text style={[styles.tabButtonText, isActive && styles.activeTabText]}>
										{tab.label}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>

					{/* Tab 1: Background & Glass Palette */}
					{activeTab === 'palette' && (
						<View style={styles.sectionCard}>
							<Text style={styles.sectionTitle}>Backdrop Aura</Text>
							<Text style={styles.sectionHint}>Ambient wallpaper gradient canvas</Text>
							<GradientPicker
								selectedId={draft.backgroundPresetId}
								onSelect={(p) => setDraft((d) => ({ ...d, backgroundPresetId: p.id }))}
							/>

							<View style={styles.divider} />

							<Text style={styles.sectionTitle}>Frosted Glass Tint</Text>
							<Text style={styles.sectionHint}>Shading applied across glass cards and surfaces</Text>
							<GlassTintPicker
								selectedId={draft.glassTintId}
								onSelect={(t) => setDraft((d) => ({ ...d, glassTintId: t.id }))}
							/>
						</View>
					)}

					{/* Tab 2: Accents & Glow */}
					{activeTab === 'accents' && (
						<View style={styles.sectionCard}>
							<Text style={styles.sectionTitle}>Interactive Accent Color</Text>
							<Text style={styles.sectionHint}>Powers the play buttons, scrubbers, and active pills</Text>
							<AccentPicker
								selectedId={draft.accentPresetId}
								onSelect={(p) => setDraft((d) => ({ ...d, accentPresetId: p.id }))}
							/>

							<View style={styles.divider} />

							<Text style={styles.sectionTitle}>Neon Glow Intensity</Text>
							<View style={styles.segmentedRow}>
								{(['subtle', 'vivid', 'neon'] as const).map((level) => {
									const isSelected = draft.glowIntensity === level
									return (
										<TouchableOpacity
											key={level}
											onPress={() => setDraft((d) => ({ ...d, glowIntensity: level }))}
											style={[styles.segmentBtn, isSelected && styles.activeSegmentBtn]}
										>
											<Text
												style={[
													styles.segmentText,
													isSelected && styles.activeSegmentText,
												]}
											>
												{level.toUpperCase()}
											</Text>
										</TouchableOpacity>
									)
								})}
							</View>
						</View>
					)}

					{/* Tab 3: Hardware & Widgets */}
					{activeTab === 'hardware' && (
						<View style={styles.sectionCard}>
							{/* Volume Control Mechanism */}
							<Text style={styles.sectionTitle}>Volume Control Mechanism</Text>
							<Text style={styles.sectionHint}>Interactive hardware widget for level adjustments</Text>
							<View style={styles.widgetChoiceGrid}>
								{(
									[
										{
											id: 'slider',
											title: 'Capsule Slider',
											desc: 'Modern frosted glass track',
											icon: 'reorder-two-outline',
										},
										{
											id: 'rotary-knob',
											title: 'Rotary Dial',
											desc: 'Tactile brushed aluminum knob',
											icon: 'radio-button-on-outline',
										},
										{
											id: 'steampunk-cog',
											title: 'Clockwork Cog',
											desc: 'Interlocking brass gears with tick haptics',
											icon: 'settings-outline',
										},
										{
											id: 'minimal-pill',
											title: 'Minimal Pill',
											desc: 'Ultra-thin streamlined track',
											icon: 'remove-outline',
										},
									] as const
								).map((w) => {
									const isSelected = draft.volumeWidget === w.id
									return (
										<TouchableOpacity
											key={w.id}
											onPress={() => {
												Haptics.selectionAsync()
												setDraft((d) => ({ ...d, volumeWidget: w.id }))
											}}
											style={[styles.widgetOptionCard, isSelected && styles.activeWidgetCard]}
										>
											<View
												style={[
													styles.widgetIconWrap,
													isSelected && styles.activeWidgetIconWrap,
												]}
											>
												<Ionicons
													name={w.icon as any}
													size={20}
													color={isSelected ? '#00e5ff' : '#94a3b8'}
												/>
											</View>
											<View style={styles.widgetTextCol}>
												<Text
													style={[
														styles.widgetCardTitle,
														isSelected && styles.activeWidgetTitle,
													]}
												>
													{w.title}
												</Text>
												<Text style={styles.widgetCardDesc}>{w.desc}</Text>
											</View>
										</TouchableOpacity>
									)
								})}
							</View>

							<View style={styles.divider} />

							{/* Album Artwork Presentation */}
							<Text style={styles.sectionTitle}>Album Artwork Stage</Text>
							<Text style={styles.sectionHint}>How queue album covers are displayed in player</Text>
							<View style={styles.segmentedRow}>
								{(
									[
										{ id: 'glass-cylinder', label: '3D Cylinder' },
										{ id: 'vinyl', label: 'Vinyl Disc' },
										{ id: 'floating-card', label: 'Glass Card' },
									] as const
								).map((a) => {
									const isSelected = draft.artworkWidget === a.id
									return (
										<TouchableOpacity
											key={a.id}
											onPress={() => {
												Haptics.selectionAsync()
												setDraft((d) => ({ ...d, artworkWidget: a.id }))
											}}
											style={[styles.segmentBtn, isSelected && styles.activeSegmentBtn]}
										>
											<Text
												style={[
													styles.segmentText,
													isSelected && styles.activeSegmentText,
												]}
											>
												{a.label}
											</Text>
										</TouchableOpacity>
									)
								})}
							</View>

							<View style={styles.divider} />

							{/* Play Button Tactile Feel */}
							<Text style={styles.sectionTitle}>Play Button Feel</Text>
							<View style={styles.segmentedRow}>
								{(
									[
										{ id: 'glossy-orb', label: 'Gel Bubble' },
										{ id: 'neumorphic-convex', label: 'Tactile Clay' },
										{ id: 'tactile-toggle', label: 'Skeuo Ring' },
									] as const
								).map((p) => {
									const isSelected = draft.buttonWidget === p.id
									return (
										<TouchableOpacity
											key={p.id}
											onPress={() => {
												Haptics.selectionAsync()
												setDraft((d) => ({ ...d, buttonWidget: p.id }))
											}}
											style={[styles.segmentBtn, isSelected && styles.activeSegmentBtn]}
										>
											<Text
												style={[
													styles.segmentText,
													isSelected && styles.activeSegmentText,
												]}
											>
												{p.label}
											</Text>
										</TouchableOpacity>
									)
								})}
							</View>

							<View style={styles.divider} />

							{/* Audio-Reactive Generative Layer */}
							<View style={styles.reactiveHeaderRow}>
								<View style={{ flex: 1 }}>
									<Text style={styles.sectionTitle}>Audio Reactivity</Text>
									<Text style={styles.sectionHint}>
										Syncs UI elements directly with audio tempo & bass EQ
									</Text>
								</View>
								<TouchableOpacity
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
										setDraft((d) => ({
											...d,
											audioReactiveEnabled: !d.audioReactiveEnabled,
										}))
									}}
									style={[
										styles.reactiveToggleBtn,
										draft.audioReactiveEnabled && styles.reactiveToggleBtnActive,
									]}
								>
									<Text
										style={[
											styles.reactiveToggleText,
											draft.audioReactiveEnabled && styles.reactiveToggleTextActive,
										]}
									>
										{draft.audioReactiveEnabled ? 'ACTIVE' : 'OFF'}
									</Text>
								</TouchableOpacity>
							</View>

							{draft.audioReactiveEnabled && (
								<>
									<Text style={[styles.sectionTitle, { fontSize: 12, marginTop: 10 }]}>
										Reactivity Target
									</Text>
									<View style={styles.segmentedRow}>
										{(
											[
												{ id: 'side-pulse', label: 'Side Pulse' },
												{ id: 'glow', label: 'Aura Glow' },
												{ id: 'scale', label: 'Beat Pump' },
												{ id: 'wobble', label: 'Cog Twitch' },
											] as const
										).map((t) => {
											const isSelected = draft.audioReactiveTarget === t.id
											return (
												<TouchableOpacity
													key={t.id}
													onPress={() =>
														setDraft((d) => ({ ...d, audioReactiveTarget: t.id }))
													}
													style={[
														styles.segmentBtn,
														isSelected && styles.activeSegmentBtn,
													]}
												>
													<Text
														style={[
															styles.segmentText,
															isSelected && styles.activeSegmentText,
														]}
													>
														{t.label}
													</Text>
												</TouchableOpacity>
											)
										})}
									</View>

									<Text style={[styles.sectionTitle, { fontSize: 12, marginTop: 12 }]}>
										Beat Intensity
									</Text>
									<View style={styles.segmentedRow}>
										{(
											[
												{ id: 'subtle', label: 'Chill' },
												{ id: 'dynamic', label: 'Dynamic' },
												{ id: 'rave', label: 'Rave' },
											] as const
										).map((i) => {
											const isSelected = draft.audioReactiveIntensity === i.id
											return (
												<TouchableOpacity
													key={i.id}
													onPress={() =>
														setDraft((d) => ({ ...d, audioReactiveIntensity: i.id }))
													}
													style={[
														styles.segmentBtn,
														isSelected && styles.activeSegmentBtn,
													]}
												>
													<Text
														style={[
															styles.segmentText,
															isSelected && styles.activeSegmentText,
														]}
													>
														{i.label}
													</Text>
												</TouchableOpacity>
											)
										})}
									</View>
								</>
							)}
						</View>
					)}

					{/* Tab 3: Geometry & Fonts */}
					{activeTab === 'geometry' && (
						<View style={styles.sectionCard}>
							<Text style={styles.sectionTitle}>Corner Curvature</Text>
							<View style={styles.segmentedRow}>
								{(
									[
										{ id: 'sharp', label: 'Tech Sharp (8px)' },
										{ id: 'balanced', label: 'Modern (16px)' },
										{ id: 'pill', label: 'Fluid Pill (28px)' },
									] as const
								).map((r) => {
									const isSelected = draft.cornerRadius === r.id
									return (
										<TouchableOpacity
											key={r.id}
											onPress={() => setDraft((d) => ({ ...d, cornerRadius: r.id }))}
											style={[styles.segmentBtn, isSelected && styles.activeSegmentBtn]}
										>
											<Text
												style={[
													styles.segmentText,
													isSelected && styles.activeSegmentText,
												]}
											>
												{r.label}
											</Text>
										</TouchableOpacity>
									)
								})}
							</View>

							<View style={styles.divider} />

							<Text style={styles.sectionTitle}>Frosted Glass Blur</Text>
							<View style={styles.segmentedRow}>
								{(
									[
										{ value: 10, label: 'Subtle (10)' },
										{ value: 25, label: 'Balanced (25)' },
										{ value: 60, label: 'Heavy (60)' },
									] as const
								).map((b) => {
									const isSelected = draft.blurIntensity === b.value
									return (
										<TouchableOpacity
											key={b.value}
											onPress={() => setDraft((d) => ({ ...d, blurIntensity: b.value }))}
											style={[styles.segmentBtn, isSelected && styles.activeSegmentBtn]}
										>
											<Text
												style={[
													styles.segmentText,
													isSelected && styles.activeSegmentText,
												]}
											>
												{b.label}
											</Text>
										</TouchableOpacity>
									)
								})}
							</View>

							<View style={styles.divider} />

							<Text style={styles.sectionTitle}>Typography Aesthetic</Text>
							<View style={styles.segmentedRow}>
								{(
									[
										{ id: 'rajdhani', label: 'Rajdhani (Retro)' },
										{ id: 'orbitron', label: 'Orbitron (Sci-Fi)' },
										{ id: 'system', label: 'System (Clean)' },
									] as const
								).map((f) => {
									const isSelected = draft.fontChoice === f.id
									return (
										<TouchableOpacity
											key={f.id}
											onPress={() => setDraft((d) => ({ ...d, fontChoice: f.id }))}
											style={[styles.segmentBtn, isSelected && styles.activeSegmentBtn]}
										>
											<Text
												style={[
													styles.segmentText,
													isSelected && styles.activeSegmentText,
												]}
											>
												{f.label}
											</Text>
										</TouchableOpacity>
									)
								})}
							</View>
						</View>
					)}

					{/* Tab 4: Details & Metadata */}
					{activeTab === 'details' && (
						<View style={styles.sectionCard}>
							<Text style={styles.sectionTitle}>Skin Name</Text>
							<TextInput
								style={styles.inputField}
								value={draft.name}
								onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
								placeholder="e.g., Cyber Neon 2000"
								placeholderTextColor="#64748b"
							/>

							<Text style={[styles.sectionTitle, { marginTop: 16 }]}>Creator Handle</Text>
							<TextInput
								style={styles.inputField}
								value={draft.author}
								onChangeText={(author) => setDraft((d) => ({ ...d, author }))}
								placeholder="e.g., @duoiz"
								placeholderTextColor="#64748b"
							/>

							<Text style={[styles.sectionTitle, { marginTop: 16 }]}>Description</Text>
							<TextInput
								style={[styles.inputField, { height: 60, textAlignVertical: 'top' }]}
								value={draft.description}
								onChangeText={(description) => setDraft((d) => ({ ...d, description }))}
								placeholder="Optional notes or inspiration..."
								placeholderTextColor="#64748b"
								multiline
							/>
						</View>
					)}

					{/* Action Buttons */}
					<View style={styles.actionsContainer}>
						<TouchableOpacity
							activeOpacity={0.8}
							onPress={handleTestInApp}
							style={styles.secondaryActionBtn}
						>
							<Ionicons name="eye-outline" size={18} color="#00e5ff" />
							<Text style={styles.secondaryActionText}>Test in App</Text>
						</TouchableOpacity>

						<TouchableOpacity
							activeOpacity={0.8}
							onPress={handleSaveAndApply}
							style={styles.primaryActionBtn}
						>
							<LinearGradient
								colors={previewTheme.colors.accentGradient as [string, string, ...string[]]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={styles.primaryGradient}
							>
								<Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
								<Text style={styles.primaryActionText}>
									{existingTheme ? 'Update Skin' : 'Save & Apply Skin'}
								</Text>
							</LinearGradient>
						</TouchableOpacity>
					</View>

					<View style={{ height: 40 }} />
				</ScrollView>

				{/* Export JSON Modal */}
				<Modal
					visible={exportModalVisible}
					animationType="slide"
					transparent={true}
					onRequestClose={() => setExportModalVisible(false)}
				>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<View style={styles.modalHeader}>
								<Text style={styles.modalTitle}>Share Skin Code</Text>
								<TouchableOpacity onPress={() => setExportModalVisible(false)}>
									<Ionicons name="close" size={22} color="#FFFFFF" />
								</TouchableOpacity>
							</View>
							<Text style={styles.modalSubtitle}>
								Copy this JSON configuration to share with other testers or import onto another device:
							</Text>
							<TextInput
								style={styles.modalCodeInput}
								value={exportedJSON}
								editable={false}
								multiline
								selectTextOnFocus
							/>
							<TouchableOpacity
								onPress={() => {
									Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
									Alert.alert('Code Ready', 'You can select all and copy the configuration text above.')
								}}
								style={styles.modalCopyBtn}
							>
								<Text style={styles.modalCopyBtnText}>Ready to Share</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#0a0f1d',
	},
	container: {
		flex: 1,
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.08)',
	},
	navButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	titleContainer: {
		alignItems: 'center',
	},
	navTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	navSubtitle: {
		fontSize: 11,
		color: '#94a3b8',
	},
	scrollContent: {
		padding: 16,
		gap: 16,
	},
	tabRow: {
		flexDirection: 'row',
		backgroundColor: 'rgba(255, 255, 255, 0.06)',
		borderRadius: 12,
		padding: 4,
		gap: 4,
	},
	tabButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		paddingVertical: 8,
		borderRadius: 8,
	},
	activeTabButton: {
		backgroundColor: 'rgba(0, 229, 255, 0.15)',
		borderWidth: 1,
		borderColor: 'rgba(0, 229, 255, 0.4)',
	},
	tabButtonText: {
		fontSize: 11,
		fontWeight: '600',
		color: '#94a3b8',
	},
	activeTabText: {
		color: '#00e5ff',
		fontWeight: '700',
	},
	sectionCard: {
		backgroundColor: 'rgba(255, 255, 255, 0.04)',
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.08)',
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: '700',
		color: '#FFFFFF',
		marginBottom: 4,
	},
	sectionHint: {
		fontSize: 11,
		color: '#94a3b8',
		marginBottom: 10,
	},
	divider: {
		height: 1,
		backgroundColor: 'rgba(255, 255, 255, 0.06)',
		marginVertical: 16,
	},
	segmentedRow: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 6,
	},
	segmentBtn: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 4,
		borderRadius: 10,
		backgroundColor: 'rgba(255, 255, 255, 0.06)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	activeSegmentBtn: {
		backgroundColor: 'rgba(0, 229, 255, 0.15)',
		borderColor: '#00e5ff',
	},
	segmentText: {
		fontSize: 11,
		fontWeight: '600',
		color: '#94a3b8',
		textAlign: 'center',
	},
	activeSegmentText: {
		color: '#00e5ff',
		fontWeight: '700',
	},
	inputField: {
		backgroundColor: 'rgba(255, 255, 255, 0.06)',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.12)',
		paddingHorizontal: 14,
		paddingVertical: 10,
		color: '#FFFFFF',
		fontSize: 14,
	},
	actionsContainer: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 8,
	},
	secondaryActionBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		paddingVertical: 14,
		borderRadius: 14,
		backgroundColor: 'rgba(0, 229, 255, 0.08)',
		borderWidth: 1.5,
		borderColor: 'rgba(0, 229, 255, 0.35)',
	},
	secondaryActionText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#00e5ff',
	},
	primaryActionBtn: {
		flex: 2,
		borderRadius: 14,
		overflow: 'hidden',
		shadowColor: '#00e5ff',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.35,
		shadowRadius: 10,
		elevation: 6,
	},
	primaryGradient: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 14,
	},
	primaryActionText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#FFFFFF',
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
	modalCodeInput: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
		padding: 12,
		color: '#38bdf8',
		fontFamily: 'Courier',
		fontSize: 11,
		height: 160,
		textAlignVertical: 'top',
	},
	modalCopyBtn: {
		backgroundColor: '#0284c7',
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: 'center',
	},
	modalCopyBtnText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '700',
	},
	/* Hardware Widgets & Reactivity */
	widgetChoiceGrid: {
		gap: 8,
		marginTop: 6,
	},
	widgetOptionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.08)',
		gap: 12,
	},
	activeWidgetCard: {
		backgroundColor: 'rgba(0, 229, 255, 0.12)',
		borderColor: '#00e5ff',
	},
	widgetIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	activeWidgetIconWrap: {
		backgroundColor: 'rgba(0, 229, 255, 0.25)',
	},
	widgetTextCol: {
		flex: 1,
	},
	widgetCardTitle: {
		fontSize: 13,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	activeWidgetTitle: {
		color: '#00e5ff',
	},
	widgetCardDesc: {
		fontSize: 11,
		color: '#94a3b8',
		marginTop: 2,
	},
	reactiveHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	reactiveToggleBtn: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)',
	},
	reactiveToggleBtnActive: {
		backgroundColor: '#00e5ff',
		borderColor: '#00e5ff',
	},
	reactiveToggleText: {
		fontSize: 11,
		fontWeight: '800',
		color: '#94a3b8',
		letterSpacing: 0.5,
	},
	reactiveToggleTextActive: {
		color: '#0a0f1d',
	},
})
