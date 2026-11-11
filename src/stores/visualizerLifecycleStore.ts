import { create } from 'zustand'
import { AppState, AppStateStatus } from 'react-native'

interface VisualizerLifecycleState {
	isSuspended: boolean
	appState: AppStateStatus
	setSuspended: (suspended: boolean) => void
}

const RESUME_DELAY_MS = 2500 // 2.5 seconds after returning to foreground before visualizer kicks in

let resumeTimer: ReturnType<typeof setTimeout> | null = null

export const useVisualizerLifecycleStore = create<VisualizerLifecycleState>((set, get) => {
	// Initialize subscription to AppState
	const handleAppStateChange = (nextAppState: AppStateStatus) => {
		const currentAppState = get().appState
		set({ appState: nextAppState })

		if (nextAppState === 'background' || nextAppState === 'inactive') {
			// Clear any pending reactivation immediately
			if (resumeTimer) {
				clearTimeout(resumeTimer)
				resumeTimer = null
			}
			// Immediately suspend visualizer recalculation
			set({ isSuspended: true })
		} else if (nextAppState === 'active' && (currentAppState === 'background' || currentAppState === 'inactive')) {
			// App returned to foreground — wait a couple seconds before reactivating
			if (resumeTimer) {
				clearTimeout(resumeTimer)
			}
			resumeTimer = setTimeout(() => {
				resumeTimer = null
				set({ isSuspended: false })
			}, RESUME_DELAY_MS)
		}
	}

	AppState.addEventListener('change', handleAppStateChange)

	return {
		isSuspended: AppState.currentState !== 'active',
		appState: AppState.currentState,
		setSuspended: (suspended: boolean) => set({ isSuspended: suspended }),
	}
})
