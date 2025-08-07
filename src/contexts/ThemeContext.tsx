import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#95E1D3',
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#999999',
    border: '#404040',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
  },
};

const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#95E1D3',
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#212121',
    textSecondary: '#757575',
    border: '#e0e0e0',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
  },
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: theme.colors,
        toggleTheme,
        isDark,
      }}
    >
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