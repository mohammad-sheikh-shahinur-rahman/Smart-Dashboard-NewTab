/**
 * Integrations Module
 * Connects with external services and APIs
 */

class Integrations {
    constructor() {
        this.connections = {
            google: null,
            github: null,
            notion: null,
            slack: null,
            trello: null,
            discord: null
        };
        this.apiKeys = {};
        this.isInitialized = false;
        this.init();
    }

    async init() {
        await this.loadConnections();
        this.setupOAuthListeners();
        this.isInitialized = true;
    }

    async loadConnections() {
        try {
            const stored = await chrome.storage.local.get(['integrations', 'apiKeys']);
            this.connections = { ...this.connections, ...stored.integrations };
            this.apiKeys = stored.apiKeys || {};
        } catch (error) {
            console.log('Integrations: Loading connections failed', error);
        }
    }

    async saveConnections() {
        try {
            await chrome.storage.local.set({
                integrations: this.connections,
                apiKeys: this.apiKeys
            });
        } catch (error) {
            console.log('Integrations: Saving connections failed', error);
        }
    }

    setupOAuthListeners() {
        // Listen for OAuth callbacks
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'oauth_callback') {
                this.handleOAuthCallback(message.provider, message.code);
            }
        });
    }

    // Google Calendar Integration
    async connectGoogle() {
        const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual client ID
        const scopes = [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events'
        ];

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${chrome.runtime.getURL('oauth.html')}&` +
            `scope=${scopes.join(' ')}&` +
            `response_type=code&` +
            `access_type=offline`;

        // Open OAuth popup
        const popup = window.open(authUrl, 'google_oauth', 
            'width=500,height=600,scrollbars=yes,resizable=yes');

        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    if (this.connections.google) {
                        resolve(this.connections.google);
                    } else {
                        reject(new Error('OAuth cancelled'));
                    }
                }
            }, 1000);
        });
    }

    async handleGoogleOAuth(code) {
        try {
            // Exchange code for tokens
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code: code,
                    client_id: 'YOUR_GOOGLE_CLIENT_ID',
                    client_secret: 'YOUR_GOOGLE_CLIENT_SECRET',
                    redirect_uri: chrome.runtime.getURL('oauth.html'),
                    grant_type: 'authorization_code'
                })
            });

            const tokens = await response.json();
            
            this.connections.google = {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: Date.now() + (tokens.expires_in * 1000)
            };

            await this.saveConnections();
            this.notifyConnectionChange('google', true);
            
            return this.connections.google;
        } catch (error) {
            console.error('Google OAuth failed:', error);
            throw error;
        }
    }

    async getGoogleEvents(calendarId = 'primary', maxResults = 10) {
        if (!this.connections.google) {
            throw new Error('Google not connected');
        }

        await this.refreshGoogleToken();

        const now = new Date();
        const timeMin = now.toISOString();
        const timeMax = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString();

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
            `timeMin=${timeMin}&timeMax=${timeMax}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
            {
                headers: {
                    'Authorization': `Bearer ${this.connections.google.accessToken}`
                }
            }
        );

        const data = await response.json();
        return data.items.map(event => ({
            id: event.id,
            title: event.summary,
            description: event.description,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            location: event.location,
            attendees: event.attendees?.map(a => a.email) || []
        }));
    }

    async createGoogleEvent(event) {
        if (!this.connections.google) {
            throw new Error('Google not connected');
        }

        await this.refreshGoogleToken();

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.connections.google.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    summary: event.title,
                    description: event.description,
                    start: { dateTime: event.start },
                    end: { dateTime: event.end },
                    location: event.location
                })
            }
        );

        return await response.json();
    }

    async refreshGoogleToken() {
        if (!this.connections.google?.refreshToken) return;

        if (Date.now() < this.connections.google.expiresAt - 60000) return; // Still valid

        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    refresh_token: this.connections.google.refreshToken,
                    client_id: 'YOUR_GOOGLE_CLIENT_ID',
                    client_secret: 'YOUR_GOOGLE_CLIENT_SECRET',
                    grant_type: 'refresh_token'
                })
            });

            const tokens = await response.json();
            
            this.connections.google.accessToken = tokens.access_token;
            this.connections.google.expiresAt = Date.now() + (tokens.expires_in * 1000);
            
            await this.saveConnections();
        } catch (error) {
            console.error('Failed to refresh Google token:', error);
            this.disconnectGoogle();
        }
    }

    // GitHub Integration
    async connectGitHub() {
        const clientId = 'YOUR_GITHUB_CLIENT_ID';
        const scopes = ['repo', 'user', 'read:org'];

        const authUrl = `https://github.com/login/oauth/authorize?` +
            `client_id=${clientId}&` +
            `scope=${scopes.join(' ')}&` +
            `redirect_uri=${chrome.runtime.getURL('oauth.html')}`;

        const popup = window.open(authUrl, 'github_oauth', 
            'width=500,height=600,scrollbars=yes,resizable=yes');

        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    if (this.connections.github) {
                        resolve(this.connections.github);
                    } else {
                        reject(new Error('OAuth cancelled'));
                    }
                }
            }, 1000);
        });
    }

    async handleGitHubOAuth(code) {
        try {
            const response = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: 'YOUR_GITHUB_CLIENT_ID',
                    client_secret: 'YOUR_GITHUB_CLIENT_SECRET',
                    code: code
                })
            });

            const tokens = await response.json();
            
            this.connections.github = {
                accessToken: tokens.access_token
            };

            await this.saveConnections();
            this.notifyConnectionChange('github', true);
            
            return this.connections.github;
        } catch (error) {
            console.error('GitHub OAuth failed:', error);
            throw error;
        }
    }

    async getGitHubRepos() {
        if (!this.connections.github) {
            throw new Error('GitHub not connected');
        }

        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
            headers: {
                'Authorization': `token ${this.connections.github.accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const repos = await response.json();
        return repos.map(repo => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updatedAt: repo.updated_at,
            url: repo.html_url
        }));
    }

    async getGitHubActivity() {
        if (!this.connections.github) {
            throw new Error('GitHub not connected');
        }

        const response = await fetch('https://api.github.com/users/YOUR_USERNAME/events?per_page=10', {
            headers: {
                'Authorization': `token ${this.connections.github.accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const events = await response.json();
        return events.map(event => ({
            id: event.id,
            type: event.type,
            repo: event.repo?.name,
            actor: event.actor?.login,
            createdAt: event.created_at,
            payload: event.payload
        }));
    }

    // Notion Integration
    async connectNotion() {
        const clientId = 'YOUR_NOTION_CLIENT_ID';
        const scopes = ['read', 'write'];

        const authUrl = `https://api.notion.com/v1/oauth/authorize?` +
            `client_id=${clientId}&` +
            `response_type=code&` +
            `owner=user&` +
            `redirect_uri=${chrome.runtime.getURL('oauth.html')}`;

        const popup = window.open(authUrl, 'notion_oauth', 
            'width=500,height=600,scrollbars=yes,resizable=yes');

        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    if (this.connections.notion) {
                        resolve(this.connections.notion);
                    } else {
                        reject(new Error('OAuth cancelled'));
                    }
                }
            }, 1000);
        });
    }

    async handleNotionOAuth(code) {
        try {
            const response = await fetch('https://api.notion.com/v1/oauth/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa('YOUR_NOTION_CLIENT_ID:YOUR_NOTION_CLIENT_SECRET')}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28'
                },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: chrome.runtime.getURL('oauth.html')
                })
            });

            const tokens = await response.json();
            
            this.connections.notion = {
                accessToken: tokens.access_token,
                workspaceId: tokens.workspace_id,
                workspaceName: tokens.workspace_name
            };

            await this.saveConnections();
            this.notifyConnectionChange('notion', true);
            
            return this.connections.notion;
        } catch (error) {
            console.error('Notion OAuth failed:', error);
            throw error;
        }
    }

    async getNotionPages() {
        if (!this.connections.notion) {
            throw new Error('Notion not connected');
        }

        const response = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.connections.notion.accessToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                filter: {
                    property: 'object',
                    value: 'page'
                },
                page_size: 10
            })
        });

        const data = await response.json();
        return data.results.map(page => ({
            id: page.id,
            title: page.properties?.title?.title?.[0]?.plain_text || 'Untitled',
            url: page.url,
            lastEdited: page.last_edited_time
        }));
    }

    // Slack Integration
    async connectSlack() {
        const clientId = 'YOUR_SLACK_CLIENT_ID';
        const scopes = ['channels:read', 'chat:write', 'users:read'];

        const authUrl = `https://slack.com/oauth/v2/authorize?` +
            `client_id=${clientId}&` +
            `scope=${scopes.join(',')}&` +
            `redirect_uri=${chrome.runtime.getURL('oauth.html')}`;

        const popup = window.open(authUrl, 'slack_oauth', 
            'width=500,height=600,scrollbars=yes,resizable=yes');

        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    if (this.connections.slack) {
                        resolve(this.connections.slack);
                    } else {
                        reject(new Error('OAuth cancelled'));
                    }
                }
            }, 1000);
        });
    }

    async handleSlackOAuth(code) {
        try {
            const response = await fetch('https://slack.com/api/oauth.v2.access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: 'YOUR_SLACK_CLIENT_ID',
                    client_secret: 'YOUR_SLACK_CLIENT_SECRET',
                    code: code,
                    redirect_uri: chrome.runtime.getURL('oauth.html')
                })
            });

            const tokens = await response.json();
            
            this.connections.slack = {
                accessToken: tokens.access_token,
                teamId: tokens.team?.id,
                teamName: tokens.team?.name
            };

            await this.saveConnections();
            this.notifyConnectionChange('slack', true);
            
            return this.connections.slack;
        } catch (error) {
            console.error('Slack OAuth failed:', error);
            throw error;
        }
    }

    async sendSlackMessage(channel, message) {
        if (!this.connections.slack) {
            throw new Error('Slack not connected');
        }

        const response = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.connections.slack.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                channel: channel,
                text: message
            })
        });

        return await response.json();
    }

    // Utility Methods
    async handleOAuthCallback(provider, code) {
        switch (provider) {
            case 'google':
                return await this.handleGoogleOAuth(code);
            case 'github':
                return await this.handleGitHubOAuth(code);
            case 'notion':
                return await this.handleNotionOAuth(code);
            case 'slack':
                return await this.handleSlackOAuth(code);
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }

    disconnectProvider(provider) {
        this.connections[provider] = null;
        this.saveConnections();
        this.notifyConnectionChange(provider, false);
    }

    disconnectGoogle() {
        this.disconnectProvider('google');
    }

    disconnectGitHub() {
        this.disconnectProvider('github');
    }

    disconnectNotion() {
        this.disconnectProvider('notion');
    }

    disconnectSlack() {
        this.disconnectProvider('slack');
    }

    isConnected(provider) {
        return !!this.connections[provider];
    }

    getConnectionStatus() {
        return Object.keys(this.connections).reduce((status, provider) => {
            status[provider] = !!this.connections[provider];
            return status;
        }, {});
    }

    notifyConnectionChange(provider, isConnected) {
        const event = new CustomEvent('integrationChanged', {
            detail: { provider, isConnected }
        });
        document.dispatchEvent(event);
    }

    // API Key Management
    setApiKey(service, key) {
        this.apiKeys[service] = key;
        this.saveConnections();
    }

    getApiKey(service) {
        return this.apiKeys[service];
    }

    removeApiKey(service) {
        delete this.apiKeys[service];
        this.saveConnections();
    }
}

// Export for use in other modules
window.Integrations = Integrations;
