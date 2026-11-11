export interface LayoutSettings {
	pillScale: number // 0.8 - 1.5, scales pill padding, text and icon
	pillRoundness: number // 0 (squared) - 1 (fully round)
	cornerScale: number // 0.4 - 1.8, multiplies theme corner radii
	paddingScale: number // 0.6 - 1.6, multiplies card padding
	tabIconSize: number // 18 - 30
	showTabLabels: boolean
}

export interface LayoutPreset {
	id: string
	name: string
	settings: LayoutSettings
}
