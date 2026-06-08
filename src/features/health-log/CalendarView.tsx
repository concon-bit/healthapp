// src/features/health-log/CalendarView.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Chip, Stack, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import type { EventContentArg, DayCellContentArg, DatesSetArg } from '@fullcalendar/core';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MOOD_ICONS, POOP_CALENDAR_ICON } from '../../constants/iconConstants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setActiveHealthTab, setSelectedDate } from '../../redux/uiSlice';
import LogDetailModal from './LogDetailModal';
import type { HealthLog } from '../../types';
import { subDays, isValid, format } from 'date-fns';

/**
 * 日付をローカルタイムゾーンでyyyy-MM-dd形式に変換
 */
const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// FullCalendar用のCSS
const calendarStyles = {
    '& .fc': {
        fontFamily: 'inherit',
    },
    '& .fc-toolbar': {
        display: 'none !important',
    },
    '& .fc-col-header-cell-cushion': {
        textDecoration: 'none !important',
        fontWeight: 'bold',
        padding: '8px 4px !important',
    },
    '& .fc-day-sun .fc-col-header-cell-cushion': {
        color: '#ef4444 !important',
    },
    '& .fc-day-sat .fc-col-header-cell-cushion': {
        color: '#3b82f6 !important',
    },
    '& .fc-daygrid-day-top': {
        flexDirection: 'row !important',
    },
    '& .fc-daygrid-day-number': {
        padding: '4px !important',
        fontWeight: 500,
        fontSize: '0.85rem',
    },
    '& .fc-daygrid-day': {
        minHeight: '65px !important',
    },
    '& .fc-daygrid-day:hover': {
        backgroundColor: 'rgba(13, 148, 136, 0.08) !important',
    },
    '& .calendar-event': {
        background: 'transparent !important',
        border: 'none !important',
        padding: '0 !important',
        margin: '0 !important',
    },
    '& .calendar-event .fc-event-title': {
        display: 'none',
    },
    '& .calendar-event-content': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1px',
        padding: '1px',
    },
    '& .calendar-event-icons': {
        display: 'flex',
        gap: '2px',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.95rem',
    },
    // 背景色
    '& .day-bg-good': {
        backgroundColor: '#dcfce7 !important',
    },
    '& .day-bg-ok': {
        backgroundColor: '#e0f2fe !important',
    },
    '& .day-bg-bad': {
        backgroundColor: '#fee2e2 !important',
    },
};

/**
 * カレンダービューコンポーネント
 */
const CalendarView: React.FC = () => {
    const { items: logs } = useAppSelector((state) => state.logs);
    const [selectedLog, setSelectedLog] = useState<HealthLog | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarApi, setCalendarApi] = useState<ReturnType<typeof FullCalendar.prototype['getApi']> | null>(null);
    const dispatch = useAppDispatch();

    // 日付をキーにしたMap
    const logsByDate = useMemo(() => {
        const map = new Map<string, HealthLog>();
        if (logs) {
            logs.forEach((log: HealthLog) => map.set(log.date, log));
        }
        return map;
    }, [logs]);

    // 生理期間を計算（startからendまでの日付を特定）
    const periodRanges = useMemo(() => {
        if (!logs) return new Set<string>();

        const periodDates = new Set<string>();
        const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

        let inPeriod = false;
        let startDate: string | null = null;

        sortedLogs.forEach((log) => {
            if (log.period === 'start') {
                inPeriod = true;
                startDate = log.date;
                periodDates.add(log.date);
            } else if (log.period === 'end' && inPeriod) {
                periodDates.add(log.date);
                // startからendまでの間の日付も追加
                if (startDate) {
                    const start = new Date(startDate);
                    const end = new Date(log.date);
                    const current = new Date(start);
                    current.setDate(current.getDate() + 1);
                    while (current < end) {
                        periodDates.add(formatDateLocal(current));
                        current.setDate(current.getDate() + 1);
                    }
                }
                inPeriod = false;
                startDate = null;
            }
        });

        // 終了していない期間は今日まで継続中
        if (inPeriod && startDate) {
            const start = new Date(startDate);
            const today = new Date();
            const current = new Date(start);
            current.setDate(current.getDate() + 1);
            while (current <= today) {
                periodDates.add(formatDateLocal(current));
                current.setDate(current.getDate() + 1);
            }
        }

        return periodDates;
    }, [logs]);

    // 今月の記録統計
    const monthStats = useMemo(() => {
        if (!logs || logs.length === 0) return null;

        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);

        const recentLogs = logs.filter((log: HealthLog) => {
            const date = new Date(log.date);
            return isValid(date) && date >= thirtyDaysAgo;
        });

        const recordedDays = recentLogs.length;
        const poopDays = recentLogs.filter((log) => log.isPooped === 'yes').length;
        const goodDays = recentLogs.filter((log) =>
            log.mood === '絶好調' || log.mood === '好調'
        ).length;

        return {
            recordedDays,
            poopDays,
            goodDays,
            poopRate: recordedDays > 0 ? Math.round((poopDays / recordedDays) * 100) : 0,
            goodRate: recordedDays > 0 ? Math.round((goodDays / recordedDays) * 100) : 0,
        };
    }, [logs]);

    // カレンダーイベント生成
    const calendarEvents = useMemo(() => {
        if (!logsByDate) return [];

        const events: Array<{
            date: string;
            className: string;
            extendedProps: { logData: HealthLog; isInPeriod: boolean };
        }> = [];

        logsByDate.forEach((log, date) => {
            if (log) {
                events.push({
                    date: date,
                    className: 'calendar-event',
                    extendedProps: {
                        logData: log,
                        isInPeriod: periodRanges.has(date),
                    },
                });
            }
        });
        return events;
    }, [logsByDate, periodRanges]);

    // 生理期間の表示
    const renderPeriodIndicator = (period: string | null | undefined, isInPeriod: boolean) => {
        // 開始・終了マーカー
        if (period === 'start' || period === 'end') {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 0.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            bgcolor: '#ec4899',
                            borderRadius: '50%',
                        }}
                    />
                </Box>
            );
        }

        // 期間中（自動計算された）
        if (isInPeriod) {
            return (
                <Box
                    sx={{
                        width: '90%',
                        height: 5,
                        bgcolor: '#f9a8d4',
                        borderRadius: 1,
                        mt: 0.5,
                        mx: 'auto',
                    }}
                />
            );
        }

        return null;
    };

    const renderEventContent = (eventInfo: EventContentArg) => {
        const { logData, isInPeriod } = eventInfo.event.extendedProps as { logData: HealthLog; isInPeriod: boolean };
        const { isPooped, mood, period } = logData;

        return (
            <div className="calendar-event-content">
                <div className="calendar-event-icons">
                    {isPooped === 'yes' && POOP_CALENDAR_ICON}
                    {mood && MOOD_ICONS[mood]}
                </div>
                {renderPeriodIndicator(period, isInPeriod)}
            </div>
        );
    };

    const handleDateClick = (clickInfo: { dateStr: string; date: Date }) => {
        const logForDate = logsByDate.get(clickInfo.dateStr);
        if (logForDate) {
            setSelectedLog(logForDate);
        } else {
            dispatch(setSelectedDate(clickInfo.date.toISOString()));
            dispatch(setActiveHealthTab('log'));
        }
    };

    const handleCloseModal = () => {
        setSelectedLog(null);
    };

    const dayCellContent = (arg: DayCellContentArg) => {
        return arg.dayNumberText.replace('日', '');
    };

    // 修正: ローカルタイムゾーンで日付を取得
    const getDayCellClassNames = useCallback(
        (arg: DayCellContentArg) => {
            const dateStr = formatDateLocal(arg.date);
            const log = logsByDate.get(dateStr);
            if (!log || !log.mood) return [];

            switch (log.mood) {
                case '絶好調':
                case '好調':
                    return ['day-bg-good'];
                case '普通':
                    return ['day-bg-ok'];
                case '不調':
                case '絶不調':
                    return ['day-bg-bad'];
                default:
                    return [];
            }
        },
        [logsByDate]
    );

    // ナビゲーション
    const handlePrev = () => {
        calendarApi?.prev();
    };

    const handleNext = () => {
        calendarApi?.next();
    };

    const handleDatesSet = (arg: DatesSetArg) => {
        setCurrentDate(arg.view.currentStart);
    };

    const handleCalendarRef = (ref: FullCalendar | null) => {
        if (ref) {
            setCalendarApi(ref.getApi());
        }
    };

    return (
        <Box>
            {/* サマリー */}
            {monthStats && monthStats.recordedDays > 0 && (
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 2, justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}
                >
                    <Chip
                        icon={<CheckCircleIcon />}
                        label={`記録 ${monthStats.recordedDays}日`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        label={`好調率 ${monthStats.goodRate}%`}
                        size="small"
                        color="success"
                        variant="outlined"
                    />
                    <Chip
                        label={`排便率 ${monthStats.poopRate}%`}
                        size="small"
                        color="warning"
                        variant="outlined"
                    />
                </Stack>
            )}

            {/* カスタム月ナビゲーション */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    p: 1,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                }}
            >
                <IconButton aria-label="前の月" onClick={handlePrev} sx={{ color: 'primary.main' }}>
                    <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                    {format(currentDate, 'yyyy年M月')}
                </Typography>
                <IconButton aria-label="次の月" onClick={handleNext} sx={{ color: 'primary.main' }}>
                    <ChevronRightIcon />
                </IconButton>
            </Box>

            <Box sx={calendarStyles}>
                <FullCalendar
                    ref={handleCalendarRef}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locale={jaLocale}
                    events={calendarEvents}
                    dateClick={handleDateClick}
                    dayCellContent={dayCellContent}
                    eventContent={renderEventContent}
                    dayCellClassNames={getDayCellClassNames}
                    datesSet={handleDatesSet}
                    headerToolbar={false}
                    height="auto"
                    aspectRatio={1.3}
                    fixedWeekCount={false}
                />
            </Box>

            {/* 凡例 */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1.5, fontWeight: 600 }}>
                    凡例
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{
                            width: 18, height: 18,
                            bgcolor: '#dcfce7',
                            borderRadius: 1,
                            border: '1px solid #86efac',
                        }} />
                        <Typography variant="body2">好調</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{
                            width: 18, height: 18,
                            bgcolor: '#e0f2fe',
                            borderRadius: 1,
                            border: '1px solid #7dd3fc',
                        }} />
                        <Typography variant="body2">普通</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{
                            width: 18, height: 18,
                            bgcolor: '#fee2e2',
                            borderRadius: 1,
                            border: '1px solid #fca5a5',
                        }} />
                        <Typography variant="body2">不調</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{
                            width: 10, height: 10,
                            bgcolor: '#ec4899',
                            borderRadius: '50%',
                        }} />
                        <Box sx={{
                            width: 16, height: 4,
                            bgcolor: '#f9a8d4',
                            borderRadius: 2,
                            mx: 0.25,
                        }} />
                        <Box sx={{
                            width: 10, height: 10,
                            bgcolor: '#ec4899',
                            borderRadius: '50%',
                        }} />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>生理</Typography>
                    </Box>
                </Stack>
            </Box>

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 2 }}
            >
                日付をタップで詳細確認
            </Typography>

            {selectedLog && <LogDetailModal log={selectedLog} onClose={handleCloseModal} />}
        </Box>
    );
};

export default CalendarView;
