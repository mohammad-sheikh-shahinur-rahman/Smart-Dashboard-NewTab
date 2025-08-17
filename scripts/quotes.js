/**
 * Quotes Manager
 * Handles quote display, rotation, and Bengali quotes by Mohammad Sheikh Shahinur Rahman
 */

class QuotesManager {
    constructor() {
        this.currentQuoteIndex = 0;
        this.quotes = this.initializeQuotes();
        this.autoRefreshInterval = null;
        this.initializeQuoteWidget();
        this.bindEvents();
    }

    initializeQuotes() {
        return {
            bengali: [
                {
                    text: "যে বিদ্রোহ চুপ করে বসে, তার হৃদয়েই অগ্নি জ্বলে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "বিদ্রোহ"
                },
                {
                    text: "ভালোবাসা কখনও শান্ত হয় না, বিদ্রোহের মতোই।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "ভালোবাসা"
                },
                {
                    text: "জীবন বলতে শুধু বেঁচে থাকা নয়, সাহসীভাবে বাঁচার নাম।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "জীবন"
                },
                {
                    text: "যে মন ভয়কে জানে না, সে ভালোবাসার শক্তিও চেনে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "সাহস"
                },
                {
                    text: "প্রেমের মধ্যে বিদ্রোহ লুকায়, আর বিদ্রোহের মাঝে প্রেম।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "প্রেম"
                },
                {
                    text: "চুপ থাকা মানেই সমঝোতা নয়, অনেক সময় তা প্রতিবাদ।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "প্রতিবাদ"
                },
                {
                    text: "সমাজের প্রতি দায়বদ্ধতা শুধু দোষ নয়, এক ধরনের ভালোবাসা।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "সমাজ"
                },
                {
                    text: "নিজেকে চেনা মানেই অন্যকে বোঝার প্রথম ধাপ।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "আত্মজ্ঞান"
                },
                {
                    text: "ভালোবাসা যদি নির্ভীক হয়, তা বিপ্লবও হয়ে ওঠে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "বিপ্লব"
                },
                {
                    text: "যে হার মানে না, তার চোখে জ্বলন্ত জীবন।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "দৃঢ়তা"
                },
                {
                    text: "নীরবতার মধ্যে অনেক কথা লুকানো থাকে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "নীরবতা"
                },
                {
                    text: "প্রতিটি ক্ষতি নতুন বোধের জন্ম দেয়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "শিক্ষা"
                },
                {
                    text: "যে জীবনকে ভালোবাসে, সে সমাজকেও ভালোবাসে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "ভালোবাসা"
                },
                {
                    text: "অন্ধকারের পরে আলো আসবেই, ভালোবাসা ও বিদ্রোহ একসাথে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "আশা"
                },
                {
                    text: "সত্যকে বলার সাহসই জীবনের মূল।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "সাহস"
                },
                {
                    text: "প্রেম এবং বিদ্রোহ দু'ই স্বাধীনতার ভাষা।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "স্বাধীনতা"
                },
                {
                    text: "যে ভয় পায় না, সে ইতিহাস গড়ে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "ইতিহাস"
                },
                {
                    text: "চলমান সময়কে থামানো যায় না, তবে বদলানো যায়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "পরিবর্তন"
                },
                {
                    text: "প্রশ্ন করো, না হলে কেউ উত্তর দেবে না।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "প্রশ্ন"
                },
                {
                    text: "হাসি অনেক সময় দুঃখকে চূর্ণ করে দেয়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "হাসি"
                },
                {
                    text: "স্বপ্ন দেখো, তা না হলে জীবন নিঃশেষ।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "স্বপ্ন"
                },
                {
                    text: "যে নিজেকে শোনে, সে অন্যকেও শুনতে পারে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "শোনা"
                },
                {
                    text: "অবজ্ঞা কখনও শক্তি নয়, প্রতিবাদই শক্তি।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "প্রতিবাদ"
                },
                {
                    text: "প্রেমের মধ্যেও ধ্বনিত হয় বিদ্রোহের সুর।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "প্রেম"
                },
                {
                    text: "নিজেকে বিশ্বাস কর, পৃথিবীকে বদলাতে পারবে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "বিশ্বাস"
                },
                {
                    text: "যেখানে আশা নেই, সেখানে বিদ্রোহ শুরু হয়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "বিদ্রোহ"
                },
                {
                    text: "প্রেম শুধু অনুভূতি নয়, এক প্রকার বিদ্রোহ।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "প্রেম"
                },
                {
                    text: "যে চোখ অন্ধকারে ভয় পায় না, সে পথ দেখায়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "পথপ্রদর্শক"
                },
                {
                    text: "সমাজের জন্য জেগে থাকা ব্যর্থতা নয়, কর্তব্য।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "কর্তব্য"
                },
                {
                    text: "প্রতিটি ক্ষতি নতুন সূচনা।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "নতুন সূচনা"
                },
                {
                    text: "বিদ্রোহ বড় নয়, সাহসী মন বড়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "সাহস"
                },
                {
                    text: "যে হার মানে না, তার জীবনের রঙ উজ্জ্বল।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "দৃঢ়তা"
                },
                {
                    text: "ভালোবাসা ছাড়া জীবন একঘেয়েমি।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "ভালোবাসা"
                },
                {
                    text: "যে চায়, সে পথ নিজেই বানায়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "ইচ্ছাশক্তি"
                },
                {
                    text: "অন্ধকার যতই দীর্ঘ, আলো ততই শক্তিশালী।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "আশা"
                },
                {
                    text: "প্রতিটি বিদ্রোহ প্রেমের প্রতিফলন।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "বিদ্রোহ"
                },
                {
                    text: "যে ভালোবাসে, সে নিজেকেও বদলাতে জানে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "পরিবর্তন"
                },
                {
                    text: "চুপ থাকা কখনও শক্তি, কখনও প্রতিবাদ।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "নীরবতা"
                },
                {
                    text: "জীবনের ছোট মুহূর্তও বিদ্রোহকে জাগায়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "জীবন"
                },
                {
                    text: "স্বপ্ন এবং বিদ্রোহ একই মুদ্রার দুই পিঠ।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "স্বপ্ন"
                },
                {
                    text: "প্রেম নিঃসঙ্গ হলে বিদ্রোহ জন্মায়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "প্রেম"
                },
                {
                    text: "যে জীবনকে বোঝে, সে অন্যকেও বোঝে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "বোধ"
                },
                {
                    text: "অপেক্ষা পরিবর্তন আনে না, কাজই আনে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "কাজ"
                },
                {
                    text: "যে হাসে, সে দুঃখ ভেঙে দেয়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "হাসি"
                },
                {
                    text: "প্রেম ও বিদ্রোহ একসাথে মুক্তির সুর।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "মুক্তি"
                },
                {
                    text: "নিজেকে ভালোবাস, অন্যকেও ভালোবাসার সাহস পাবে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "ভালোবাসা"
                },
                {
                    text: "যে মানুষ ভয় পায় না, সে ইতিহাস লিখে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "ইতিহাস"
                },
                {
                    text: "অন্ধকারে দাঁড়াও, আলো নিজেই চলে আসবে।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "আশা"
                },
                {
                    text: "প্রতিটি ক্ষতি নতুন বোধের জন্ম দেয়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "শিক্ষা"
                },
                {
                    text: "যে স্বপ্ন দেখে, সে জীবনের রঙ বদলায়।",
                    author: "মোহাম্মদ শেখ শাহিনুর রহমান",
                    category: "স্বপ্ন"
                }
            ],
            english: [
                {
                    text: "The only way to do great work is to love what you do.",
                    author: "Steve Jobs",
                    category: "Motivation"
                },
                {
                    text: "Life is what happens when you're busy making other plans.",
                    author: "John Lennon",
                    category: "Life"
                },
                {
                    text: "The future belongs to those who believe in the beauty of their dreams.",
                    author: "Eleanor Roosevelt",
                    category: "Dreams"
                },
                {
                    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                    author: "Winston Churchill",
                    category: "Success"
                },
                {
                    text: "The mind is everything. What you think you become.",
                    author: "Buddha",
                    category: "Mind"
                }
            ]
        };
    }

    initializeQuoteWidget() {
        this.quoteContainer = document.getElementById('quote-text');
        this.authorContainer = document.getElementById('quote-author');
        this.categoryContainer = document.getElementById('quote-category');
        this.languageToggle = document.getElementById('quote-language-toggle');
        
        // Set initial language preference
        this.currentLanguage = localStorage.getItem('quote-language') || 'bengali';
        this.displayQuote();
        this.startAutoRefresh();
    }

    bindEvents() {
        // Next quote button
        document.getElementById('next-quote-btn')?.addEventListener('click', () => {
            this.nextQuote();
        });

        // Previous quote button
        document.getElementById('prev-quote-btn')?.addEventListener('click', () => {
            this.previousQuote();
        });

        // Language toggle
        this.languageToggle?.addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Share quote button
        document.getElementById('share-quote-btn')?.addEventListener('click', () => {
            this.shareQuote();
        });

        // Favorite quote button
        document.getElementById('favorite-quote-btn')?.addEventListener('click', () => {
            this.toggleFavorite();
        });
    }

    displayQuote() {
        const quotes = this.quotes[this.currentLanguage];
        if (!quotes || quotes.length === 0) return;

        const quote = quotes[this.currentQuoteIndex];
        
        if (this.quoteContainer) {
            this.quoteContainer.textContent = quote.text;
            this.quoteContainer.style.opacity = '0';
            
            setTimeout(() => {
                this.quoteContainer.style.opacity = '1';
            }, 100);
        }

        if (this.authorContainer) {
            this.authorContainer.textContent = `— ${quote.author}`;
        }

        if (this.categoryContainer) {
            this.categoryContainer.textContent = quote.category;
        }

        // Update language toggle text
        if (this.languageToggle) {
            this.languageToggle.textContent = this.currentLanguage === 'bengali' ? 'EN' : 'বাং';
        }

        // Save current quote to localStorage
        localStorage.setItem('current-quote-index', this.currentQuoteIndex);
        localStorage.setItem('quote-language', this.currentLanguage);
    }

    nextQuote() {
        const quotes = this.quotes[this.currentLanguage];
        if (!quotes) return;

        this.currentQuoteIndex = (this.currentQuoteIndex + 1) % quotes.length;
        this.displayQuote();
        this.addQuoteAnimation();
    }

    previousQuote() {
        const quotes = this.quotes[this.currentLanguage];
        if (!quotes) return;

        this.currentQuoteIndex = this.currentQuoteIndex === 0 
            ? quotes.length - 1 
            : this.currentQuoteIndex - 1;
        this.displayQuote();
        this.addQuoteAnimation();
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'bengali' ? 'english' : 'bengali';
        this.currentQuoteIndex = 0; // Reset to first quote in new language
        this.displayQuote();
        this.addQuoteAnimation();
    }

    addQuoteAnimation() {
        const quoteWidget = document.querySelector('.quote-widget');
        if (quoteWidget) {
            quoteWidget.style.transform = 'scale(0.95)';
            setTimeout(() => {
                quoteWidget.style.transform = 'scale(1)';
            }, 150);
        }
    }

    startAutoRefresh() {
        const refreshInterval = parseInt(localStorage.getItem('quote-refresh-interval')) || 3600000; // 1 hour default
        
        this.autoRefreshInterval = setInterval(() => {
            this.nextQuote();
        }, refreshInterval);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    shareQuote() {
        const quotes = this.quotes[this.currentLanguage];
        if (!quotes) return;

        const quote = quotes[this.currentQuoteIndex];
        const shareText = `"${quote.text}" — ${quote.author}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Inspirational Quote',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Quote copied to clipboard!');
            });
        }
    }

    toggleFavorite() {
        const quotes = this.quotes[this.currentLanguage];
        if (!quotes) return;

        const quote = quotes[this.currentQuoteIndex];
        const favorites = JSON.parse(localStorage.getItem('favorite-quotes') || '[]');
        
        const quoteId = `${this.currentLanguage}-${this.currentQuoteIndex}`;
        const isFavorite = favorites.some(fav => fav.id === quoteId);
        
        if (isFavorite) {
            // Remove from favorites
            const updatedFavorites = favorites.filter(fav => fav.id !== quoteId);
            localStorage.setItem('favorite-quotes', JSON.stringify(updatedFavorites));
            this.showNotification('Quote removed from favorites');
        } else {
            // Add to favorites
            favorites.push({
                id: quoteId,
                text: quote.text,
                author: quote.author,
                category: quote.category,
                language: this.currentLanguage,
                addedAt: new Date().toISOString()
            });
            localStorage.setItem('favorite-quotes', JSON.stringify(favorites));
            this.showNotification('Quote added to favorites!');
        }

        // Update favorite button appearance
        this.updateFavoriteButton(isFavorite);
    }

    updateFavoriteButton(isFavorite) {
        const favoriteBtn = document.getElementById('favorite-quote-btn');
        if (favoriteBtn) {
            const icon = favoriteBtn.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = isFavorite ? 'favorite' : 'favorite_border';
                icon.style.color = isFavorite ? '#e74c3c' : 'inherit';
            }
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'quote-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-gradient);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getRandomQuote() {
        const quotes = this.quotes[this.currentLanguage];
        if (!quotes) return null;

        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    }

    getQuotesByCategory(category) {
        const quotes = this.quotes[this.currentLanguage];
        if (!quotes) return [];

        return quotes.filter(quote => quote.category === category);
    }

    getFavorites() {
        return JSON.parse(localStorage.getItem('favorite-quotes') || '[]');
    }

    // Method to add new quotes
    addQuote(text, author, category, language = 'bengali') {
        if (!this.quotes[language]) {
            this.quotes[language] = [];
        }

        this.quotes[language].push({
            text,
            author,
            category
        });

        // Save to localStorage
        localStorage.setItem('custom-quotes', JSON.stringify(this.quotes));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quotesManager = new QuotesManager();
    // Create proper QuotesWidget class for compatibility
    window.QuotesWidget = {
        init: async function() {
            if (window.quotesManager) {
                window.quotesManager.initializeQuoteWidget();
                return true;
            }
            return false;
        },
        getData: function() {
            return window.quotesManager ? window.quotesManager.getFavorites() : [];
        },
        restoreData: function(data) {
            if (window.quotesManager && data) {
                // Restore favorites
                localStorage.setItem('favorite-quotes', JSON.stringify(data));
            }
        }
    };
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuotesManager;
}
