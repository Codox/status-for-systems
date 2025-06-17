'use client';

import { ReactNode } from 'react';
import { ChakraProvider, extendTheme, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { CacheProvider } from '@chakra-ui/next-js';

interface ThemeProviderProps {
  children: ReactNode;
}

// Define the Chakra UI theme to match the previous MUI theme
const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  fonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  colors: {
    // Light mode colors
    light: {
      background: '#ffffff',
      paper: '#f5f5f5',
      text: '#171717',
    },
    // Dark mode colors
    dark: {
      background: '#0a0a0a',
      paper: '#171717',
      text: '#ededed',
    },
    // Status colors that match MUI's palette
    success: {
      light: '#e6f7ea',
      main: '#4caf50',
      dark: '#2e7d32',
    },
    warning: {
      light: '#fff8e1',
      main: '#ff9800',
      dark: '#e65100',
    },
    error: {
      light: '#ffebee',
      main: '#f44336',
      dark: '#c62828',
    },
    info: {
      light: '#e3f2fd',
      main: '#2196f3',
      dark: '#0d47a1',
    },
    grey: {
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  components: {
    // Define component styles to match MUI's defaults
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'medium',
      },
    },
  },
});

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
}
