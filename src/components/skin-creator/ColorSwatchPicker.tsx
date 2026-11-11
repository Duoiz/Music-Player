import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import {
	BACKGROUND_PRESETS,
	ACCENT_PRESETS,
	GLASS_TINT_PRESETS,
	GradientPreset,
	AccentPreset,
	GlassTintPreset,
} from '../../utils/themeBuilder'

interface GradientPickerProps {
	selectedId: string
	onSelect: (preset: GradientPreset) => void
}

export function GradientPicker({ selectedId, onSelect }: GradientPickerProps) {
	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
			{BACKGROUND_PRESETS.map((preset) => {
				const isSelected = preset.id === selectedId
				return (
					<TouchableOpacity
						key={preset.id}
						activeOpacity={0.8}
						onPress={() => onSelect(preset)}
						style={[styles.gradientCard, isSelected && styles.selectedGradientCard]}
					>
						<LinearGradient
							colors={preset.colors as [string, string, ...string[]]}
							start={preset.start}
							end={preset.end}
							style={styles.gradientPreview}
						>
							{isSelected && (
								<View style={styles.checkBadge}>
									<Ionicons name="checkmark" size={14} color="#FFFFFF" />
								</View>
							)}
						</LinearGradient>
						<Text style={[styles.cardLabel, isSelected && styles.selectedCardLabel]} numberOfLines={1}>
							{preset.name}
						</Text>
					</TouchableOpacity>
				)
			})}
		</ScrollView>
	)
}

interface AccentPickerProps {
	selectedId: string
	onSelect: (preset: AccentPreset) => void
}

export function AccentPicker({ selectedId, onSelect }: AccentPickerProps) {
	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
			{ACCENT_PRESETS.map((preset) => {
				const isSelected = preset.id === selectedId
				return (
					<TouchableOpacity
						key={preset.id}
						activeOpacity={0.8}
						onPress={() => onSelect(preset)}
						style={styles.accentItem}
					>
						<View
							style={[
								styles.accentCircleOuter,
								isSelected && { borderColor: preset.primary, borderWidth: 2.5 },
							]}
						>
							<LinearGradient
								colors={preset.gradient as [string, string, ...string[]]}
								style={styles.accentCircleInner}
							>
								{isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
							</LinearGradient>
						</View>
						<Text style={[styles.accentLabel, isSelected && { color: preset.primary }]} numberOfLines={1}>
							{preset.name}
						</Text>
					</TouchableOpacity>
				)
			})}
		</ScrollView>
	)
}

interface GlassTintPickerProps {
	selectedId: string
	onSelect: (preset: GlassTintPreset) => void
}

export function GlassTintPicker({ selectedId, onSelect }: GlassTintPickerProps) {
	return (
		<View style={styles.grid}>
			{GLASS_TINT_PRESETS.map((preset) => {
				const isSelected = preset.id === selectedId
				return (
					<TouchableOpacity
						key={preset.id}
						activeOpacity={0.8}
						onPress={() => onSelect(preset)}
						style={[
							styles.tintCard,
							{
								backgroundColor: preset.isDark ? '#1e293b' : 'rgba(255,255,255,0.7)',
								borderColor: isSelected ? '#00e5ff' : preset.cardBorderColor,
								borderWidth: isSelected ? 2 : 1,
							},
						]}
					>
						<View style={styles.tintHeader}>
							<Text style={[styles.tintName, { color: preset.isDark ? '#FFFFFF' : '#0f172a' }]}>
								{preset.name}
							</Text>
							{isSelected && <Ionicons name="checkmark-circle" size={16} color="#00e5ff" />}
						</View>
						<Text style={[styles.tintMode, { color: preset.isDark ? '#94a3b8' : '#64748b' }]}>
							{preset.isDark ? 'Dark Glass' : 'Light Glass'}
						</Text>
					</TouchableOpacity>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		paddingVertical: 8,
		gap: 12,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	gradientCard: {
		width: 105,
		alignItems: 'center',
		gap: 6,
	},
	selectedGradientCard: {
		transform: [{ scale: 1.04 }],
	},
	gradientPreview: {
		width: 105,
		height: 60,
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: 'rgba(255, 255, 255, 0.4)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	checkBadge: {
		backgroundColor: 'rgba(0,0,0,0.4)',
		width: 22,
		height: 22,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cardLabel: {
		fontSize: 11,
		fontWeight: '600',
		color: 'rgba(255,255,255,0.8)',
		textAlign: 'center',
	},
	selectedCardLabel: {
		color: '#00e5ff',
		fontWeight: '700',
	},
	accentItem: {
		alignItems: 'center',
		gap: 4,
		width: 64,
	},
	accentCircleOuter: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 2,
	},
	accentCircleInner: {
		width: '100%',
		height: '100%',
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	accentLabel: {
		fontSize: 10,
		fontWeight: '600',
		color: 'rgba(255,255,255,0.7)',
		textAlign: 'center',
	},
	tintCard: {
		flex: 1,
		minWidth: '45%',
		padding: 12,
		borderRadius: 12,
		gap: 4,
	},
	tintHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	tintName: {
		fontSize: 13,
		fontWeight: '700',
	},
	tintMode: {
		fontSize: 10,
		fontWeight: '500',
	},
})
