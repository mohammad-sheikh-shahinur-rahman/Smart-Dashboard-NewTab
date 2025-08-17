/* 
 * Enhanced Voice Widget - Speech Recognition and Text-to-Speech
 * Features: Voice commands, Speech-to-text, Text-to-speech, Voice notes
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class VoiceWidget {
    constructor() {
        this.isListening = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
        
        // Voice settings
        this.voiceSettings = {
            language: 'en-US',
            voice: null,
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            autoSpeak: false,
            continuous: false
        };
        
        // Commands
        this.voiceCommands = {
            'new task': () => this.executeCommand('new task'),
            'add task': () => this.executeCommand('new task'),
            'create task': () => this.executeCommand('new task'),
            'start timer': () => this.executeCommand('start timer'),
            'begin timer': () => this.executeCommand('start timer'),
            'stop timer': () => this.executeCommand('stop timer'),
            'pause timer': () => this.executeCommand('pause timer'),
            'new note': () => this.executeCommand('new note'),
            'add note': () => this.executeCommand('new note'),
            'create note': () => this.executeCommand('new note'),
            'open settings': () => this.executeCommand('open settings'),
            'show settings': () => this.executeCommand('open settings'),
            'what time': () => this.executeCommand('time'),
            'current time': () => this.executeCommand('time'),
            'what date': () => this.executeCommand('date'),
            'today date': () => this.executeCommand('date'),
            'weather': () => this.executeCommand('weather'),
            'weather today': () => this.executeCommand('weather'),
            'quote': () => this.executeCommand('quote'),
            'daily quote': () => this.executeCommand('quote'),
            'help': () => this.executeCommand('help'),
            'voice help': () => this.executeCommand('help')
        };
        
        // DOM elements
        this.voiceContainer = document.getElementById('voice-container');
        this.voiceButton = document.getElementById('voice-btn');
        this.voiceStatus = document.getElementById('voice-status');
        this.voiceTranscript = document.getElementById('voice-transcript');
        this.voiceCommands = document.getElementById('voice-commands');
        this.settingsBtn = document.getElementById('voice-settings');
        
        // Voice notes
        this.voiceNotes = [];
        this.currentNote = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadSettings();
            await this.loadVoiceNotes();
        this.setupSpeechRecognition();
        this.setupEventListeners();
            this.updateDisplay();
            console.log('Voice Widget initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Voice Widget:', error);
            this.showError('Speech recognition not supported');
        }
    }

    setupSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            throw new Error('Speech recognition not supported');
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        this.recognition.continuous = this.voiceSettings.continuous;
        this.recognition.interimResults = true;
        this.recognition.lang = this.voiceSettings.language;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateDisplay();
            this.showNotification('Listening...', 'info');
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                this.processVoiceCommand(finalTranscript);
            }
            
            this.updateTranscript(finalTranscript || interimTranscript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateDisplay();
            
            if (event.error === 'no-speech') {
                this.showNotification('No speech detected', 'warning');
            } else if (event.error === 'audio-capture') {
                this.showNotification('Microphone not available', 'error');
            } else {
                this.showNotification(`Error: ${event.error}`, 'error');
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateDisplay();
            
            if (this.voiceSettings.continuous) {
                this.startListening();
            }
        };
    }

    setupEventListeners() {
        // Voice button
        if (this.voiceButton) {
            this.voiceButton.addEventListener('click', () => {
                this.toggleListening();
            });
        }

        // Settings button
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // Voice notes button
        const notesBtn = document.getElementById('voice-notes-btn');
        if (notesBtn) {
            notesBtn.addEventListener('click', () => {
                this.showVoiceNotes();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+V to toggle voice recognition
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.toggleListening();
            }
            
            // Escape to stop listening
            if (e.key === 'Escape' && this.isListening) {
                e.preventDefault();
                this.stopListening();
            }
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get('voice_settings');
            this.voiceSettings = { ...this.voiceSettings, ...result.voice_settings };
        } catch (error) {
            console.error('Failed to load voice settings:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({
                voice_settings: this.voiceSettings
            });
        } catch (error) {
            console.error('Failed to save voice settings:', error);
        }
    }

    async loadVoiceNotes() {
        try {
            const result = await chrome.storage.sync.get('voice_notes');
            this.voiceNotes = result.voice_notes || [];
        } catch (error) {
            console.error('Failed to load voice notes:', error);
            this.voiceNotes = [];
        }
    }

    async saveVoiceNotes() {
        try {
            await chrome.storage.sync.set({
                voice_notes: this.voiceNotes
            });
        } catch (error) {
            console.error('Failed to save voice notes:', error);
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.recognition) {
            this.showError('Speech recognition not available');
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            this.showError('Failed to start listening');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    processVoiceCommand(transcript) {
        const command = transcript.toLowerCase().trim();
        
        // Check for exact command matches
        if (this.voiceCommands[command]) {
            this.voiceCommands[command]();
            return;
        }
        
        // Check for partial matches
        for (const [key, func] of Object.entries(this.voiceCommands)) {
            if (command.includes(key)) {
                func();
                return;
            }
        }
        
        // If no command found, treat as voice note
        this.createVoiceNote(transcript);
    }

    executeCommand(command) {
        switch (command) {
            case 'new task':
                this.speak('Opening task creation');
                this.focusTodoInput();
                break;
                
            case 'start timer':
                this.speak('Starting timer');
                if (window.TimerWidget) {
                    window.TimerWidget.startTimer();
                }
                break;
                
            case 'stop timer':
                this.speak('Stopping timer');
                if (window.TimerWidget) {
                    window.TimerWidget.stopTimer();
                }
                break;
                
            case 'pause timer':
                this.speak('Pausing timer');
                if (window.TimerWidget) {
                    window.TimerWidget.pauseTimer();
                }
                break;
                
            case 'new note':
                this.speak('Opening note creation');
                this.focusNotesInput();
                break;
                
            case 'open settings':
                this.speak('Opening settings');
                this.openSettings();
                break;
                
            case 'time':
                const time = new Date().toLocaleTimeString();
                this.speak(`The current time is ${time}`);
                break;
                
            case 'date':
                const date = new Date().toLocaleDateString();
                this.speak(`Today is ${date}`);
                break;
                
            case 'weather':
                this.speak('Fetching weather information');
                if (window.WeatherWidget) {
                    window.WeatherWidget.fetchWeatherData();
                }
                break;
                
            case 'quote':
                this.speak('Fetching daily quote');
                if (window.QuotesWidget) {
                    window.QuotesWidget.fetchQuote();
                }
                break;
                
            case 'help':
                this.showVoiceHelp();
                break;
                
            default:
                this.speak(`Command ${command} not recognized`);
        }
    }

    createVoiceNote(transcript) {
        const note = {
            id: Date.now(),
            text: transcript,
            timestamp: new Date().toISOString(),
            duration: 0
        };
        
        this.voiceNotes.unshift(note);
        this.saveVoiceNotes();
        
        this.speak(`Voice note created: ${transcript}`);
        this.showSuccess('Voice note saved');
    }

    focusTodoInput() {
        const todoInput = document.getElementById('new-todo-input');
        if (todoInput) {
            todoInput.focus();
        }
    }

    focusNotesInput() {
        const notesTextarea = document.getElementById('notes-textarea');
        if (notesTextarea) {
            notesTextarea.focus();
        }
    }

    openSettings() {
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.click();
        }
    }

    speak(text) {
        if (!this.voiceSettings.autoSpeak) return;
        
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.voiceSettings.rate;
        utterance.pitch = this.voiceSettings.pitch;
        utterance.volume = this.voiceSettings.volume;
        
        if (this.voiceSettings.voice) {
            utterance.voice = this.voiceSettings.voice;
        }
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateDisplay();
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateDisplay();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.isSpeaking = false;
            this.updateDisplay();
        };
        
        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
    }

    updateDisplay() {
        // Update voice button
        if (this.voiceButton) {
            if (this.isListening) {
                this.voiceButton.innerHTML = '<span class="material-symbols-outlined">mic</span>';
                this.voiceButton.classList.add('listening');
            } else if (this.isSpeaking) {
                this.voiceButton.innerHTML = '<span class="material-symbols-outlined">volume_up</span>';
                this.voiceButton.classList.add('speaking');
            } else {
                this.voiceButton.innerHTML = '<span class="material-symbols-outlined">mic_none</span>';
                this.voiceButton.classList.remove('listening', 'speaking');
            }
        }

        // Update status
        if (this.voiceStatus) {
        if (this.isListening) {
                this.voiceStatus.textContent = 'Listening...';
                this.voiceStatus.className = 'voice-status listening';
            } else if (this.isSpeaking) {
                this.voiceStatus.textContent = 'Speaking...';
                this.voiceStatus.className = 'voice-status speaking';
        } else {
                this.voiceStatus.textContent = 'Ready';
                this.voiceStatus.className = 'voice-status ready';
            }
        }

        // Update commands list
        if (this.voiceCommands) {
            this.voiceCommands.innerHTML = `
                <h4>Available Commands:</h4>
                <div class="commands-grid">
                    <div class="command-item">
                        <span class="command">"New task"</span>
                        <span class="description">Create a new task</span>
                    </div>
                    <div class="command-item">
                        <span class="command">"Start timer"</span>
                        <span class="description">Start the timer</span>
                    </div>
                    <div class="command-item">
                        <span class="command">"New note"</span>
                        <span class="description">Create a new note</span>
                    </div>
                    <div class="command-item">
                        <span class="command">"What time"</span>
                        <span class="description">Get current time</span>
                    </div>
                    <div class="command-item">
                        <span class="command">"Weather"</span>
                        <span class="description">Get weather info</span>
                    </div>
                    <div class="command-item">
                        <span class="command">"Quote"</span>
                        <span class="description">Get daily quote</span>
                    </div>
                </div>
            `;
        }
    }

    updateTranscript(text) {
        if (this.voiceTranscript) {
            this.voiceTranscript.textContent = text;
        }
    }

    showVoiceHelp() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Voice Commands Help</h3>
                </div>
                <div class="modal-body">
                    <div class="help-section">
                        <h4>Task Management</h4>
                        <ul>
                            <li><strong>"New task"</strong> - Create a new task</li>
                            <li><strong>"Add task"</strong> - Create a new task</li>
                            <li><strong>"Create task"</strong> - Create a new task</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Timer Control</h4>
                        <ul>
                            <li><strong>"Start timer"</strong> - Start the timer</li>
                            <li><strong>"Stop timer"</strong> - Stop the timer</li>
                            <li><strong>"Pause timer"</strong> - Pause the timer</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Notes</h4>
                        <ul>
                            <li><strong>"New note"</strong> - Create a new note</li>
                            <li><strong>"Add note"</strong> - Create a new note</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Information</h4>
                        <ul>
                            <li><strong>"What time"</strong> - Get current time</li>
                            <li><strong>"What date"</strong> - Get current date</li>
                            <li><strong>"Weather"</strong> - Get weather information</li>
                            <li><strong>"Quote"</strong> - Get daily quote</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>System</h4>
                        <ul>
                            <li><strong>"Open settings"</strong> - Open settings panel</li>
                            <li><strong>"Help"</strong> - Show this help</li>
                        </ul>
                    </div>
                    <div class="help-tip">
                        <p><strong>Tip:</strong> Any unrecognized speech will be saved as a voice note.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="close-help">Got it!</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('#close-help').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }

    showVoiceNotes() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Voice Notes</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.voiceNotes.length === 0 ? 
                        '<div class="no-notes">No voice notes yet</div>' :
                        this.voiceNotes.map((note, index) => `
                            <div class="voice-note" data-index="${index}">
                                <div class="note-text">${note.text}</div>
                                <div class="note-meta">
                                    <span class="note-time">${this.formatTime(note.timestamp)}</span>
                                    <div class="note-actions">
                                        <button class="btn btn-sm btn-primary" onclick="window.VoiceWidget.playNote(${index})">Play</button>
                                        <button class="btn btn-sm btn-secondary" onclick="window.VoiceWidget.copyNote(${index})">Copy</button>
                                        <button class="btn btn-sm btn-danger" onclick="window.VoiceWidget.deleteNote(${index})">Delete</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="close-notes">Close</button>
                    ${this.voiceNotes.length > 0 ? 
                        '<button class="btn btn-primary" id="export-notes">Export</button>' : ''
                    }
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.querySelector('#close-notes').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        if (this.voiceNotes.length > 0) {
            dialog.querySelector('#export-notes').addEventListener('click', () => {
                this.exportVoiceNotes();
            });
        }
    }

    playNote(index) {
        const note = this.voiceNotes[index];
        if (note) {
            this.speak(note.text);
        }
    }

    copyNote(index) {
        const note = this.voiceNotes[index];
        if (note) {
            navigator.clipboard.writeText(note.text).then(() => {
                this.showSuccess('Note copied to clipboard');
            }).catch(() => {
                this.showError('Failed to copy note');
            });
        }
    }

    deleteNote(index) {
        if (confirm('Are you sure you want to delete this voice note?')) {
            this.voiceNotes.splice(index, 1);
            this.saveVoiceNotes();
            this.showVoiceNotes(); // Refresh the dialog
            this.showSuccess('Voice note deleted');
        }
    }

    exportVoiceNotes() {
        const data = {
            voiceNotes: this.voiceNotes,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voice-notes-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Voice notes exported successfully');
    }

    showSettings() {
        const voices = this.synthesis.getVoices();
        
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Voice Settings</h3>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Language</label>
                        <select id="voice-language" class="form-select">
                            <option value="en-US" ${this.voiceSettings.language === 'en-US' ? 'selected' : ''}>English (US)</option>
                            <option value="en-GB" ${this.voiceSettings.language === 'en-GB' ? 'selected' : ''}>English (UK)</option>
                            <option value="es-ES" ${this.voiceSettings.language === 'es-ES' ? 'selected' : ''}>Spanish</option>
                            <option value="fr-FR" ${this.voiceSettings.language === 'fr-FR' ? 'selected' : ''}>French</option>
                            <option value="de-DE" ${this.voiceSettings.language === 'de-DE' ? 'selected' : ''}>German</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Voice</label>
                        <select id="voice-voice" class="form-select">
                            <option value="">Default</option>
                            ${voices.map(voice => `
                                <option value="${voice.name}" ${this.voiceSettings.voice === voice.name ? 'selected' : ''}>
                                    ${voice.name} (${voice.lang})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Speech Rate</label>
                        <input type="range" id="voice-rate" min="0.5" max="2" step="0.1" value="${this.voiceSettings.rate}" class="form-range">
                        <span id="rate-value">${this.voiceSettings.rate}</span>
                    </div>
                    <div class="form-group">
                        <label>Pitch</label>
                        <input type="range" id="voice-pitch" min="0.5" max="2" step="0.1" value="${this.voiceSettings.pitch}" class="form-range">
                        <span id="pitch-value">${this.voiceSettings.pitch}</span>
                    </div>
                    <div class="form-group">
                        <label>Volume</label>
                        <input type="range" id="voice-volume" min="0" max="1" step="0.1" value="${this.voiceSettings.volume}" class="form-range">
                        <span id="volume-value">${this.voiceSettings.volume}</span>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="voice-auto-speak" ${this.voiceSettings.autoSpeak ? 'checked' : ''}>
                            Auto-speak responses
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="voice-continuous" ${this.voiceSettings.continuous ? 'checked' : ''}>
                            Continuous listening
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-settings">Cancel</button>
                    <button class="btn btn-primary" id="save-settings">Save Settings</button>
                    <button class="btn btn-info" id="test-voice">Test Voice</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Update range values
        dialog.querySelector('#voice-rate').addEventListener('input', (e) => {
            dialog.querySelector('#rate-value').textContent = e.target.value;
        });

        dialog.querySelector('#voice-pitch').addEventListener('input', (e) => {
            dialog.querySelector('#pitch-value').textContent = e.target.value;
        });

        dialog.querySelector('#voice-volume').addEventListener('input', (e) => {
            dialog.querySelector('#volume-value').textContent = e.target.value;
        });

        dialog.querySelector('#cancel-settings').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.querySelector('#save-settings').addEventListener('click', async () => {
            this.voiceSettings.language = dialog.querySelector('#voice-language').value;
            this.voiceSettings.voice = dialog.querySelector('#voice-voice').value;
            this.voiceSettings.rate = parseFloat(dialog.querySelector('#voice-rate').value);
            this.voiceSettings.pitch = parseFloat(dialog.querySelector('#voice-pitch').value);
            this.voiceSettings.volume = parseFloat(dialog.querySelector('#voice-volume').value);
            this.voiceSettings.autoSpeak = dialog.querySelector('#voice-auto-speak').checked;
            this.voiceSettings.continuous = dialog.querySelector('#voice-continuous').checked;

            await this.saveSettings();
            this.setupSpeechRecognition();
            document.body.removeChild(dialog);
            this.showSuccess('Voice settings saved');
        });

        dialog.querySelector('#test-voice').addEventListener('click', () => {
            const testText = 'This is a test of the voice settings. How does this sound?';
            this.speak(testText);
        });
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-message">${message}</div>
            <button class="notification-close">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);

        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
        }
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
    window.VoiceWidget = new VoiceWidget();
});
} else {
    window.VoiceWidget = new VoiceWidget();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceWidget;
}
