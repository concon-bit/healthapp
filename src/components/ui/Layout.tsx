// src/components/ui/Layout.tsx

import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import MoreMenuModal from './MoreMenuModal';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                bgcolor: 'background.default',
            }}
        >
            <Container
                maxWidth="sm"
                disableGutters
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    bgcolor: 'background.paper',
                    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                }}
            >
                <Header />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 2,
                        overflow: 'auto',
                    }}
                >
                    {children}
                </Box>
                <Footer />
                <MoreMenuModal />
            </Container>
        </Box>
    );
};

export default Layout;
