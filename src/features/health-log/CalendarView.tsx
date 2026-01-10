// src/features/health-log/CalendarView.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import type { EventContentArg, DayCellContentArg } from '@fullcalendar/core';
import { MOOD_ICONS, POOP_CALENDAR_ICON } from '../../constants/iconConstants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setActiveHealthTab, setSelectedDate } from '../../redux/uiSlice';
import LogDetailModal from './LogDetailModal';
import type { HealthLog } from '../../types';

// FullCalendar用のCSS (グローバルスタイル)
const calendarStyles = {
    '& .fc': {
        fontFamily: 'inherit',
    },
    '& .fc-col-header-cell-cushion': {
        textDecoration: 'none !important',
    },
    '& .fc-day-sun .fc-col-header-cell-cushion': {
        color: 'red !important',
    },
    '& .fc-day-sat .fc-col-header-cell-cushion': {
        color: 'blue !important',
    },
    '& .fc-daygrid-day-top': {
        flexDirection: 'row !important',
    },
    '& .fc-daygrid-day-number': {
        padding: '4px !important',
    },
    '& .fc-daygrid-day:hover': {
        backgroundColor: 'rgba(239, 71, 111, 0.1) !important',
    },
    '& .calendar-event': {
        background: 'transparent !important',
        border: 'none !important',
        padding: '10px 0 2px 0 !important',
    },
    '& .calendar-event .fc-event-title': {
        display: 'none',
    },
    '& .calendar-event-icons': {
        display: 'flex',
        gap: '2px',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        fontSize: '1.4rem',
        marginTop: '-2px',
    },
    '& .day-bg-good': {
        backgroundColor: '#fff0f3',
    },
    '& .day-bg-ok': {
        backgroundColor: '#f0f9ff',
    },
    '& .day-bg-bad': {
        backgroundColor: '#f3f4f6',
    },
};

const CalendarView: React.FC = () => {
    const { items: logs } = useAppSelector((state) => state.logs);
    const [selectedLog, setSelectedLog] = useState<HealthLog | null>(null);
    const dispatch = useAppDispatch();

    // 日付をキーにしたMap
    const logsByDate = useMemo(() => {
        const map = new Map<string, HealthLog>();
        if (logs) {
            logs.forEach((log: HealthLog) => map.set(log.date, log));
        }
        return map;
    }, [logs]);

    // カレンダーイベントを生成
    const calendarEvents = useMemo(() => {
        if (!logsByDate) return [];

        const events: Array<{
            date: string;
            className: string;
            extendedProps: { logData: HealthLog };
        }> = [];

        logsByDate.forEach((log, date) => {
            if (log && (log.isPooped === 'yes' || log.mood)) {
                events.push({
                    date: date,
                    className: 'calendar-event',
                    extendedProps: { logData: log },
                });
            }
        });
        return events;
    }, [logsByDate]);

    const renderEventContent = (eventInfo: EventContentArg) => {
        const { isPooped, mood } = eventInfo.event.extendedProps.logData as HealthLog;
        return (
            <div className="calendar-event-icons">
                {isPooped && isPooped === 'yes' && POOP_CALENDAR_ICON}
                {mood && MOOD_ICONS[mood]}
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

    const getDayCellClassNames = useCallback(
        (arg: DayCellContentArg) => {
            const dateStr = arg.date.toISOString().split('T')[0];
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

    return (
        <Box sx={calendarStyles}>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={jaLocale}
                events={calendarEvents}
                dateClick={handleDateClick}
                dayCellContent={dayCellContent}
                eventContent={renderEventContent}
                dayCellClassNames={getDayCellClassNames}
                headerToolbar={{
                    left: 'prev',
                    center: 'title',
                    right: 'next',
                }}
                height="auto"
                aspectRatio={1.5}
            />
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
            >
                日付をクリックすると、詳細の確認ができます。
            </Typography>
            {selectedLog && <LogDetailModal log={selectedLog} onClose={handleCloseModal} />}
        </Box>
    );
};

export default CalendarView;
