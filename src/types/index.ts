// src/types/index.ts

// ==========================================
// Firebase User Types
// ==========================================
export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
}

// ==========================================
// Health Log Types
// ==========================================
export type MoodType = '絶好調' | '好調' | '普通' | '不調' | '絶不調' | '';
export type PoopType = 'yes' | 'no' | null;
export type SleepType = 'good' | 'normal' | 'bad' | null;
export type StressType = 'low' | 'medium' | 'high' | null;
export type AlcoholType = 'yes' | 'no' | null;

export interface HealthLog {
    id?: string;
    userId: string;
    date: string;
    temp: number;
    mood: MoodType;
    isPooped: PoopType;
    waterIntake: number;
    sleep: SleepType;
    stress: StressType;
    alcohol: AlcoholType;
    symptoms: Record<string, boolean>;
    memo: string;
}

export interface HealthLogFormData {
    temp: number;
    mood: MoodType;
    isPooped: PoopType;
    waterIntake: number;
    sleep: SleepType;
    stress: StressType;
    alcohol: AlcoholType;
    symptoms: Record<string, boolean>;
    memo: string;
}

// ==========================================
// Redux State Types
// ==========================================
export interface UserState {
    currentUser: AppUser | null;
    loading: boolean;
}

export interface LogsState {
    items: HealthLog[];
    loading: boolean;
    error: string | null;
}

export type ActiveMode = 'health';
export type ActiveHealthTab = 'log' | 'chart' | 'calendar';

export interface UIState {
    activeMode: ActiveMode;
    activeHealthTab: ActiveHealthTab;
    selectedDate: string;
    showMoreMenu: boolean;
}

// ==========================================
// Option Types for Constants
// ==========================================
export interface OptionMap {
    [key: string]: string;
}

export interface IconMap {
    [key: string]: React.ReactElement;
}
