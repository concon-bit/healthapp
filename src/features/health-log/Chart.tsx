// src/features/health-log/Chart.tsx

import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
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

// 統計カードコンポーネント
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color = 'primary' }) => (
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

const Chart: React.FC = () => {
    const { items: logs, loading } = useAppSelector((state) => state.logs);

    // 統計データの計算
    const stats = useMemo(() => {
        if (!Array.isArray(logs) || logs.length === 0) {
            return null;
        }

        const validLogs = logs.filter(
            (log: HealthLog) => log && log.date && log.temp && isValid(new Date(log.date))
        );

        if (validLogs.length === 0) return null;

        const temps = validLogs.map((log: HealthLog) => parseFloat(String(log.temp)));
        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);
        const latestLog = [...validLogs].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        // 過去7日間の記録数
        const sevenDaysAgo = subDays(new Date(), 7);
        const recentLogs = validLogs.filter(
            (log: HealthLog) => new Date(log.date) >= sevenDaysAgo
        );

        return {
            avgTemp: avgTemp.toFixed(2),
            maxTemp: maxTemp.toFixed(2),
            minTemp: minTemp.toFixed(2),
            latestTemp: latestLog?.temp ? parseFloat(String(latestLog.temp)).toFixed(2) : '-',
            latestDate: latestLog?.date ? format(new Date(latestLog.date), 'M/d') : '-',
            recordCount: validLogs.length,
            weeklyCount: recentLogs.length,
        };
    }, [logs]);

    if (loading) {
        return (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                グラフを読み込み中...
            </Typography>
        );
    }

    const validLogs = Array.isArray(logs)
        ? logs.filter((log: HealthLog) => log && log.date && isValid(new Date(log.date)))
        : [];
    const sortedLogs = [...validLogs].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (sortedLogs.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" gutterBottom>
                    グラフを表示する記録がありません。
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    日々の体温を記録するとグラフが表示されます。
                </Typography>
            </Box>
        );
    }

    // Highcharts datetime形式 [timestamp, value] に変換
    const tempData = sortedLogs.map((log: HealthLog) => {
        const timestamp = new Date(log.date + 'T00:00:00').getTime();
        return [timestamp, log.temp ? parseFloat(String(log.temp)) : null];
    });

    // X軸の表示範囲を「過去14日〜今日+1日」に設定 (モバイルで見やすく)
    const today = new Date();
    const fourteenDaysAgo = subDays(today, 14);
    const xAxisMin = fourteenDaysAgo.getTime();
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
            dateTimeLabelFormats: {
                day: '%m/%d',
                week: '%m/%d',
            },
            labels: {
                style: { fontSize: '10px' },
            },
            lineColor: '#e0e0e0',
            tickColor: '#e0e0e0',
        },
        yAxis: {
            title: { text: undefined },
            labels: {
                format: '{value}°',
                style: { fontSize: '10px' },
            },
            min: 35.5,
            max: 38.0,
            gridLineColor: '#f0f0f0',
            // 基準線
            plotLines: [
                {
                    value: 37.0,
                    color: '#ef476f',
                    dashStyle: 'Dash',
                    width: 1,
                    label: {
                        text: '37°C',
                        align: 'right',
                        style: { fontSize: '9px', color: '#ef476f' },
                    },
                },
            ],
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0.2,
                lineWidth: 2,
                marker: {
                    enabled: true,
                    radius: 4,
                    symbol: 'circle',
                },
            },
        },
        series: [
            {
                name: '体温',
                type: 'areaspline',
                data: tempData,
                color: '#ef476f',
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(239, 71, 111, 0.3)'],
                        [1, 'rgba(239, 71, 111, 0)'],
                    ],
                },
                connectNulls: true,
            },
        ],
        legend: { enabled: false },
        tooltip: {
            backgroundColor: 'white',
            borderColor: '#ef476f',
            borderRadius: 8,
            shadow: true,
            useHTML: true,
            formatter: function () {
                const point = this as { x?: number; y?: number };
                const date = Highcharts.dateFormat('%m月%d日', point.x ?? 0);
                return `<div style="text-align:center"><small>${date}</small><br/><b style="font-size:14px">${(point.y ?? 0).toFixed(2)}°C</b></div>`;
            },
        },
        accessibility: { enabled: false },
    };

    return (
        <Box>
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
                            過去14日間の体温推移
                        </Typography>
                        {stats && (
                            <Chip
                                icon={<CalendarTodayIcon sx={{ fontSize: '14px !important' }} />}
                                label={`${stats.weeklyCount}件/週`}
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
                        全記録の平均体温
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                        {stats.avgTemp}°C
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ({stats.recordCount}件の記録から算出)
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default Chart;
