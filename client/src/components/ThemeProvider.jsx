import { createContext, useContext, useEffect, useState } from "react";

const initialState = {
    theme: "dark",
    setTheme: () => null,
};

const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
    children,
    storageKey = "vite-ui-theme",
    ...props
}) {
    // Always lock to dark — clear any old user preference
    useEffect(() => {
        localStorage.removeItem(storageKey);
        const root = window.document.documentElement;
        root.classList.remove("light", "system");
        root.classList.add("dark");
    }, [storageKey]);

    const value = {
        theme: "dark",
        setTheme: () => null, // no-op — theme is locked
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};