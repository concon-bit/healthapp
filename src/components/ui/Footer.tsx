// src/components/ui/Footer.tsx

import React from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setActiveHealthTab } from '../../redux/uiSlice';
import type { ActiveHealthTab } from '../../types';

const TAB_MAP: { value: ActiveHealthTab; label: string; icon: React.ReactNode }[] = [
    { value: 'log', label: '記録', icon: <HomeIcon /> },
    { value: 'chart', label: 'グラフ', icon: <ShowChartIcon /> },
    { value: 'calendar', label: 'カレンダー', icon: <CalendarMonthIcon /> },
    { value: 'stats', label: '統計', icon: <BarChartIcon /> },
];

const Footer: React.FC = () => {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector((state) => state.ui.activeHealthTab);

    const handleChange = (_: React.SyntheticEvent, newValue: ActiveHealthTab) => {
        dispatch(setActiveHealthTab(newValue));
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1100,
                borderTop: 1,
                borderColor: 'divider',
            }}
            elevation={8}
        >
            <BottomNavigation
                value={activeTab}
                onChange={handleChange}
                showLabels
                sx={{
                    height: 64,
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 'auto',
                        py: 1,
                        '&.Mui-selected': {
                            color: 'primary.main',
                        },
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.7rem',
                        '&.Mui-selected': {
                            fontSize: '0.75rem',
                            fontWeight: 600,
                        },
                    },
                }}
            >
                {TAB_MAP.map((tab) => (
                    <BottomNavigationAction
                        key={tab.value}
                        value={tab.value}
                        label={tab.label}
                        icon={tab.icon}
                    />
                ))}
            </BottomNavigation>
            {/* Safe area for iPhone */}
            <Box sx={{ height: 'env(safe-area-inset-bottom)' }} />
        </Paper>
    );
};

export default Footer;
