import React, { useCallback, useState } from 'react'
import {
	Alert,
	Modal,
	ScrollView,
	Share,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from './ThemeProvider'
import { useSheetColors } from './useSheetColors'
import { useLayoutStore, usePillMetrics } from '../stores/layoutStore'
import { useThemeStore } from '../stores/themeStore'
import { useVibeStore } from '../stores/vibeStore'
import { useAutoPlaylistStore } from '../stores/autoPlaylistStore'
import { DEFAULT_LAYOUT, LAYOUT_PRESETS, isDefaultLayout } from '../utils/layout'
import { createVibe, exportVibe, parseVibe } from '../utils/vibe'
import type { LayoutSettings, VibeBundle } from '../types'

type Tab = 'layout' | 'vibes'

interface CustomizeSheetProps {
	visible: boolean
	onClose: () => void
}

interface StepperProps {
	label: string
	value: number
	min: number
	max: number
	step: number
	format?: (v: number) => string
	onChange: (v: number) => void
}

function Stepper({ label, value, min, max, step, format, onChange }: StepperProps) {
	const c = useSheetColors()
	const round = (v: number) => Math.round(v * 100) / 100
	const dec = () => onChange(Math.max(min, round(value - step)))
	const inc = () => onChange(Math.min(max, round(value + step)))
	const btn = [styles.stepBtn, { borderColor: c.border, backgroundColor: c.surfaceAlt }]

	return (
		<View style={styles.stepRow}>
			<Text style={[styles.stepLabel, { color: c.text }]}>{label}</Text>
			<View style={styles.stepControls}>
				<TouchableOpacity style={btn} onPress={dec} disabled={value <= min} accessibilityLabel={`Decrease ${label}`}>
					<Ionicons name="remove" size={18} color={c.text} />
				</TouchableOpacity>
				<Text style={[styles.stepValue, { color: c.textSecondary }]}>
					{format ? format(value) : String(value)}
				</Text>
				<TouchableOpacity style={btn} onPress={inc} disabled={value >= max} accessibilityLabel={`Increase ${label}`}>
					<Ionicons name="add" size={18} color={c.text} />
				</TouchableOpacity>
			</View>
		</View>
	)
}

function LayoutTab() {
	const theme = useTheme()
	const c = useSheetColors()
	const accent = c.accent
	const pm = usePillMetrics()
	const layout = useLayoutStore((s) => s.layout)
	const setLayout = useLayoutStore((s) => s.setLayout)
	const replaceLayout = useLayoutStore((s) => s.replaceLayout)
		const pct = (v: number) => `${Math.round(v * 100)}%`

	const set = (patch: Partial<LayoutSettings>) => {
		Haptics.selectionAsync()
		setLayout(patch)
	}

	return (
		<>
			<View
				style={[
					styles.preview,
					{
						backgroundColor: c.surfaceAlt,
						borderRadius: theme.metrics.borderRadiusMedium,
						padding: theme.metrics.cardPadding,
					},
				]}
			>
				<View style={styles.previewPills}>
					{['Chill', 'Workout', 'Party'].map((label, i) => (
						<View
							key={label}
							style={{
								paddingHorizontal: pm.paddingHorizontal,
								paddingVertical: pm.paddingVertical,
								borderRadius: pm.borderRadius,
								borderWidth: 1,
								borderColor: i === 0 ? accent : c.border,
								backgroundColor: i === 0 ? accent : 'transparent',
							}}
						>
							<Text
								style={{
									fontSize: pm.fontSize,
									fontWeight: '700',
									color: i === 0 ? c.onAccent : c.text,
								}}
							>
								{label}
							</Text>
						</View>
					))}
				</View>
				<Text style={{ color: c.textSecondary, fontSize: 12 }}>Live preview</Text>
			</View>

			<Text style={[styles.section, { color: c.textSecondary }]}>PRESETS</Text>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
				{LAYOUT_PRESETS.map((p) => {
					const active = (Object.keys(DEFAULT_LAYOUT) as (keyof LayoutSettings)[]).every(
						(k) => layout[k] === p.settings[k]
					)
					return (
						<TouchableOpacity
							key={p.id}
							onPress={() => {
								Haptics.selectionAsync()
								replaceLayout(p.settings)
							}}
							style={[
								styles.preset,
								{
									borderColor: active ? accent : c.border,
									backgroundColor: active ? accent + '30' : 'transparent',
								},
							]}
						>
							<Text style={{ color: c.text, fontWeight: active ? '700' : '500' }}>{p.name}</Text>
						</TouchableOpacity>
					)
				})}
			</ScrollView>

			<Text style={[styles.section, { color: c.textSecondary }]}>PILLS</Text>
			<Stepper label="Size" value={layout.pillScale} min={0.8} max={1.5} step={0.05} format={pct} onChange={(v) => set({ pillScale: v })} />
			<Stepper label="Roundness" value={layout.pillRoundness} min={0} max={1} step={0.1} format={pct} onChange={(v) => set({ pillRoundness: v })} />

			<Text style={[styles.section, { color: c.textSecondary }]}>CARDS</Text>
			<Stepper label="Corner radius" value={layout.cornerScale} min={0.4} max={1.8} step={0.1} format={pct} onChange={(v) => set({ cornerScale: v })} />
			<Stepper label="Padding" value={layout.paddingScale} min={0.6} max={1.6} step={0.1} format={pct} onChange={(v) => set({ paddingScale: v })} />

			<Text style={[styles.section, { color: c.textSecondary }]}>TAB BAR</Text>
			<Stepper label="Icon size" value={layout.tabIconSize} min={18} max={30} step={2} format={(v) => `${v}px`} onChange={(v) => set({ tabIconSize: v })} />
			<View style={styles.stepRow}>
				<Text style={[styles.stepLabel, { color: c.text }]}>Show labels</Text>
				<Switch
					value={layout.showTabLabels}
					onValueChange={(v) => set({ showTabLabels: v })}
					trackColor={{ true: accent, false: c.border }}
				/>
			</View>

			<TouchableOpacity
				onPress={() => replaceLayout(DEFAULT_LAYOUT)}
				disabled={isDefaultLayout(layout)}
				style={[styles.resetBtn, { opacity: isDefaultLayout(layout) ? 0.4 : 1, borderColor: c.border }]}
			>
				<Text style={{ color: c.textSecondary, fontWeight: '600' }}>Reset to default</Text>
			</TouchableOpacity>
		</>
	)
}

function VibesTab() {
	const c = useSheetColors()
	const accent = c.accent
		const vibes = useVibeStore((s) => s.vibes)
	const authorName = useVibeStore((s) => s.authorName)
	const setAuthorName = useVibeStore((s) => s.setAuthorName)
	const saveVibe = useVibeStore((s) => s.saveVibe)
	const deleteVibe = useVibeStore((s) => s.deleteVibe)
	const applyVibe = useVibeStore((s) => s.applyVibe)

	const [name, setName] = useState('')
	const [importText, setImportText] = useState('')

	const handleSave = useCallback(() => {
		if (!name.trim()) {
			Alert.alert('Name your vibe', 'Give it a name so you can find it later.')
			return
		}
		// Use the base theme (not the layout-scaled one) so the layout isn't applied twice on import.
		const baseTheme = useThemeStore.getState().getActiveTheme()
		const bundle = createVibe({
			name,
			author: authorName,
			theme: baseTheme,
			layout: useLayoutStore.getState().layout,
			playlist: useAutoPlaylistStore.getState().defaultConfig ?? undefined,
		})
		saveVibe(bundle)
		setName('')
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
	}, [name, authorName, saveVibe])

	const handleShare = useCallback(async (bundle: VibeBundle) => {
		try {
			await Share.share({ message: exportVibe(bundle), title: bundle.name })
		} catch {
			Alert.alert('Could not share', 'Sharing was cancelled or is unavailable.')
		}
	}, [])

	const handleApply = useCallback(
		async (bundle: VibeBundle) => {
			await applyVibe(bundle)
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
		},
		[applyVibe]
	)

	const handleImport = useCallback(() => {
		const parsed = parseVibe(importText.trim())
		if (!parsed) {
			Alert.alert('Invalid vibe', 'That text is not a valid shared vibe.')
			return
		}
		saveVibe(parsed)
		setImportText('')
		Alert.alert('Vibe added', `"${parsed.name}" by ${parsed.author} is in your list. Tap Apply to use it.`)
	}, [importText, saveVibe])

	const input = [
		styles.input,
		{ color: c.text, borderColor: c.border, backgroundColor: c.surfaceAlt },
	]

	return (
		<>
			<Text style={[styles.section, { color: c.textSecondary }]}>SAVE CURRENT LOOK</Text>
			<TextInput
				style={input}
				value={authorName}
				onChangeText={setAuthorName}
				placeholder="Your creator name"
				placeholderTextColor={c.textMuted}
				maxLength={40}
			/>
			<View style={styles.inlineRow}>
				<TextInput
					style={[...input, { flex: 1 }]}
					value={name}
					onChangeText={setName}
					placeholder="Vibe name"
					placeholderTextColor={c.textMuted}
					maxLength={60}
				/>
				<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: accent }]} onPress={handleSave}>
					<Text style={{ color: c.onAccent, fontWeight: '700' }}>Save</Text>
				</TouchableOpacity>
			</View>
			<Text style={[styles.hint, { color: c.textMuted }]}>
				Bundles your theme, layout and Smart Mix settings. It never includes your songs or listening data.
			</Text>

			<Text style={[styles.section, { color: c.textSecondary }]}>MY VIBES</Text>
			{vibes.length === 0 && <Text style={[styles.hint, { color: c.textMuted }]}>Nothing saved yet.</Text>}
			{vibes.map(({ id, bundle }) => (
				<View key={id} style={[styles.vibeRow, { borderColor: c.border }]}>
					<View style={{ flex: 1 }}>
						<Text style={{ color: c.text, fontWeight: '700' }} numberOfLines={1}>{bundle.name}</Text>
						<Text style={{ color: c.textMuted, fontSize: 12 }} numberOfLines={1}>by {bundle.author}</Text>
					</View>
					<TouchableOpacity style={[styles.smallBtn, { backgroundColor: accent }]} onPress={() => handleApply(bundle)}>
						<Text style={{ color: c.onAccent, fontWeight: '700', fontSize: 12 }}>Apply</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.iconBtn} onPress={() => handleShare(bundle)} accessibilityLabel="Share vibe">
						<Ionicons name="share-outline" size={20} color={accent} />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.iconBtn}
						onPress={() =>
							Alert.alert('Delete vibe', `Remove "${bundle.name}"?`, [
								{ text: 'Cancel', style: 'cancel' },
								{ text: 'Delete', style: 'destructive', onPress: () => deleteVibe(id) },
							])
						}
						accessibilityLabel="Delete vibe"
					>
						<Ionicons name="trash-outline" size={20} color={c.textMuted} />
					</TouchableOpacity>
				</View>
			))}

			<Text style={[styles.section, { color: c.textSecondary }]}>IMPORT A VIBE</Text>
			<TextInput
				style={[...input, styles.importInput]}
				value={importText}
				onChangeText={setImportText}
				placeholder="Paste a shared vibe here..."
				placeholderTextColor={c.textMuted}
				multiline
			/>
			<TouchableOpacity
				style={[styles.primaryBtn, { backgroundColor: accent, alignSelf: 'flex-end', opacity: importText.trim() ? 1 : 0.5 }]}
				onPress={handleImport}
				disabled={!importText.trim()}
			>
				<Text style={{ color: c.onAccent, fontWeight: '700' }}>Import</Text>
			</TouchableOpacity>
		</>
	)
}

export function CustomizeSheet({ visible, onClose }: CustomizeSheetProps) {
	const c = useSheetColors()
	const accent = c.accent
	const [tab, setTab] = useState<Tab>('layout')
	
	return (
		<Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={[styles.sheet, { backgroundColor: c.surface }]}>
					<View style={styles.header}>
						<Text style={[styles.title, { color: c.text }]}>Customize</Text>
						<TouchableOpacity onPress={onClose} accessibilityLabel="Close">
							<Ionicons name="close" size={24} color={c.text} />
						</TouchableOpacity>
					</View>
					<View style={styles.tabs}>
						{(['layout', 'vibes'] as Tab[]).map((t) => (
							<TouchableOpacity
								key={t}
								onPress={() => setTab(t)}
								style={[styles.tab, { backgroundColor: tab === t ? accent : c.surfaceAlt }]}
							>
								<Text
									style={{
										color: tab === t ? c.onAccent : c.textSecondary,
										fontWeight: '700',
									}}
								>
									{t === 'layout' ? 'Layout' : 'Vibes'}
								</Text>
							</TouchableOpacity>
						))}
					</View>
					<ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
						{tab === 'layout' ? <LayoutTab /> : <VibesTab />}
					</ScrollView>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
	sheet: { maxHeight: '88%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16 },
	header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
	title: { fontSize: 22, fontWeight: '800' },
	tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
	tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 18 },
	body: { paddingHorizontal: 20, paddingBottom: 40 },
	section: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 18, marginBottom: 8 },
	preview: { gap: 10, marginTop: 4 },
	previewPills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
	presetRow: { gap: 8 },
	preset: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
	stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 },
	stepLabel: { fontSize: 15, fontWeight: '500' },
	stepControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	stepBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
	stepValue: { minWidth: 48, textAlign: 'center', fontVariant: ['tabular-nums'] },
	resetBtn: { marginTop: 20, alignItems: 'center', paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
	input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 8 },
	importInput: { minHeight: 90, textAlignVertical: 'top' },
	inlineRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
	primaryBtn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, alignItems: 'center' },
	hint: { fontSize: 12, lineHeight: 17 },
	vibeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
	smallBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
	iconBtn: { padding: 6 },
})
