# Design System Documentation

## Overview
This document outlines the comprehensive design system refactor implemented for the Gonca Yoldaş educational platform. The refactor establishes a unified, token-based design system that ensures visual consistency, accessibility compliance, and maintainability across the entire application.

## Design Token System

### Core Brand Colors
```css
--color-primary: #ec4f4f  /* Primary brand color - CTAs, key actions */
--color-accent: #ec8ebb   /* Secondary accent - highlights, hover states */
```

### Theme Base Colors
```css
--bg-light: #ffffff       /* Light theme background */
--bg-dark: #332859        /* Dark theme background */
--fg-light: #f6f6f8       /* Light theme foreground text */
--fg-dark: #1b1b1f        /* Dark theme foreground text */
```

### Semantic Tokens
```css
--bg: var(--bg-light)              /* Current background */
--fg: var(--fg-dark)               /* Current foreground */
--fg-muted: #5f5f66                /* Muted text */
--surface-0: var(--bg)             /* Base surface */
--surface-1: #f5f6fa (light)       /* Elevated surfaces */
            rgba(255,255,255,0.06) (dark)
--border: rgba(236, 79, 79, 0.1)   /* Border color */
--hover-overlay: rgba(236, 79, 79, 0.08) /* Hover states */
```

## Theme System Architecture

### Theme Switching
The application supports three theme modes:
- **Light**: Explicit light theme
- **Dark**: Explicit dark theme
- **Auto**: Follows OS preference via `prefers-color-scheme`

### Implementation
```typescript
// Theme is stored in localStorage as 'light', 'dark', or 'auto'
// Applied via data-theme attribute on <html> element
<html data-theme="light"> or <html data-theme="dark">
```

### CSS Variable Mapping
```css
[data-theme='light'] {
  --bg: var(--bg-light);
  --fg: var(--fg-dark);
  --surface-1: #f5f6fa;
}

[data-theme='dark'] {
  --bg: var(--bg-dark);
  --fg: var(--fg-light);
  --surface-1: rgba(255, 255, 255, 0.06);
}
```

## Component Standards

### Button Variants

#### Primary Button
```css
.btn-primary {
  background-color: var(--color-primary);
  color: white;
}
.btn-primary:hover {
  background: linear-gradient(90deg, #ec4f4f 0%, #ec8ebb 100%);
  transform: scale(1.03);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: var(--fg);
  border: 2px solid var(--color-primary);
}
.btn-secondary:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
```

#### Ghost Button
```css
.btn-ghost {
  background-color: transparent;
  color: var(--fg);
}
.btn-ghost:hover {
  color: var(--color-accent);
  background-color: var(--hover-overlay);
}
```

### Card Component
```css
.card {
  background-color: var(--surface-1);
  border-radius: 1rem;
  box-shadow: var(--shadow-md);
}
```

### Input Component
```css
.input {
  background-color: var(--surface-1);
  color: var(--fg);
  border: 1px solid var(--border);
}

[data-theme='light'] .input {
  background-color: white;
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] .input {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}
```

## Accessibility Compliance

### WCAG 2.1 Level AA Requirements
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Focus indicators**: 2px solid outline with 2px offset

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Animation System

### Scroll Reveal
Implemented using IntersectionObserver API for performance:
```typescript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in', 'animate-slide-up');
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);
```

### Button Interactions
```css
.btn-primary:hover {
  transform: scale(1.03);
  transition: transform var(--transition-fast);
}
```

## Program Details Page

### Registration Flow
1. **Unauthenticated users**: Redirect to `/auth/signup?redirect=/programs/{slug}&programId={id}`
2. **Authenticated users**: Initiate enrollment API call
3. **Loading state**: Display spinner and disable button
4. **Success**: Navigate to checkout page
5. **Error**: Display toast notification

### Dark Theme Quality
- Page background: `var(--bg)`
- Card surfaces: `var(--surface-1)`
- Text: `var(--fg)` with 90% opacity for body text
- Borders: `var(--border)`

## Migration Guide

### Replacing Hardcoded Colors
❌ **Before:**
```jsx
<div className="bg-blue-600 text-white">
```

✅ **After:**
```jsx
<div style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
```

### Using Tailwind Arbitrary Values
```jsx
<div className="bg-[var(--surface-1)] text-[var(--fg)]">
```

### Button Migration
❌ **Before:**
```jsx
<button className="bg-blue-600 hover:bg-blue-700">
```

✅ **After:**
```jsx
<Button className="btn-primary">
```

## Testing Checklist

- [ ] All pages render correctly in light theme
- [ ] All pages render correctly in dark theme
- [ ] Theme switching works without flash
- [ ] No blue colors present in application
- [ ] All text meets WCAG contrast requirements
- [ ] Focus indicators are visible on all interactive elements
- [ ] Animations respect prefers-reduced-motion
- [ ] Registration button functions correctly
- [ ] Scroll reveal animations work smoothly
- [ ] Mobile responsive design maintained

## Architectural Decisions

### Why CSS Custom Properties?
- Runtime theme switching without page reload
- Single source of truth for colors
- Easy maintenance and updates
- Better performance than JavaScript-based theming

### Why IntersectionObserver for Animations?
- Better performance than scroll event listeners
- Native browser API with good support
- Automatic cleanup and memory management

### Why Separate Button Classes?
- Consistent styling across components
- Easy to maintain and update
- Reduces code duplication
- Better performance than inline styles

## Future Enhancements

1. **Color Palette Expansion**: Add semantic colors for success, warning, error states
2. **Typography Scale**: Define comprehensive type scale with CSS variables
3. **Spacing System**: Implement 8-point grid system with CSS variables
4. **Component Library**: Create comprehensive Storybook documentation
5. **A11y Testing**: Integrate automated accessibility testing tools
