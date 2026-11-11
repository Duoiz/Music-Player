import React, { useMemo } from 'react'
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from './ThemeProvider'
import { useDeviceMediaStore } from '../stores/deviceMediaStore'
import { analyzeLibrary, ISSUE_LABELS, type LibraryIssue } from '../utils/libraryHealth'

interface LibraryHealthModalProps {
	visible: boolean
	onClose: () => void
}

export function LibraryHealthModal({ visible, onClose }: LibraryHealthModalProps) {
	const theme = useTheme()
	const deviceTracks = useDeviceMediaStore((s) => s.deviceTracks)

	const issues = useMemo(() => (visible ? analyzeLibrary(deviceTracks) : []), [visible, deviceTracks])

	const renderItem = ({ item }: { item: LibraryIssue }) => (
		<View style={[styles.row, { borderColor: theme.colors.divider }]}>
			<View style={{ flex: 1 }}>
				<Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }} numberOfLines={1}>
					{item.track.title || 'Untitled'}
				</Text>
				<Text style={{ color: theme.colors.textMuted, fontSize: 12 }} numberOfLines={1}>
					{item.detail}
				</Text>
			</View>
			<Text style={[styles.badge, { color: theme.colors.accentPrimary, borderColor: theme.colors.accentPrimary }]}>
				{ISSUE_LABELS[item.kind]}
			</Text>
		</View>
	)

	return (
		<Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={[styles.sheet, { backgroundColor: theme.colors.backgroundGradient[0] }]}>
					<View style={styles.header}>
						<View>
							<Text style={[styles.title, { color: theme.colors.textPrimary }]}>Library check</Text>
							<Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
								{deviceTracks.length === 0
									? 'Scan your device first.'
									: issues.length === 0
										? `All ${deviceTracks.length} songs look healthy.`
										: `${issues.length} possible issue${issues.length === 1 ? '' : 's'} in ${deviceTracks.length} songs`}
							</Text>
						</View>
						<TouchableOpacity onPress={onClose} accessibilityLabel="Close">
							<Ionicons name="close" size={24} color={theme.colors.textPrimary} />
						</TouchableOpacity>
					</View>
					<FlatList
						data={issues}
						keyExtractor={(item, i) => `${item.kind}-${item.track.id}-${i}`}
						renderItem={renderItem}
						contentContainerStyle={styles.list}
						initialNumToRender={14}
						windowSize={7}
					/>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
	sheet: { height: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16 },
	header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 12 },
	title: { fontSize: 22, fontWeight: '800' },
	list: { paddingHorizontal: 20, paddingBottom: 40 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
	badge: { fontSize: 11, fontWeight: '700', borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
})
