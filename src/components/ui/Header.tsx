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
import { useAppDispatch } from '../../redux/hooks';
import { toggleMoreMenu } from '../../redux/uiSlice';

const Header: React.FC = () => {
    const dispatch = useAppDispatch();

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
            <Toolbar>
                {/* 左側のスペース */}
                <Box sx={{ minWidth: 48 }} />

                {/* タイトル中央 */}
                <Typography
                    variant="h1"
                    component="h1"
                    color="primary"
                    sx={{
                        flexGrow: 1,
                        textAlign: 'center',
                    }}
                >
                    体調管理
                </Typography>

                {/* 右側のメニューボタン */}
                <IconButton
                    edge="end"
                    onClick={() => dispatch(toggleMoreMenu())}
                    sx={{ color: 'text.secondary' }}
                >
                    <MoreVertIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
