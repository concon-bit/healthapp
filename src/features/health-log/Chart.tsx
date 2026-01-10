// src/features/health-log/Chart.tsx

import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { PeriodSelector, PERIOD_OPTIONS, type PeriodOption } from '../../components/ui/PeriodSelector';
import { StatCard } from '../../components/ui/StatCard';
import { useAppSelector } from '../../redux/hooks';
import { isValid, subDays, addDays, format } from 'date-fns';
import type { HealthLog } from '../../types';

// Highcharts グローバル設定
Highcharts.setOptions({
    lang: {
        shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        weekdays: ['日', '月', '火', '水', '木', '金', '土'],
    },
    credits: { enabled: false },
});

const Chart: React.FC = () => {
    const { items: logs, loading } = useAppSelector((state) => state.logs);
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('30days');

    // 期間に応じたデータフィルタリング
    const filteredLogs = useMemo(() => {
        if (!Array.isArray(logs)) return [];

        const validLogs = logs.filter(
            (log: HealthLog) => log && log.date && log.temp && isValid(new Date(log.date))
        );

        if (selectedPeriod === 'all') return validLogs;

        const periodOption = PERIOD_OPTIONS.find(p => p.value === selectedPeriod);
        const days = periodOption?.days || 30;
        const cutoffDate = subDays(new Date(), days);

        return validLogs.filter((log: HealthLog) => new Date(log.date) >= cutoffDate);
    }, [logs, selectedPeriod]);

    // 統計データ計算
    const stats = useMemo(() => {
        if (filteredLogs.length === 0) return null;

        const temps = filteredLogs.map((log: HealthLog) => parseFloat(String(log.temp)));
        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);
        const latestLog = [...filteredLogs].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        return {
            avgTemp: avgTemp.toFixed(2),
            maxTemp: maxTemp.toFixed(2),
            minTemp: minTemp.toFixed(2),
            latestTemp: latestLog?.temp ? parseFloat(String(latestLog.temp)).toFixed(2) : '-',
            latestDate: latestLog?.date ? format(new Date(latestLog.date), 'M/d') : '-',
            recordCount: filteredLogs.length,
        };
    }, [filteredLogs]);

    if (loading) {
        return (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                読み込み中...
            </Typography>
        );
    }

    const sortedLogs = [...filteredLogs].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (sortedLogs.length === 0) {
        return (
            <Box>
                <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary" gutterBottom>
                        この期間のデータがありません
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        体温を記録するとグラフが表示されます
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Highchartsデータ
    const tempData = sortedLogs.map((log: HealthLog) => {
        const timestamp = new Date(log.date + 'T00:00:00').getTime();
        return [timestamp, log.temp ? parseFloat(String(log.temp)) : null];
    });

    // X軸範囲
    const today = new Date();
    const periodOption = PERIOD_OPTIONS.find(p => p.value === selectedPeriod);
    const days = periodOption?.days || 30;
    const startDate = selectedPeriod === 'all'
        ? new Date(sortedLogs[0]?.date || today)
        : subDays(today, days);
    const xAxisMin = startDate.getTime();
    const xAxisMax = addDays(today, 1).getTime();

    const options: Highcharts.Options = {
        chart: {
            type: 'areaspline',
            height: 200,
            spacing: [10, 0, 10, 0],
            backgroundColor: 'transparent',
        },
        title: { text: undefined },
        xAxis: {
            type: 'datetime',
            min: xAxisMin,
            max: xAxisMax,
            dateTimeLabelFormats: { day: '%m/%d', week: '%m/%d' },
            labels: { style: { fontSize: '10px' } },
            lineColor: '#e0e0e0',
            tickColor: '#e0e0e0',
        },
        yAxis: {
            title: { text: undefined },
            labels: { format: '{value}°', style: { fontSize: '10px' } },
            min: 35.5,
            max: 38.5,
            gridLineColor: '#f0f0f0',
            plotLines: [{
                value: 37.5,
                color: '#ef4444',
                dashStyle: 'Dash',
                width: 2,
                zIndex: 5,
                label: {
                    text: '発熱ライン',
                    align: 'right',
                    style: { fontSize: '10px', color: '#ef4444', fontWeight: 'bold' },
                },
            }],
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0.2,
                lineWidth: 2,
                marker: { enabled: true, radius: 4, symbol: 'circle' },
            },
        },
        series: [{
            name: '体温',
            type: 'areaspline',
            data: tempData,
            color: '#3b82f6',
            zones: [
                { value: 37.5, color: '#3b82f6' },
                { color: '#ef4444' },
            ],
            fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, 'rgba(59, 130, 246, 0.3)'],
                    [1, 'rgba(59, 130, 246, 0)'],
                ],
            },
            connectNulls: true,
        }],
        legend: { enabled: false },
        tooltip: {
            backgroundColor: 'white',
            borderColor: '#3b82f6',
            borderRadius: 8,
            shadow: true,
            useHTML: true,
            formatter: function () {
                const point = this as { x?: number; y?: number };
                const date = Highcharts.dateFormat('%m月%d日', point.x ?? 0);
                return `<div style="text-align:center"><small>${date}</small><br/><b>${(point.y ?? 0).toFixed(2)}°C</b></div>`;
            },
        },
        accessibility: { enabled: false },
    };

    const periodLabel = periodOption?.label || '';

    return (
        <Box>
            <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />

            {/* 統計カード */}
            {stats && (
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <StatCard
                        icon={<ThermostatIcon fontSize="small" />}
                        label="最新"
                        value={`${stats.latestTemp}°C`}
                        subValue={stats.latestDate}
                        color="primary"
                    />
                    <StatCard
                        icon={<TrendingUpIcon fontSize="small" />}
                        label="最高"
                        value={`${stats.maxTemp}°C`}
                        color="error"
                    />
                    <StatCard
                        icon={<TrendingDownIcon fontSize="small" />}
                        label="最低"
                        value={`${stats.minTemp}°C`}
                        color="info"
                    />
                </Stack>
            )}

            {/* グラフ */}
            <Card elevation={0} sx={{ bgcolor: 'grey.50', borderRadius: 2, overflow: 'hidden' }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            {periodLabel}の体温推移
                        </Typography>
                        {stats && (
                            <Chip
                                icon={<CalendarTodayIcon sx={{ fontSize: '14px !important' }} />}
                                label={`${stats.recordCount}件`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 24, fontSize: '0.7rem' }}
                            />
                        )}
                    </Box>
                    <HighchartsReact highcharts={Highcharts} options={options} />
                </CardContent>
            </Card>

            {/* 平均体温 */}
            {stats && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        {periodLabel}の平均体温
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                        {stats.avgTemp}°C
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default Chart;
