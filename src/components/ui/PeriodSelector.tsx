// src/components/ui/PeriodSelector.tsx
// 期間セレクタコンポーネント（グラフ/統計で共用）

import React from 'react';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';

export type PeriodOption = '7days' | '14days' | '30days' | '90days' | 'all';

export const PERIOD_OPTIONS: { value: PeriodOption; label: string; days: number }[] = [
    { value: '7days', label: '1週間', days: 7 },
    { value: '14days', label: '2週間', days: 14 },
    { value: '30days', label: '1ヶ月', days: 30 },
    { value: '90days', label: '3ヶ月', days: 90 },
    { value: 'all', label: '全期間', days: 0 },
];

interface PeriodSelectorProps {
    value: PeriodOption;
    onChange: (newValue: PeriodOption) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ value, onChange }) => {
    const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: PeriodOption | null) => {
        if (newValue) {
            onChange(newValue);
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
                value={value}
                exclusive
                onChange={handleChange}
                size="small"
                fullWidth
                sx={{
                    '& .MuiToggleButton-root': {
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        borderColor: 'grey.300',
                        '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderColor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                        },
                    },
                }}
            >
                {PERIOD_OPTIONS.map((opt) => (
                    <ToggleButton key={opt.value} value={opt.value}>
                        {opt.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
};

export default PeriodSelector;
