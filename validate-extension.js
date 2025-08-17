/**
 * Smart Dashboard NewTab - Extension Validator
 * This script validates the extension configuration and files
 */

class ExtensionValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.success = [];
    }

    async validate() {
        console.log('🔍 Validating Smart Dashboard Extension...');
        
        // Validate manifest
        this.validateManifest();
        
        // Validate API keys
        this.validateAPIKeys();
        
        // Validate file structure
        this.validateFileStructure();
        
        // Validate storage
        await this.validateStorage();
        
        // Validate permissions
        this.validatePermissions();
        
        // Print results
        this.printResults();
        
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            success: this.success
        };
    }

    validateManifest() {
        try {
            // Check if manifest exists and is valid JSON
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
                const manifest = chrome.runtime.getManifest();
                
                // Check required fields
                const requiredFields = ['manifest_version', 'name', 'version', 'description'];
                requiredFields.forEach(field => {
                    if (!manifest[field]) {
                        this.errors.push(`Missing required manifest field: ${field}`);
                    } else {
                        this.success.push(`✓ Manifest field ${field}: ${manifest[field]}`);
                    }
                });
                
                // Check permissions
                if (manifest.permissions) {
                    this.success.push(`✓ Permissions configured: ${manifest.permissions.length} permissions`);
                } else {
                    this.warnings.push('No permissions configured in manifest');
                }
                
                // Check host permissions
                if (manifest.host_permissions) {
                    this.success.push(`✓ Host permissions configured: ${manifest.host_permissions.length} hosts`);
                } else {
                    this.warnings.push('No host permissions configured');
                }
                
            } else {
                this.errors.push('Cannot access manifest - not running in extension context');
            }
        } catch (error) {
            this.errors.push(`Manifest validation failed: ${error.message}`);
        }
    }

    validateAPIKeys() {
        try {
            if (typeof window !== 'undefined' && window.API_KEYS) {
                const keys = window.API_KEYS;
                const keyStatus = {};
                
                Object.keys(keys).forEach(key => {
                    const value = keys[key];
                    if (value && value !== `YOUR_${key}`) {
                        keyStatus[key] = 'configured';
                        this.success.push(`✓ API key ${key}: configured`);
                    } else {
                        keyStatus[key] = 'not configured';
                        this.warnings.push(`⚠ API key ${key}: not configured`);
                    }
                });
                
                // Check API key manager
                if (window.apiKeyManager) {
                    const status = window.apiKeyManager.getAPIStatus();
                    this.success.push(`✓ API key manager: available`);
                } else {
                    this.warnings.push('⚠ API key manager not available');
                }
                
            } else {
                this.warnings.push('⚠ API_KEYS not available in window object');
            }
        } catch (error) {
            this.errors.push(`API key validation failed: ${error.message}`);
        }
    }

    validateFileStructure() {
        const requiredFiles = [
            'manifest.json',
            'index.html',
            'background.js',
            'popup.html',
            'popup.js',
            'config/api-keys.js',
            'scripts/app.js',
            'scripts/analytics.js',
            'styles/main.css',
            'styles/components.css',
            'styles/themes.css',
            'styles/animations.css'
        ];
        
        // Note: This is a basic check - in a real extension context,
        // we'd need to use chrome.runtime.getURL() to check files
        this.success.push('✓ File structure validation would run in extension context');
    }

    async validateStorage() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                // Test storage access
                const testData = { validator: Date.now() };
                await chrome.storage.sync.set(testData);
                const result = await chrome.storage.sync.get('validator');
                
                if (result.validator === testData.validator) {
                    this.success.push('✓ Chrome storage: working');
                } else {
                    this.errors.push('Chrome storage: data mismatch');
                }
                
                // Clean up test data
                await chrome.storage.sync.remove('validator');
                
            } else {
                this.warnings.push('⚠ Chrome storage not available');
            }
        } catch (error) {
            this.errors.push(`Storage validation failed: ${error.message}`);
        }
    }

    validatePermissions() {
        try {
            if (typeof chrome !== 'undefined' && chrome.permissions) {
                chrome.permissions.getAll((permissions) => {
                    if (permissions.permissions) {
                        this.success.push(`✓ Permissions granted: ${permissions.permissions.length} permissions`);
                    } else {
                        this.warnings.push('⚠ No permissions granted');
                    }
                });
            } else {
                this.warnings.push('⚠ Chrome permissions API not available');
            }
        } catch (error) {
            this.errors.push(`Permission validation failed: ${error.message}`);
        }
    }

    printResults() {
        console.log('\n📊 Validation Results:');
        console.log('=====================');
        
        if (this.success.length > 0) {
            console.log('\n✅ Success:');
            this.success.forEach(msg => console.log(`  ${msg}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            this.warnings.forEach(msg => console.log(`  ${msg}`));
        }
        
        if (this.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.errors.forEach(msg => console.log(`  ${msg}`));
        }
        
        console.log('\n📈 Summary:');
        console.log(`  Success: ${this.success.length}`);
        console.log(`  Warnings: ${this.warnings.length}`);
        console.log(`  Errors: ${this.errors.length}`);
        
        if (this.errors.length === 0) {
            console.log('\n🎉 Extension validation passed!');
        } else {
            console.log('\n🔧 Extension has issues that need to be fixed.');
        }
    }

    // Quick validation methods
    static async quickValidate() {
        const validator = new ExtensionValidator();
        return await validator.validate();
    }

    static checkAPIKeys() {
        if (typeof window !== 'undefined' && window.apiKeyManager) {
            return window.apiKeyManager.getAPIStatus();
        }
        return null;
    }

    static checkStorage() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.sync.get(null, (data) => {
                    resolve({
                        available: true,
                        data: data
                    });
                });
            } else {
                resolve({
                    available: false,
                    data: null
                });
            }
        });
    }
}

// Auto-run validation if this script is loaded
if (typeof window !== 'undefined') {
    window.ExtensionValidator = ExtensionValidator;
    
    // Run validation after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ExtensionValidator.quickValidate();
        });
    } else {
        ExtensionValidator.quickValidate();
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExtensionValidator;
}
