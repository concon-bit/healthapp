// src/features/health-log/HealthDashboard.tsx

import React, { Suspense, lazy, useRef, useEffect } from 'react';
import { Box, Slide, CircularProgress } from '@mui/material';
import { useAppSelector } from '../../redux/hooks';

// 遅延読み込みでバンドルサイズ最適化
const DailyLogForm = lazy(() => import('./DailyLogForm'));
const Chart = lazy(() => import('./Chart'));
const CalendarView = lazy(() => import('./CalendarView'));
const Statistics = lazy(() => import('./Statistics'));

// ローディングスピナー
const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress color="primary" size={32} />
    </Box>
);

// タブコンテンツコンポーネント
interface TabPanelProps {
    active: boolean;
    children: React.ReactNode;
    direction: 'left' | 'right';
}

const TabPanel: React.FC<TabPanelProps> = ({ active, children, direction }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <Box
            ref={containerRef}
            sx={{
                position: active ? 'relative' : 'absolute',
                width: '100%',
                visibility: active ? 'visible' : 'hidden',
                top: 0,
                left: 0,
            }}
        >
            <Slide
                direction={direction}
                in={active}
                container={containerRef.current}
                timeout={250}
                easing={{
                    enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <Box>{children}</Box>
            </Slide>
        </Box>
    );
};

const HealthDashboard: React.FC = () => {
    const activeHealthTab = useAppSelector((state) => state.ui.activeHealthTab);
    const prevTabRef = useRef(activeHealthTab);

    // スライド方向を決定
    const getDirection = (tab: string): 'left' | 'right' => {
        const tabOrder = ['log', 'chart', 'calendar', 'stats'];
        const prevIndex = tabOrder.indexOf(prevTabRef.current);
        const currentIndex = tabOrder.indexOf(tab);
        return currentIndex > prevIndex ? 'left' : 'right';
    };

    useEffect(() => {
        prevTabRef.current = activeHealthTab;
    }, [activeHealthTab]);

    return (
        <Box sx={{ position: 'relative', minHeight: 400, overflow: 'hidden' }}>
            <Suspense fallback={<LoadingFallback />}>
                <TabPanel active={activeHealthTab === 'log'} direction={getDirection('log')}>
                    <DailyLogForm />
                </TabPanel>
                <TabPanel active={activeHealthTab === 'chart'} direction={getDirection('chart')}>
                    <Chart />
                </TabPanel>
                <TabPanel active={activeHealthTab === 'calendar'} direction={getDirection('calendar')}>
                    <CalendarView />
                </TabPanel>
                <TabPanel active={activeHealthTab === 'stats'} direction={getDirection('stats')}>
                    <Statistics />
                </TabPanel>
            </Suspense>
        </Box>
    );
};

export default HealthDashboard;
