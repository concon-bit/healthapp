// src/features/health-log/Statistics.tsx

import React, { useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Divider,
    Chip,
    LinearProgress,
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import MoodIcon from '@mui/icons-material/Mood';
import WcIcon from '@mui/icons-material/Wc';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAppSelector } from '../../redux/hooks';
import { subDays, format, isValid } from 'date-fns';
import type { HealthLog, MoodType } from '../../types';

// 統計カード
interface StatCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, icon, children, color = 'primary.main' }) => (
    <Card elevation={0} sx={{ bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
        <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color, display: 'flex' }}>{icon}</Box>
                <Typography variant="subtitle2" fontWeight="bold">
                    {title}
                </Typography>
            </Box>
            {children}
        </CardContent>
    </Card>
);

// 相関分析行
interface CorrelationRowProps {
    label: string;
    value: string | number;
    subLabel?: string;
    percent?: number;
}

const CorrelationRow: React.FC<CorrelationRowProps> = ({ label, value, subLabel, percent }) => (
    <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
                {value}
            </Typography>
        </Box>
        {percent !== undefined && (
            <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                    },
                }}
            />
        )}
        {subLabel && (
            <Typography variant="caption" color="text.secondary">
                {subLabel}
            </Typography>
        )}
    </Box>
);

const Statistics: React.FC = () => {
    const { items: logs, loading } = useAppSelector((state) => state.logs);

    const stats = useMemo(() => {
        if (!Array.isArray(logs) || logs.length === 0) return null;

        const validLogs = logs.filter(
            (log: HealthLog) => log && log.date && isValid(new Date(log.date))
        );

        if (validLogs.length === 0) return null;

        // 基本統計
        const temps = validLogs
            .filter((log) => log.temp)
            .map((log) => parseFloat(String(log.temp)));
        const avgTemp = temps.length > 0
            ? temps.reduce((a, b) => a + b, 0) / temps.length
            : 0;

        // 体調別統計
        const moodCounts: Record<MoodType, number> = {
            '絶好調': 0,
            '好調': 0,
            '普通': 0,
            '不調': 0,
            '絶不調': 0,
            '': 0,
        };
        const moodTemps: Record<MoodType, number[]> = {
            '絶好調': [],
            '好調': [],
            '普通': [],
            '不調': [],
            '絶不調': [],
            '': [],
        };

        validLogs.forEach((log) => {
            if (log.mood && log.mood in moodCounts) {
                moodCounts[log.mood]++;
                if (log.temp) {
                    moodTemps[log.mood].push(parseFloat(String(log.temp)));
                }
            }
        });

        // 体調別平均体温
        const moodAvgTemps: Record<string, number> = {};
        Object.entries(moodTemps).forEach(([mood, tempArr]) => {
            if (tempArr.length > 0 && mood !== '') {
                moodAvgTemps[mood] = tempArr.reduce((a, b) => a + b, 0) / tempArr.length;
            }
        });

        // 排便統計
        const poopYes = validLogs.filter((log) => log.isPooped === 'yes').length;
        const poopNo = validLogs.filter((log) => log.isPooped === 'no').length;
        const poopTotal = poopYes + poopNo;
        const poopRate = poopTotal > 0 ? (poopYes / poopTotal) * 100 : 0;

        // 排便と体調の相関
        const poopYesMoods = validLogs
            .filter((log) => log.isPooped === 'yes' && log.mood)
            .map((log) => log.mood);
        const poopNoMoods = validLogs
            .filter((log) => log.isPooped === 'no' && log.mood)
            .map((log) => log.mood);

        const goodMoods: MoodType[] = ['絶好調', '好調'];
        const poopYesGoodRate = poopYesMoods.length > 0
            ? (poopYesMoods.filter((m) => goodMoods.includes(m)).length / poopYesMoods.length) * 100
            : 0;
        const poopNoGoodRate = poopNoMoods.length > 0
            ? (poopNoMoods.filter((m) => goodMoods.includes(m)).length / poopNoMoods.length) * 100
            : 0;

        // 週間統計
        const sevenDaysAgo = subDays(new Date(), 7);
        const weeklyLogs = validLogs.filter(
            (log) => new Date(log.date) >= sevenDaysAgo
        );
        const weeklyTemp = weeklyLogs
            .filter((log) => log.temp)
            .map((log) => parseFloat(String(log.temp)));
        const weeklyAvgTemp = weeklyTemp.length > 0
            ? weeklyTemp.reduce((a, b) => a + b, 0) / weeklyTemp.length
            : 0;

        // 発熱回数（37.5℃以上）
        const feverCount = temps.filter((t) => t >= 37.5).length;

        return {
            totalRecords: validLogs.length,
            avgTemp: avgTemp.toFixed(2),
            moodCounts,
            moodAvgTemps,
            poopRate: poopRate.toFixed(1),
            poopYes,
            poopNo,
            poopYesGoodRate: poopYesGoodRate.toFixed(1),
            poopNoGoodRate: poopNoGoodRate.toFixed(1),
            weeklyRecords: weeklyLogs.length,
            weeklyAvgTemp: weeklyAvgTemp.toFixed(2),
            feverCount,
            latestDate: validLogs.length > 0
                ? format(new Date(validLogs.sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0].date), 'M月d日')
                : '-',
        };
    }, [logs]);

    if (loading) {
        return (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                統計を読み込み中...
            </Typography>
        );
    }

    if (!stats) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" gutterBottom>
                    統計を表示する記録がありません。
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    日々の体調を記録すると統計が表示されます。
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* サマリー */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    健康統計ダッシュボード
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<CalendarTodayIcon />}
                        label={`全${stats.totalRecords}件の記録`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        icon={<ThermostatIcon />}
                        label={`平均 ${stats.avgTemp}°C`}
                        size="small"
                        color="info"
                        variant="outlined"
                    />
                    {stats.feverCount > 0 && (
                        <Chip
                            label={`発熱 ${stats.feverCount}回`}
                            size="small"
                            color="error"
                            variant="outlined"
                        />
                    )}
                </Box>
            </Box>

            <Grid container spacing={2}>
                {/* 体調と体温の相関 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <StatCard title="体調別 平均体温" icon={<MoodIcon />} color="#8b5cf6">
                        {Object.entries(stats.moodAvgTemps)
                            .sort(([, a], [, b]) => b - a)
                            .map(([mood, temp]) => (
                                <CorrelationRow
                                    key={mood}
                                    label={mood}
                                    value={`${temp.toFixed(2)}°C`}
                                    percent={((temp - 35.5) / 3) * 100}
                                />
                            ))}
                        {Object.keys(stats.moodAvgTemps).length === 0 && (
                            <Typography variant="caption" color="text.secondary">
                                データが不足しています
                            </Typography>
                        )}
                    </StatCard>
                </Grid>

                {/* 排便と体調の相関 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <StatCard title="排便と体調の相関" icon={<WcIcon />} color="#f59e0b">
                        <CorrelationRow
                            label="排便率"
                            value={`${stats.poopRate}%`}
                            subLabel={`${stats.poopYes}日あり / ${stats.poopNo}日なし`}
                            percent={parseFloat(stats.poopRate)}
                        />
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            排便時の好調率
                        </Typography>
                        <CorrelationRow
                            label="排便あり"
                            value={`${stats.poopYesGoodRate}%`}
                            percent={parseFloat(stats.poopYesGoodRate)}
                        />
                        <CorrelationRow
                            label="排便なし"
                            value={`${stats.poopNoGoodRate}%`}
                            percent={parseFloat(stats.poopNoGoodRate)}
                        />
                    </StatCard>
                </Grid>

                {/* 週間サマリー */}
                <Grid size={12}>
                    <StatCard title="過去7日間のサマリー" icon={<TrendingUpIcon />} color="#22c55e">
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                            <Box>
                                <Typography variant="h4" color="primary" fontWeight="bold">
                                    {stats.weeklyRecords}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    記録日数
                                </Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem />
                            <Box>
                                <Typography variant="h4" color="info.main" fontWeight="bold">
                                    {stats.weeklyAvgTemp}°C
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    平均体温
                                </Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem />
                            <Box>
                                <Typography variant="h4" color="text.secondary" fontWeight="bold">
                                    {stats.latestDate}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    最終記録
                                </Typography>
                            </Box>
                        </Box>
                    </StatCard>
                </Grid>

                {/* 体調分布 */}
                <Grid size={12}>
                    <StatCard title="体調分布" icon={<MoodIcon />} color="#ef4444">
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 1 }}>
                            {(['絶好調', '好調', '普通', '不調', '絶不調'] as MoodType[]).map((mood) => {
                                const count = stats.moodCounts[mood];
                                const percent = stats.totalRecords > 0
                                    ? ((count / stats.totalRecords) * 100).toFixed(0)
                                    : '0';
                                return (
                                    <Box key={mood} sx={{ textAlign: 'center', minWidth: 56 }}>
                                        <Typography variant="h5" fontWeight="bold" color="primary">
                                            {count}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {mood}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled">
                                            ({percent}%)
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </StatCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Statistics;
