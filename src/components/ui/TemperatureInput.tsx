// src/components/ui/TemperatureInput.tsx
// 体温入力コンポーネント

import React, { useState, useCallback } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useLongPress } from '../../hooks/useLongPress';

interface TemperatureInputProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    showAdjustButtons?: boolean;
}

// 体温表示色（段階的変化）
const getTempColor = (temp: number): string => {
    if (temp >= 37.5) return '#dc2626'; // 赤 - 発熱
    if (temp >= 37.0) return '#f59e0b'; // オレンジ - 微熱
    return '#0d9488'; // ティール - 正常
};

export const TemperatureInput: React.FC<TemperatureInputProps> = ({
    value,
    onChange,
    disabled = false,
    showAdjustButtons = true,
}) => {
    const [inputMode, setInputMode] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // 体温調整（±0.01）
    const adjustTemp = useCallback((amount: number) => {
        const newTemp = parseFloat((value + amount).toFixed(2));
        if (newTemp >= 35.0 && newTemp <= 42.0) {
            onChange(newTemp);
        }
    }, [value, onChange]);

    const decreaseTemp = useCallback(() => adjustTemp(-0.01), [adjustTemp]);
    const increaseTemp = useCallback(() => adjustTemp(0.01), [adjustTemp]);
    const decreaseTempPress = useLongPress(decreaseTemp, { repeatDelay: 80 });
    const increaseTempPress = useLongPress(increaseTemp, { repeatDelay: 80 });

    // 入力モード開始
    const handleStartInput = () => {
        if (!disabled && !inputMode) {
            setInputValue(value.toFixed(2));
            setInputMode(true);
        }
    };

    // 入力確定
    const handleInputBlur = () => {
        const parsedValue = parseFloat(inputValue);
        if (!isNaN(parsedValue) && parsedValue >= 35.0 && parsedValue <= 42.0) {
            const roundedValue = Math.round(parsedValue * 100) / 100;
            onChange(roundedValue);
        }
        setInputMode(false);
        setInputValue('');
    };

    // 入力変更（3桁目で自動小数点挿入）
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // 数字と小数点のみを許可
        newValue = newValue.replace(/[^\d.]/g, '');

        // 小数点がない場合、3桁目で自動的に小数点を挿入
        if (!newValue.includes('.') && newValue.length >= 3) {
            newValue = newValue.slice(0, 2) + '.' + newValue.slice(2);
        }

        // 小数点以下2桁までに制限
        if (/^\d*\.?\d{0,2}$/.test(newValue) || newValue === '') {
            setInputValue(newValue);
        }
    };

    // Enterキーで確定
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
        }
    };

    const showButtons = showAdjustButtons && !disabled;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            {/* 減少ボタン */}
            {showButtons && (
                <Button
                    variant="outlined"
                    {...decreaseTempPress}
                    disabled={disabled}
                    sx={{
                        minWidth: 70,
                        minHeight: 70,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                        userSelect: 'none',
                    }}
                >
                    -0.01
                </Button>
            )}

            {/* 体温表示/入力エリア */}
            <Box
                sx={{
                    width: 140,
                    height: 80,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: disabled ? 'default' : 'pointer',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': disabled ? {} : { bgcolor: 'grey.100' },
                }}
                onClick={handleStartInput}
            >
                {inputMode ? (
                    <TextField
                        type="tel"
                        inputMode="decimal"
                        placeholder="36.50"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        sx={{
                            width: '100%',
                            '& input': {
                                textAlign: 'center',
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                p: 0.5,
                                color: '#0d9488',
                            },
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                            },
                        }}
                    />
                ) : (
                    <>
                        <Typography
                            sx={{
                                fontWeight: 'bold',
                                color: getTempColor(value),
                                fontSize: '2.2rem',
                                lineHeight: 1,
                            }}
                        >
                            {value.toFixed(2)}
                            <Typography component="span" sx={{ fontSize: '1rem', ml: 0.5 }}>°C</Typography>
                        </Typography>
                        {!disabled && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                タップで入力
                            </Typography>
                        )}
                    </>
                )}
            </Box>

            {/* 増加ボタン */}
            {showButtons && (
                <Button
                    variant="outlined"
                    {...increaseTempPress}
                    disabled={disabled}
                    sx={{
                        minWidth: 70,
                        minHeight: 70,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                        userSelect: 'none',
                    }}
                >
                    +0.01
                </Button>
            )}
        </Box>
    );
};
