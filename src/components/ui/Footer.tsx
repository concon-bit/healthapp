// src/components/ui/Footer.tsx

import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 2,
                textAlign: 'center',
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            <Typography variant="caption" color="text.secondary">
                © 2026 体調管理アプリ
            </Typography>
        </Box>
    );
};

export default Footer;
