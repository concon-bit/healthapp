// src/redux/uiSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { addDays } from 'date-fns';
import type { UIState, ActiveMode, ActiveHealthTab } from '../types';

const initialState: UIState = {
    activeMode: 'health',
    activeHealthTab: 'log',
    selectedDate: new Date().toISOString(),
    showMoreMenu: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setActiveMode(state, action: PayloadAction<ActiveMode>) {
            state.activeMode = action.payload;
            state.showMoreMenu = false;
        },
        setActiveHealthTab(state, action: PayloadAction<ActiveHealthTab>) {
            state.activeHealthTab = action.payload;
        },
        setSelectedDate(state, action: PayloadAction<string>) {
            state.selectedDate = action.payload;
        },
        changeDateBy(state, action: PayloadAction<number>) {
            const currentDate = new Date(state.selectedDate);
            state.selectedDate = addDays(currentDate, action.payload).toISOString();
        },
        toggleMoreMenu(state) {
            state.showMoreMenu = !state.showMoreMenu;
        },
    },
});

export const {
    setActiveMode,
    setActiveHealthTab,
    setSelectedDate,
    changeDateBy,
    toggleMoreMenu,
} = uiSlice.actions;

export default uiSlice.reducer;
