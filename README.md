# 🎵 Fruitiger Aero Music Player

A retro-inspired, glassy music player built with React Native and Expo, featuring the iconic Fruitiger Aero aesthetic from the 2000s era.

## 📋 Overview

This is a **template-ready** music player design that captures the essence of Fruitiger Aero styling with:

- Translucent glass effect (BlurView)
- Soft gradient backgrounds (sky blue to light blue)
- Smooth shadows and depth
- Retro-inspired green accent color (#00B050, #92D050)
- Clean, rounded UI elements

Perfect for customizing with your own music player logic and design preferences.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on your device:

```bash
# iOS
npm run ios

# Android
npm run android
```

## 📂 Project Structure

```
Music-Player/
├── components/
│   └── MusicPlayer.tsx       # Main player component
├── App.tsx                    # Entry point
├── package.json
├── tsconfig.json
├── babel.config.js
└── README.md
```

## 🎨 Fruitiger Aero Style Guide

### Color Palette

| Color       | Hex Code  | Usage                      |
| ----------- | --------- | -------------------------- |
| Sky Blue    | `#87CEEB` | Primary gradient start     |
| Light Blue  | `#E0F6FF` | Gradient accent            |
| Powder Blue | `#B0E0E6` | Secondary gradient         |
| Retro Green | `#00B050` | Play button, progress bars |
| Lime Green  | `#92D050` | Accents, highlights        |
| Dark Text   | `#1a1a1a` | Primary text               |
| Gray Text   | `#666666` | Secondary text             |

### Key Design Elements

#### 1. **Glass Effect (Frosted Glass)**

- Uses `BlurView` from `expo-blur`
- Set intensity between 80-95 for optimal frosted effect
- Layered with semi-transparent gradients

```tsx
<BlurView intensity={90} style={styles.blurContainer}>
	<LinearGradient colors={['rgba(255, 255, 255, 0.95)', 'rgba(220, 240, 255, 0.9)']}>
		{/* Content */}
	</LinearGradient>
</BlurView>
```

#### 2. **Gradients**

- Primary: Blue to light blue (background)
- Accents: Green gradients for interactive elements
- Use `expo-linear-gradient` for smooth color transitions

#### 3. **Shadows & Depth**

- Apply subtle shadows to create depth
- Shadow properties:
  - `shadowColor`: `'rgba(0, 0, 0, 0.3)'`
  - `shadowOffset`: `{ width: 0, height: 10 }`
  - `shadowOpacity`: `0.3`
  - `shadowRadius`: `20`
  - `elevation`: `15` (Android)

#### 4. **Border Styling**

- Rounded corners: `borderRadius: 25-30px`
- Subtle white border on glass panels: `borderColor: 'rgba(255, 255, 255, 0.8)'`

## 🎛️ Component Customization

### Basic Usage

```tsx
import { MusicPlayer } from './components/MusicPlayer'

export default function App() {
	return <MusicPlayer />
}
```

### Extending the Component

To add real music functionality:

1. **Add Track Player Integration**

   ```tsx
   import TrackPlayer from 'react-native-track-player'

   // Initialize player on component mount
   useEffect(() => {
   	setupPlayer()
   }, [])
   ```

2. **Connect State Management**
   - Use Zustand (already in dependencies) for global state
   - Manage playback, queue, and song metadata

3. **Custom Colors**
   - Replace gradient colors in `styles`
   - Modify the color palette in the theme

## 📝 Styling Tips

### To Change the Theme:

1. **Background Gradient** (in `container` style):
   - Modify `LinearGradient` colors
   - Example for warm tone: `['#FFB6C1', '#FFE4E1']`

2. **Accent Color** (for play button, progress):
   - Find all `#00B050` and `#92D050` references
   - Replace with your chosen green/accent color

3. **Glass Intensity**:
   - Increase `BlurView` intensity for more blur effect
   - Range: 0-100 (recommended: 80-95)

4. **Shadow Depth**:
   - Increase `shadowRadius` and `elevation` for more depth
   - Decrease for a flatter design

## 🔧 Key Dependencies

- **expo-linear-gradient**: Smooth gradient backgrounds
- **expo-blur**: Frosted glass effect
- **react-native-reanimated**: For smooth animations (ready for expansion)
- **react-native-track-player**: Music playback (ready for integration)

## 📚 File Modifications Guide

### `components/MusicPlayer.tsx`

- **Controls Section**: Buttons for play/pause, next, previous
- **Progress Bar**: Shows playback position
- **Volume Control**: Placeholder for volume adjustment
- **Album Art**: Centered display area for cover images

### `App.tsx`

- Current entry point imports the MusicPlayer
- Easy to add additional screens/navigation

## 🎯 Next Steps (Your Customization)

1. **Add Real Music Data**
   - Replace mock song data with API calls
   - Connect to music library or streaming service

2. **Implement Playback Controls**
   - Integrate `react-native-track-player`
   - Add play/pause/skip functionality

3. **Add Animations**
   - Use `react-native-reanimated` for smooth transitions
   - Animate progress bar updates
   - Add button press animations

4. **Enhance UI**
   - Add lyrics display
   - Implement playlist view
   - Create favorite/like button
   - Add equalizer visualization

5. **Personalize Colors**
   - Create a theme system
   - Add dark mode support
   - Implement custom color schemes

## 🎨 Design Inspiration

This template is inspired by:

- Fruitiger Aero design movement (2000s)
- Windows Vista aesthetics
- Glassy, translucent UI elements
- Retro-modern color palettes

## 📦 Building for Production

```bash
# Create a production build
eas build --platform ios
eas build --platform android
```

## 🤝 Tips for Taking Over

- The component is fully self-contained in `MusicPlayer.tsx`
- All styles are defined at the bottom (easy to modify)
- Comment sections guide you through different UI parts
- Replace emoji icons with proper icon libraries as needed
- The mock `Song` interface shows the data structure to expect

---

Happy customizing! 🚀
