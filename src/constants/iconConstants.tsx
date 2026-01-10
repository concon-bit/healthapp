// src/constants/iconConstants.tsx

import React from 'react';
import type { IconType } from 'react-icons';
import {
    FaGrinStars,
    FaSmile,
    FaMeh,
    FaFrown,
    FaTired,
    FaRegCheckCircle,
    FaRegTimesCircle,
    FaHeadSideVirus,
    FaGlassMartiniAlt,
    FaBed,
    FaGrinBeam,
    FaMehRollingEyes,
    FaTired as FaTiredStress,
    FaBeer,
    FaStar,
} from 'react-icons/fa';
import type { IconMap } from '../types';

// Helper to create icon elements (fixes React 19 type compatibility)
const icon = (Icon: IconType, style?: React.CSSProperties): React.ReactElement =>
    React.createElement(Icon as React.ComponentType<{ style?: React.CSSProperties }>, { style });

export const MOOD_ICONS: IconMap = {
    絶好調: icon(FaGrinStars, { color: '#ef476f' }),
    好調: icon(FaSmile, { color: '#f7a325' }),
    普通: icon(FaMeh, { color: '#a3a3a3' }),
    不調: icon(FaFrown, { color: '#577399' }),
    絶不調: icon(FaTired, { color: '#2d3142' }),
};

export const POOP_ICONS: IconMap = {
    あり: icon(FaRegCheckCircle, { color: '#8B4513' }),
    なし: icon(FaRegTimesCircle, { color: '#a3a3a3' }),
};

export const POOP_CALENDAR_ICON = icon(FaStar, { color: '#FFC107' });

export const SYMPTOM_ICONS: IconMap = {
    headache: icon(FaHeadSideVirus),
    hangover: icon(FaGlassMartiniAlt),
};

export const SLEEP_ICONS: IconMap = {
    good: icon(FaBed, { color: '#8b5cf6' }),
    normal: icon(FaBed, { color: '#a3a3a3' }),
    bad: icon(FaBed, { color: '#6b7280' }),
};

export const STRESS_ICONS: IconMap = {
    low: icon(FaGrinBeam, { color: '#22c55e' }),
    medium: icon(FaMehRollingEyes, { color: '#f59e0b' }),
    high: icon(FaTiredStress, { color: '#ef4444' }),
};

export const ALCOHOL_ICONS: IconMap = {
    yes: icon(FaBeer, { color: '#f97316' }),
    no: icon(FaRegTimesCircle, { color: '#a3a3a3' }),
};

// 生理記録アイコン - シンプルなドット表現
export const PERIOD_ICONS: IconMap = {
    start: <span style={{ color: '#ec4899', fontSize: '1.2rem' }}>●</span>,
    ongoing: <span style={{ color: '#f9a8d4', fontSize: '1rem' }}>━</span>,
    end: <span style={{ color: '#ec4899', fontSize: '1.2rem' }}>●</span>,
};

// カレンダー用生理アイコン（使用しない - カレンダーでは直接スタイル適用）
export const PERIOD_CALENDAR_ICON = <span style={{ color: '#ec4899' }}>●</span>;
