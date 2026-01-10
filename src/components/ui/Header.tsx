// src/components/ui/Header.tsx

import React from 'react';
import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toggleMoreMenu } from '../../redux/uiSlice';
import type { ActiveHealthTab } from '../../types';

const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector((state) => state.ui.activeHealthTab);

    const getTabLabel = (tab: ActiveHealthTab) => {
        switch (tab) {
            case 'log': return '記録';
            case 'chart': return 'グラフ';
            case 'calendar': return 'カレンダー';
            case 'stats': return '統計';
            default: return '';
        }
    };

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
            <Toolbar sx={{ minHeight: 56, px: 2 }}>
                {/* ロゴ・タイトル */}
                <Box sx={{ flexGrow: 1 }}>
                    <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                            fontSize: '1.35rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #0d9488 0%, #6366f1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        WellNote
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {getTabLabel(activeTab)}
                    </Typography>
                </Box>

                {/* メニューボタンのみ */}
                <IconButton
                    edge="end"
                    onClick={() => dispatch(toggleMoreMenu())}
                    sx={{
                        color: 'text.secondary',
                        p: 1,
                        '&:hover': {
                            bgcolor: 'grey.100',
                        },
                    }}
                >
                    <MoreVertIcon sx={{ fontSize: 24 }} />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
