import React, { useEffect, useState } from 'react'
import { Stack, SplashScreen } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import TrackPlayer from 'react-native-track-player'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet, ActivityIndicator, View, Text, PermissionsAndroid, Platform } from 'react-native'
import { ThemeProvider } from '../src/components/ThemeProvider'
import { setupTrackPlayer } from '../src/services/trackPlayerSetup'
import { PlaybackService } from '../src/services/trackPlayerService'
import { useTrackPlayerSync } from '../src/hooks/useTrackProgress'
import {
	useFonts,
	Orbitron_400Regular,
	Orbitron_600SemiBold,
	Orbitron_700Bold,
} from '@expo-google-fonts/orbitron'
import {
	Rajdhani_400Regular,
	Rajdhani_500Medium,
	Rajdhani_600SemiBold,
	Rajdhani_700Bold,
} from '@expo-google-fonts/rajdhani'

// Prevent auto-hiding the splash screen until everything is ready
SplashScreen.preventAutoHideAsync()

// Register the playback service at the module level (runs once)
TrackPlayer.registerPlaybackService(() => PlaybackService)

/**
 * Inner component that syncs TrackPlayer state.
 * Must be inside ThemeProvider.
 */
function TrackPlayerSyncWrapper({ children }: { children: React.ReactNode }) {
	useTrackPlayerSync()
	return <>{children}</>
}

/**
 * Root layout — wraps the entire app with:
 * 1. GestureHandlerRootView (required for gesture-based components)
 * 2. ThemeProvider (provides active theme to all screens)
 * 3. TrackPlayer initialization
 * 4. Stack navigator (tabs + modal player)
 */
export default function RootLayout() {
	const [isReady, setIsReady] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [fontsLoaded] = useFonts({
		Orbitron_400Regular,
		Orbitron_600SemiBold,
		Orbitron_700Bold,
		Rajdhani_400Regular,
		Rajdhani_500Medium,
		Rajdhani_600SemiBold,
		Rajdhani_700Bold,
	})

	useEffect(() => {
		async function init() {
			try {
				if (Platform.OS === 'android' && Platform.Version >= 33) {
					await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
				}

				const success = await setupTrackPlayer()
				if (!success) {
					setError('Failed to initialize audio player')
				}
			} catch (err) {
				console.error('TrackPlayer init error:', err)
				setError('Failed to initialize audio player')
			} finally {
				setIsReady(true)
			}
		}
		init()
	}, [])

	useEffect(() => {
		if (isReady && fontsLoaded) {
			SplashScreen.hideAsync()
		}
	}, [isReady, fontsLoaded])

	if (!isReady || !fontsLoaded) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#00B050" />
				<Text style={styles.loadingText}>Loading player...</Text>
			</View>
		)
	}

	return (
		<GestureHandlerRootView style={styles.root}>
			<ThemeProvider>
				<TrackPlayerSyncWrapper>
					<StatusBar style="auto" />
					<Stack
						screenOptions={{
							headerShown: false,
							animation: 'slide_from_bottom',
						}}
					>
						<Stack.Screen name="(tabs)" />
						<Stack.Screen
							name="player"
							options={{
								presentation: 'modal',
								animation: 'slide_from_bottom',
							}}
						/>
					</Stack>
				</TrackPlayerSyncWrapper>
			</ThemeProvider>
		</GestureHandlerRootView>
	)
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#87CEEB',
		gap: 16,
	},
	loadingText: {
		color: '#1a1a1a',
		fontSize: 16,
		fontWeight: '500',
	},
})
