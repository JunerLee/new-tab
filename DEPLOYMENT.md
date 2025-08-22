# Deployment Guide

This guide covers how to deploy the Modern New Tab Extension to various browser extension stores.

## 📋 Pre-deployment Checklist

### 1. Code Quality
- [ ] All tests pass (`npm run test:run`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Security audit passes (`npm audit`)

### 2. Build Quality
- [ ] Production build completes successfully (`npm run build`)
- [ ] Bundle size is within limits (< 5MB)
- [ ] All assets are properly optimized
- [ ] Source maps are excluded from production build

### 3. Extension Validation
- [ ] Manifest V3 compliance
- [ ] All permissions are justified
- [ ] CSP is properly configured
- [ ] Icons are provided in all required sizes
- [ ] Extension loads without errors in all target browsers

### 4. Testing
- [ ] Manual testing in Chrome
- [ ] Manual testing in Firefox  
- [ ] Manual testing in Edge
- [ ] Accessibility testing completed
- [ ] Performance testing completed

## 🏗️ Build Process

1. **Install dependencies**
   ```bash
   npm ci
   ```

2. **Run quality checks**
   ```bash
   npm run ci
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Verify build output**
   ```bash
   ls -la dist/
   ```

## 🌐 Chrome Web Store

### Prerequisites
- Google Developer account ($5 registration fee)
- Chrome Web Store Developer Dashboard access
- Extension ID from previous submission (for updates)

### Steps
1. **Package the extension**
   ```bash
   cd dist
   zip -r ../extension-chrome.zip .
   ```

2. **Upload to Chrome Web Store**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
   - Click "Add new item"
   - Upload the ZIP file
   - Fill in store listing details
   - Upload screenshots and promotional images
   - Submit for review

3. **Store Listing Requirements**
   - Detailed description (minimum 132 characters)
   - Screenshots (1280x800 or 640x400)
   - Small tile icon (128x128)
   - Promotional images (optional but recommended)
   - Privacy policy URL (if collecting user data)

### Review Process
- Initial review: 1-3 business days
- Updates: Usually faster approval
- Rejections: Address feedback and resubmit

## 🦊 Firefox Add-ons

### Prerequisites
- Mozilla Developer account (free)
- Add-on Developer Hub access

### Steps
1. **Package the extension**
   ```bash
   cd dist
   zip -r ../extension-firefox.zip .
   ```

2. **Upload to Firefox Add-ons**
   - Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
   - Click "Submit a New Add-on"
   - Upload the ZIP file
   - Choose distribution method
   - Fill in listing details

3. **Store Listing Requirements**
   - Add-on name and summary
   - Detailed description
   - Categories and tags
   - Screenshots
   - Icon (48x48, 96x96)
   - Privacy policy (if applicable)

### Review Process
- Automated review: Few minutes to hours
- Manual review: 1-7 days (if flagged)
- Listed immediately after approval

## 🔷 Microsoft Edge Add-ons

### Prerequisites
- Microsoft Partner Center account
- Edge Add-ons dashboard access

### Steps
1. **Package the extension**
   ```bash
   cd dist
   zip -r ../extension-edge.zip .
   ```

2. **Upload to Edge Add-ons**
   - Go to [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview)
   - Click "New extension"
   - Upload the ZIP file
   - Complete store listing

3. **Store Listing Requirements**
   - Extension name and description
   - Categories
   - Screenshots (1366x768)
   - Icons (44x44, 150x150, 310x150)
   - Privacy policy URL

### Review Process
- Review time: 7-14 business days
- Certification requirements must be met
- May require additional documentation

## 🚀 Automated Deployment

### GitHub Actions Setup
The repository includes a CI/CD pipeline that can automatically deploy to stores on release.

1. **Set up secrets in GitHub repository**
   ```
   CHROME_EXTENSION_ID
   CHROME_CLIENT_ID
   CHROME_CLIENT_SECRET
   CHROME_REFRESH_TOKEN
   
   FIREFOX_JWT_ISSUER
   FIREFOX_JWT_SECRET
   
   EDGE_PRODUCT_ID
   EDGE_CLIENT_ID
   EDGE_CLIENT_SECRET
   ```

2. **Create a release**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Monitor deployment**
   - Check GitHub Actions workflow
   - Verify upload to each store
   - Monitor review status

### Manual Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment process..."

# Quality checks
npm run ci

# Build
npm run build

# Package for each browser
cd dist

# Chrome
zip -r ../chrome-extension.zip .
echo "✅ Chrome package ready"

# Firefox  
zip -r ../firefox-extension.zip .
echo "✅ Firefox package ready"

# Edge
zip -r ../edge-extension.zip .
echo "✅ Edge package ready"

cd ..

echo "🎉 All packages ready for upload!"
echo "📁 Files:"
echo "  - chrome-extension.zip"
echo "  - firefox-extension.zip"  
echo "  - edge-extension.zip"
```

## 📊 Post-deployment Monitoring

### Analytics Setup
- Google Analytics for web store views
- Chrome Web Store analytics
- Firefox Add-ons statistics
- Edge Add-ons analytics

### User Feedback
- Monitor store reviews and ratings
- Set up support channels
- Track user-reported issues
- Regular feedback analysis

### Version Management
- Semantic versioning (x.y.z)
- Changelog maintenance
- Release notes
- Backwards compatibility

## 🔄 Update Process

### Minor Updates (Bug fixes)
1. Fix the issue
2. Update version number (patch)
3. Test thoroughly
4. Deploy through automated pipeline

### Major Updates (New features)
1. Feature development
2. Comprehensive testing
3. Update version number (minor/major)
4. Update store listings if needed
5. Deploy with detailed changelog

### Emergency Updates
1. Hotfix deployment
2. Expedited review request
3. Communication to users
4. Monitor rollout

## 🛠️ Troubleshooting

### Common Deployment Issues

**Build Failures**
- Check Node.js version compatibility
- Clear node_modules and reinstall
- Verify all dependencies are available

**Store Rejections**
- Review store policies carefully
- Address all feedback points
- Test in fresh browser profile
- Validate manifest.json

**Permission Issues**
- Justify all requested permissions
- Use optional permissions where possible
- Provide clear permission explanations

**Performance Issues**
- Optimize bundle size
- Check for memory leaks
- Profile extension performance

### Support Resources
- [Chrome Web Store Developer Policy](https://developer.chrome.com/docs/webstore/program-policies/)
- [Firefox Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)
- [Edge Add-ons Policies](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/store-policies/developer-policies)

## 📞 Support Contacts

- **Chrome Web Store**: Developer Support
- **Firefox Add-ons**: Add-on Review Team
- **Edge Add-ons**: Partner Center Support

---

**🎯 Remember**: Each store has different requirements and review processes. Plan accordingly and always test your extension thoroughly before submission.