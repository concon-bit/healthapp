// src/components/ui/Header.tsx

import React from 'react';
import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toggleMoreMenu, setActiveHealthTab } from '../../redux/uiSlice';
import type { ActiveHealthTab } from '../../types';

const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector((state) => state.ui.activeHealthTab);

    const handleTabChange = (tab: ActiveHealthTab) => {
        dispatch(setActiveHealthTab(tab));
    };

    const iconButtonStyle = (tab: ActiveHealthTab) => ({
        color: activeTab === tab ? 'primary.main' : 'text.secondary',
        bgcolor: activeTab === tab ? 'primary.50' : 'transparent',
        borderRadius: 1,
        mx: 0.25,
    });

    return (
        <AppBar
            position="static"
            color="transparent"
            elevation={0}
            sx={{
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            <Toolbar sx={{ minHeight: 56 }}>
                {/* 左側: ホームボタン */}
                <IconButton
                    onClick={() => handleTabChange('log')}
                    sx={iconButtonStyle('log')}
                >
                    <HomeIcon />
                </IconButton>

                {/* タイトル中央 */}
                <Typography
                    variant="h1"
                    component="h1"
                    color="primary"
                    sx={{
                        flexGrow: 1,
                        textAlign: 'center',
                        fontSize: '1.1rem',
                    }}
                >
                    体調管理
                </Typography>

                {/* 右側: グラフ・カレンダー・統計・メニュー */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        onClick={() => handleTabChange('chart')}
                        sx={iconButtonStyle('chart')}
                        size="small"
                    >
                        <ShowChartIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={() => handleTabChange('calendar')}
                        sx={iconButtonStyle('calendar')}
                        size="small"
                    >
                        <CalendarMonthIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={() => handleTabChange('stats')}
                        sx={iconButtonStyle('stats')}
                        size="small"
                    >
                        <BarChartIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        edge="end"
                        onClick={() => dispatch(toggleMoreMenu())}
                        sx={{ color: 'text.secondary', ml: 0.5 }}
                        size="small"
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
