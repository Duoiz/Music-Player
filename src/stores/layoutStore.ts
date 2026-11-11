import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { LayoutSettings } from '../types'
import { DEFAULT_LAYOUT, getPillMetrics, sanitizeLayout, type PillMetrics } from '../utils/layout'

interface LayoutStore {
	layout: LayoutSettings
	setLayout: (patch: Partial<LayoutSettings>) => void
	replaceLayout: (layout: unknown) => void
	resetLayout: () => void
}

export const useLayoutStore = create<LayoutStore>()(
	persist(
		(set) => ({
			layout: DEFAULT_LAYOUT,
			setLayout: (patch) => set((s) => ({ layout: sanitizeLayout({ ...s.layout, ...patch }) })),
			replaceLayout: (layout) => set({ layout: sanitizeLayout(layout) }),
			resetLayout: () => set({ layout: DEFAULT_LAYOUT }),
		}),
		{
			name: 'layout-storage',
			storage: createJSONStorage(() => AsyncStorage),
			merge: (persisted, current) => ({
				...current,
				layout: sanitizeLayout((persisted as Partial<LayoutStore> | undefined)?.layout),
			}),
		}
	)
)

export function usePillMetrics(): PillMetrics {
	const layout = useLayoutStore((s) => s.layout)
	return getPillMetrics(layout)
}
