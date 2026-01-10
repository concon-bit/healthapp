// src/features/health-log/DailyLogForm.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

import { IconButtonOption } from '../../components/ui/IconButtonOption';
import { useLongPress } from '../../hooks/useLongPress';
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
import type {
    HealthLogFormData,
    MoodType,
    PoopType,
    SleepType,
    StressType,
    AlcoholType,
    PeriodType,
    HealthLog
} from '../../types';

/**
 * 日次記録フォームコンポーネント
 * 体温、体調、排便、生理などの健康データを記録
 */
const DailyLogForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const selectedDateISO = useAppSelector((state) => state.ui.selectedDate);
    const { items: logs, loading: logLoading } = useAppSelector((state) => state.logs);
    const { currentUser } = useAppSelector((state) => state.user);

    const selectedDate = useMemo(() => new Date(selectedDateISO), [selectedDateISO]);
    const dateStr = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

    // UI状態
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSubItems, setShowSubItems] = useState(false);
    const [tempInputMode, setTempInputMode] = useState(false);
    const [tempInputValue, setTempInputValue] = useState('');

    // 日付のログを取得
    const logForDate = useMemo(
        () => (Array.isArray(logs) ? logs.find((log) => log.date === dateStr) : undefined),
        [logs, dateStr]
    );
    const logExists = !!logForDate;
    const [isLocked, setIsLocked] = useState(logExists);

    // 初期フォーム状態
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
            period: null,
        }),
        []
    );

    const [formData, setFormData] = useState<HealthLogFormData>(initialFormState);

    // 日付変更時にフォームをリセット/復元
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
        setTempInputMode(false);
        setTempInputValue('');
    }, [dateStr, logForDate, initialFormState]);

    // フォーム送信
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
            setTempInputMode(false);
        }
    };

    // フォームフィールド変更ハンドラ
    const handleFormChange = <K extends keyof HealthLogFormData>(
        field: K,
        value: HealthLogFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // 体温調整（±0.01）
    const adjustTemp = useCallback((amount: number) => {
        setFormData((prev) => {
            const newTemp = parseFloat((prev.temp + amount).toFixed(2));
            if (newTemp >= 35.0 && newTemp <= 42.0) {
                return { ...prev, temp: newTemp };
            }
            return prev;
        });
    }, []);

    const decreaseTemp = useCallback(() => adjustTemp(-0.01), [adjustTemp]);
    const increaseTemp = useCallback(() => adjustTemp(0.01), [adjustTemp]);
    const decreaseTempPress = useLongPress(decreaseTemp, { repeatDelay: 80 });
    const increaseTempPress = useLongPress(increaseTemp, { repeatDelay: 80 });

    // 症状トグル
    const handleToggleChange = (subField: string, value: boolean) => {
        setFormData((prev) => ({
            ...prev,
            symptoms: { ...prev.symptoms, [subField]: value },
        }));
    };

    // テンキー入力blur時に確定（小数点第2位まで）
    const handleTempInputBlur = () => {
        const value = parseFloat(tempInputValue);
        if (!isNaN(value) && value >= 35.0 && value <= 42.0) {
            // 小数点第2位で丸める
            const roundedValue = Math.round(value * 100) / 100;
            handleFormChange('temp', roundedValue);
        }
        setTempInputMode(false);
        setTempInputValue('');
    };

    // 体温入力の制限（小数点第2位まで、3桁目入力で自動小数点挿入）
    const handleTempInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        // 数字と小数点のみを許可（マイナスは体温には不要）
        inputValue = inputValue.replace(/[^\d.]/g, '');

        // 小数点がない場合、3桁目の入力で自動的に小数点を挿入
        // 例: 365 → 36.5, 3650 → 36.50
        if (!inputValue.includes('.') && inputValue.length >= 3) {
            inputValue = inputValue.slice(0, 2) + '.' + inputValue.slice(2);
        }

        // 小数点以下2桁までに制限
        if (/^\d*\.?\d{0,2}$/.test(inputValue) || inputValue === '') {
            setTempInputValue(inputValue);
        }
    };

    const isFormDisabled = logExists && isLocked;
    const showTempAdjustButtons = !showSuccess && !isFormDisabled;

    // 体温表示色（段階的変化）
    const getTempColor = (temp: number) => {
        if (temp >= 37.5) return '#dc2626'; // 赤 - 発熱
        if (temp >= 37.0) return '#f59e0b'; // オレンジ - 微熱
        return '#0d9488'; // ティール - 正常
    };

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

            {/* 体温入力 - サイズ固定 */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    体温
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    {showTempAdjustButtons && (
                        <Button
                            variant="outlined"
                            {...decreaseTempPress}
                            disabled={isFormDisabled}
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

                    {/* 体温表示/入力エリア - 固定サイズ */}
                    <Box
                        sx={{
                            width: 140,
                            height: 80,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isFormDisabled ? 'default' : 'pointer',
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': isFormDisabled ? {} : { bgcolor: 'grey.100' },
                        }}
                        onClick={() => {
                            if (!isFormDisabled && !tempInputMode) {
                                setTempInputValue(formData.temp.toFixed(2));
                                setTempInputMode(true);
                            }
                        }}
                    >
                        {tempInputMode ? (
                            <TextField
                                type="tel"
                                inputMode="decimal"
                                placeholder="36.50"
                                value={tempInputValue}
                                onChange={handleTempInputChange}
                                onBlur={handleTempInputBlur}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        (e.target as HTMLInputElement).blur();
                                    }
                                }}
                                autoFocus
                                sx={{
                                    width: '100%',
                                    '& input': {
                                        textAlign: 'center',
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        p: 0.5,
                                        color: '#0d9488', // ティール色で統一
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
                                        color: getTempColor(formData.temp),
                                        fontSize: '2.2rem',
                                        lineHeight: 1,
                                    }}
                                >
                                    {formData.temp.toFixed(2)}
                                    <Typography component="span" sx={{ fontSize: '1rem', ml: 0.5 }}>°C</Typography>
                                </Typography>
                                {!isFormDisabled && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                        タップで入力
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>

                    {showTempAdjustButtons && (
                        <Button
                            variant="outlined"
                            {...increaseTempPress}
                            disabled={isFormDisabled}
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
                            onClick={() => !isFormDisabled && handleFormChange('mood', key as MoodType)}
                        />
                    ))}
                </Box>
                {isFormDisabled && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        🔒 編集するには鍵をタップ
                    </Typography>
                )}
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
                            onClick={() => !isFormDisabled && handleFormChange('isPooped', (key === 'あり' ? 'yes' : 'no') as PoopType)}
                        />
                    ))}
                </Box>
            </Box>

            {/* 生理記録 - メインフォームに表示 */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    生理
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButtonOption
                        label={formData.period === 'start' ? '開始中' : '開始'}
                        icon={<Box sx={{
                            width: 14,
                            height: 14,
                            bgcolor: formData.period === 'start' ? '#ec4899' : '#e5e7eb',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                        }} />}
                        selected={formData.period === 'start'}
                        onClick={() => !isFormDisabled && handleFormChange('period', formData.period === 'start' ? null : 'start' as PeriodType)}
                    />
                    <IconButtonOption
                        label="終了"
                        icon={<Box sx={{
                            width: 14,
                            height: 14,
                            bgcolor: formData.period === 'end' ? '#ec4899' : '#e5e7eb',
                            borderRadius: '50%',
                            border: formData.period === 'end' ? 'none' : '2px solid #d1d5db',
                            transition: 'all 0.2s',
                        }} />}
                        selected={formData.period === 'end'}
                        onClick={() => !isFormDisabled && handleFormChange('period', formData.period === 'end' ? null : 'end' as PeriodType)}
                    />
                </Box>
                {isFormDisabled && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        🔒 編集するには鍵をタップ
                    </Typography>
                )}
            </Box>

            {/* その他項目 */}
            <Box sx={{ opacity: isFormDisabled ? 0.6 : 1, pointerEvents: isFormDisabled ? 'none' : 'auto' }}>
                <Button
                    onClick={() => setShowSubItems(!showSubItems)}
                    endIcon={showSubItems ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ mb: 2 }}
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
                            />
                        </Box>

                        {/* 症状 */}
                        <Box sx={{ mb: 3, textAlign: 'center' }}>
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
