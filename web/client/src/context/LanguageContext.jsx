import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('language') || 'en');

    useEffect(() => {
        localStorage.setItem('language', currentLang);
        
        // Intercept and synchronize explicitly with the hidden Google Translate widget
        const triggerGoogleTranslate = () => {
            const selectField = document.querySelector('.goog-te-combo');
            if (selectField) {
                selectField.value = currentLang;
                selectField.dispatchEvent(new Event('change'));
            } else {
                // If widget is still loading on initial mount
                setTimeout(() => {
                    const retrySelect = document.querySelector('.goog-te-combo');
                    if(retrySelect) {
                        retrySelect.value = currentLang;
                        retrySelect.dispatchEvent(new Event('change'));
                    }
                }, 1500);
            }
        };
        triggerGoogleTranslate();

    }, [currentLang]);

    const t = translations[currentLang] || translations['en'];

    return (
        <LanguageContext.Provider value={{ currentLang, setCurrentLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
