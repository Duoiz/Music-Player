import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, StyleSheet } from 'react-native'
import { MusicPlayer } from './components/MusicPlayer'

export default function App() {
	return (
		<SafeAreaView style={styles.container}>
			<MusicPlayer />
			<StatusBar style="light" />
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})
