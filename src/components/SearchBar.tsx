import React, { useState, useCallback, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
	StyleSheet,
	TextInput,
	TouchableOpacity,
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
			if (text.trim().length === 0) {
				onSearch('')
			}
		},
		[onSearch]
	)

	const handleClear = useCallback(() => {
		setQuery('')
		onSearch('')
	}, [onSearch])

	const handleSubmit = useCallback(() => {
		const trimmed = query.trim()
		if (trimmed.length > 0) {
			onSearch(trimmed)
		}
	}, [query, onSearch])


	const borderColor = focusAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [
			theme.id === 'frutiger-aero' ? 'rgba(255,255,255,0.85)' : theme.colors.cardBorderColor,
			theme.id === 'frutiger-aero' ? theme.colors.accentPrimary : theme.colors.accentPrimary
		],
	})

	return (
		<Animated.View
			style={[
				styles.container,
				{
					backgroundColor: theme.id === 'frutiger-aero' ? 'rgba(255,255,255,0.65)' : theme.colors.controlBackground,
					borderRadius: theme.metrics.borderRadiusMedium,
					borderColor: borderColor,
					borderWidth: 1.5,
					shadowColor: theme.id === 'frutiger-aero' ? 'rgba(0,180,255,0.3)' : theme.metrics.shadowLight.color,
					shadowOffset: theme.metrics.shadowLight.offset,
					shadowOpacity: isFocused ? 0.6 : 0.2,
					shadowRadius: theme.id === 'frutiger-aero' ? 10 : theme.metrics.shadowLight.radius,
					elevation: theme.metrics.shadowLight.elevation,
				},
			]}
		>
			<TouchableOpacity onPress={handleSubmit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
				<Ionicons name="search" size={20} color={theme.id === 'frutiger-aero' ? theme.colors.textSecondary : theme.colors.textMuted} style={styles.searchIcon} />
			</TouchableOpacity>
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
			{isLoading && <Ionicons name="sync" size={18} color={theme.colors.accentPrimary} style={styles.loadingIcon} />}
			{query.length > 0 && !isLoading && (
				<TouchableOpacity onPress={handleClear} style={styles.clearButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
					<Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
				</TouchableOpacity>
			)}
			{query.trim().length > 0 && !isLoading && (
				<TouchableOpacity onPress={handleSubmit} style={styles.submitButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
					<Ionicons name="arrow-forward-circle" size={24} color={theme.colors.accentPrimary} />
				</TouchableOpacity>
			)}
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 4,
		minHeight: 48,
	},
	searchIcon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		paddingVertical: 10,
		fontWeight: '400',
	},
	loadingIcon: {
		marginLeft: 8,
	},
	clearButton: {
		padding: 4,
		marginLeft: 4,
	},
	submitButton: {
		padding: 4,
		marginLeft: 4,
	},
})



