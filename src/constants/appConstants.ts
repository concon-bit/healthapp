// src/constants/appConstants.ts

import type { OptionMap } from '../types';

export const MOOD_OPTIONS: OptionMap = {
    絶好調: '絶好調',
    好調: '好調',
    普通: '普通',
    不調: '不調',
    絶不調: '絶不調',
};

export const POOP_OPTIONS: OptionMap = {
    あり: 'あり',
    なし: 'なし',
};

export const SYMPTOM_OPTIONS: OptionMap = {
    headache: '頭痛',
    hangover: '二日酔い',
};

export const SLEEP_OPTIONS: OptionMap = {
    good: '良い',
    normal: '普通',
    bad: '悪い',
};

export const STRESS_OPTIONS: OptionMap = {
    low: '低い',
    medium: '中',
    high: '高い',
};

export const ALCOHOL_OPTIONS: OptionMap = {
    yes: 'あり',
    no: 'なし',
};

export const PERIOD_OPTIONS: OptionMap = {
    start: '開始',
    ongoing: '期間中',
    end: '終了',
};
