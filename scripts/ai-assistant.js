/**
 * AI Assistant Module with Gemini API Integration
 * Provides intelligent features and smart suggestions using Google's Gemini AI
 */

class AIAssistant {
    constructor() {
        this.context = {
            userBehavior: {},
            preferences: {},
            currentTasks: [],
            recentSearches: [],
            timeOfDay: 'morning'
        };
        this.suggestions = [];
        this.isInitialized = false;
        this.geminiApiKey = window.API_KEYS?.GEMINI_API_KEY || 'AIzaSyC81PcmFULHAoU0WzuRKqntFeq430iN-fU';
        this.geminiApiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
        this.init();
    }

    async init() {
        await this.loadUserContext();
        this.analyzeUserBehavior();
        this.startContextualAnalysis();
        this.isInitialized = true;
    }

    async loadUserContext() {
        try {
            const stored = await chrome.storage.local.get(['aiContext', 'userPreferences']);
            this.context = { ...this.context, ...stored.aiContext };
            this.context.preferences = stored.userPreferences || {};
        } catch (error) {
            console.log('AI Assistant: Loading context failed', error);
        }
    }

    async saveUserContext() {
        try {
            await chrome.storage.local.set({ aiContext: this.context });
        } catch (error) {
            console.log('AI Assistant: Saving context failed', error);
        }
    }

    // Gemini API Integration
    async callGeminiAPI(prompt, context = '') {
        try {
            const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
            
            console.log('Calling Gemini API with URL:', this.geminiApiUrl);
            console.log('API Key available:', !!this.geminiApiKey);
            
            const requestBody = {
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            };
            
            console.log('Request body:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch(`${this.geminiApiUrl}?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response from Gemini API');
            }
        } catch (error) {
            console.error('Gemini API call failed:', error);
            return null;
        }
    }

    // Enhanced Smart Suggestions with Gemini
    async generateSmartSuggestions() {
        const suggestions = [];

        // Time-based suggestions
        const timeSuggestions = this.getTimeBasedSuggestions();
        suggestions.push(...timeSuggestions);

        // Productivity suggestions
        const productivitySuggestions = this.getProductivitySuggestions();
        suggestions.push(...productivitySuggestions);

        // Task suggestions
        const taskSuggestions = this.getTaskSuggestions();
        suggestions.push(...taskSuggestions);

        // AI-powered suggestions using Gemini
        const aiSuggestions = await this.getGeminiSuggestions();
        if (aiSuggestions) {
            suggestions.push(...aiSuggestions);
        }

        this.suggestions = suggestions.slice(0, 5); // Keep top 5 suggestions
        this.saveUserContext();
        this.notifySuggestions();
    }

    async getGeminiSuggestions() {
        try {
            // Check if API key is available
            if (!this.geminiApiKey || this.geminiApiKey === 'YOUR_GEMINI_API_KEY') {
                console.log('Gemini API key not configured, using fallback suggestions');
                return this.getFallbackSuggestions();
            }
            
            const context = this.buildContextForGemini();
            const prompt = `Based on the user's context, provide 2-3 personalized productivity suggestions. 
            Focus on actionable, specific advice that would help improve their productivity and workflow.
            Format each suggestion as a JSON object with: title, message, action, priority (high/medium/low), and type.
            
            User Context: ${context}
            
            Return only valid JSON array format.`;

            const response = await this.callGeminiAPI(prompt);
            
            if (response) {
                try {
                    // Extract JSON from response
                    const jsonMatch = response.match(/\[.*\]/s);
                    if (jsonMatch) {
                        const suggestions = JSON.parse(jsonMatch[0]);
                        return suggestions.map(s => ({
                            type: 'ai',
                            title: s.title,
                            message: s.message,
                            action: s.action,
                            priority: s.priority
                        }));
                    }
                } catch (parseError) {
                    console.error('Failed to parse Gemini suggestions:', parseError);
                }
            }
        } catch (error) {
            console.error('Failed to get Gemini suggestions:', error);
            return this.getFallbackSuggestions();
        }
    }

    getFallbackSuggestions() {
        const suggestions = [
            {
                title: "Take a Break",
                message: "You've been working for a while. Consider taking a 5-minute break to refresh your mind.",
                action: "Start a 5-minute timer",
                priority: "medium",
                type: "wellness"
            },
            {
                title: "Organize Your Tasks",
                message: "Create a prioritized to-do list for today to stay focused and productive.",
                action: "Open task manager",
                priority: "high",
                type: "productivity"
            },
            {
                title: "Stay Hydrated",
                message: "Don't forget to drink water! Staying hydrated helps maintain focus and energy.",
                action: "Set hydration reminder",
                priority: "low",
                type: "wellness"
            }
        ];
        
        return suggestions;
    }

    buildContextForGemini() {
        const productivity = this.context.userBehavior.productivity || {};
        const patterns = this.context.userBehavior.searchPatterns || {};
        
        return `
        Time of day: ${this.context.timeOfDay}
        Task completion rate: ${(productivity.completionRate * 100).toFixed(1)}%
        Total tasks: ${productivity.totalTasks || 0}
        Completed today: ${productivity.completedToday || 0}
        Most active category: ${patterns.mostSearchedCategory || 'none'}
        Recent searches: ${this.context.recentSearches.slice(0, 5).map(s => s.query).join(', ')}
        Current tasks: ${this.context.currentTasks.length}
        `;
    }

    // Enhanced Task Prioritization with Gemini
    async prioritizeTasks(tasks) {
        if (tasks.length === 0) return tasks;

        // Check if API key is available
        if (!this.geminiApiKey || this.geminiApiKey === 'YOUR_GEMINI_API_KEY') {
            console.log('Gemini API key not configured, using local prioritization');
            return this.localPrioritizeTasks(tasks);
        }

        try {
            const taskContext = tasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                priority: task.priority,
                category: task.category
            }));

            const prompt = `Analyze these tasks and prioritize them based on importance, urgency, and user context.
            Consider deadlines, task complexity, and user's typical productivity patterns.
            
            Tasks: ${JSON.stringify(taskContext)}
            User Context: ${this.buildContextForGemini()}
            
            Return a JSON array with task IDs in priority order (highest priority first).`;

            const response = await this.callGeminiAPI(prompt);
            
            if (response) {
                try {
                    const jsonMatch = response.match(/\[.*\]/s);
                    if (jsonMatch) {
                        const priorityOrder = JSON.parse(jsonMatch[0]);
                        return priorityOrder.map(taskId => {
                            const task = tasks.find(t => t.id === taskId);
                            return task ? { ...task, aiPriority: priorityOrder.indexOf(taskId) } : null;
                        }).filter(Boolean);
                    }
                } catch (parseError) {
                    console.error('Failed to parse task prioritization:', parseError);
                }
            }
        } catch (error) {
            console.error('Failed to prioritize tasks with Gemini:', error);
        }

        // Fallback to local prioritization
        return this.localPrioritizeTasks(tasks);
    }

    localPrioritizeTasks(tasks) {
        return tasks.map(task => {
            let priority = 1;

            if (task.dueDate) {
                const daysUntilDue = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
                if (daysUntilDue < 0) priority += 10;
                else if (daysUntilDue <= 1) priority += 8;
                else if (daysUntilDue <= 3) priority += 5;
            }

            if (task.userPriority === 'high') priority += 5;
            else if (task.userPriority === 'medium') priority += 3;

            const hour = new Date().getHours();
            if (hour >= 9 && hour <= 17 && task.category === 'work') priority += 2;

            return { ...task, aiPriority: priority };
        }).sort((a, b) => b.aiPriority - a.aiPriority);
    }

    // Enhanced Search Suggestions with Gemini
    async getSmartSearchSuggestions(query) {
        const suggestions = [];
        const recentSearches = this.context.recentSearches;
        
        // Find similar recent searches
        const similarSearches = recentSearches.filter(search => 
            search.query.toLowerCase().includes(query.toLowerCase()) ||
            query.toLowerCase().includes(search.query.toLowerCase())
        );

        if (similarSearches.length > 0) {
            suggestions.push({
                type: 'recent',
                title: 'Recent Searches',
                items: similarSearches.slice(0, 3).map(s => s.query)
            });
        }

        // AI-powered suggestions using Gemini
        const aiSuggestions = await this.getGeminiSearchSuggestions(query);
        if (aiSuggestions.length > 0) {
            suggestions.push({
                type: 'ai',
                title: 'AI Suggestions',
                items: aiSuggestions
            });
        }

        return suggestions;
    }

    async getGeminiSearchSuggestions(query) {
        try {
            const context = this.buildContextForGemini();
            const prompt = `Based on the user's search query and context, suggest 3-5 related search terms or topics that might be helpful.
            
            Search Query: "${query}"
            User Context: ${context}
            
            Return only a JSON array of strings with the suggestions.`;

            const response = await this.callGeminiAPI(prompt);
            
            if (response) {
                try {
                    const jsonMatch = response.match(/\[.*\]/s);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    }
                } catch (parseError) {
                    console.error('Failed to parse search suggestions:', parseError);
                }
            }
        } catch (error) {
            console.error('Failed to get AI search suggestions:', error);
        }
        
        return [];
    }

    // AI-Powered Task Analysis
    async analyzeTask(task) {
        try {
            const prompt = `Analyze this task and provide insights about:
            1. Estimated completion time
            2. Difficulty level (easy/medium/hard)
            3. Recommended approach
            4. Potential blockers
            5. Related resources or tools
            
            Task: ${task.title}
            Description: ${task.description || 'No description'}
            Category: ${task.category || 'General'}
            
            Return a JSON object with these insights.`;

            const response = await this.callGeminiAPI(prompt);
            
            if (response) {
                try {
                    const jsonMatch = response.match(/\{.*\}/s);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    }
                } catch (parseError) {
                    console.error('Failed to parse task analysis:', parseError);
                }
            }
        } catch (error) {
            console.error('Failed to analyze task with Gemini:', error);
        }
        
        return null;
    }

    // AI-Powered Productivity Insights
    async getProductivityInsights() {
        // Check if API key is available
        if (!this.geminiApiKey || this.geminiApiKey === 'YOUR_GEMINI_API_KEY') {
            console.log('Gemini API key not configured, using fallback insights');
            return this.getFallbackProductivityInsights();
        }

        try {
            const context = this.buildContextForGemini();
            const prompt = `Analyze the user's productivity patterns and provide actionable insights.
            
            User Context: ${context}
            
            Provide insights about:
            1. Productivity strengths
            2. Areas for improvement
            3. Recommended productivity techniques
            4. Time management suggestions
            
            Return a JSON object with these insights.`;

            const response = await this.callGeminiAPI(prompt);
            
            if (response) {
                try {
                    const jsonMatch = response.match(/\{.*\}/s);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    }
                } catch (parseError) {
                    console.error('Failed to parse productivity insights:', parseError);
                }
            }
        } catch (error) {
            console.error('Failed to get productivity insights:', error);
            return this.getFallbackProductivityInsights();
        }
    }

    getFallbackProductivityInsights() {
        return {
            strengths: [
                "You're maintaining consistent daily routines",
                "You have good task completion patterns",
                "You're using productivity tools effectively"
            ],
            improvements: [
                "Consider implementing time-blocking techniques",
                "Try the Pomodoro Technique for better focus",
                "Schedule regular breaks to maintain energy"
            ],
            recommendations: [
                "Use the 2-minute rule: if a task takes less than 2 minutes, do it now",
                "Implement the Eisenhower Matrix for task prioritization",
                "Set specific, measurable goals for each day"
            ],
            timeManagement: [
                "Allocate specific time slots for different types of work",
                "Use calendar blocking to protect your time",
                "Review and adjust your schedule weekly"
            ]
        };
    }

    // AI Chat Interface
    async chatWithAI(message) {
        // Check if API key is available
        if (!this.geminiApiKey || this.geminiApiKey === 'YOUR_GEMINI_API_KEY') {
            console.log('Gemini API key not configured, using fallback response');
            return this.getFallbackChatResponse(message);
        }

        try {
            const context = this.buildContextForGemini();
            const prompt = `You are a helpful AI assistant for a productivity dashboard. 
            The user is asking: "${message}"
            
            User Context: ${context}
            
            Provide a helpful, concise response that's relevant to their productivity and workflow needs.`;

            const response = await this.callGeminiAPI(prompt);
            return response || "I'm sorry, I couldn't process your request at the moment.";
        } catch (error) {
            console.error('AI chat failed:', error);
            return this.getFallbackChatResponse(message);
        }
    }

    getFallbackChatResponse(message) {
        const responses = {
            'hello': "Hello! I'm your productivity assistant. How can I help you today?",
            'help': "I can help you with task management, productivity tips, and workflow optimization. What would you like to know?",
            'tasks': "I can help you organize and prioritize your tasks. Would you like me to create a task list or suggest a productivity strategy?",
            'time': "Time management is crucial for productivity. Would you like me to suggest some time-blocking techniques or help you set up a schedule?",
            'break': "Taking regular breaks is important for maintaining focus and productivity. I recommend the Pomodoro Technique: 25 minutes of focused work followed by a 5-minute break.",
            'focus': "To improve focus, try eliminating distractions, setting clear goals, and using time-blocking techniques. Would you like me to help you set up a focus session?"
        };

        const lowerMessage = message.toLowerCase();
        
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        return "I'm here to help with your productivity! Try asking me about task management, time management, or productivity tips.";
    }

    analyzeUserBehavior() {
        // Analyze time patterns
        const hour = new Date().getHours();
        if (hour < 12) this.context.timeOfDay = 'morning';
        else if (hour < 17) this.context.timeOfDay = 'afternoon';
        else if (hour < 21) this.context.timeOfDay = 'evening';
        else this.context.timeOfDay = 'night';

        // Analyze task patterns
        this.analyzeTaskPatterns();
        
        // Analyze search patterns
        this.analyzeSearchPatterns();
    }

    analyzeTaskPatterns() {
        const tasks = this.context.currentTasks;
        const completedTasks = tasks.filter(task => task.completed);
        const pendingTasks = tasks.filter(task => !task.completed);

        // Calculate productivity metrics
        const completionRate = completedTasks.length / (tasks.length || 1);
        const avgTaskDuration = this.calculateAverageTaskDuration(completedTasks);

        this.context.userBehavior.productivity = {
            completionRate,
            avgTaskDuration,
            totalTasks: tasks.length,
            completedToday: completedTasks.filter(task => 
                new Date(task.completedAt).toDateString() === new Date().toDateString()
            ).length
        };
    }

    calculateAverageTaskDuration(completedTasks) {
        if (completedTasks.length === 0) return 0;
        
        const durations = completedTasks.map(task => {
            if (task.createdAt && task.completedAt) {
                return new Date(task.completedAt) - new Date(task.createdAt);
            }
            return 0;
        }).filter(duration => duration > 0);

        return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    }

    analyzeSearchPatterns() {
        const searches = this.context.recentSearches;
        const searchCategories = this.categorizeSearches(searches);
        
        this.context.userBehavior.searchPatterns = {
            categories: searchCategories,
            totalSearches: searches.length,
            mostSearchedCategory: this.getMostFrequentCategory(searchCategories)
        };
    }

    categorizeSearches(searches) {
        const categories = {
            work: 0,
            entertainment: 0,
            shopping: 0,
            news: 0,
            education: 0,
            other: 0
        };

        searches.forEach(search => {
            const query = search.query.toLowerCase();
            if (query.includes('work') || query.includes('project') || query.includes('meeting')) {
                categories.work++;
            } else if (query.includes('movie') || query.includes('game') || query.includes('music')) {
                categories.entertainment++;
            } else if (query.includes('buy') || query.includes('shop') || query.includes('price')) {
                categories.shopping++;
            } else if (query.includes('news') || query.includes('update') || query.includes('latest')) {
                categories.news++;
            } else if (query.includes('learn') || query.includes('tutorial') || query.includes('how to')) {
                categories.education++;
            } else {
                categories.other++;
            }
        });

        return categories;
    }

    getMostFrequentCategory(categories) {
        return Object.entries(categories).reduce((a, b) => categories[a] > categories[b] ? a : b);
    }

    startContextualAnalysis() {
        // Analyze context every 5 minutes
        setInterval(() => {
            this.analyzeUserBehavior();
            this.generateSmartSuggestions();
        }, 5 * 60 * 1000);
    }

    getTimeBasedSuggestions() {
        const suggestions = [];
        const hour = new Date().getHours();

        switch (this.context.timeOfDay) {
            case 'morning':
                suggestions.push({
                    type: 'productivity',
                    title: 'Morning Routine',
                    message: 'Start your day with a focused task list',
                    action: 'openTodo',
                    priority: 'high'
                });
                break;
            case 'afternoon':
                suggestions.push({
                    type: 'break',
                    title: 'Take a Break',
                    message: 'Consider a short break to maintain productivity',
                    action: 'startTimer',
                    priority: 'medium'
                });
                break;
            case 'evening':
                suggestions.push({
                    type: 'planning',
                    title: 'Plan Tomorrow',
                    message: 'Review today and plan for tomorrow',
                    action: 'openCalendar',
                    priority: 'medium'
                });
                break;
            case 'night':
                suggestions.push({
                    type: 'wellness',
                    title: 'Wind Down',
                    message: 'Time to relax and prepare for sleep',
                    action: 'openQuotes',
                    priority: 'low'
                });
                break;
        }

        return suggestions;
    }

    getProductivitySuggestions() {
        const suggestions = [];
        const productivity = this.context.userBehavior.productivity;

        if (productivity.completionRate < 0.5) {
            suggestions.push({
                type: 'productivity',
                title: 'Low Completion Rate',
                message: 'Consider breaking down larger tasks into smaller ones',
                action: 'showTaskTips',
                priority: 'high'
            });
        }

        if (productivity.completedToday === 0) {
            suggestions.push({
                type: 'motivation',
                title: 'Start Small',
                message: 'Begin with a simple 5-minute task',
                action: 'createQuickTask',
                priority: 'high'
            });
        }

        return suggestions;
    }

    getTaskSuggestions() {
        const suggestions = [];
        const pendingTasks = this.context.currentTasks.filter(task => !task.completed);

        if (pendingTasks.length > 10) {
            suggestions.push({
                type: 'organization',
                title: 'Too Many Tasks',
                message: 'Consider prioritizing and removing low-priority items',
                action: 'showPriorityGuide',
                priority: 'medium'
            });
        }

        const overdueTasks = pendingTasks.filter(task => 
            task.dueDate && new Date(task.dueDate) < new Date()
        );

        if (overdueTasks.length > 0) {
            suggestions.push({
                type: 'urgent',
                title: 'Overdue Tasks',
                message: `You have ${overdueTasks.length} overdue task(s)`,
                action: 'showOverdueTasks',
                priority: 'high'
            });
        }

        return suggestions;
    }

    notifySuggestions() {
        if (this.suggestions.length > 0) {
            const event = new CustomEvent('aiSuggestions', {
                detail: { suggestions: this.suggestions }
            });
            document.dispatchEvent(event);
        }
    }

    // Update context with new data
    updateContext(type, data) {
        switch (type) {
            case 'task':
                this.context.currentTasks = data;
                break;
            case 'search':
                this.context.recentSearches.unshift(data);
                this.context.recentSearches = this.context.recentSearches.slice(0, 50); // Keep last 50
                break;
            case 'preference':
                this.context.preferences = { ...this.context.preferences, ...data };
                break;
        }
        this.saveUserContext();
    }

    // Get AI insights
    getInsights() {
        const productivity = this.context.userBehavior.productivity;
        const patterns = this.context.userBehavior.searchPatterns;

        return {
            productivity: {
                completionRate: Math.round(productivity.completionRate * 100),
                avgTaskDuration: Math.round(productivity.avgTaskDuration / (1000 * 60)), // in minutes
                tasksCompletedToday: productivity.completedToday,
                totalTasks: productivity.totalTasks
            },
            patterns: {
                mostActiveCategory: patterns.mostSearchedCategory,
                totalSearches: patterns.totalSearches,
                searchCategories: patterns.categories
            },
            suggestions: this.suggestions
        };
    }
}

// Export for use in other modules
window.AIAssistant = AIAssistant;
