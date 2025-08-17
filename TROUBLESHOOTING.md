# Smart Dashboard NewTab - Troubleshooting Guide

This guide helps you resolve common issues with the Smart Dashboard Chrome extension.

## 🔍 Quick Diagnostic

### Check Extension Status
1. Go to `chrome://extensions/`
2. Find "Smart Dashboard NewTab"
3. Ensure it's enabled and has no errors
4. Check if the extension shows any error messages

### Check Console for Errors
1. Open a new tab (should show the dashboard)
2. Press `F12` to open Developer Tools
3. Go to the Console tab
4. Look for any red error messages
5. Note down any error codes or messages

## 🚨 Common Issues & Solutions

### 1. Extension Not Loading

**Symptoms:**
- Extension doesn't appear in Chrome
- "Load unpacked" fails
- Extension shows as disabled

**Solutions:**
```bash
# Check file structure
ls -la new-extension/
# Should show: manifest.json, index.html, background.js, etc.

# Verify manifest.json is valid JSON
cat new-extension/manifest.json | python -m json.tool

# Check for missing files
find new-extension/ -name "*.js" -o -name "*.html" -o -name "*.css"
```

**Common Causes:**
- Invalid JSON in manifest.json
- Missing required files
- Incorrect file permissions
- Chrome cache issues

### 2. Dashboard Not Appearing

**Symptoms:**
- New tab shows default Chrome page
- Dashboard appears but is blank
- Loading screen stuck

**Solutions:**
1. **Reload Extension:**
   - Go to `chrome://extensions/`
   - Click the refresh icon on Smart Dashboard
   - Open a new tab

2. **Clear Browser Cache:**
   - Press `Ctrl+Shift+Delete`
   - Select "Cached images and files"
   - Clear data

3. **Check URL Override:**
   - Ensure `chrome_url_overrides` is set in manifest.json
   - Verify the path to index.html is correct

### 3. Widgets Not Working

**Symptoms:**
- Widgets show loading forever
- Widgets display error messages
- Widgets are missing

**Solutions:**

#### Weather Widget Issues
```javascript
// Check if weather API key is configured
console.log(window.API_KEYS.WEATHER_API_KEY);

// Test weather API directly
fetch('https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Weather API Error:', error));
```

#### Todo Widget Issues
```javascript
// Check if todo data is loading
chrome.storage.sync.get('todos', (result) => {
  console.log('Todo data:', result.todos);
});

// Clear and reset todo data
chrome.storage.sync.remove('todos', () => {
  console.log('Todo data cleared');
});
```

#### Notes Widget Issues
```javascript
// Check notes storage
chrome.storage.sync.get('notes', (result) => {
  console.log('Notes data:', result.notes);
});

// Reset notes if corrupted
chrome.storage.sync.remove('notes', () => {
  console.log('Notes data cleared');
});
```

### 4. API Key Issues

**Symptoms:**
- "API key not configured" errors
- Widgets show placeholder data
- External services not working

**Solutions:**

1. **Verify API Keys:**
   ```javascript
   // Check all API keys
   console.log('API Keys Status:', window.apiKeyManager.getAPIStatus());
   
   // Check missing keys
   console.log('Missing Keys:', window.apiKeyManager.getMissingKeys());
   ```

2. **Get Free API Keys:**
   - **Weather**: [OpenWeatherMap](https://openweathermap.org/api) (free tier available)
   - **Currency**: [Open Exchange Rates](https://openexchangerates.org/) (free tier available)
   - **AI**: [Google Gemini](https://makersuite.google.com/app/apikey) (free tier available)

3. **Update API Keys:**
   ```javascript
   // Update API key programmatically
   window.apiKeyManager.updateKey('WEATHER_API_KEY', 'your_new_key');
   ```

### 5. Storage Issues

**Symptoms:**
- Settings not saving
- Data disappearing
- Widgets reset to defaults

**Solutions:**

1. **Check Storage Permissions:**
   ```javascript
   // Test storage access
   chrome.storage.sync.set({test: 'value'}, () => {
     chrome.storage.sync.get('test', (result) => {
       console.log('Storage test:', result.test);
     });
   });
   ```

2. **Clear and Reset Storage:**
   ```javascript
   // Clear all storage
   chrome.storage.sync.clear();
   chrome.storage.local.clear();
   
   // Reload extension
   chrome.runtime.reload();
   ```

3. **Export/Import Data:**
   ```javascript
   // Export current data
   chrome.storage.sync.get(null, (data) => {
     const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'smart-dashboard-backup.json';
     a.click();
   });
   ```

### 6. Performance Issues

**Symptoms:**
- Dashboard loads slowly
- Widgets lag or freeze
- High memory usage

**Solutions:**

1. **Check Performance:**
   ```javascript
   // Monitor memory usage
   if (performance.memory) {
     console.log('Memory usage:', {
       used: performance.memory.usedJSHeapSize,
       total: performance.memory.totalJSHeapSize,
       limit: performance.memory.jsHeapSizeLimit
     });
   }
   
   // Check load time
   console.log('Page load time:', performance.timing.loadEventEnd - performance.timing.navigationStart);
   ```

2. **Disable Heavy Widgets:**
   - Go to Settings
   - Disable widgets you don't use
   - Restart the extension

3. **Clear Analytics Data:**
   ```javascript
   // Clear analytics if causing issues
   if (window.analytics) {
     window.analytics.clearData();
   }
   ```

### 7. Theme and UI Issues

**Symptoms:**
- Wrong colors or theme
- UI elements misaligned
- Animations not working

**Solutions:**

1. **Reset Theme:**
   ```javascript
   // Force theme reset
   document.documentElement.removeAttribute('data-theme');
   document.documentElement.setAttribute('data-theme', 'light');
   
   // Or set to dark
   document.documentElement.setAttribute('data-theme', 'dark');
   ```

2. **Check CSS Loading:**
   ```javascript
   // Verify CSS files are loaded
   const stylesheets = Array.from(document.styleSheets);
   stylesheets.forEach(sheet => {
     console.log('Stylesheet:', sheet.href);
   });
   ```

3. **Clear CSS Cache:**
   - Hard refresh: `Ctrl+Shift+R`
   - Or clear browser cache completely

### 8. AI Assistant Issues

**Symptoms:**
- AI not responding
- "AI not available" errors
- Gemini API errors

**Solutions:**

1. **Check Gemini API:**
   ```javascript
   // Test Gemini API directly
   fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       contents: [{
         parts: [{
           text: "Hello, how are you?"
         }]
       }]
     })
   })
   .then(response => response.json())
   .then(data => console.log('Gemini response:', data))
   .catch(error => console.error('Gemini error:', error));
   ```

2. **Check API Quota:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Check your API usage and limits
   - Ensure you haven't exceeded free tier limits

### 9. Search Issues

**Symptoms:**
- Search not working
- Search suggestions not appearing
- Voice search not responding

**Solutions:**

1. **Test Search Engines:**
   ```javascript
   // Test different search engines
   const engines = {
     google: 'https://www.google.com/search?q=',
     bing: 'https://www.bing.com/search?q=',
     duckduckgo: 'https://duckduckgo.com/?q='
   };
   
   // Test search functionality
   function testSearch(query, engine = 'google') {
     window.open(engines[engine] + encodeURIComponent(query), '_blank');
   }
   ```

2. **Check Voice Permissions:**
   ```javascript
   // Check microphone permissions
   navigator.permissions.query({name: 'microphone'})
     .then(result => {
       console.log('Microphone permission:', result.state);
     });
   ```

### 10. Integration Issues

**Symptoms:**
- OAuth not working
- External services not connecting
- Integration buttons not responding

**Solutions:**

1. **Check OAuth Configuration:**
   ```javascript
   // Verify OAuth client IDs
   console.log('OAuth Status:', {
     google: window.API_KEYS.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID',
     github: window.API_KEYS.GITHUB_CLIENT_ID !== 'YOUR_GITHUB_CLIENT_ID',
     notion: window.API_KEYS.NOTION_CLIENT_ID !== 'YOUR_NOTION_CLIENT_ID',
     slack: window.API_KEYS.SLACK_CLIENT_ID !== 'YOUR_SLACK_CLIENT_ID'
   });
   ```

2. **Test OAuth Flow:**
   - Ensure redirect URIs are configured correctly
   - Check if OAuth apps are properly set up
   - Verify client secrets are correct

## 🛠️ Advanced Debugging

### Enable Debug Mode
```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');
console.log('Debug mode enabled');

// Check all widget status
Object.keys(window).forEach(key => {
  if (key.endsWith('Widget')) {
    console.log(`${key}:`, window[key]);
  }
});
```

### Performance Profiling
```javascript
// Start performance monitoring
const startTime = performance.now();

// Your code here

const endTime = performance.now();
console.log(`Execution time: ${endTime - startTime}ms`);
```

### Memory Leak Detection
```javascript
// Monitor memory usage over time
setInterval(() => {
  if (performance.memory) {
    console.log('Memory:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
    });
  }
}, 5000);
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the Console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Copy all error messages

2. **Gather Information:**
   - Chrome version: `chrome://version/`
   - Extension version: Check manifest.json
   - Operating system and version
   - Any error messages or screenshots

3. **Report Issues:**
   - Create a GitHub issue with detailed information
   - Include console logs and error messages
   - Describe steps to reproduce the problem

## 🔄 Reset Everything

If all else fails, you can reset the extension completely:

```javascript
// Nuclear option - reset everything
chrome.storage.sync.clear();
chrome.storage.local.clear();
localStorage.clear();
sessionStorage.clear();

// Reload the extension
chrome.runtime.reload();
```

Then reconfigure your settings and API keys.

---

**Remember:** Most issues can be resolved by checking the browser console for error messages and ensuring all API keys are properly configured.
