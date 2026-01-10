// src/components/ui/PeriodInput.tsx
// 生理記録入力コンポーネント

import React from 'react';
import { Box, Typography } from '@mui/material';
import { IconButtonOption } from './IconButtonOption';
import type { PeriodType } from '../../types';

interface PeriodInputProps {
    value: PeriodType | null;
    onChange: (value: PeriodType | null) => void;
    disabled?: boolean;
}

// 生理状態のドットアイコン
const PeriodDot: React.FC<{ isActive: boolean; isEnd?: boolean }> = ({ isActive, isEnd = false }) => (
    <Box
        sx={{
            width: 14,
            height: 14,
            bgcolor: isActive ? '#ec4899' : '#e5e7eb',
            borderRadius: '50%',
            border: !isActive && isEnd ? '2px solid #d1d5db' : 'none',
            transition: 'all 0.2s',
        }}
    />
);

export const PeriodInput: React.FC<PeriodInputProps> = ({
    value,
    onChange,
    disabled = false,
}) => {
    const handleToggle = (type: PeriodType) => {
        if (disabled) return;
        onChange(value === type ? null : type);
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                生理
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <IconButtonOption
                    label={value === 'start' ? '開始中' : '開始'}
                    icon={<PeriodDot isActive={value === 'start'} />}
                    selected={value === 'start'}
                    onClick={() => handleToggle('start')}
                />
                <IconButtonOption
                    label="終了"
                    icon={<PeriodDot isActive={value === 'end'} isEnd />}
                    selected={value === 'end'}
                    onClick={() => handleToggle('end')}
                />
            </Box>
            {disabled && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    🔒 編集するには鍵をタップ
                </Typography>
            )}
        </Box>
    );
};
