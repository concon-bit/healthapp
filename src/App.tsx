// src/App.tsx

import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import Dashboard from './features/dashboard/Dashboard';
import Login from './features/auth/Login';
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { setUser } from './redux/userSlice';
import { fetchLogs } from './redux/logsSlice';
import { onAuthChange } from './services/firebaseService';

function App() {
    const { currentUser, loading } = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            if (user) {
                const serializedUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                };
                dispatch(setUser(serializedUser));
                dispatch(fetchLogs(user.uid));
            } else {
                dispatch(setUser(null));
            }
        });
        return () => unsubscribe();
    }, [dispatch]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 2,
                }}
            >
                <CircularProgress color="primary" />
                <Typography color="text.secondary">読み込み中...</Typography>
            </Box>
        );
    }

    return currentUser ? <Dashboard /> : <Login />;
}

export default App;
