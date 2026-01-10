// src/theme.ts

import { createTheme } from '@mui/material/styles';

// WellNote Theme - 爽やかなティール/ミント系カラー
export const theme = createTheme({
    palette: {
        primary: {
            main: '#0d9488', // ティール
            light: '#5eead4',
            dark: '#115e59',
            contrastText: '#fff',
        },
        secondary: {
            main: '#6366f1', // インディゴ
            light: '#a5b4fc',
            dark: '#4338ca',
        },
        background: {
            default: '#f0fdfa',
            paper: '#ffffff',
        },
        text: {
            primary: '#1f2937',
            secondary: '#6b7280',
        },
        success: {
            main: '#22c55e',
            light: '#86efac',
            dark: '#16a34a',
        },
        warning: {
            main: '#f59e0b',
            light: '#fcd34d',
            dark: '#d97706',
        },
        error: {
            main: '#ef4444',
            light: '#fca5a5',
            dark: '#dc2626',
        },
        info: {
            main: '#3b82f6',
            light: '#93c5fd',
            dark: '#1d4ed8',
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
