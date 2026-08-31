import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { BlurView } from 'expo-blur'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from './ThemeProvider'
import { MiniPlayer } from './MiniPlayer'

/**
 * Custom bottom tab bar with Fruitiger Aero glass styling.
 * Renders the MiniPlayer above the tabs when a song is playing.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	const theme = useTheme()
	const insets = useSafeAreaInsets()

	const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
		index: 'search',
		library: 'albums',
		equalizer: 'options',
		themes: 'color-palette',
	}

	const tabLabels: Record<string, string> = {
		index: 'Search',
		library: 'Library',
		equalizer: 'EQ',
		themes: 'Themes',
	}

	const renderTabBar = () => (
		<View style={styles.tabsRow}>
			{state.routes.map((route, index) => {
				const isFocused = state.index === index
				const icon = tabIcons[route.name] || 'apps'
				const label = tabLabels[route.name] || route.name

				const onPress = () => {
					const event = navigation.emit({
						type: 'tabPress',
						target: route.key,
						canPreventDefault: true,
					})

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name)
					}
				}

				return (
					<TouchableOpacity
						key={route.key}
						onPress={onPress}
						style={[
							styles.tab,
							theme.id === 'frutiger-aero' && isFocused && {
								borderTopWidth: 2,
								borderTopColor: 'rgba(0,200,255,0.8)',
								backgroundColor: 'rgba(0,180,255,0.1)',
							}
						]}
						activeOpacity={0.7}
					>
						<Ionicons
							name={icon as keyof typeof Ionicons.glyphMap}
							size={22}
							color={isFocused ? theme.colors.tabBarActive : theme.colors.tabBarInactive}
							style={[
								styles.tabIcon,
								{ opacity: isFocused ? 1 : 0.5 },
								theme.id === 'frutiger-aero' && isFocused && {
									textShadowColor: 'rgba(0,200,255,0.8)',
									textShadowOffset: { width: 0, height: 0 },
									textShadowRadius: 8,
								}
							]}
						/>
						<Text
							style={[
								styles.tabLabel,
								{
									color: isFocused
										? theme.colors.tabBarActive
										: theme.colors.tabBarInactive,
									fontWeight: isFocused ? '600' : '400',
									fontSize: theme.id === 'frutiger-aero' ? 10 : theme.typography.captionSize - 1,
									fontFamily: theme.id === 'frutiger-aero' ? 'Orbitron_600SemiBold' : undefined,
									textTransform: theme.id === 'frutiger-aero' ? 'uppercase' : 'none',
									letterSpacing: theme.id === 'frutiger-aero' ? 1 : 0,
								},
								theme.id === 'frutiger-aero' && isFocused && {
									textShadowColor: 'rgba(0,200,255,0.8)',
									textShadowOffset: { width: 0, height: 0 },
									textShadowRadius: 8,
								}
							]}
						>
							{label}
						</Text>
					</TouchableOpacity>
				)
			})}
		</View>
	)

	// Use BlurView for themes that support it
	if (theme.useBlur) {
		return (
			<View style={styles.container}>
				<MiniPlayer />
				<BlurView
					intensity={theme.metrics.blurIntensity}
					style={[
						styles.blurContainer,
						{
							borderTopWidth: 0.5,
							borderTopColor: theme.colors.divider,
							paddingBottom: Math.max(insets.bottom, 12),
						},
					]}
				>
					{renderTabBar()}
				</BlurView>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<MiniPlayer />
			<View
				style={[
					styles.solidContainer,
					{
						backgroundColor: theme.colors.tabBarBackground,
						borderTopWidth: 0.5,
						borderTopColor: theme.colors.divider,
						paddingBottom: Math.max(insets.bottom, 12),
					},
				]}
			>
				{renderTabBar()}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
	},
	blurContainer: {
	},
	solidContainer: {
	},
	tabsRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingTop: 8,
		paddingBottom: 4,
	},
	tab: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 4,
		minWidth: 60,
		flex: 1,
		paddingTop: 8,
	},
	tabIcon: {
		fontSize: 22,
		marginBottom: 2,
	},
	tabLabel: {
		fontSize: 10,
	},
})


