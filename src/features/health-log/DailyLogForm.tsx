// src/features/health-log/DailyLogForm.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    IconButton,
    Paper,
    Slider,
    TextField,
    Typography,
    Collapse,
    Alert,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { format } from 'date-fns';
import {
    MOOD_OPTIONS,
    POOP_OPTIONS,
    SYMPTOM_OPTIONS,
    SLEEP_OPTIONS,
    STRESS_OPTIONS,
    ALCOHOL_OPTIONS,
} from '../../constants/appConstants';
import {
    MOOD_ICONS,
    POOP_ICONS,
    SYMPTOM_ICONS,
    SLEEP_ICONS,
    STRESS_ICONS,
    ALCOHOL_ICONS,
} from '../../constants/iconConstants';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { changeDateBy } from '../../redux/uiSlice';
import { saveLog as saveLogAction } from '../../redux/logsSlice';
import type { HealthLogFormData, MoodType, PoopType, SleepType, StressType, AlcoholType, HealthLog } from '../../types';

// アイコンボタンコンポーネント - モバイル最適化
interface IconButtonOptionProps {
    label: string;
    icon: React.ReactNode;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
}

const IconButtonOption: React.FC<IconButtonOptionProps> = ({
    label,
    icon,
    selected,
    onClick,
    disabled,
}) => (
    <Button
        variant={selected ? 'contained' : 'outlined'}
        onClick={onClick}
        disabled={disabled}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 60,
            minHeight: 60, // タッチ操作しやすい最小サイズ
            px: 1.5,
            py: 1,
            borderRadius: 2,
            borderColor: selected ? 'primary.main' : 'grey.300',
            bgcolor: selected ? 'primary.main' : 'background.paper',
            color: selected ? 'white' : 'text.primary',
            boxShadow: selected ? 2 : 0,
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: 'primary.main',
                bgcolor: selected ? 'primary.dark' : 'primary.50',
            },
            '&:active': {
                transform: 'scale(0.95)',
            },
        }}
    >
        <Box sx={{ fontSize: '1.75rem', lineHeight: 1, mb: 0.5 }}>{icon}</Box>
        <Typography
            variant="caption"
            sx={{
                fontSize: '0.7rem',
                fontWeight: selected ? 600 : 400,
                lineHeight: 1.2,
            }}
        >
            {label}
        </Typography>
    </Button>
);

const DailyLogForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const selectedDateISO = useAppSelector((state) => state.ui.selectedDate);
    const { items: logs, loading: logLoading } = useAppSelector((state) => state.logs);
    const { currentUser } = useAppSelector((state) => state.user);
    const selectedDate = useMemo(() => new Date(selectedDateISO), [selectedDateISO]);
    const dateStr = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSubItems, setShowSubItems] = useState(false);

    const logForDate = useMemo(
        () => (Array.isArray(logs) ? logs.find((log) => log.date === dateStr) : undefined),
        [logs, dateStr]
    );
    const logExists = !!logForDate;
    const [isLocked, setIsLocked] = useState(logExists);

    const initialFormState: HealthLogFormData = useMemo(
        () => ({
            temp: 36.5,
            isPooped: null,
            mood: '',
            memo: '',
            waterIntake: 1500,
            symptoms: {},
            sleep: null,
            stress: null,
            alcohol: null,
        }),
        []
    );

    const [formData, setFormData] = useState<HealthLogFormData>(initialFormState);

    useEffect(() => {
        if (logForDate) {
            setFormData({
                ...initialFormState,
                ...logForDate,
                temp: logForDate.temp !== undefined ? parseFloat(String(logForDate.temp)) : 36.5,
                waterIntake: logForDate.waterIntake !== undefined ? logForDate.waterIntake : 1500,
            });
            setIsLocked(true);
        } else {
            setFormData(initialFormState);
            setIsLocked(false);
        }
        setShowSuccess(false);
        setShowSubItems(false);
    }, [dateStr, logForDate, initialFormState]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (logExists && isLocked) {
            alert('記録はロックされています。鍵アイコンをクリックして編集モードにしてください。');
            return;
        }
        if (showSuccess) return;
        if (!formData.mood || !formData.isPooped) {
            alert('「今日の体調」と「排便」は必須項目です。');
            return;
        }
        if (!currentUser) return;

        const logToSave: HealthLog = {
            ...formData,
            date: dateStr,
            userId: currentUser.uid,
        };
        const resultAction = await dispatch(saveLogAction(logToSave));

        if (saveLogAction.fulfilled.match(resultAction)) {
            setShowSuccess(true);
            setIsLocked(true);
        }
    };

    const handleFormChange = <K extends keyof HealthLogFormData>(
        field: K,
        value: HealthLogFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const adjustTemp = (amount: number) => {
        setFormData((prev) => {
            const newTemp = parseFloat((prev.temp + amount).toFixed(2));
            if (newTemp >= 35.0 && newTemp <= 42.0) {
                return { ...prev, temp: newTemp };
            }
            return prev;
        });
    };

    const handleToggleChange = (subField: string, value: boolean) => {
        setFormData((prev) => ({
            ...prev,
            symptoms: { ...prev.symptoms, [subField]: value },
        }));
    };

    const isFormDisabled = logExists && isLocked;

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {/* 日付ナビゲーション */}
            <Paper
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                }}
            >
                <IconButton onClick={() => dispatch(changeDateBy(-1))}>
                    <ChevronLeftIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h3">
                        {format(selectedDate, 'yyyy年M月d日')}
                    </Typography>
                    {logExists && (
                        <IconButton size="small" onClick={() => setIsLocked(!isLocked)}>
                            {isLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                        </IconButton>
                    )}
                </Box>
                <IconButton onClick={() => dispatch(changeDateBy(1))}>
                    <ChevronRightIcon />
                </IconButton>
            </Paper>

            <Box sx={{ opacity: isFormDisabled ? 0.6 : 1, pointerEvents: isFormDisabled ? 'none' : 'auto' }}>
                {/* 体温 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        体温
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={() => adjustTemp(-0.01)}
                            disabled={isFormDisabled}
                            sx={{
                                minWidth: 70,
                                minHeight: 70,
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                borderWidth: 2,
                                '&:hover': { borderWidth: 2 },
                            }}
                        >
                            -0.01
                        </Button>
                        <TextField
                            type="number"
                            value={formData.temp}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val >= 35.0 && val <= 42.0) {
                                    handleFormChange('temp', val);
                                }
                            }}
                            disabled={isFormDisabled}
                            inputProps={{
                                step: 0.01,
                                min: 35.0,
                                max: 42.0,
                                style: { textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' },
                            }}
                            sx={{
                                width: 140,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'grey.50',
                                },
                                '& input': {
                                    py: 1.5,
                                },
                            }}
                        />
                        <Typography variant="h4" sx={{ ml: -1 }}>°C</Typography>
                        <Button
                            variant="outlined"
                            onClick={() => adjustTemp(0.01)}
                            disabled={isFormDisabled}
                            sx={{
                                minWidth: 70,
                                minHeight: 70,
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                borderWidth: 2,
                                '&:hover': { borderWidth: 2 },
                            }}
                        >
                            +0.01
                        </Button>
                    </Box>
                </Box>

                {/* 今日の体調 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        今日の体調
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {Object.entries(MOOD_OPTIONS).map(([key, label]) => (
                            <IconButtonOption
                                key={key}
                                label={label}
                                icon={MOOD_ICONS[key]}
                                selected={formData.mood === key}
                                onClick={() => handleFormChange('mood', key as MoodType)}
                                disabled={isFormDisabled}
                            />
                        ))}
                    </Box>
                </Box>

                {/* 排便 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        排便
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {Object.entries(POOP_OPTIONS).map(([key, label]) => (
                            <IconButtonOption
                                key={key}
                                label={label}
                                icon={POOP_ICONS[key]}
                                selected={formData.isPooped === (key === 'あり' ? 'yes' : 'no')}
                                onClick={() => handleFormChange('isPooped', (key === 'あり' ? 'yes' : 'no') as PoopType)}
                                disabled={isFormDisabled}
                            />
                        ))}
                    </Box>
                </Box>

                {/* その他項目 */}
                <Button
                    onClick={() => setShowSubItems(!showSubItems)}
                    endIcon={showSubItems ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ mb: 2 }}
                    disabled={isFormDisabled}
                >
                    その他項目を記録する
                </Button>

                <Collapse in={showSubItems}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        {/* 睡眠の質 */}
                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                睡眠の質
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                {Object.entries(SLEEP_OPTIONS).map(([key, label]) => (
                                    <IconButtonOption
                                        key={key}
                                        label={label}
                                        icon={SLEEP_ICONS[key]}
                                        selected={formData.sleep === key}
                                        onClick={() => handleFormChange('sleep', key as SleepType)}
                                        disabled={isFormDisabled}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* ストレス */}
                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                ストレス
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                {Object.entries(STRESS_OPTIONS).map(([key, label]) => (
                                    <IconButtonOption
                                        key={key}
                                        label={label}
                                        icon={STRESS_ICONS[key]}
                                        selected={formData.stress === key}
                                        onClick={() => handleFormChange('stress', key as StressType)}
                                        disabled={isFormDisabled}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* 飲酒 */}
                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                飲酒
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                {Object.entries(ALCOHOL_OPTIONS).map(([key, label]) => (
                                    <IconButtonOption
                                        key={key}
                                        label={label}
                                        icon={ALCOHOL_ICONS[key]}
                                        selected={formData.alcohol === key}
                                        onClick={() => handleFormChange('alcohol', key as AlcoholType)}
                                        disabled={isFormDisabled}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* 水分摂取量 */}
                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                水分摂取量
                            </Typography>
                            <Typography variant="h3" sx={{ textAlign: 'center', mb: 1 }}>
                                {formData.waterIntake}ml
                            </Typography>
                            <Slider
                                min={0}
                                max={4000}
                                step={100}
                                value={formData.waterIntake}
                                onChange={(_, val) => handleFormChange('waterIntake', val as number)}
                                disabled={isFormDisabled}
                                sx={{
                                    '& .MuiSlider-track': { bgcolor: 'info.light' },
                                    '& .MuiSlider-thumb': { borderColor: 'info.main' },
                                }}
                            />
                        </Box>

                        {/* 症状・アクティビティ */}
                        <Box sx={{ mb: 1, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                症状・アクティビティ
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {Object.entries(SYMPTOM_OPTIONS).map(([key, label]) => (
                                    <IconButtonOption
                                        key={key}
                                        label={label}
                                        icon={SYMPTOM_ICONS[key]}
                                        selected={!!formData.symptoms?.[key]}
                                        onClick={() => handleToggleChange(key, !formData.symptoms?.[key])}
                                        disabled={isFormDisabled}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Collapse>

                {/* メモ */}
                <TextField
                    label="メモ"
                    placeholder="その他、気になる症状など"
                    multiline
                    rows={3}
                    fullWidth
                    value={formData.memo || ''}
                    onChange={(e) => handleFormChange('memo', e.target.value)}
                    disabled={isFormDisabled}
                    sx={{ mb: 3 }}
                />
            </Box>

            {/* 保存ボタン */}
            {showSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    保存しました！
                </Alert>
            )}
            <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={logLoading || showSuccess || (logExists && isLocked)}
                sx={{ py: 1.5 }}
            >
                {logLoading ? '処理中...' : logExists ? '更新する' : '記録する'}
            </Button>
        </Box>
    );
};

export default DailyLogForm;
