/**
 * Internationalization (i18n) utility for the blog
 * Supports: English (en), Vietnamese (vi)
 * Features: Browser detection, localStorage persistence, manual switching
 */

const I18n = (function() {
    const SUPPORTED_LANGUAGES = ['en', 'vi'];
    const DEFAULT_LANGUAGE = 'en';
    const STORAGE_KEY = 'blog-language';

    /**
     * Detect browser's preferred language
     */
    function detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        return SUPPORTED_LANGUAGES.includes(langCode) ? langCode : DEFAULT_LANGUAGE;
    }

    /**
     * Get stored language preference or detect from browser
     */
    function getLanguage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
            return stored;
        }
        return detectBrowserLanguage();
    }

    /**
     * Set language preference
     */
    function setLanguage(lang) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
            console.warn(`Unsupported language: ${lang}. Using default.`);
            lang = DEFAULT_LANGUAGE;
        }
        localStorage.setItem(STORAGE_KEY, lang);
        applyLanguage(lang);
        return lang;
    }

    /**
     * Apply language to all content elements
     */
    function applyLanguage(lang) {
        // Update document language attribute
        document.documentElement.lang = lang;

        // Show/hide content based on language
        document.querySelectorAll('[data-lang]').forEach(el => {
            if (el.getAttribute('data-lang') === lang) {
                el.style.display = '';
                el.removeAttribute('hidden');
            } else {
                el.style.display = 'none';
                el.setAttribute('hidden', '');
            }
        });

        // Update language switcher active state
        document.querySelectorAll('[data-lang-switch]').forEach(btn => {
            const btnLang = btn.getAttribute('data-lang-switch');
            btn.classList.toggle('active', btnLang === lang);
            btn.setAttribute('aria-pressed', btnLang === lang);
        });

        // Dispatch custom event for any additional handlers
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
    }

    /**
     * Toggle between available languages
     */
    function toggleLanguage() {
        const current = getLanguage();
        const currentIndex = SUPPORTED_LANGUAGES.indexOf(current);
        const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
        return setLanguage(SUPPORTED_LANGUAGES[nextIndex]);
    }

    /**
     * Initialize i18n system
     */
    function init() {
        const lang = getLanguage();
        applyLanguage(lang);

        // Set up language switcher buttons
        document.querySelectorAll('[data-lang-switch]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetLang = btn.getAttribute('data-lang-switch');
                setLanguage(targetLang);
            });
        });

        return lang;
    }

    // Public API
    return {
        init,
        getLanguage,
        setLanguage,
        toggleLanguage,
        detectBrowserLanguage,
        SUPPORTED_LANGUAGES,
        DEFAULT_LANGUAGE
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
    I18n.init();
}
