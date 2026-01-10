// src/components/ui/IconButtonOption.tsx
// モダンな選択ボタンコンポーネント（Apple/Google風）

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface IconButtonOptionProps {
    label: string;
    icon: React.ReactNode;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
    size?: 'normal' | 'small';
}

/**
 * モダンなアイコン選択ボタン
 * 
 * 選択時の表現（背景色変更ではなく）:
 * - チェックマーク表示
 * - スケール拡大（1.05倍）
 * - シャドウ強調
 * - ボーダー強調
 */
export const IconButtonOption: React.FC<IconButtonOptionProps> = ({
    label,
    icon,
    selected,
    onClick,
    disabled,
    size = 'normal',
}) => {
    const isSmall = size === 'small';

    return (
        <Button
            variant="outlined"
            onClick={onClick}
            disabled={disabled}
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                minWidth: isSmall ? 52 : 64,
                minHeight: isSmall ? 52 : 64,
                px: isSmall ? 1 : 1.5,
                py: isSmall ? 0.5 : 1,
                borderRadius: 2,
                // 背景は常に白系
                bgcolor: 'background.paper',
                color: 'text.primary',
                // ボーダーで選択を表現
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? 'primary.main' : 'grey.300',
                // スケールとシャドウで選択を表現
                transform: selected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: selected
                    ? '0 4px 12px rgba(13, 148, 136, 0.3)'
                    : '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
                },
                '&:active': {
                    transform: 'scale(0.98)',
                },
            }}
        >
            {/* 選択時のチェックマーク */}
            {selected && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 1,
                    }}
                >
                    <CheckIcon sx={{ fontSize: 14, color: 'white' }} />
                </Box>
            )}

            <Box
                sx={{
                    fontSize: isSmall ? '1.3rem' : '1.6rem',
                    lineHeight: 1,
                    mb: 0.5,
                    opacity: selected ? 1 : 0.8,
                }}
            >
                {icon}
            </Box>
            <Typography
                variant="caption"
                sx={{
                    fontSize: isSmall ? '0.6rem' : '0.7rem',
                    fontWeight: selected ? 600 : 400,
                    color: selected ? 'primary.dark' : 'text.secondary',
                    lineHeight: 1.2,
                }}
            >
                {label}
            </Typography>
        </Button>
    );
};

export default IconButtonOption;
