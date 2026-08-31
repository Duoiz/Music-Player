import React from 'react'
import { Tabs } from 'expo-router'
import { TabBar } from '../../src/components/TabBar'

/**
 * Tab layout — 4 tabs with custom glass-styled tab bar.
 * The TabBar component handles rendering the MiniPlayer above the tabs.
 */
export default function TabLayout() {
	return (
		<Tabs
			tabBar={(props) => <TabBar {...props} />}
			screenOptions={{
				headerShown: false,
			}}
		>
			<Tabs.Screen name="index" />
			<Tabs.Screen name="library" />
			<Tabs.Screen name="equalizer" />
			<Tabs.Screen name="themes" />
		</Tabs>
	)
}
