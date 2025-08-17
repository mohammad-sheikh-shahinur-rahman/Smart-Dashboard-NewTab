/* 
 * Smart Dashboard NewTab - Advanced Notes Widget
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class NotesWidget {
    constructor() {
        this.notesTextarea = document.getElementById('notes-textarea');
        this.notesContainer = document.getElementById('notes-widget');
        this.storageKey = 'smartDashboard_notes';
        this.autoSaveTimeout = null;
        this.autoSaveDelay = 1000; // 1 second
        this.notes = [];
        this.currentNoteId = null;
        this.isEditing = false;
        
        // Advanced features
        this.supportedFormats = ['bold', 'italic', 'underline', 'list', 'link', 'code', 'quote'];
        this.maxNotes = 100;
        this.maxNoteLength = 50000;
        this.categories = ['Personal', 'Work', 'Ideas', 'Meeting', 'Project', 'Learning', 'Reminder'];
        this.tags = [];
        this.searchQuery = '';
        this.filterCategory = 'all';
        this.sortBy = 'updated'; // 'created', 'updated', 'title', 'category'
        this.sortOrder = 'desc'; // 'asc', 'desc'
        
        // Productivity features
        this.wordCount = 0;
        this.charCount = 0;
        this.lastSaved = null;
        this.autoBackup = true;
        this.backupInterval = 300000; // 5 minutes
    }

    async init() {
        try {
            await this.loadNotes();
            this.setupEventListeners();
            this.renderNotes();
            this.setupAdvancedEditor();
            this.setupProductivityFeatures();
            this.startAutoBackup();
            console.log('Notes Widget initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Notes Widget:', error);
        }
    }

    setupAdvancedEditor() {
        if (!this.notesTextarea) {
            console.warn('Notes textarea not found, skipping advanced editor setup');
            return;
        }

        if (!this.notesTextarea.parentNode) {
            console.warn('Notes textarea parent node not found, skipping advanced editor setup');
            return;
        }

        // Create advanced editor interface
        const editorContainer = document.createElement('div');
        editorContainer.className = 'advanced-notes-editor';
        editorContainer.innerHTML = `
            <div class="notes-toolbar">
                <div class="toolbar-group">
                    <button class="toolbar-btn" data-action="bold" title="Bold (Ctrl+B)">
                        <span class="material-symbols-outlined">format_bold</span>
                    </button>
                    <button class="toolbar-btn" data-action="italic" title="Italic (Ctrl+I)">
                        <span class="material-symbols-outlined">format_italic</span>
                    </button>
                    <button class="toolbar-btn" data-action="underline" title="Underline (Ctrl+U)">
                        <span class="material-symbols-outlined">format_underline</span>
                    </button>
                </div>
                <div class="toolbar-group">
                    <button class="toolbar-btn" data-action="list" title="Bullet List">
                        <span class="material-symbols-outlined">format_list_bulleted</span>
                    </button>
                    <button class="toolbar-btn" data-action="numbered-list" title="Numbered List">
                        <span class="material-symbols-outlined">format_list_numbered</span>
                    </button>
                    <button class="toolbar-btn" data-action="quote" title="Quote">
                        <span class="material-symbols-outlined">format_quote</span>
                    </button>
                </div>
                <div class="toolbar-group">
                    <button class="toolbar-btn" data-action="link" title="Insert Link">
                        <span class="material-symbols-outlined">link</span>
                    </button>
                    <button class="toolbar-btn" data-action="code" title="Code Block">
                        <span class="material-symbols-outlined">code</span>
                    </button>
                    <button class="toolbar-btn" data-action="clear" title="Clear Formatting">
                        <span class="material-symbols-outlined">format_clear</span>
                    </button>
                </div>
            </div>
            <div class="notes-meta">
                <select class="note-category" id="note-category">
                    ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
                <input type="text" class="note-tags" id="note-tags" placeholder="Add tags (comma separated)">
                <div class="notes-stats">
                    <span class="word-count">Words: 0</span>
                    <span class="char-count">Chars: 0</span>
                    <span class="last-saved">Last saved: Never</span>
                </div>
            </div>
        `;

        try {
            this.notesTextarea.parentNode.insertBefore(editorContainer, this.notesTextarea);
        } catch (error) {
            console.error('Failed to insert advanced editor:', error);
            return;
        }

        // Add event listeners for toolbar
        editorContainer.addEventListener('click', (e) => {
            if (e.target.closest('.toolbar-btn')) {
                const action = e.target.closest('.toolbar-btn').dataset.action;
                this.applyAdvancedFormatting(action);
            }
        });

        // Enhanced keyboard shortcuts
        this.notesTextarea.addEventListener('keydown', (e) => {
            this.handleAdvancedKeyboardShortcuts(e);
        });

        // Real-time stats update
        this.notesTextarea.addEventListener('input', () => {
            this.updateStats();
            this.scheduleAutoSave();
        });
    }

    applyAdvancedFormatting(action) {
        const textarea = this.notesTextarea;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        let formattedText = '';
        switch (action) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                break;
            case 'list':
                formattedText = `• ${selectedText}`;
                break;
            case 'numbered-list':
                formattedText = `1. ${selectedText}`;
                break;
            case 'quote':
                formattedText = `> ${selectedText}`;
                break;
            case 'link':
                formattedText = `[${selectedText}](url)`;
                break;
            case 'code':
                formattedText = `\`${selectedText}\``;
                break;
            case 'clear':
                formattedText = selectedText.replace(/[*_\[\]()>`]/g, '');
                break;
        }

        textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        textarea.setSelectionRange(start, start + formattedText.length);
        textarea.focus();
        this.scheduleAutoSave();
    }

    handleAdvancedKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    this.applyAdvancedFormatting('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    this.applyAdvancedFormatting('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    this.applyAdvancedFormatting('underline');
                    break;
                case 'k':
                    e.preventDefault();
                    this.applyAdvancedFormatting('link');
                    break;
                case 's':
                    e.preventDefault();
                    this.saveCurrentNote();
                    break;
                case 'n':
                    e.preventDefault();
                    this.createNewNote();
                    break;
            }
        }

        // Tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.notesTextarea.selectionStart;
            const end = this.notesTextarea.selectionEnd;
            const value = this.notesTextarea.value;
            
            this.notesTextarea.value = value.substring(0, start) + '    ' + value.substring(end);
            this.notesTextarea.setSelectionRange(start + 4, start + 4);
        }
    }

    setupProductivityFeatures() {
        if (!this.notesContainer) {
            console.warn('Notes container not found, skipping productivity features setup');
            return;
        }

        // Create notes navigation
        const notesNav = document.createElement('div');
        notesNav.className = 'notes-navigation';
        notesNav.innerHTML = `
            <div class="notes-header">
                <h3>Quick Notes</h3>
                <div class="notes-actions">
                    <button class="action-btn" id="new-note-btn" title="New Note (Ctrl+N)">
                        <span class="material-symbols-outlined">add</span>
                    </button>
                    <button class="action-btn" id="search-notes-btn" title="Search Notes">
                        <span class="material-symbols-outlined">search</span>
                    </button>
                    <button class="action-btn" id="export-notes-btn" title="Export Notes">
                        <span class="material-symbols-outlined">download</span>
                    </button>
                </div>
            </div>
            <div class="notes-filters">
                <input type="text" id="notes-search" placeholder="Search notes..." class="notes-search">
                <select id="category-filter" class="category-filter">
                    <option value="all">All Categories</option>
                    ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
                <select id="sort-notes" class="sort-notes">
                    <option value="updated-desc">Recently Updated</option>
                    <option value="created-desc">Recently Created</option>
                    <option value="title-asc">Title A-Z</option>
                    <option value="category-asc">Category</option>
                </select>
            </div>
            <div class="notes-list" id="notes-list"></div>
        `;

        try {
            this.notesContainer.appendChild(notesNav);
        } catch (error) {
            console.error('Failed to append notes navigation:', error);
            return;
        }

        // Add event listeners
        document.getElementById('new-note-btn').addEventListener('click', () => this.createNewNote());
        document.getElementById('search-notes-btn').addEventListener('click', () => this.toggleSearch());
        document.getElementById('export-notes-btn').addEventListener('click', () => this.exportNotes());
        
        document.getElementById('notes-search').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderNotes();
        });
        
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filterCategory = e.target.value;
            this.renderNotes();
        });
        
        document.getElementById('sort-notes').addEventListener('change', (e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            this.sortBy = sortBy;
            this.sortOrder = sortOrder;
            this.renderNotes();
        });
    }

    async createNewNote() {
        const newNote = {
            id: this.generateId(),
            title: 'Untitled Note',
            content: '',
            category: 'Personal',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wordCount: 0,
            charCount: 0
        };

        this.notes.unshift(newNote);
        this.currentNoteId = newNote.id;
        await this.saveNotes();
        this.renderNotes();
        this.loadNote(newNote.id);
        this.showSuccess('New note created!');
    }

    async loadNote(noteId) {
        const note = this.getNoteById(noteId);
        if (!note) return;

        this.currentNoteId = noteId;
        this.notesTextarea.value = note.content;
        
        // Update meta fields
        document.getElementById('note-category').value = note.category;
        document.getElementById('note-tags').value = note.tags.join(', ');
        
        this.updateStats();
        this.updateLastSaved();
    }

    async saveCurrentNote() {
        if (!this.currentNoteId) {
            await this.createNewNote();
            return;
        }

        const note = this.getNoteById(this.currentNoteId);
        if (!note) return;

        const content = this.notesTextarea.value;
        const category = document.getElementById('note-category').value;
        const tags = document.getElementById('note-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

        note.content = content;
        note.title = this.extractTitle(content);
        note.category = category;
        note.tags = tags;
        note.updatedAt = new Date().toISOString();
        note.wordCount = this.wordCount;
        note.charCount = this.charCount;

        await this.saveNotes();
        this.updateLastSaved();
        this.renderNotes();
    }

    updateStats() {
        const content = this.notesTextarea.value;
        this.wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
        this.charCount = content.length;

        document.querySelector('.word-count').textContent = `Words: ${this.wordCount}`;
        document.querySelector('.char-count').textContent = `Chars: ${this.charCount}`;
    }

    updateLastSaved() {
        this.lastSaved = new Date();
        const timeString = this.lastSaved.toLocaleTimeString();
        document.querySelector('.last-saved').textContent = `Last saved: ${timeString}`;
    }

    renderNotes() {
        const notesList = document.getElementById('notes-list');
        if (!notesList) return;

        let filteredNotes = this.notes;

        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredNotes = filteredNotes.filter(note => 
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query) ||
                note.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (this.filterCategory !== 'all') {
            filteredNotes = filteredNotes.filter(note => note.category === this.filterCategory);
        }

        // Apply sorting
        filteredNotes.sort((a, b) => {
            let aValue, bValue;
            
            switch (this.sortBy) {
                case 'created':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'updated':
                    aValue = new Date(a.updatedAt);
                    bValue = new Date(b.updatedAt);
                    break;
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'category':
                    aValue = a.category.toLowerCase();
                    bValue = b.category.toLowerCase();
                    break;
                default:
                    aValue = new Date(a.updatedAt);
                    bValue = new Date(b.updatedAt);
            }

            if (this.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        notesList.innerHTML = filteredNotes.map(note => `
            <div class="note-item ${note.id === this.currentNoteId ? 'active' : ''}" data-note-id="${note.id}">
                <div class="note-header">
                    <h4 class="note-title">${this.escapeHtml(note.title)}</h4>
                    <div class="note-actions">
                        <button class="note-action-btn" data-action="edit" title="Edit">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="note-action-btn" data-action="delete" title="Delete">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
                <div class="note-meta">
                    <span class="note-category-badge">${note.category}</span>
                    <span class="note-date">${this.formatDate(note.updatedAt)}</span>
                </div>
                <div class="note-preview">${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</div>
                ${note.tags.length > 0 ? `<div class="note-tags">${note.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}</div>` : ''}
            </div>
        `).join('');

        // Add event listeners to note items
        notesList.addEventListener('click', (e) => {
            const noteItem = e.target.closest('.note-item');
            if (!noteItem) return;

            const noteId = noteItem.dataset.noteId;
            const action = e.target.closest('.note-action-btn')?.dataset.action;

            if (action === 'edit') {
                this.loadNote(noteId);
            } else if (action === 'delete') {
                this.deleteNote(noteId);
            } else {
                this.loadNote(noteId);
            }
        });
    }

    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        this.notes = this.notes.filter(note => note.id !== noteId);
        
        if (this.currentNoteId === noteId) {
            this.currentNoteId = null;
            this.notesTextarea.value = '';
            this.updateStats();
        }

        await this.saveNotes();
        this.renderNotes();
        this.showSuccess('Note deleted successfully!');
    }

    async exportNotes() {
        try {
            const exportData = {
                notes: this.notes,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showSuccess('Notes exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            this.showError('Failed to export notes');
        }
    }

    async importNotes(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (importData.notes && Array.isArray(importData.notes)) {
                this.notes = [...this.notes, ...importData.notes];
                await this.saveNotes();
                this.renderNotes();
                this.showSuccess(`Imported ${importData.notes.length} notes successfully!`);
            } else {
                throw new Error('Invalid import file format');
            }
        } catch (error) {
            console.error('Import failed:', error);
            this.showError('Failed to import notes');
        }
    }

    startAutoBackup() {
        if (!this.autoBackup) return;

        setInterval(() => {
            if (this.currentNoteId) {
                this.saveCurrentNote();
            }
        }, this.backupInterval);
    }

    // Enhanced utility methods
    extractTitle(content) {
        const firstLine = content.split('\n')[0].trim();
        if (firstLine && firstLine.length > 0) {
            return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        }
        return 'Untitled Note';
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    // Enhanced Event Listeners
    setupEventListeners() {
        if (!this.notesTextarea) {
            console.warn('Notes textarea not found, creating fallback');
            this.createFallbackTextarea();
        }

        // Auto-save on input
        if (this.notesTextarea) {
            this.notesTextarea.addEventListener('input', () => {
                this.handleInput();
            });

            // Keyboard shortcuts
            this.notesTextarea.addEventListener('keydown', (e) => {
                this.handleKeyboardShortcuts(e);
            });
        }

        // Save button
        if (this.notesSaveBtn) {
            this.notesSaveBtn.addEventListener('click', () => {
                this.saveNote();
            });
        }

        // Clear button
        if (this.notesClearBtn) {
            this.notesClearBtn.addEventListener('click', () => {
                this.clearEditor();
            });
        }

        // Delete button
        if (this.notesDeleteBtn) {
            this.notesDeleteBtn.addEventListener('click', () => {
                this.deleteNote();
            });
        }

        // New note button
        if (this.notesNewBtn) {
            this.notesNewBtn.addEventListener('click', () => {
                this.createNewNote();
            });
        }

        // Export button
        if (this.notesExportBtn) {
            this.notesExportBtn.addEventListener('click', () => {
                this.exportNotes();
            });
        }

        // Import button
        if (this.notesImportBtn) {
            this.notesImportBtn.addEventListener('click', () => {
                this.importNotes();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('notes-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // Help button
        const helpBtn = document.getElementById('notes-help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelp();
            });
        }

        // Auto-save toggle
        const autoSaveToggle = document.getElementById('notes-auto-save-toggle');
        if (autoSaveToggle) {
            autoSaveToggle.addEventListener('click', () => {
                this.toggleAutoSave();
            });
        }

        // Preview button
        const previewBtn = document.getElementById('notes-preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.showPreview();
            });
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('notes-fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // Share button
        const shareBtn = document.getElementById('notes-share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareNote();
            });
        }
    }

    createFallbackTextarea() {
        const notesWidget = document.querySelector('.notes-widget');
        if (notesWidget) {
            const widgetContent = notesWidget.querySelector('.widget-content');
            if (widgetContent) {
                this.notesTextarea = document.createElement('textarea');
                this.notesTextarea.id = 'notes-textarea';
                this.notesTextarea.className = 'notes-textarea';
                this.notesTextarea.placeholder = 'Start writing your notes here...';
                this.notesTextarea.style.cssText = `
                    width: 100%;
                    min-height: 200px;
                    padding: 12px;
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-md);
                    background: var(--glass-bg);
                    color: var(--text-primary);
                    font-size: var(--font-size-sm);
                    resize: vertical;
                    font-family: inherit;
                `;
                widgetContent.appendChild(this.notesTextarea);
            }
        }
    }

    setupEventListeners() {
        // Textarea input
        if (this.notesTextarea) {
            this.notesTextarea.addEventListener('input', () => {
                this.scheduleAutoSave();
                this.updateStats();
            });
        }

        // Format buttons
        const formatButtons = document.querySelectorAll('.format-btn');
        formatButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const format = btn.dataset.format;
                this.applyFormatting(format);
            });
        });

        // Search input
        if (this.notesSearchInput) {
            this.notesSearchInput.addEventListener('input', () => {
                this.searchNotes();
            });
        }

        // Category filter
        if (this.notesCategoryFilter) {
            this.notesCategoryFilter.addEventListener('change', () => {
                this.filterNotes();
            });
        }

        // Sort dropdown
        if (this.notesSort) {
            this.notesSort.addEventListener('change', () => {
                this.sortNotes();
            });
        }
    }

    scheduleAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        this.autoSaveTimeout = setTimeout(() => {
            this.saveCurrentNote();
        }, this.autoSaveDelay);
    }

    async loadNotes() {
        try {
            const result = await chrome.storage.sync.get(this.storageKey);
            this.notes = result[this.storageKey] || [];
        } catch (error) {
            console.error('Failed to load notes:', error);
            this.notes = [];
        }
    }

    async saveNotes() {
        try {
            await chrome.storage.sync.set({ [this.storageKey]: this.notes });
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
    }

    // Enhanced Methods
    toggleAutoSave() {
        this.autoSaveEnabled = !this.autoSaveEnabled;
        const toggleBtn = document.getElementById('notes-auto-save-toggle');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', this.autoSaveEnabled);
            toggleBtn.title = this.autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled';
        }
        this.showNotification(`Auto-save ${this.autoSaveEnabled ? 'enabled' : 'disabled'}`, 'info');
    }

    showPreview() {
        const content = this.notesTextarea ? this.notesTextarea.value : '';
        const title = this.notesTitle ? this.notesTitle.value : 'Untitled';
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Preview: ${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="preview-content">
                        ${this.formatPreviewContent(content)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                    <button class="btn btn-primary" onclick="window.NotesWidget.printNote()">Print</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
    }

    formatPreviewContent(content) {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<u>$1</u>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^>\s*(.*)/gm, '<blockquote>$1</blockquote>')
            .replace(/^- (.*)/gm, '<li>$1</li>')
            .replace(/\n\n/g, '<br><br>');
    }

    toggleFullscreen() {
        const notesWidget = document.querySelector('.notes-widget');
        if (notesWidget) {
            notesWidget.classList.toggle('fullscreen');
            const fullscreenBtn = document.getElementById('notes-fullscreen-btn');
            if (fullscreenBtn) {
                const icon = fullscreenBtn.querySelector('.material-symbols-outlined');
                if (notesWidget.classList.contains('fullscreen')) {
                    icon.textContent = 'fullscreen_exit';
                    fullscreenBtn.title = 'Exit Fullscreen';
                } else {
                    icon.textContent = 'fullscreen';
                    fullscreenBtn.title = 'Fullscreen';
                }
            }
        }
    }

    shareNote() {
        const content = this.notesTextarea ? this.notesTextarea.value : '';
        const title = this.notesTitle ? this.notesTitle.value : 'Untitled';
        
        if (navigator.share) {
            navigator.share({
                title: title,
                text: content,
                url: window.location.href
            }).catch(error => {
                console.log('Error sharing:', error);
                this.copyToClipboard(content);
            });
        } else {
            this.copyToClipboard(content);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showSuccess('Note copied to clipboard');
        }).catch(() => {
            this.showError('Failed to copy note');
        });
    }

    printNote() {
        const content = this.notesTextarea ? this.notesTextarea.value : '';
        const title = this.notesTitle ? this.notesTitle.value : 'Untitled';
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
                        h1 { color: #333; }
                        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
                        blockquote { border-left: 4px solid #ccc; padding-left: 20px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <div>${this.formatPreviewContent(content)}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    showSettings() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Notes Settings</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="auto-save-enabled" ${this.autoSaveEnabled ? 'checked' : ''}>
                            Enable auto-save
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Auto-save delay (seconds)</label>
                        <input type="number" id="auto-save-delay" value="${this.autoSaveDelay / 1000}" min="1" max="60" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Maximum notes</label>
                        <input type="number" id="max-notes" value="${this.maxNotes}" min="10" max="1000" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Maximum note length</label>
                        <input type="number" id="max-note-length" value="${this.maxNoteLength}" min="1000" max="100000" class="form-input">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="window.NotesWidget.saveSettings()">Save Settings</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
    }

    saveSettings() {
        const autoSaveEnabled = document.getElementById('auto-save-enabled').checked;
        const autoSaveDelay = parseInt(document.getElementById('auto-save-delay').value) * 1000;
        const maxNotes = parseInt(document.getElementById('max-notes').value);
        const maxNoteLength = parseInt(document.getElementById('max-note-length').value);

        this.autoSaveEnabled = autoSaveEnabled;
        this.autoSaveDelay = autoSaveDelay;
        this.maxNotes = maxNotes;
        this.maxNoteLength = maxNoteLength;

        document.querySelector('.modal-overlay').remove();
        this.showSuccess('Settings saved successfully');
    }

    showHelp() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Quick Notes Help</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="help-section">
                        <h4>Keyboard Shortcuts</h4>
                        <ul>
                            <li><strong>Ctrl+B</strong> - Bold text</li>
                            <li><strong>Ctrl+I</strong> - Italic text</li>
                            <li><strong>Ctrl+U</strong> - Underline text</li>
                            <li><strong>Ctrl+L</strong> - Create list</li>
                            <li><strong>Ctrl+K</strong> - Insert link</li>
                            <li><strong>Ctrl+Shift+C</strong> - Insert code</li>
                            <li><strong>Ctrl+Q</strong> - Insert quote</li>
                            <li><strong>Ctrl+S</strong> - Save note</li>
                            <li><strong>Ctrl+N</strong> - New note</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Formatting</h4>
                        <ul>
                            <li><strong>**text**</strong> - Bold</li>
                            <li><strong>*text*</strong> - Italic</li>
                            <li><strong>__text__</strong> - Underline</li>
                            <li><strong>~~text~~</strong> - Strikethrough</li>
                            <li><strong>`code`</strong> - Inline code</li>
                            <li><strong>> text</strong> - Quote</li>
                            <li><strong>- item</strong> - List item</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Features</h4>
                        <ul>
                            <li>Auto-save functionality</li>
                            <li>Rich text formatting</li>
                            <li>Categories and tags</li>
                            <li>Search and filter</li>
                            <li>Export/Import notes</li>
                            <li>Fullscreen mode</li>
                            <li>Preview and print</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Got it!</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
    }

    searchNotes() {
        const query = this.notesSearchInput ? this.notesSearchInput.value.toLowerCase() : '';
        this.searchQuery = query;
        this.renderNotes();
    }

    filterNotes() {
        const category = this.notesCategoryFilter ? this.notesCategoryFilter.value : '';
        this.filterCategory = category;
        this.renderNotes();
    }

    sortNotes() {
        const sortBy = this.notesSort ? this.notesSort.value : 'date-desc';
        this.sortBy = sortBy;
        this.renderNotes();
    }
}

// Create widget instance when script loads
document.addEventListener('DOMContentLoaded', () => {
    window.NotesWidget = new NotesWidget();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotesWidget;
}
