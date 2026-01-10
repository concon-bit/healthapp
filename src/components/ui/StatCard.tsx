// src/components/ui/StatCard.tsx
// 統計カードコンポーネント（グラフ/統計で共用）

import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
    icon,
    label,
    value,
    subValue,
    color = 'primary'
}) => (
    <Card
        elevation={0}
        sx={{
            bgcolor: `${color}.50`,
            borderRadius: 2,
            flex: 1,
            minWidth: 0,
        }}
    >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Box sx={{ color: `${color}.main`, display: 'flex' }}>{icon}</Box>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {label}
                </Typography>
            </Box>
            <Typography variant="h6" fontWeight="bold" color={`${color}.dark`}>
                {value}
            </Typography>
            {subValue && (
                <Typography variant="caption" color="text.secondary">
                    {subValue}
                </Typography>
            )}
        </CardContent>
    </Card>
);

export default StatCard;
