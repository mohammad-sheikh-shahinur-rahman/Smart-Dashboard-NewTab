/* 
 * Smart Dashboard NewTab - Search Widget
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class SearchWidget {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchSuggestions = document.getElementById('search-suggestions');
        this.searchEngines = {
            google: 'https://www.google.com/search?q=',
            duckduckgo: 'https://duckduckgo.com/?q=',
            bing: 'https://www.bing.com/search?q=',
            youtube: 'https://www.youtube.com/results?search_query='
        };
        this.currentEngine = 'google';
        this.suggestions = [];
        this.debounceTimeout = null;
        
        // Camera search properties
        this.cameraStream = null;
        this.cameraVideo = null;
        this.cameraCanvas = null;
        this.cameraModal = null;
        this.isCameraActive = false;
        this.capturedImage = null;
    }

    async init() {
        this.setupEventListeners();
        await this.loadSettings();
    }

    setupEventListeners() {
        if (this.searchInput) {
            // Handle input changes
            this.searchInput.addEventListener('input', (e) => {
                this.handleInputChange(e.target.value);
            });

            // Handle form submission
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(e.target.value);
                }
            });

            // Handle focus/blur
            this.searchInput.addEventListener('focus', () => {
                this.showSuggestions();
            });

            // Handle clicks outside to hide suggestions
            document.addEventListener('click', (e) => {
                if (!this.searchInput.contains(e.target) && !this.searchSuggestions.contains(e.target)) {
                    this.hideSuggestions();
                }
            });
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get('searchEngine');
            this.currentEngine = result.searchEngine || 'google';
        } catch (error) {
            console.error('Failed to load search settings:', error);
        }
    }

    handleInputChange(query) {
        // Clear previous timeout
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // Hide suggestions if query is empty
        if (!query.trim()) {
            this.hideSuggestions();
            return;
        }

        // Debounce the search suggestions
        this.debounceTimeout = setTimeout(() => {
            this.fetchSuggestions(query);
        }, 300);
    }

    async fetchSuggestions(query) {
        try {
            let suggestions = [];

            // Get suggestions from different sources based on search engine
            switch (this.currentEngine) {
                case 'google':
                    suggestions = await this.getGoogleSuggestions(query);
                    break;
                case 'duckduckgo':
                    suggestions = await this.getDuckDuckGoSuggestions(query);
                    break;
                case 'bing':
                    suggestions = await this.getBingSuggestions(query);
                    break;
                default:
                    suggestions = [];
            }

            this.suggestions = suggestions;
            this.renderSuggestions();

        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
            this.suggestions = [];
            this.renderSuggestions();
        }
    }

    async getGoogleSuggestions(query) {
        try {
            const response = await fetch(
                `https://www.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`
            );
            
            if (response.ok) {
                const data = await response.json();
                return data[1] || [];
            }
        } catch (error) {
            console.error('Google suggestions failed:', error);
        }
        return [];
    }

    async getDuckDuckGoSuggestions(query) {
        try {
            const response = await fetch(
                `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}`
            );
            
            if (response.ok) {
                const data = await response.json();
                return data.map(item => item.phrase);
            }
        } catch (error) {
            console.error('DuckDuckGo suggestions failed:', error);
        }
        return [];
    }

    async getBingSuggestions(query) {
        try {
            const response = await fetch(
                `https://api.bing.com/qsonhs.aspx?type=cb&q=${encodeURIComponent(query)}`
            );
            
            if (response.ok) {
                const data = await response.json();
                // Parse Bing suggestions (format may vary)
                return data.AS?.Results?.[0]?.Suggests?.map(item => item.Txt) || [];
            }
        } catch (error) {
            console.error('Bing suggestions failed:', error);
        }
        return [];
    }

    renderSuggestions() {
        if (!this.searchSuggestions) return;

        if (this.suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.searchSuggestions.innerHTML = this.suggestions
            .slice(0, 8) // Limit to 8 suggestions
            .map(suggestion => `
                <div class="suggestion-item" data-query="${this.escapeHtml(suggestion)}">
                    <span class="material-symbols-outlined">search</span>
                    <span>${this.escapeHtml(suggestion)}</span>
                </div>
            `).join('');

        // Add event listeners to suggestion items
        this.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                this.searchInput.value = query;
                this.performSearch(query);
            });
        });

        this.showSuggestions();
    }

    showSuggestions() {
        if (this.searchSuggestions && this.suggestions.length > 0) {
            this.searchSuggestions.classList.add('show');
        }
    }

    hideSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.classList.remove('show');
        }
    }

    performSearch(query) {
        if (!query.trim()) return;

        const searchUrl = this.searchEngines[this.currentEngine] + encodeURIComponent(query);
        
        // Open search in new tab
        chrome.tabs.create({ url: searchUrl });
        
        // Hide suggestions
        this.hideSuggestions();
        
        // Clear input
        if (this.searchInput) {
            this.searchInput.value = '';
        }
    }

    setSearchEngine(engine) {
        if (this.searchEngines[engine]) {
            this.currentEngine = engine;
            chrome.storage.sync.set({ searchEngine: engine });
        }
    }

    getCurrentEngine() {
        return this.currentEngine;
    }

    getAvailableEngines() {
        return Object.keys(this.searchEngines);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Camera search functionality
    startCameraSearch() {
        console.log('Starting camera search...');
        this.createCameraModal();
        this.showCameraModal();
    }

    createCameraModal() {
        if (this.cameraModal) return;

        this.cameraModal = document.createElement('div');
        this.cameraModal.className = 'camera-modal';
        this.cameraModal.innerHTML = `
            <div class="camera-modal-content">
                <div class="camera-modal-header">
                    <h3>Camera Search</h3>
                    <button class="camera-close-btn" id="camera-close-btn">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="camera-modal-body">
                    <div class="camera-preview-container">
                        <video id="camera-video" autoplay playsinline></video>
                        <div class="camera-overlay">
                            <div class="camera-frame"></div>
                        </div>
                    </div>
                    <div class="camera-controls">
                        <button class="camera-btn" id="camera-switch-btn">
                            <span class="material-symbols-outlined">flip_camera_ios</span>
                            Switch Camera
                        </button>
                        <button class="camera-btn" id="camera-capture-btn">
                            <span class="material-symbols-outlined">camera_alt</span>
                            Capture
                        </button>
                        <button class="camera-btn" id="camera-cancel-btn">
                            <span class="material-symbols-outlined">cancel</span>
                            Cancel
                        </button>
                    </div>
                    <div class="camera-preview" id="camera-preview" style="display: none;">
                        <img id="captured-image" alt="Captured image">
                        <div class="camera-preview-controls">
                            <button class="camera-btn" id="camera-retake-btn">
                                <span class="material-symbols-outlined">refresh</span>
                                Retake
                            </button>
                            <button class="camera-btn" id="camera-search-btn">
                                <span class="material-symbols-outlined">search</span>
                                Search Image
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.cameraModal);
        this.setupCameraEventListeners();
    }

    setupCameraEventListeners() {
        const closeBtn = document.getElementById('camera-close-btn');
        const switchBtn = document.getElementById('camera-switch-btn');
        const captureBtn = document.getElementById('camera-capture-btn');
        const cancelBtn = document.getElementById('camera-cancel-btn');
        const retakeBtn = document.getElementById('camera-retake-btn');
        const searchBtn = document.getElementById('camera-search-btn');

        if (closeBtn) closeBtn.addEventListener('click', () => this.hideCameraModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideCameraModal());
        if (switchBtn) switchBtn.addEventListener('click', () => this.switchCamera());
        if (captureBtn) captureBtn.addEventListener('click', () => this.captureImage());
        if (retakeBtn) retakeBtn.addEventListener('click', () => this.retakeImage());
        if (searchBtn) searchBtn.addEventListener('click', () => this.searchImage());
    }

    showCameraModal() {
        if (this.cameraModal) {
            this.cameraModal.style.display = 'flex';
            this.initializeCamera();
        }
    }

    hideCameraModal() {
        if (this.cameraModal) {
            this.cameraModal.style.display = 'none';
            this.stopCamera();
        }
    }

    async initializeCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: 'environment', // Start with back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.cameraVideo = document.getElementById('camera-video');
            
            if (this.cameraVideo) {
                this.cameraVideo.srcObject = this.cameraStream;
                this.isCameraActive = true;
                console.log('Camera initialized successfully');
            }
        } catch (error) {
            console.error('Failed to initialize camera:', error);
            this.showNotification('Camera access denied or not available', 'error');
        }
    }

    switchCamera() {
        if (!this.cameraStream) return;

        const currentFacingMode = this.cameraStream.getVideoTracks()[0].getSettings().facingMode;
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: newFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        }).then(newStream => {
            this.stopCamera();
            this.cameraStream = newStream;
            this.cameraVideo.srcObject = newStream;
            this.isCameraActive = true;
        }).catch(error => {
            console.error('Failed to switch camera:', error);
        });
    }

    captureImage() {
        if (!this.cameraVideo || !this.isCameraActive) return;

        this.cameraCanvas = document.createElement('canvas');
        this.cameraCanvas.width = this.cameraVideo.videoWidth;
        this.cameraCanvas.height = this.cameraVideo.videoHeight;

        const ctx = this.cameraCanvas.getContext('2d');
        ctx.drawImage(this.cameraVideo, 0, 0);

        this.capturedImage = this.cameraCanvas.toDataURL('image/jpeg');
        this.showImagePreview();
    }

    showImagePreview() {
        const preview = document.getElementById('camera-preview');
        const image = document.getElementById('captured-image');
        
        if (preview && image) {
            image.src = this.capturedImage;
            preview.style.display = 'block';
            this.stopCamera();
        }
    }

    hideImagePreview() {
        const preview = document.getElementById('camera-preview');
        if (preview) {
            preview.style.display = 'none';
        }
    }

    retakeImage() {
        this.hideImagePreview();
        this.initializeCamera();
    }

    searchImage() {
        if (!this.capturedImage) return;

        // Open Google Lens with the captured image
        const lensUrl = 'https://lens.google.com/';
        chrome.tabs.create({ url: lensUrl });
        
        this.showNotification('Image search opened in new tab. You can upload the captured image.', 'info');
        this.hideCameraModal();
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
            this.isCameraActive = false;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);

        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
    }

    // Public methods
    focus() {
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }

    clear() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.hideSuggestions();
    }
}

// Create widget instance when script loads
window.SearchWidget = new SearchWidget();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchWidget;
}
