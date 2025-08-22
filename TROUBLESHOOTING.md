# Troubleshooting Guide

This guide helps resolve common issues with the Modern New Tab Extension.

## 🔧 Development Issues

### Build Problems

#### `npm install` fails
**Symptoms**: Dependencies fail to install
**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with latest npm
npm install -g npm@latest
npm install
```

#### TypeScript compilation errors
**Symptoms**: Type errors during build
**Solutions**:
```bash
# Check TypeScript version
npm ls typescript

# Run type checking
npm run type-check

# Fix common issues
# - Update @types packages
# - Check tsconfig.json settings
# - Verify import paths
```

#### Vite build fails
**Symptoms**: Build process stops with errors
**Solutions**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Check vite.config.ts
# Verify all plugins are compatible
# Update Vite and plugins to latest versions
```

### Testing Issues

#### Tests fail to run
**Symptoms**: Vitest doesn't start or crashes
**Solutions**:
```bash
# Check Node version (requires 16+)
node --version

# Clear test cache
npm run test -- --no-cache

# Update test dependencies
npm update @vitest/ui vitest @testing-library/react
```

#### Mock issues
**Symptoms**: Chrome APIs not mocked properly
**Solutions**:
- Check `src/test/setup.ts` for proper mocks
- Verify `jest-webextension-mock` is installed
- Update mock configurations for new APIs

### Linting and Formatting

#### ESLint errors
**Symptoms**: Code doesn't pass linting
**Solutions**:
```bash
# Auto-fix issues
npm run lint:fix

# Check .eslintrc.json configuration
# Update ESLint and plugins
# Disable specific rules if needed
```

#### Prettier conflicts
**Symptoms**: Code formatting conflicts with ESLint
**Solutions**:
- Check `.prettierrc` configuration
- Ensure `eslint-config-prettier` is installed
- Run `npm run format` before linting

## 🌐 Browser Compatibility

### Chrome Extension Issues

#### Extension doesn't load
**Symptoms**: Extension fails to load in Chrome
**Solutions**:
1. Check `manifest.json` syntax
2. Verify all permissions are valid
3. Check for console errors in extension popup
4. Ensure Manifest V3 compatibility

```bash
# Validate manifest
chrome://extensions/ > Developer mode > Load unpacked
```

#### Service worker issues
**Symptoms**: Background script errors
**Solutions**:
1. Check `public/background.js` for errors
2. Verify service worker registration
3. Check Chrome DevTools > Application > Service Workers
4. Ensure proper async/await usage

### Firefox Compatibility

#### WebExtension API differences
**Symptoms**: Features work in Chrome but not Firefox
**Solutions**:
1. Check [WebExtension API compatibility](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
2. Use `browser` instead of `chrome` where needed
3. Implement Firefox-specific fallbacks

#### Content Security Policy
**Symptoms**: CSP violations in Firefox
**Solutions**:
1. Update manifest CSP for Firefox
2. Remove `'unsafe-eval'` if possible
3. Use stricter CSP directives

### Edge-specific Issues

#### Chromium compatibility
**Symptoms**: Extension works in Chrome but not Edge
**Solutions**:
1. Test with latest Edge version
2. Check for Edge-specific API limitations
3. Verify extension store requirements

## 🎨 UI/UX Issues

### Styling Problems

#### Tailwind CSS not working
**Symptoms**: Styles not applied
**Solutions**:
```bash
# Check if Tailwind is properly imported
# Verify tailwind.config.js
# Rebuild CSS
npm run build
```

#### Dark mode issues
**Symptoms**: Theme switching doesn't work
**Solutions**:
1. Check `useTheme` hook implementation
2. Verify CSS custom properties
3. Test `prefers-color-scheme` detection

#### Responsive design breaks
**Symptoms**: Layout issues on different screen sizes
**Solutions**:
1. Test with Chrome DevTools device emulation
2. Check Tailwind responsive classes
3. Verify flex/grid implementations

### Animation Issues

#### Framer Motion errors
**Symptoms**: Animations don't work or cause crashes
**Solutions**:
```bash
# Update Framer Motion
npm update framer-motion

# Check for conflicting CSS
# Verify motion configurations
# Test with reduced motion preference
```

#### Performance problems
**Symptoms**: Animations are janky or slow
**Solutions**:
1. Enable hardware acceleration
2. Use `will-change` CSS property sparingly
3. Implement `useReducedMotion` hook
4. Profile performance with DevTools

## 🔄 Data and Sync Issues

### Storage Problems

#### Data not persisting
**Symptoms**: Settings reset on browser restart
**Solutions**:
1. Check Chrome storage permissions
2. Verify storage API usage
3. Test with storage quotas
4. Implement error handling

```javascript
// Debug storage
chrome.storage.local.get(null, (result) => {
  console.log('All stored data:', result);
});
```

#### Sync issues
**Symptoms**: Settings don't sync across devices
**Solutions**:
1. Check `chrome.storage.sync` quotas
2. Verify sync implementation
3. Test with multiple browser profiles
4. Implement conflict resolution

### WebDAV Sync

#### Connection failures
**Symptoms**: WebDAV sync doesn't work
**Solutions**:
1. Verify WebDAV server URL and credentials
2. Check CORS headers on server
3. Test with WebDAV client tools
4. Implement proper error handling

#### Authentication issues
**Symptoms**: 401/403 errors during sync
**Solutions**:
1. Verify username/password
2. Check server authentication method
3. Test with basic auth vs digest auth
4. Implement token refresh logic

## 🔒 Security Issues

### Content Security Policy

#### CSP violations
**Symptoms**: Console errors about blocked content
**Solutions**:
1. Update manifest CSP directives
2. Remove inline scripts/styles
3. Use nonce or hash for allowed content
4. Whitelist necessary domains

### Permission Issues

#### API access denied
**Symptoms**: Chrome APIs return permission errors
**Solutions**:
1. Check manifest permissions
2. Request permissions at runtime if needed
3. Handle permission denial gracefully
4. Provide user-friendly error messages

## ⚡ Performance Issues

### Memory Problems

#### Memory leaks
**Symptoms**: Extension uses increasing memory over time
**Solutions**:
1. Use memory monitoring utilities
2. Check for unregistered event listeners
3. Verify cleanup in useEffect hooks
4. Profile with Chrome DevTools Memory tab

```javascript
// Debug memory usage
if ('memory' in performance) {
  console.log('Memory usage:', performance.memory);
}
```

#### High CPU usage
**Symptoms**: Extension causes browser slowdown
**Solutions**:
1. Profile CPU usage with DevTools
2. Optimize expensive operations
3. Implement debouncing/throttling
4. Use Web Workers for heavy tasks

### Bundle Size

#### Large bundle warnings
**Symptoms**: Build warnings about bundle size
**Solutions**:
1. Analyze bundle with `npm run build`
2. Implement code splitting
3. Remove unused dependencies
4. Optimize images and assets

```bash
# Analyze bundle size
npx vite-bundle-analyzer dist/assets/*.js
```

## 🌍 Internationalization Issues

### Translation Problems

#### Missing translations
**Symptoms**: Text shows as keys instead of translated text
**Solutions**:
1. Check translation files in `src/locales/`
2. Verify key names match usage
3. Test language switching
4. Implement fallback to default language

#### RTL language issues
**Symptoms**: Layout breaks with RTL languages
**Solutions**:
1. Test with RTL language settings
2. Use logical CSS properties
3. Implement direction-aware components
4. Test with Arabic or Hebrew

## 🔍 Debugging Tools

### Chrome DevTools

#### Extension debugging
```bash
# Open extension DevTools
chrome://extensions/ > Extension Details > Inspect views
```

#### Background script debugging
```bash
# Debug service worker
chrome://extensions/ > Extension Details > Inspect views > service worker
```

### Firefox Debugging

#### Extension debugging
```bash
# Open about:debugging
about:debugging > This Firefox > Extension Name > Inspect
```

### Console Commands

#### Storage debugging
```javascript
// Chrome storage
chrome.storage.local.get(null, console.log);
chrome.storage.sync.get(null, console.log);

// Clear storage
chrome.storage.local.clear();
chrome.storage.sync.clear();
```

#### Permission debugging
```javascript
// Check permissions
chrome.permissions.getAll(console.log);

// Request permission
chrome.permissions.request({
  permissions: ['tabs']
}, console.log);
```

## 📞 Getting Help

### Documentation Resources
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Firefox WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Community Support
- [Chrome Extensions Google Group](https://groups.google.com/a/chromium.org/g/chromium-extensions)
- [Firefox Add-ons Discourse](https://discourse.mozilla.org/c/add-ons/35)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/chrome-extension)

### Issue Reporting

When reporting issues, include:
1. **Environment details**
   - Browser version
   - Operating system
   - Extension version

2. **Steps to reproduce**
   - Detailed reproduction steps
   - Expected vs actual behavior

3. **Debug information**
   - Console errors
   - Network requests
   - Storage contents

4. **Code snippets**
   - Relevant code sections
   - Configuration files

### Emergency Contacts
- **Security issues**: security@yourproject.com
- **Critical bugs**: bugs@yourproject.com
- **General support**: support@yourproject.com

---

**💡 Pro Tip**: Always test your extension in a fresh browser profile to avoid conflicts with other extensions or settings.