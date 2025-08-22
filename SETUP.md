# New Tab Extension Setup Guide

## Prerequisites

1. **Install Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Or use a version manager like `nvm`

2. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

## Installation & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Type checking:**
   ```bash
   npm run type-check
   ```

5. **Linting:**
   ```bash
   npm run lint
   npm run lint:fix
   ```

## Chrome Extension Installation

1. **Build the extension:**
   ```bash
   npm run build
   ```

2. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder

3. **Test the extension:**
   - Open a new tab to see your custom new tab page

## Project Structure

```
new-tab-extension/
├── src/
│   ├── components/          # React components
│   │   ├── Background/      # Background image management
│   │   ├── SearchEngine/    # Search functionality
│   │   ├── QuickLaunch/     # Quick launch grid
│   │   └── Settings/        # Settings modal
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state management
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── locales/            # Internationalization
│   └── styles/             # CSS and Tailwind styles
├── public/
│   ├── manifest.json       # Chrome extension manifest
│   └── icons/              # Extension icons
└── dist/                   # Built extension files
```

## Features Implemented

### ✅ Core Features
- **Multi-search engine support** with visual engine selector
- **Quick launch grid** with drag-and-drop reordering
- **Bing daily backgrounds** with automatic rotation
- **Dark/Light/Auto theme modes** with time-based switching
- **Internationalization** (English/Chinese)
- **Modern UI** with Claude-inspired design
- **Framer Motion animations** for smooth interactions
- **TypeScript** for type safety
- **Zustand** for state management

### ✅ UI Components
- **SearchBar** - Multi-engine search with dropdown
- **QuickLaunchGrid** - Customizable website shortcuts
- **BackgroundImage** - Bing daily wallpapers with controls
- **TimeWeather** - Current time and weather display
- **SettingsModal** - Comprehensive settings panel

### ✅ Technical Features
- **Chrome Extension API** integration
- **Local storage** persistence
- **Responsive design** for different screen sizes
- **Keyboard shortcuts** (Ctrl+K for search, Ctrl+, for settings)
- **Error handling** and loading states
- **Favicon fetching** for website icons

### 🚧 Future Enhancements
- **WebDAV sync** for cross-device settings
- **Weather API** integration
- **Custom background uploads**
- **More search engines**
- **Bookmark integration**
- **Usage analytics**

## Development Notes

- Built with **React 18** and **TypeScript**
- Styled with **Tailwind CSS** and custom Claude-inspired theme
- Animated with **Framer Motion**
- State managed with **Zustand**
- Bundled with **Vite** and **CRXJS**
- Follows modern React patterns and best practices

## Troubleshooting

1. **Build errors:** Ensure all dependencies are installed correctly
2. **Extension not loading:** Check manifest.json syntax and permissions
3. **Background images not loading:** Verify CORS and API availability
4. **Settings not persisting:** Check browser storage permissions