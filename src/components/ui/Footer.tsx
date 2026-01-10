// src/components/ui/Footer.tsx

import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setActiveHealthTab } from '../../redux/uiSlice';
import type { ActiveHealthTab } from '../../types';

const Footer: React.FC = () => {
    const dispatch = useAppDispatch();
    const activeHealthTab = useAppSelector((state) => state.ui.activeHealthTab);

    const handleChange = (_: React.SyntheticEvent, newValue: ActiveHealthTab) => {
        dispatch(setActiveHealthTab(newValue));
    };

    return (
        <Paper
            sx={{
                position: 'sticky',
                bottom: 0,
                borderTop: 1,
                borderColor: 'divider',
            }}
            elevation={0}
        >
            <BottomNavigation
                value={activeHealthTab}
                onChange={handleChange}
                showLabels
                sx={{
                    '& .Mui-selected': {
                        color: 'primary.main',
                    },
                }}
            >
                <BottomNavigationAction
                    label="記録"
                    value="log"
                    icon={<EditNoteIcon />}
                />
                <BottomNavigationAction
                    label="グラフ"
                    value="chart"
                    icon={<ShowChartIcon />}
                />
                <BottomNavigationAction
                    label="カレンダー"
                    value="calendar"
                    icon={<CalendarMonthIcon />}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default Footer;
