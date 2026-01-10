// src/features/auth/Login.tsx

import React from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { loginWithGoogle } from '../../services/firebaseService';

const Login: React.FC = () => {
    const handleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error('ログインに失敗しました:', error);
            alert('ログインに失敗しました。');
        }
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
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<GoogleIcon />}
                        onClick={handleLogin}
                        sx={{
                            py: 1.5,
                            px: 4,
                            fontSize: '1rem',
                            borderRadius: 2,
                        }}
                    >
                        Googleでログイン
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
