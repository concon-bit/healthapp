// src/App.tsx

import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import Dashboard from './features/dashboard/Dashboard';
import Login from './features/auth/Login';
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { setUser } from './redux/userSlice';
import { fetchLogs } from './redux/logsSlice';
import { onAuthChange, checkRedirectResult } from './services/firebaseService';

function App() {
    const { currentUser, loading } = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const initAuth = async () => {
            try {
                // リダイレクト認証の結果を先に確認（iOSのSafari対応）
                // これを先に処理しないと、onAuthChangeがnullを検出してログイン画面に戻ってしまう
                await checkRedirectResult();
            } catch (error) {
                console.error('リダイレクト認証確認エラー:', error);
            }

            // リダイレクト結果の確認後に認証状態リスナーを設定
            unsubscribe = onAuthChange((user) => {
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
        };

        initAuth();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
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
