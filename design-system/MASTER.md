# Design System - AI-Powered Adaptive Study Assistant

## 🎨 Design Philosophy

Clean, minimalist educational platform inspired by Duolingo and Notion. The interface should feel assistive and encouraging, never overwhelming.

## 🎭 Color Palette

```
Primary: #6366F1 (Indigo)
Secondary: #8B5CF6 (Purple)
Success: #10B981 (Emerald)
Warning: #F59E0B (Amber)
Error: #EF4444 (Red)
Neutral: #F3F4F6 (Light Gray)
Dark: #1F2937 (Dark Gray)
```

## 📐 Typography

- **Headings**: Inter, Bold (700)
- **Body**: Inter, Regular (400)
- **Small**: Inter, Regular (400), 12px
- **Line Height**: 1.5 for body, 1.2 for headings

## 🧩 Component Patterns

### Cards
- Rounded corners: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Padding: 20px
- Hover: Subtle lift effect (transform: translateY(-2px))

### Buttons
- Primary: Indigo background, white text
- Secondary: Gray background, dark text
- Disabled: 50% opacity
- Transition: 200ms ease

### Inputs
- Border: 1px solid #E5E7EB
- Focus: 2px solid #6366F1
- Padding: 12px 16px
- Border radius: 8px

## 🎬 Motion & Animation

- Transitions: 200-300ms ease
- Page transitions: Fade in 300ms
- Hover effects: Subtle scale (1.02) or shadow increase
- Loading: Smooth spinner animation
- Success feedback: Brief pulse animation

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🎯 Layout Patterns

### Dashboard
- Hero banner with welcome message
- Stats cards in grid (2-3 columns)
- Recent materials section
- Recommended actions section

### Content Pages
- Sidebar navigation (collapsible on mobile)
- Main content area with clear hierarchy
- Action buttons top-right
- Breadcrumb navigation

### Quiz Interface
- Question centered
- Options clearly separated
- Progress bar at top
- Instant feedback with color coding

## ♿ Accessibility

- Minimum contrast ratio: 4.5:1
- Focus indicators: Visible 2px outline
- Font size: Minimum 14px for body text
- Interactive elements: Minimum 44px touch target
- Semantic HTML: Proper heading hierarchy

## 🎓 Educational UX Principles

- Clear primary action per screen
- Progress visibility (progress bars, step indicators)
- Immediate feedback on actions
- Encouraging language and tone
- Celebrate achievements (XP, streaks)
- Reduce cognitive load with progressive disclosure
