# Wedding Website Enhancements

## Overview

Enhanced the couples wedding website with modern, responsive components featuring carousels, split banners, improved galleries, and better mobile experience.

## Components

### 1. Hero Section (`hero-section.tsx`)

- **Features:**
  - Animated gradient backgrounds with floating elements
  - Larger, more prominent couple names with gradient text
  - Smooth fade-in animations
  - Better responsive typography
  - Improved date display with calendar icon
  - Elegant scroll indicator

### 2. Events Carousel (`events-carousel.tsx`)

- **Features:**
  - Full-width carousel with smooth transitions
  - Auto-play functionality (pauses on hover)
  - Navigation arrows and dot indicators
  - Split layout: event details on one side, visual on the other
  - Gradient backgrounds and modern card design
  - Fully responsive for mobile devices

### 3. Venue Section (`venue-section.tsx`)

- **Features:**
  - Alternating split layout (content left/right)
  - Large, prominent venue information
  - Integrated map placeholder with gradient backgrounds
  - Contact information with hover effects
  - "Get Directions" CTA buttons
  - Responsive grid that stacks on mobile

### 4. Photo Gallery Section (`photo-gallery-section.tsx`)

- **Features:**
  - Masonry grid layout with varying sizes
  - Lightbox modal for full-size viewing
  - Keyboard navigation (arrow keys, escape)
  - Smooth hover effects and zoom indicators
  - Category badges on photos
  - Upload CTA section
  - Fully responsive grid

### 5. Gift Portal Section (`gift-portal-section.tsx`)

- **Features:**
  - Split layout: QR code and UPI ID side by side
  - Copy-to-clipboard functionality with visual feedback
  - Step-by-step payment instructions
  - Gradient backgrounds and modern card design
  - Thank you message section
  - Mobile-optimized layout

## Global CSS Improvements

### Typography

- Better font smoothing and rendering
- Responsive font sizes using `clamp()`
- Improved text contrast for readability
- Proper heading hierarchy

### Responsiveness

- Touch-friendly targets (minimum 44x44px)
- Responsive containers
- Mobile-first approach
- Proper breakpoints for all screen sizes

### Accessibility

- Smooth scrolling with reduced motion support
- Better focus visibility
- Proper ARIA labels
- Keyboard navigation support

### Visual Enhancements

- Loading skeleton animations
- Better shadow definitions
- Backdrop blur support
- Gradient text support
- Smooth transitions

## Responsive Breakpoints

```css
- Mobile: < 640px
- Tablet: 640px - 768px
- Desktop: 768px - 1024px
- Large Desktop: > 1024px
```

## Key Improvements

### Text Visibility

- All text now has proper contrast ratios
- Dark text on light backgrounds
- No more invisible or hard-to-read text
- Proper color values enforced

### Mobile Experience

- All components stack properly on mobile
- Touch-friendly buttons and links
- Responsive images and layouts
- Optimized font sizes

### Performance

- Lazy loading for images
- Optimized animations
- Reduced motion support
- Efficient CSS

### User Experience

- Smooth scrolling
- Intuitive navigation
- Clear CTAs
- Visual feedback on interactions

## Usage

The components are used in the main `wedding-site.tsx` component:

```tsx
import { HeroSection } from "./hero-section";
import { EventsCarousel } from "./events-carousel";
import { VenueSection } from "./venue-section";
import { PhotoGallerySection } from "./photo-gallery-section";
import { GiftPortalSection } from "./gift-portal-section";
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

## Future Enhancements

- Add actual photo integration with Sanity CMS
- Implement real-time RSVP functionality
- Add animation preferences
- Integrate with Google Maps API for venues
- Add social sharing capabilities
