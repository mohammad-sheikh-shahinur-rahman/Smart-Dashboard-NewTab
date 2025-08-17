# Gemini API Troubleshooting Guide

## Issue: "Gemini API call failed: Error: Gemini API error: 404"

This error typically occurs when there's an issue with the API endpoint, API key, or API access permissions.

## Quick Fixes

### 1. Updated API Endpoint
The extension now uses the stable Gemini API endpoint:
- **Old**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **New**: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`

### 2. Enhanced Error Handling
The extension now includes:
- Better error logging with detailed response information
- Fallback suggestions when the API is unavailable
- Graceful degradation to local features

### 3. API Key Validation
The extension checks if the API key is properly configured and falls back to local features if not.

## Testing the API

### Option 1: Use the Test Page
1. Open `test-gemini.html` in your browser
2. Click "Test Gemini API" to verify the connection
3. Check the browser console for detailed error information

### Option 2: Check API Key Status
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Verify your API key is active and has the necessary permissions
3. Check if you have any usage quotas or restrictions

## Common Solutions

### 1. Enable Gemini API
If you haven't enabled the Gemini API:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for "Generative Language API"
5. Click "Enable"

### 2. Check API Key Permissions
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your API key and click on it
4. Ensure it has access to the Generative Language API
5. Check if there are any restrictions that might block the requests

### 3. Verify API Key Format
Your API key should:
- Start with "AIza"
- Be 39 characters long
- Not contain any spaces or special characters

### 4. Check Network Access
- Ensure your network allows HTTPS requests to `generativelanguage.googleapis.com`
- Check if any firewall or proxy is blocking the requests

## Fallback Features

When the Gemini API is unavailable, the extension automatically uses:

### Smart Suggestions
- Time-based productivity tips
- Task organization suggestions
- Wellness reminders

### Chat Responses
- Pre-defined helpful responses for common queries
- Productivity advice and tips
- Task management guidance

### Task Prioritization
- Local algorithm based on due dates and user priorities
- Time-of-day considerations
- Category-based prioritization

### Productivity Insights
- General productivity best practices
- Time management techniques
- Focus and wellness recommendations

## Debug Information

The extension now logs detailed information to help diagnose issues:

1. Open the browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for messages starting with "Gemini API" or "AI Assistant"
4. Check for any error messages or response details

## Getting Help

If the issue persists:

1. Check the browser console for detailed error messages
2. Verify your API key is working with the test page
3. Ensure the Gemini API is enabled in your Google Cloud project
4. Check if you have any usage quotas or billing issues

## Alternative Solutions

If you continue to have issues with the Gemini API:

1. **Use Fallback Mode**: The extension will work with local features
2. **Contact Google Support**: For API-specific issues
3. **Check API Status**: Visit [Google Cloud Status](https://status.cloud.google.com/) for any service disruptions

## Extension Features Without Gemini API

The extension will still provide:
- ✅ Clock widget (digital/analog)
- ✅ Weather information
- ✅ Quote of the day
- ✅ Task management
- ✅ Timer and productivity tools
- ✅ Settings and customization
- ✅ Local smart suggestions
- ✅ Basic chat responses
- ✅ Task prioritization (local algorithm)
- ✅ Productivity insights (pre-defined)

Only the AI-powered features will use fallback responses when the Gemini API is unavailable.
