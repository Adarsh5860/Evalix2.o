// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('evalix_theme');
            if (savedTheme === 'dark' || savedTheme === 'light') {
                return savedTheme;
            }
            // If user prefers dark mode at the OS level
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        } catch (e) {
            console.warn('Could not read theme from localStorage');
        }
        return 'light';
    });

    const isDarkMode = theme === 'dark';

    useEffect(() => {
        try {
            localStorage.setItem('evalix_theme', theme);
        } catch (e) {
            // Ignore localStorage errors
        }

        // Apply data-theme attribute on root and body
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-bs-theme', theme);

        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.documentElement.classList.add('dark');
        } else {
            document.body.classList.remove('dark-theme');
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;

