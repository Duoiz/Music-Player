import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View, LayoutChangeEvent } from 'react-native'
import { BlurView } from 'expo-blur'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from './ThemeProvider'
import { MiniPlayer } from './MiniPlayer'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'

/**
 * Custom bottom tab bar with floating pill design and draggable active scope.
 * Renders the MiniPlayer above the tabs when a song is playing.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	const theme = useTheme()
	const insets = useSafeAreaInsets()

	const [tabWidth, setTabWidth] = useState(0)
	const translateX = useSharedValue(0)

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

	// Sync shared value with navigation state
	useEffect(() => {
		if (tabWidth > 0) {
			const springConfig = theme.id === 'liquid-glass'
				? { damping: 20, stiffness: 150, mass: 1 } // more fluid and smooth
				: { damping: 25, stiffness: 350, mass: 0.8 }
				
			translateX.value = withSpring(state.index * tabWidth, springConfig)
		}
	}, [state.index, tabWidth, theme.id])

	const navigateToIndex = (index: number) => {
		const clampedIndex = Math.max(0, Math.min(index, state.routes.length - 1))
		const route = state.routes[clampedIndex]
		const event = navigation.emit({
			type: 'tabPress',
			target: route.key,
			canPreventDefault: true,
		})

		if (state.index !== clampedIndex && !event.defaultPrevented) {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
			navigation.navigate(route.name)
		}
	}

	// Pan gesture to drag the scope
	const pan = Gesture.Pan()
		.activeOffsetX([-10, 10]) // Require horizontal drag to claim gesture (preserves taps)
		.onChange((e) => {
			if (tabWidth > 0) {
				const minTranslate = 0
				const maxTranslate = tabWidth * (state.routes.length - 1)
				
				let newValue = translateX.value + e.changeX
				if (newValue < minTranslate) newValue = minTranslate
				if (newValue > maxTranslate) newValue = maxTranslate
				
				translateX.value = newValue
			}
		})
		.onEnd(() => {
			if (tabWidth > 0) {
				const targetIndex = Math.round(translateX.value / tabWidth)
				runOnJS(navigateToIndex)(targetIndex)
			}
		})

	const animatedScopeStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		}
	})

	const handleLayout = (e: LayoutChangeEvent) => {
		const totalWidth = e.nativeEvent.layout.width
		setTabWidth(totalWidth / state.routes.length)
	}

	const renderTabBar = () => (
		<GestureDetector gesture={pan}>
			<View style={styles.tabsRow} onLayout={handleLayout}>
				{tabWidth > 0 && (
					<Animated.View style={[styles.scope, animatedScopeStyle, { width: tabWidth }]} pointerEvents="none">
						<View style={[
							styles.scopeInner, 
							theme.id === 'frutiger-aero' 
								? { backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' }
								: theme.id === 'liquid-glass'
								? { backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.5)' }
								: { backgroundColor: theme.colors.accentPrimary + '30' }
						]} />
					</Animated.View>
				)}
				{state.routes.map((route, index) => {
					const isFocused = state.index === index
					const icon = tabIcons[route.name] || 'apps'
					const label = tabLabels[route.name] || route.name

					const onPress = () => navigateToIndex(index)

					return (
						<TouchableOpacity
							key={route.key}
							onPress={onPress}
							style={styles.tab}
							activeOpacity={0.7}
						>
							<Ionicons
								name={icon as keyof typeof Ionicons.glyphMap}
								size={22}
								color={isFocused ? theme.colors.tabBarActive : theme.colors.tabBarInactive}
								style={[
									styles.tabIcon,
									{ opacity: isFocused ? 1 : 0.6 },
									theme.id === 'frutiger-aero' && isFocused && {
										textShadowColor: 'rgba(255,255,255,0.8)',
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
										fontWeight: isFocused ? '700' : '500',
										fontSize: theme.id === 'frutiger-aero' ? 10 : theme.typography.captionSize - 1,
										fontFamily: theme.id === 'frutiger-aero' ? 'Orbitron_600SemiBold' : undefined,
										textTransform: theme.id === 'frutiger-aero' ? 'uppercase' : 'none',
										letterSpacing: theme.id === 'frutiger-aero' ? 1 : 0,
									},
									theme.id === 'frutiger-aero' && isFocused && {
										textShadowColor: 'rgba(255,255,255,0.8)',
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
		</GestureDetector>
	)

	return (
		<View style={[styles.outerContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
			<MiniPlayer />
			<View style={styles.navShadowContainer}>
				{theme.useBlur ? (
					<BlurView
						intensity={theme.metrics.blurIntensity}
						tint={theme.id === 'frutiger-aero' ? 'light' : 'default'}
						style={[
							styles.floatingNav,
							{
								borderColor: theme.id === 'frutiger-aero' ? 'rgba(255,255,255,0.5)' : theme.colors.divider,
							}
						]}
					>
						{renderTabBar()}
					</BlurView>
				) : (
					<View
						style={[
							styles.floatingNav,
							{
								backgroundColor: theme.colors.tabBarBackground,
								borderColor: theme.colors.divider,
							}
						]}
					>
						{renderTabBar()}
					</View>
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	outerContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 20, // Add spacing to sides for floating effect
	},
	navShadowContainer: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.15,
		shadowRadius: 20,
		elevation: 10,
	},
	floatingNav: {
		borderRadius: 100, // iOS perfect pill shape
		overflow: 'hidden',
		borderWidth: 1,
		marginTop: 8, // Gap above nav bar (between it and mini player)
	},
	tabsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 56, // Slightly tighter height for iOS pill feel
	},
	scope: {
		position: 'absolute',
		height: '100%',
		padding: 6, // Inset the pill so it doesn't touch the borders
		left: 0,
	},
	scopeInner: {
		flex: 1,
		borderRadius: 100, // Inner pill perfectly round
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	tab: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
		height: '100%',
		zIndex: 1, // Keep tabs above the scope so taps register
	},
	tabIcon: {
		fontSize: 22,
		marginBottom: 2,
	},
	tabLabel: {
		fontSize: 10,
	},
})
