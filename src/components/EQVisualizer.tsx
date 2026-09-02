import React, { useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from './ThemeProvider'
import { useEQStore } from '../stores/eqStore'
import { EQ_PRESETS, EQ_MIN_GAIN, EQ_MAX_GAIN } from '../constants/eqPresets'
import { useHapticFeedback } from '../hooks/useHapticFeedback'

/**
 * Visual equalizer display with draggable vertical bars for each frequency band.
 * Includes preset selection buttons.
 */
export function EQVisualizer() {
	const theme = useTheme()
	const haptic = useHapticFeedback()
	const bands = useEQStore((s) => s.bands)
	const activePreset = useEQStore((s) => s.activePreset)
	const isEnabled = useEQStore((s) => s.isEnabled)
	const setBandGain = useEQStore((s) => s.setBandGain)
	const applyPreset = useEQStore((s) => s.applyPreset)
	const toggleEQ = useEQStore((s) => s.toggleEQ)

	const handlePresetSelect = useCallback(
		(presetId: string) => {
			haptic.medium()
			applyPreset(presetId)
		},
		[applyPreset, haptic]
	)

	const handleToggle = useCallback(() => {
		haptic.light()
		toggleEQ()
	}, [toggleEQ, haptic])

	// Map gain to bar height (0dB = 50%, +12dB = 100%, -12dB = 0%)
	const gainToHeight = (gain: number): number => {
		return ((gain - EQ_MIN_GAIN) / (EQ_MAX_GAIN - EQ_MIN_GAIN)) * 100
	}

	return (
		<View style={styles.container}>
			{/* EQ Toggle */}
			<TouchableOpacity
				style={[
					styles.toggleButton,
					theme.id === 'frutiger-aero' ? {
						backgroundColor: isEnabled ? theme.colors.accentPrimary : 'rgba(255, 255, 255, 0.50)',
						borderRadius: 12,
						borderWidth: 1,
						borderColor: 'rgba(255, 255, 255, 0.70)',
					} : {
						backgroundColor: isEnabled
							? theme.colors.accentPrimary + '20'
							: theme.colors.controlBackground,
						borderRadius: theme.metrics.borderRadiusSmall,
						borderWidth: 1,
						borderColor: isEnabled
							? theme.colors.accentPrimary
							: theme.colors.divider,
					},
				]}
				onPress={handleToggle}
			>
				<Text
					style={[
						styles.toggleText,
						theme.id === 'frutiger-aero' ? {
							color: isEnabled ? '#FFFFFF' : theme.colors.textPrimary,
							fontFamily: 'Rajdhani_700Bold',
							fontSize: 13,
						} : {
							color: isEnabled
								? theme.colors.accentPrimary
								: theme.colors.textSecondary,
						},
					]}
				>
					EQ {isEnabled ? 'ENABLED' : 'DISABLED'}
				</Text>
			</TouchableOpacity>

			{/* Frequency Bands on Dark Glass */}
			<View
				style={[
					styles.bandsContainer,
					theme.id === 'frutiger-aero' && {
						backgroundColor: 'rgba(14, 58, 88, 0.58)',
						borderRadius: 14,
						borderWidth: 1,
						borderColor: 'rgba(255, 255, 255, 0.22)',
						paddingTop: 18,
						paddingBottom: 14,
					},
					{ opacity: isEnabled ? 1 : 0.5 },
				]}
			>
				{/* Center line (0 dB) */}
				<View
					style={[
						styles.centerLine,
						{ backgroundColor: theme.id === 'frutiger-aero' ? 'rgba(255, 255, 255, 0.15)' : theme.colors.divider },
					]}
				/>

				{bands.map((band, index) => {
					const height = gainToHeight(band.gain)
					const isPositive = band.gain >= 0

					return (
						<View key={band.label} style={styles.bandColumn}>
							{/* Gain value */}
							<Text
								style={[
									styles.gainText,
									{
										color: theme.id === 'frutiger-aero' ? '#EAF7FC' : theme.colors.textSecondary,
										fontSize: 10,
										fontFamily: theme.id === 'frutiger-aero' ? 'Orbitron_600SemiBold' : undefined,
									},
								]}
							>
								{band.gain > 0 ? `+${band.gain}` : band.gain}
							</Text>

							{/* Bar container */}
							<View style={[
								styles.barContainer,
								theme.id === 'frutiger-aero' && { width: 6 }
							]}>
								<LinearGradient
									colors={
										theme.id === 'frutiger-aero'
											? ['#2196F3', '#3ECB7C']
											: isPositive
												? (theme.colors.accentGradient as [string, string, ...string[]])
												: ['#FF6B6B', '#EE5A5A']
									}
									start={{ x: 0, y: 1 }}
									end={{ x: 0, y: 0 }}
									style={[
										styles.bar,
										{
											height: `${Math.abs(band.gain / EQ_MAX_GAIN) * 50}%`,
											bottom: isPositive ? '50%' : undefined,
											top: isPositive ? undefined : '50%',
											borderRadius: 3,
										},
									]}
								/>
							</View>

							{/* Frequency label */}
							<Text
								style={[
									styles.freqLabel,
									{
										color: theme.id === 'frutiger-aero' ? '#BEE3EF' : theme.colors.textMuted,
										fontSize: 10,
										fontFamily: theme.id === 'frutiger-aero' ? 'Orbitron_600SemiBold' : undefined,
									},
								]}
							>
								{band.label}
							</Text>

							{/* Touch targets for adjustment */}
							<View style={styles.touchTargets}>
								<TouchableOpacity
									style={styles.touchUp}
									onPress={() => {
										if (isEnabled) {
											haptic.selection()
											setBandGain(index, Math.min(band.gain + 1, EQ_MAX_GAIN))
										}
									}}
								>
									<Text style={[styles.adjustText, { color: theme.id === 'frutiger-aero' ? '#BEE3EF' : theme.colors.textMuted }]}>+</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.touchDown}
									onPress={() => {
										if (isEnabled) {
											haptic.selection()
											setBandGain(index, Math.max(band.gain - 1, EQ_MIN_GAIN))
										}
									}}
								>
									<Text style={[styles.adjustText, { color: theme.id === 'frutiger-aero' ? '#BEE3EF' : theme.colors.textMuted }]}>-</Text>
								</TouchableOpacity>
							</View>
						</View>
					)
				})}
			</View>

			{/* Presets */}
			<View style={styles.presetsContainer}>
				<Text
					style={[
						styles.presetsLabel,
						{
							color: theme.colors.textSecondary,
							fontSize: theme.typography.captionSize,
							fontWeight: theme.typography.captionWeight,
						},
					]}
				>
					Presets
				</Text>
				<View style={styles.presetsList}>
					{EQ_PRESETS.filter((p) => p.id !== 'custom').map((preset) => (
						<TouchableOpacity
							key={preset.id}
							style={[
								styles.presetChip,
								{
									backgroundColor:
										activePreset === preset.id
											? theme.colors.accentPrimary + '20'
											: theme.colors.controlBackground,
									borderRadius: theme.metrics.borderRadiusSmall,
									borderWidth: 1,
									borderColor:
										activePreset === preset.id
											? theme.colors.accentPrimary
											: theme.colors.divider,
								},
							]}
							onPress={() => handlePresetSelect(preset.id)}
						>
							<Ionicons 
								name={preset.icon as any} 
								size={14} 
								color={activePreset === preset.id ? theme.colors.accentPrimary : theme.colors.textSecondary} 
								style={styles.presetIcon} 
							/>
							<Text
								style={[
									styles.presetName,
									{
										color:
											activePreset === preset.id
												? theme.colors.accentPrimary
												: theme.colors.textSecondary,
										fontSize: theme.typography.captionSize - 1,
									},
								]}
							>
								{preset.name}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		gap: 20,
	},
	toggleButton: {
		alignSelf: 'center',
		paddingHorizontal: 24,
		paddingVertical: 10,
	},
	toggleText: {
		fontSize: 14,
		fontWeight: '700',
		letterSpacing: 1,
	},
	bandsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		height: 180,
		paddingHorizontal: 8,
	},
	centerLine: {
		position: 'absolute',
		left: 8,
		right: 8,
		height: 1,
		top: '50%',
	},
	bandColumn: {
		alignItems: 'center',
		flex: 1,
		height: '100%',
		justifyContent: 'center',
	},
	gainText: {
		fontWeight: '600',
		marginBottom: 4,
		fontVariant: ['tabular-nums'],
	},
	barContainer: {
		width: 16,
		height: 100,
		position: 'relative',
	},
	bar: {
		position: 'absolute',
		width: '100%',
	},
	freqLabel: {
		marginTop: 4,
		fontWeight: '500',
	},
	touchTargets: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: -4,
		right: -4,
	},
	touchUp: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	touchDown: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	adjustText: {
		fontSize: 16,
		fontWeight: '700',
		opacity: 0.4,
	},
	presetsContainer: {
		gap: 10,
	},
	presetsLabel: {
		marginLeft: 4,
	},
	presetsList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	presetChip: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		gap: 4,
	},
	presetIcon: {
		fontSize: 14,
	},
	presetName: {
		fontWeight: '500',
	},
})
