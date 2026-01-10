// src/theme.ts

import { createTheme } from '@mui/material/styles';

// MUI Theme定義
export const theme = createTheme({
    palette: {
        primary: {
            main: '#ef476f',
            light: '#ff7a9c',
            dark: '#b81d48',
            contrastText: '#fff',
        },
        secondary: {
            main: '#577399',
            light: '#7a9bc5',
            dark: '#2d4a6f',
        },
        background: {
            default: '#f4f7f9',
            paper: '#ffffff',
        },
        text: {
            primary: '#333333',
            secondary: '#666666',
        },
        success: {
            main: '#22c55e',
        },
        warning: {
            main: '#f59e0b',
        },
        error: {
            main: '#ef4444',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            '"Hiragino Kaku Gothic ProN"',
            'Meiryo',
            'sans-serif',
        ].join(','),
        h1: {
            fontSize: '1.5rem',
            fontWeight: 600,
        },
        h2: {
            fontSize: '1.25rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '1.125rem',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
    },
});
