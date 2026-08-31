import React, { useState, useCallback, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
	StyleSheet,
	TextInput,
	View,
	TouchableOpacity,
	Text,
	Animated,
} from 'react-native'
import { useTheme } from './ThemeProvider'

interface SearchBarProps {
	onSearch: (query: string) => void
	placeholder?: string
	isLoading?: boolean
}

/**
 * Animated search input with glass effect and debounced search.
 */
export function SearchBar({
	onSearch,
	placeholder = 'Search songs, artists...',
	isLoading = false,
}: SearchBarProps) {
	const theme = useTheme()
	const [query, setQuery] = useState('')
	const [isFocused, setIsFocused] = useState(false)
	const focusAnim = useRef(new Animated.Value(0)).current
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const handleFocus = useCallback(() => {
		setIsFocused(true)
		Animated.spring(focusAnim, {
			toValue: 1,
			useNativeDriver: false,
			tension: 40,
			friction: 7,
		}).start()
	}, [focusAnim])

	const handleBlur = useCallback(() => {
		setIsFocused(false)
		Animated.spring(focusAnim, {
			toValue: 0,
			useNativeDriver: false,
			tension: 40,
			friction: 7,
		}).start()
	}, [focusAnim])

	const handleChange = useCallback(
		(text: string) => {
			setQuery(text)
		},
		[]
	)

	const handleClear = useCallback(() => {
		setQuery('')
		onSearch('')
	}, [onSearch])

	const handleSubmit = useCallback(() => {
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current)
		}
		onSearch(query)
	}, [query, onSearch])

	const borderColor = focusAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [
			theme.id === 'frutiger-aero' ? 'rgba(0,100,180,0.3)' : theme.colors.cardBorderColor,
			theme.id === 'frutiger-aero' ? 'rgba(0,180,255,0.7)' : theme.colors.accentPrimary
		],
	})

	return (
		<Animated.View
			style={[
				styles.container,
				{
					backgroundColor: theme.id === 'frutiger-aero' ? 'rgba(0,30,70,0.55)' : theme.colors.controlBackground,
					borderRadius: theme.metrics.borderRadiusMedium,
					borderColor: borderColor,
					borderWidth: 1.5,
					shadowColor: theme.id === 'frutiger-aero' ? 'rgba(0,180,255,0.4)' : theme.metrics.shadowLight.color,
					shadowOffset: theme.metrics.shadowLight.offset,
					shadowOpacity: isFocused ? (theme.id === 'frutiger-aero' ? 0.6 : 0.2) : (theme.id === 'frutiger-aero' ? 0 : theme.metrics.shadowLight.opacity),
					shadowRadius: theme.id === 'frutiger-aero' ? 12 : theme.metrics.shadowLight.radius,
					elevation: theme.metrics.shadowLight.elevation,
				},
			]}
		>
			<Ionicons name="search" size={20} color={theme.id === 'frutiger-aero' ? 'rgba(0,180,255,0.7)' : theme.colors.textMuted} style={styles.searchIcon} />
			<TextInput
				style={[
					styles.input,
					{
						color: theme.colors.textPrimary,
						fontSize: theme.typography.bodySize,
						fontFamily: theme.id === 'frutiger-aero' ? 'Rajdhani_600SemiBold' : undefined,
					},
				]}
				value={query}
				onChangeText={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onSubmitEditing={handleSubmit}
				placeholder={placeholder}
				placeholderTextColor={theme.colors.textMuted}
				returnKeyType="search"
				autoCorrect={false}
			/>
			{isLoading && <Ionicons name="sync" size={18} color={theme.colors.textMuted} style={styles.loadingIcon} />}
			{query.length > 0 && !isLoading && (
				<TouchableOpacity onPress={handleClear} style={styles.clearButton}>
					<Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
				</TouchableOpacity>
			)}
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 4,
		minHeight: 48,
	},
	searchIcon: {
		fontSize: 16,
		marginRight: 10,
	},
	input: {
		flex: 1,
		paddingVertical: 10,
		fontWeight: '400',
	},
	loadingIcon: {
		fontSize: 16,
		marginLeft: 8,
	},
	clearButton: {
		padding: 6,
		marginLeft: 4,
	},
	clearIcon: {
		fontSize: 14,
		fontWeight: '600',
	},
})


