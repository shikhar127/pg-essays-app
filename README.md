# PG Essays

A premium, distraction-free mobile app for reading Paul Graham's essays.

## Features

- **Immersive Reader** - Full-screen reading experience with auto-hiding UI
- **Beautiful Typography** - Optimized for long-form reading
- **Three Themes** - Light, Dark, and Sepia modes
- **Font Size Options** - Small, Medium, Large
- **Keep Screen Awake** - Never dims while reading
- **Reading Progress** - Visual progress bar at top

## Tech Stack

- React Native + Expo
- Expo Router (file-based navigation)
- React Native Reanimated (animations)
- TypeScript

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Building APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview
```

## Project Structure

```
pg-essays-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   └── reader/[id].tsx    # Immersive reader
├── components/reader/      # Reader components
├── context/               # React contexts
├── lib/                   # Utilities and data
└── assets/                # Images, fonts
```

## Roadmap

- [x] Step 1: The Perfect Reader
- [ ] Step 2: The Library (228 essays)
- [ ] Step 3: Persistence (progress tracking)
- [ ] Step 4: Gamification (streaks, notifications)

---

Built with essays from [paulgraham.com](https://paulgraham.com)
