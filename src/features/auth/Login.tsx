// src/features/auth/Login.tsx

import React, { useState } from 'react';
import { Box, Button, Container, Paper, Typography, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { loginWithGoogle } from '../../services/firebaseService';

const Login: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            await loginWithGoogle();
            // リダイレクト認証のため、ここでは画面が切り替わる
            // 認証結果はApp.tsxのcheckRedirectResultで処理される
        } catch (err) {
            const firebaseError = err as { code?: string };
            if (firebaseError.code === 'auth/redirect-cancelled-by-user') {
                console.log('ログインがキャンセルされました');
            } else if (firebaseError.code === 'auth/redirect-operation-pending') {
                // リダイレクト操作が進行中
                console.log('リダイレクト操作が進行中です');
            } else {
                console.error('ログインに失敗しました:', err);
                setError('ログインに失敗しました。もう一度お試しください。');
            }
            setLoading(false);
        }
        // リダイレクト発生時はsetLoadingをfalseにしない（画面遷移するため）
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={3}
                    sx={{
                        p: 5,
                        textAlign: 'center',
                        borderRadius: 3,
                    }}
                >
                    <Typography
                        variant="h1"
                        component="h1"
                        color="primary"
                        sx={{ mb: 2 }}
                    >
                        体調管理アプリ
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        Googleアカウントでログインして、
                        <br />
                        日々の健康を記録・分析しましょう。
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<GoogleIcon />}
                        onClick={handleLogin}
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            px: 4,
                            fontSize: '1rem',
                            borderRadius: 2,
                        }}
                    >
                        {loading ? 'ログイン中...' : 'Googleでログイン'}
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
