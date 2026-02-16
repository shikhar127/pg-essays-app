# PG Essays

A premium React Native reading app for 228 Paul Graham essays. Distraction-free, immersive reading with progress tracking, favorites, and personalized reminders.

## Features

- **228 Essays** - Complete collection of Paul Graham's essays with offline access
- **Immersive Reader** - Markdown rendering with clean typography
- **Reading Progress** - Auto-saves scroll position, auto-marks essays as read at 90%
- **Favorites** - Heart essays to save them, with dedicated favorites tab
- **Search & Filter** - Find essays by title, filter by All/In Progress/Read
- **Swipeable Tabs** - Swipe between filter views with haptic feedback
- **Reading Reminders** - Morning and evening notifications to keep your reading habit
- **Onboarding Tutorial** - Interactive 4-step tutorial for new users
- **Accessibility** - WCAG 2.1 AA compliant, VoiceOver/TalkBack support, 44x44 touch targets

## Tech Stack

- **Framework:** React Native with Expo SDK 54
- **Navigation:** Expo Router (file-based routing)
- **Storage:** AsyncStorage for reading progress, favorites, and settings
- **Rendering:** react-native-markdown-display
- **Notifications:** expo-notifications
- **Haptics:** expo-haptics
- **Icons:** @expo/vector-icons (Ionicons)
- **Language:** TypeScript (strict mode, no `any` types)

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `a` for Android emulator / `i` for iOS simulator.

## Build APK

```bash
# Preview APK (for testing)
npx eas build --platform android --profile preview

# Production app bundle
npx eas build --platform android --profile production
```

## Project Structure

```
pg-essays-app/
├── app/
│   ├── _layout.tsx          # Root layout with error boundary & onboarding
│   ├── index.tsx             # Redirect to library
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab navigator (Library, Favorites, Settings)
│   │   ├── library.tsx       # Essay list with search & filters
│   │   ├── favorites.tsx     # Favorited essays
│   │   └── settings.tsx      # App settings & reminders toggle
│   └── reader/
│       └── [id].tsx          # Essay reader with progress tracking
├── assets/
│   └── essays/
│       ├── index.json        # Essay metadata (228 entries)
│       └── content/          # Markdown files for each essay
├── components/
│   ├── ErrorBoundary.tsx
│   └── onboarding/
│       └── OnboardingModal.tsx
├── contexts/
│   └── AppStateContext.tsx    # Global state (progress, favorites, settings)
├── lib/
│   ├── essays.ts             # Essay loading utilities
│   ├── essayContentMap.ts    # Generated asset map for 228 essays
│   └── reminderService.ts    # Morning/evening notification messages
└── types/
    ├── essay.ts              # Data types
    └── navigation.ts         # Navigation param types
```
