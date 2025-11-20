# Scroll Heart Animation

## Overview

An animated heart that travels through the page as you scroll, inspired by the airplane animation from CodePen. The heart contains the couple's initials and follows a smooth S-curve path.

## Features

### 1. Scroll-Based Animation

- Heart position is tied to scroll progress (0-100%)
- Smooth movement along a predefined SVG path
- Appears after scrolling 100px from the top
- Disappears when at the very top of the page

### 2. Visual Effects

- **Gradient Fill**: Pink to rose gradient
- **Glow Effect**: Soft glow around the heart
- **Pulse Animation**: Heart pulses continuously
- **Trail Effect**: Semi-transparent shadow trail
- **Sparkles**: Three rotating sparkles around the heart
- **Particle Trail**: 5 particles following the heart's path

### 3. Couple's Initials

- First letter of each partner's name displayed inside the heart
- White text for contrast
- Positioned vertically (Partner 1 on top, Partner 2 on bottom)

### 4. Progress Indicator

- Small progress bar in bottom-right corner
- Shows scroll percentage (0-100%)
- Gradient progress bar matching heart colors
- Backdrop blur for modern look

### 5. Path Animation

- Heart follows a smooth S-curve through the page
- Rotates to face the direction of travel
- Path: `M 15,10 Q 25,15 35,25 Q 45,35 50,45 Q 55,55 65,65 Q 75,75 85,85`

## Technical Details

### Components

- **ScrollHeart**: Main component (`src/components/public/scroll-heart.tsx`)
- Integrated into `wedding-site.tsx`

### Scroll Calculation

```typescript
const windowHeight = window.innerHeight;
const documentHeight = document.documentElement.scrollHeight - windowHeight;
const scrolled = window.scrollY;
const progress = Math.min(scrolled / documentHeight, 1);
```

### Path Following

```typescript
const pathLength = pathRef.current.getTotalLength();
const point = pathRef.current.getPointAtLength(scrollProgress * pathLength);
```

### Rotation Calculation

```typescript
const nextPoint = pathRef.current.getPointAtLength(
  Math.min(scrollProgress * pathLength + 1, pathLength)
);
const angle =
  Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
```

## Styling

### Colors

- Heart: `#ec4899` (pink-500) to `#f43f5e` (rose-500)
- Sparkles: `#fbbf24` (amber-400)
- Progress bar: Pink to rose gradient

### Sizes

- Heart: Scales from 1.2 to 1.4 (pulse)
- Sparkles: 0.5 radius
- Trail particles: 0.3 radius

### Positioning

- Fixed position overlay
- Z-index: 40 (above content, below navigation)
- Pointer events: none (doesn't block clicks)

## Accessibility

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are automatically disabled */
}
```

### Performance

- Passive scroll listener for better performance
- Efficient SVG path calculations
- No layout thrashing
- GPU-accelerated transforms

## Browser Support

- Modern browsers with SVG support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Change Path

Edit the `d` attribute in the path definition:

```tsx
<path
  ref={pathRef}
  id="heartPath"
  d="M 15,10 Q 25,15 35,25 Q 45,35 50,45 Q 55,55 65,65 Q 75,75 85,85"
/>
```

### Change Colors

Modify the gradient stops:

```tsx
<linearGradient id="scrollHeartGradient">
  <stop offset="0%" stopColor="#ec4899" />
  <stop offset="100%" stopColor="#f43f5e" />
</linearGradient>
```

### Change Visibility Threshold

Adjust the scroll threshold:

```typescript
if (scrolled > 100) {
  // Change this value
  setIsVisible(true);
}
```

## Usage

The component is automatically included in the wedding site:

```tsx
<ScrollHeart partner1={couple.partner1_name} partner2={couple.partner2_name} />
```

## Props

| Prop       | Type   | Description                                |
| ---------- | ------ | ------------------------------------------ |
| `partner1` | string | First partner's name (first letter shown)  |
| `partner2` | string | Second partner's name (first letter shown) |

## Future Enhancements

Possible improvements:

1. Multiple hearts with different paths
2. Interactive heart (click to trigger animation)
3. Custom path based on page sections
4. Heart leaves a permanent trail
5. Different shapes (stars, flowers, etc.)
6. Sound effects on milestone scroll points
7. Confetti burst at 100% scroll

## Performance Notes

- Uses `requestAnimationFrame` implicitly through React state updates
- Passive scroll listener prevents scroll jank
- SVG is hardware-accelerated
- Minimal DOM manipulation
- Efficient path calculations

## Status: ✅ Complete

The scroll heart animation is fully implemented and integrated into the wedding website!
