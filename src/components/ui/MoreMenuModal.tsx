// src/components/ui/MoreMenuModal.tsx

import React from 'react';
import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toggleMoreMenu } from '../../redux/uiSlice';
import { logout } from '../../services/firebaseService';

const MoreMenuModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const showMoreMenu = useAppSelector((state) => state.ui.showMoreMenu);

    const handleClose = () => {
        dispatch(toggleMoreMenu());
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleClose();
        } catch (error) {
            console.error('ログアウトに失敗しました:', error);
        }
    };

    return (
        <Dialog open={showMoreMenu} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>メニュー</DialogTitle>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="ログアウト" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Dialog>
    );
};

export default MoreMenuModal;
