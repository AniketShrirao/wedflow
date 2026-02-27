# Venue Carousel Section Implementation

## Overview

The venue carousel is a scroll-triggered sticky carousel that displays venue cards one at a time. As users scroll, new venue cards are revealed while maintaining a sticky position on the screen.

## Features

### 1. **Scroll-Triggered Display**

- Each venue card is revealed as the user scrolls
- The carousel calculates scroll progress through the section
- Card index updates based on scroll position

### 2. **Sticky Behavior**

- The carousel container becomes sticky (fixed position) while scrolling through venues
- Automatically unsticks after all cards have been viewed
- Smooth transition between sticky and normal scroll

### 3. **Full Screen Coverage**

- Each venue card takes up 100vh (full viewport height)
- Total section height = `number_of_venues × 100vh`
- Responsive design works on all device sizes (mobile, tablet, desktop)

### 4. **Card Layout**

- **Left Side (50% on desktop)**: Venue information
  - Venue name and number
  - Address with icon
  - Description
  - Contact information (phone, email)
  - Get Directions button
  - Progress indicator

- **Right Side (50% on desktop)**: Visual element
  - Gradient background
  - Pattern overlay
  - Venue icon
  - Venue name and address

### 5. **Progress Tracking**

- Shows current card number (e.g., "1 of 3")
- Visual progress bar at the bottom
- Scroll hint on first card

## How It Works

### Scroll Calculation

```
scrollProgress = Math.max(0, -sectionTop) / (sectionHeight - window.innerHeight)
cardIndex = Math.floor(scrollProgress × totalCards)
```

### Sticky Logic

- `isSticky = true` while `scrollProgress < 1`
- `isSticky = false` after all cards are viewed
- Container uses `fixed` positioning when sticky, `relative` when not

## Usage

Replace the regular `VenueSection` with `VenueCarouselSection`:

```tsx
import { VenueCarouselSection } from "./venue-carousel-section";

// In your component
<VenueCarouselSection venues={events.venues} />;
```

## Customization

### Adjust Card Transition Speed

Modify the `transition-all duration-300` class in the sticky container div.

### Change Colors

Update the gradient classes:

- `from-pink-500 to-purple-500` - Primary gradient
- `from-pink-100 to-purple-100` - Background gradient

### Modify Spacing

Adjust padding in the content container:

- `p-8 md:p-12 lg:p-16` - Content padding
- `gap-0` - Gap between left and right sides

### Scroll Hint Animation

The scroll hint uses `animate-bounce` class. Customize or remove as needed.

## Browser Compatibility

- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses passive scroll listeners for better performance
- Responsive design adapts to all screen sizes

## Performance Considerations

- Scroll listener uses `{ passive: true }` for better performance
- Minimal re-renders using React hooks
- CSS transitions for smooth animations
- No external animation libraries required

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Links have proper `rel` attributes
- Color contrast meets WCAG standards
- Keyboard navigation supported
