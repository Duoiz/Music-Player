import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from './ThemeProvider'
import { AnimatedButton } from './AnimatedButton'
import type { ThemeStyle } from '../types'

interface ThemeCardProps {
	themeStyle: ThemeStyle
	isActive: boolean
	isLocked: boolean
	onPress: () => void
	onRemix?: () => void
}

/**
 * Preview card for the theme store.
 * Shows a mini mockup of the theme colors, name, author,
 * and free/premium badge.
 */
export function ThemeCard({ themeStyle, isActive, isLocked, onPress, onRemix }: ThemeCardProps) {
	const currentTheme = useTheme()

	return (
		<AnimatedButton
			style={[
				styles.container,
				{
					borderRadius: currentTheme.metrics.borderRadiusMedium,
					borderWidth: isActive ? (currentTheme.id === 'frutiger-aero' ? 2 : 2.5) : 1,
					borderColor: isActive
						? (currentTheme.id === 'frutiger-aero' ? 'rgba(0,200,255,0.8)' : currentTheme.colors.accentPrimary)
						: currentTheme.colors.divider,
					shadowColor: isActive && currentTheme.id === 'frutiger-aero' ? 'rgba(0,200,255,0.8)' : currentTheme.metrics.shadowMedium.color,
					shadowOffset: isActive && currentTheme.id === 'frutiger-aero' ? { width: 0, height: 0 } : currentTheme.metrics.shadowMedium.offset,
					shadowOpacity: isActive ? (currentTheme.id === 'frutiger-aero' ? 1 : 0.3) : 0.1,
					shadowRadius: isActive && currentTheme.id === 'frutiger-aero' ? 10 : currentTheme.metrics.shadowMedium.radius,
					elevation: currentTheme.metrics.shadowMedium.elevation,
					opacity: isLocked ? 0.7 : 1,
					backgroundColor: currentTheme.colors.cardGradient[0],
				},
			]}
			onPress={onPress}
			activeScale={0.95}
		>
			{/* Theme Preview — mini gradient mockup */}
			<LinearGradient
				colors={themeStyle.colors.backgroundGradient as [string, string, ...string[]]}
				start={themeStyle.colors.backgroundGradientStart}
				end={themeStyle.colors.backgroundGradientEnd}
				style={[
					styles.preview,
					{ borderRadius: currentTheme.metrics.borderRadiusMedium - 2 },
				]}
			>
				{/* Mini player mockup */}
				<View style={styles.mockup}>
					{/* Album art placeholder */}
					<LinearGradient
						colors={themeStyle.colors.cardGradient as [string, string, ...string[]]}
						style={[styles.mockupCard, { borderRadius: 8 }]}
					>
						<View
							style={[
								styles.mockupAlbum,
								{ backgroundColor: themeStyle.colors.controlBackground },
							]}
						/>
						{/* Progress bar */}
						<View
							style={[
								styles.mockupProgress,
								{ backgroundColor: themeStyle.colors.progressTrack },
							]}
						>
							<LinearGradient
								colors={themeStyle.colors.progressFillGradient as [string, string, ...string[]]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={[styles.mockupProgressFill, { width: '60%' }]}
							/>
						</View>
						{/* Play button */}
						<View style={styles.mockupControls}>
							<LinearGradient
								colors={themeStyle.colors.accentGradient as [string, string, ...string[]]}
								style={styles.mockupPlayBtn}
							>
								<Ionicons name="play" size={8} color={themeStyle.colors.textOnAccent} />
							</LinearGradient>
						</View>
					</LinearGradient>
				</View>

				{/* Lock overlay */}
				{isLocked && (
					<View style={styles.lockOverlay}>
						<Ionicons name="lock-closed" size={16} color={themeStyle.colors.textPrimary} style={styles.lockIcon} />
					</View>
				)}
			</LinearGradient>

			{/* Theme info */}
			<View style={styles.info}>
				<View style={styles.nameRow}>
					<Text
						style={[
							styles.name,
							{
								color: currentTheme.colors.textPrimary,
								fontSize: currentTheme.typography.bodySize - 1,
								fontFamily: currentTheme.id === 'frutiger-aero' ? 'Rajdhani_600SemiBold' : undefined,
							},
						]}
						numberOfLines={1}
					>
						{themeStyle.name}
					</Text>
					{themeStyle.isPremium && (
						<View
							style={[
								styles.premiumBadge,
								{ backgroundColor: currentTheme.colors.accentPrimary + '20' },
							]}
						>
							<Text
								style={[
									styles.premiumText,
									{ color: currentTheme.colors.accentPrimary },
								]}
							>
								PRO
							</Text>
						</View>
					)}
					{themeStyle.badge && (
						<View
							style={[
								styles.customBadge,
								{ backgroundColor: '#DAA52025', borderColor: '#DAA520' },
							]}
						>
							<Text style={[styles.customBadgeText, { color: '#DAA520' }]}>
								{themeStyle.badge}
							</Text>
						</View>
					)}
				</View>

				<Text
					style={[
						styles.author,
						{ color: currentTheme.colors.textSecondary, fontSize: currentTheme.typography.captionSize },
					]}
					numberOfLines={1}
				>
					by {themeStyle.author}
				</Text>

				{/* Lineage Attribution */}
				{themeStyle.forkedFrom && (
					<View style={styles.lineageBadge}>
						<Ionicons name="git-branch-outline" size={10} color={currentTheme.colors.accentPrimary} />
						<Text
							style={[styles.lineageText, { color: currentTheme.colors.accentPrimary }]}
							numberOfLines={1}
						>
							Forked @{themeStyle.forkedFrom.author}
						</Text>
					</View>
				)}

				{/* Footer Actions */}
				{onRemix && (
					<TouchableOpacity
						onPress={(e) => {
							e.stopPropagation()
							onRemix()
						}}
						style={[
							styles.remixBtn,
							{
								backgroundColor: `${currentTheme.colors.accentPrimary}15`,
								borderColor: `${currentTheme.colors.accentPrimary}40`,
							},
						]}
						hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
					>
						<Ionicons name="git-branch-outline" size={12} color={currentTheme.colors.accentPrimary} />
						<Text style={[styles.remixBtnText, { color: currentTheme.colors.accentPrimary }]}>
							Remix
						</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* Active indicator */}
			{isActive && (
				<View
					style={[
						styles.activeIndicator,
						{ backgroundColor: currentTheme.colors.accentPrimary },
					]}
				>
					<Ionicons name="checkmark-circle" size={24} color={themeStyle.colors.accentPrimary} style={styles.activeIcon} />
				</View>
			)}
		</AnimatedButton>
	)
}

const styles = StyleSheet.create({
	container: {
		overflow: 'hidden',
		width: '47%',
		marginBottom: 16,
	},
	preview: {
		height: 120,
		padding: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	mockup: {
		width: '100%',
	},
	mockupCard: {
		padding: 10,
		gap: 8,
	},
	mockupAlbum: {
		width: 36,
		height: 36,
		borderRadius: 6,
		alignSelf: 'center',
		opacity: 0.6,
	},
	mockupProgress: {
		height: 3,
		borderRadius: 1.5,
		overflow: 'hidden',
	},
	mockupProgressFill: {
		height: '100%',
	},
	mockupControls: {
		alignItems: 'center',
		marginTop: 2,
	},
	mockupPlayBtn: {
		width: 20,
		height: 20,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	lockOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 16,
	},
	lockIcon: {
		fontSize: 24,
	},
	info: {
		padding: 10,
		gap: 2,
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	name: {
		fontWeight: '600',
		flex: 1,
	},
	premiumBadge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
	},
	premiumText: {
		fontSize: 9,
		fontWeight: '800',
	},
	author: {
		fontWeight: '400',
	},
	activeIndicator: {
		position: 'absolute',
		top: 8,
		right: 8,
		width: 22,
		height: 22,
		borderRadius: 11,
		justifyContent: 'center',
		alignItems: 'center',
	},
	activeIcon: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '700',
	},
	customBadge: {
		paddingHorizontal: 5,
		paddingVertical: 1.5,
		borderRadius: 4,
		borderWidth: 0.8,
	},
	customBadgeText: {
		fontSize: 8,
		fontWeight: '800',
		letterSpacing: 0.3,
	},
	lineageBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		marginTop: 2,
	},
	lineageText: {
		fontSize: 9,
		fontWeight: '600',
	},
	remixBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		gap: 4,
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 6,
		borderWidth: 1,
		marginTop: 6,
	},
	remixBtnText: {
		fontSize: 10,
		fontWeight: '700',
	},
})


