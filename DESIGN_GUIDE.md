# 🎨 Fruitiger Aero Design Guide

Complete design reference for maintaining and extending the Fruitiger Aero aesthetic.

## 📐 Design System Overview

### Design Philosophy

- **Retro-Modern**: Blend 2000s aesthetics with modern clarity
- **Glass-First**: Emphasis on translucency and depth
- **Organic Curves**: Rounded corners and smooth transitions
- **Colorful**: Use of bright, vibrant accent colors with soft backgrounds

---

## 🎨 Color System

### Primary Palette (Background)

```
Sky Blue        #87CEEB    Main gradient start
Light Blue      #E0F6FF    Bright gradient accent
Powder Blue     #B0E0E6    Secondary gradient
Azure           #F0F8FF    Light accents
```

**Usage**: These create the soft, dreamy background that defines Fruitiger Aero.

### Secondary Palette (Interactive)

```
Retro Green     #00B050    Primary action (play button)
Lime Green      #92D050    Highlights, accent fills
Gradient        #00B050→#92D050    Button gradients
```

**Usage**: Bright greens for all interactive elements (buttons, progress bars, sliders).

### Text Palette

```
Dark Gray       #1a1a1a    Primary text, titles
Medium Gray     #666666    Secondary text, labels
Light Gray      #999999    Disabled, muted text (optional)
White           #FFFFFF    High contrast areas
```

**Usage**: Maintain readability over glass backgrounds.

### Transparency Values

```
95% opacity     rgba(..., 0.95)    Glass panel background
90% opacity     rgba(..., 0.90)    Gradient overlays
80% opacity     rgba(..., 0.8)     Borders, subtle elements
60% opacity     rgba(..., 0.6)     Control buttons
10% opacity     rgba(..., 0.1)     Subtle shadows
```

---

## 🎛️ Component Styling

### Glass Effect Setup

**Required elements:**

1. `BlurView` wrapper (intensity: 85-95)
2. Semi-transparent gradient overlay
3. Subtle white border
4. Soft shadow for depth

```tsx
// Pattern to follow
<BlurView intensity={90} style={styles.blurContainer}>
	<LinearGradient colors={['rgba(255, 255, 255, 0.95)', 'rgba(220, 240, 255, 0.9)']}>
		{/* Content */}
	</LinearGradient>
</BlurView>
```

### Border Radius Reference

```
Large panels     borderRadius: 30
Cards           borderRadius: 25
Buttons         borderRadius: 20 (med), 35 (large)
Sliders         borderRadius: 3-4 (small bars)
Album art       borderRadius: 20
```

### Shadow Pattern

**Default Shadow (Moderate Depth):**

```tsx
shadowColor: 'rgba(0, 0, 0, 0.2)'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.2
shadowRadius: 8
elevation: 4
```

**Deep Shadow (Heavy Element):**

```tsx
shadowColor: 'rgba(0, 0, 0, 0.3)'
shadowOffset: { width: 0, height: 10 }
shadowOpacity: 0.3
shadowRadius: 20
elevation: 15
```

**Interaction Shadow (Pressed State):**

```tsx
shadowColor: 'rgba(0, 176, 80, 0.4)'  // Green-tinted
shadowOffset: { width: 0, height: 6 }
shadowOpacity: 0.4
shadowRadius: 12
elevation: 8
```

---

## 🔄 Spacing & Layout

### Margin/Padding Scale

```
Compact:    4px, 8px      Tight spacing
Comfortable: 12px, 16px   Standard spacing
Spacious:   20px, 24px    Large sections
Extra:      28px, 32px    Major separations
```

### Element Dimensions

```
Small button    40x40 px
Medium button   50x50 px
Large button    70x70 px
Progress bar    ~6-8 px height
Volume slider   ~4-6 px height
```

---

## 🎬 Animation Guidelines

### Motion Timing

```
Quick feedback    150ms     Button press, toggle
Smooth transition 300ms     Screen changes, fades
Slow motion       500ms+    Complex animations
```

### Easing Functions

- **Standard**: Ease-in-out for most animations
- **Bounce**: Light bounce on play button press
- **Fade**: Opacity transitions for overlays

---

## 🌈 Gradient Combinations

### Background Gradient (Primary)

```tsx
colors={['#87CEEB', '#E0F6FF', '#B0E0E6']}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}
```

**Effect**: Diagonal blue flow, very Aero

### Action Button Gradient

```tsx
colors={['#00B050', '#92D050']}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}
```

**Effect**: Subtle green to lime transition

### Glass Panel Gradient

```tsx
colors={['rgba(255, 255, 255, 0.95)', 'rgba(220, 240, 255, 0.9)']}
start={{ x: 0, y: 0 }}
end={{ x: 0, y: 1 }}
```

**Effect**: Vertical fade from white to blue-tint

---

## 🎯 Interactive States

### Button States

**Default:**

- Background: `rgba(255, 255, 255, 0.6)`
- Shadow: Moderate
- Scale: 1.0

**Pressed:**

- Background: `rgba(255, 255, 255, 0.7)`
- Shadow: Deeper
- Scale: 0.95

**Disabled:**

- Background: `rgba(0, 0, 0, 0.05)`
- Opacity: 0.5
- Scale: 1.0

### Progress Bar

**Track:** `rgba(0, 0, 0, 0.1)`  
**Fill:** Green gradient `#00B050 → #92D050`  
**Height:** 6px  
**Animation:** Smooth width change

---

## 📱 Responsive Design Tips

### Mobile-First Approach

- Design for smallest screen first
- Use `Dimensions.get('window')` for screen size
- Max width: 380px for player card (centered)
- Padding: 16-20px on edges

### Screen Size Adaptation

```
Small (< 375px):  Reduce padding, smaller text
Medium (375-500): Standard layout
Large (> 500px):  Increase padding, larger player
```

---

## 🎨 Color Scheme Variations

### Warm Variant

Replace blues with:

```
Orange: #FF8C00
Peach:  #FFEBCD
Gold:   #FFD700
```

### Cool Variant (Current)

```
Blue:   #87CEEB
Cyan:   #E0F6FF
Teal:   #B0E0E6
```

### Purple Variant

Replace with:

```
Lavender: #E6E6FA
Violet:   #EE82EE
Orchid:   #DA70D6
```

---

## 📝 Implementation Checklist

When creating new components, ensure:

- [ ] Use `LinearGradient` for backgrounds
- [ ] Apply `BlurView` for glass effect
- [ ] Proper shadow layering (elevation + shadow props)
- [ ] Consistent border radius (20-30 for panels)
- [ ] Green accents (#00B050, #92D050) for interactions
- [ ] Semi-transparent overlays where needed
- [ ] Proper spacing following the scale system
- [ ] Text contrast verified against backgrounds
- [ ] Shadows appear realistic on Android (elevation property)

---

## 🔧 Common Customizations

### Change Primary Color

1. Find all `#87CEEB` → Replace with your hex
2. Find all `#E0F6FF` → Update accent
3. Update `LinearGradient` start/end colors

### Increase Glass Effect

1. Raise `BlurView` intensity to 95+
2. Increase gradient opacity to 0.98
3. Enhance shadows for more contrast

### Make It Flatter

1. Reduce `shadowRadius` by 50%
2. Set `elevation` to 2-4
3. Lower `BlurView` intensity to 60-70

### Add Dark Mode

1. Invert color values
2. Use `useColorScheme()` from `react-native`
3. Create alternate gradient sets

---

## 🎯 Fruitiger Aero Key Characteristics

To maintain authenticity:

1. **Glossy Finish**: Use glass effect (blur + semi-transparent overlay)
2. **Soft Shadows**: Gentle drop shadows, not harsh blacks
3. **Vibrant Accents**: Bright greens and blues against soft backgrounds
4. **Rounded Geometry**: No sharp corners
5. **Depth Layers**: Multiple z-index levels
6. **Organic Feel**: Smooth curves and natural transitions

---

## 📚 Resources

- Fruitiger Aero Wiki: Historic design reference
- Windows Vista UI: Design inspiration source
- Color palette references: Coolors.co, ColorHunt.co

---

**Last Updated**: March 2026  
**Aero Style Version**: 1.0
