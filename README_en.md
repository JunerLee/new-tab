# Modern New Tab Extension

A beautiful, customizable, and feature-rich new tab extension for modern browsers. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎨 **Beautiful Backgrounds**
- Daily Bing wallpapers with automatic updates
- Custom image uploads
- Solid colors and gradients
- Blur and opacity controls

### 🔍 **Smart Search**
- Multiple search engines (Google, Bing, DuckDuckGo)
- Custom search engine support
- Keyboard shortcuts
- Search suggestions

### ⚡ **Quick Launch**
- Customizable app shortcuts
- Drag-and-drop organization
- Top sites integration
- Category management

### 🌤️ **Weather & Time**
- Real-time weather information
- Multiple time formats
- Location-based updates
- Weather condition icons

### 🔧 **Customization**
- Light/dark/auto theme modes
- Accessibility features
- Reduced motion support
- High contrast mode

### 🔄 **Sync & Backup**
- WebDAV synchronization
- Local backup/restore
- Cross-device settings sync
- Data export/import

### 🌐 **Multi-language Support**
- English and Chinese languages
- Easy localization system
- RTL language support ready

## 🚀 Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/new-tab-extension.git
   cd new-tab-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Browser Installation

#### Chrome/Edge
1. Open `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

#### Firefox
1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from `dist` folder

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Background/      # Background image components
│   ├── QuickLaunch/     # Quick launch grid
│   ├── SearchEngine/    # Search functionality
│   ├── Settings/        # Settings modal and forms
│   └── __tests__/       # Component tests
├── hooks/              # Custom React hooks
├── locales/            # Internationalization
├── stores/             # State management (Zustand)
├── styles/             # CSS and styling
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Testing utilities
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run ci` - Run all checks (CI pipeline)

### Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Internationalization**: React i18next
- **Build Tool**: Vite
- **Testing**: Vitest, Testing Library
- **Code Quality**: ESLint, Prettier
- **Browser APIs**: Chrome Extension APIs

## 🧪 Testing

The project includes comprehensive testing:

### Unit Tests
```bash
npm run test
```

### Coverage Report
```bash
npm run test:coverage
```

### Browser Compatibility Testing
- Chrome (Manifest V3)
- Firefox (WebExtensions)
- Edge (Chromium-based)

## 🔒 Security

### Security Features
- Content Security Policy (CSP)
- URL validation and sanitization
- Input sanitization
- Rate limiting
- Privacy-focused design

### Security Audit
```bash
npm audit
```

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Reduced motion support
- Focus management

## 🌍 Internationalization

Currently supported languages:
- English (en)
- Chinese (zh)

To add a new language:
1. Create a new JSON file in `src/locales/`
2. Add translations for all keys
3. Import in `src/locales/i18n.ts`

## 📊 Performance

### Optimization Features
- Code splitting and lazy loading
- Image optimization and caching
- Memory leak prevention
- Bundle size optimization
- Progressive loading

### Performance Monitoring
- Memory usage tracking
- Bundle size analysis
- Lighthouse audits

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_WEATHER_API_KEY=your_openweather_api_key
VITE_BING_API_KEY=your_bing_api_key
```

### Build Configuration
See `vite.config.ts` for build customization options.

## 📱 Browser Support

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 88+ | ✅ Supported |
| Firefox | 89+ | ✅ Supported |
| Edge | 88+ | ✅ Supported |
| Safari | - | ⏳ Planned |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Write comprehensive tests
- Use semantic commit messages
- Follow accessibility guidelines

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bing Image API](https://www.bing.com) for beautiful daily wallpapers
- [OpenWeather](https://openweathermap.org) for weather data
- [Lucide](https://lucide.dev) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling

## 📞 Support

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/new-tab-extension/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/new-tab-extension/discussions)

## 🗺️ Roadmap

### Version 1.1
- [ ] Safari support
- [ ] More search engines
- [ ] Widget system
- [ ] Advanced theming

### Version 1.2
- [ ] Note-taking functionality
- [ ] Calendar integration
- [ ] Todo list
- [ ] RSS feed reader

### Version 2.0
- [ ] Mobile companion app
- [ ] Cloud sync service
- [ ] Advanced analytics
- [ ] Plugin system

---

**Made with ❤️ for a better browsing experience**