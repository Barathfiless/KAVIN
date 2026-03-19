import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('language') || 'en');

    useEffect(() => {
        localStorage.setItem('language', currentLang);
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
