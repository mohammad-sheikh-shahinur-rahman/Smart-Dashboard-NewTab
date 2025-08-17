# Currency Converter Troubleshooting Guide

## Issue: "Failed to update exchange rates: TypeError: Failed to fetch"

This error occurs when the currency converter cannot connect to exchange rate APIs.

## What's Been Fixed

### 1. Multiple API Sources
The converter now tries multiple exchange rate APIs in order:
- Exchange Rate API (primary - most reliable)
- Fixer.io (secondary)
- Open Exchange Rates (tertiary)
- Currency Layer API (last resort)

### 2. Enhanced Error Handling
- Graceful fallback to offline rates when all APIs fail
- User notifications about API status
- Automatic retry mechanisms

### 3. Manual Refresh
- Added refresh button to manually update rates
- Visual feedback during refresh (rotating icon)

## How It Works Now

### Automatic Updates
- Rates are updated every hour automatically
- If an API fails, it tries the next one
- Falls back to offline rates if all APIs fail

### Manual Refresh
- Click the refresh button (🔄) in the converter widget
- Shows loading animation while updating
- Displays success/error notifications

### Offline Mode
- Uses pre-defined exchange rates when APIs are unavailable
- Rates may be slightly outdated but functional
- Shows warning notification when using offline rates

## Common Solutions

### 1. Check Network Connection
- Ensure you have internet access
- Check if any firewall is blocking API requests
- Try refreshing the page

### 2. Use Manual Refresh
- Click the refresh button in the converter widget
- Wait for the loading animation to complete
- Check for success/error notifications

### 3. Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for messages about exchange rate APIs
4. Check for any network errors

### 4. Extension Permissions
The extension needs permission to access:
- `https://api.exchangerate-api.com/*`
- `https://api.fixer.io/*`
- `https://openexchangerates.org/*`
- `https://api.currencylayer.com/*`

## API Status

### Exchange Rate API
- **Status**: Free tier available
- **Rate Limits**: 1000 requests/month (free)
- **Fallback**: Yes
- **Priority**: Primary (most reliable)

### Fixer.io
- **Status**: Free tier available
- **Rate Limits**: 100 requests/month (free)
- **Fallback**: Yes
- **Priority**: Secondary

### Open Exchange Rates
- **Status**: May require API key
- **Rate Limits**: Varies by plan
- **Fallback**: Yes
- **Priority**: Tertiary

### Currency Layer API
- **Status**: Free tier available
- **Rate Limits**: 100 requests/month (free)
- **Fallback**: Yes
- **Priority**: Last resort

## Troubleshooting Steps

1. **Try Manual Refresh**
   - Click the refresh button in the converter
   - Check if rates update successfully

2. **Check Console Logs**
   - Open browser console (F12)
   - Look for API error messages
   - Check which APIs are being tried

3. **Test Network Access**
   - Try accessing the APIs directly in browser:
     - `https://api.exchangerate-api.com/v4/latest/USD`
     - `https://api.fixer.io/latest?base=USD`

4. **Check Extension Permissions**
   - Go to Chrome Extensions (chrome://extensions/)
   - Find your extension
   - Ensure it has permission to access external sites

5. **Use Offline Mode**
   - If all APIs fail, the converter will use offline rates
   - Rates will be functional but may be outdated
   - Check the notification for offline mode status

## Expected Behavior

### Normal Operation
- Rates update automatically every hour
- Manual refresh works instantly
- Success notifications appear briefly
- Conversion works smoothly

### When APIs Fail
- Warning notification appears
- Offline rates are used
- Converter remains functional
- Manual refresh still attempts to update

### Error States
- "Loading..." appears while updating
- "Error" appears if conversion fails
- "Rates unavailable" if no rates are available

## Getting Help

If the issue persists:

1. **Check the console** for detailed error messages
2. **Try manual refresh** to see if it's a temporary issue
3. **Test network access** to the API endpoints
4. **Check extension permissions** in Chrome settings
5. **Report the issue** with console logs and error messages

## Alternative Solutions

If you continue to have issues:

1. **Use Offline Mode**: The converter will work with fallback rates
2. **Check API Status**: Visit the API provider websites for service status
3. **Contact Support**: For persistent issues with specific APIs

## Extension Features Without APIs

The converter will still provide:
- ✅ Basic currency conversion (offline rates)
- ✅ Currency selection
- ✅ Amount input/output
- ✅ Swap functionality
- ✅ Favorites system
- ✅ Manual refresh attempts

Only real-time rate updates will be affected when APIs are unavailable.
