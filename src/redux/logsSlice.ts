// src/redux/logsSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchLogs as fetchLogsService,
    saveLog as saveLogService,
} from '../services/firebaseService';
import type { LogsState, HealthLog } from '../types';
import type { AppDispatch } from './store';

// 非同期処理: ユーザーIDに基づいてログを取得
export const fetchLogs = createAsyncThunk<
    HealthLog[],
    string,
    { rejectValue: string }
>('logs/fetchLogs', async (userId, { rejectWithValue }) => {
    try {
        const logs = await fetchLogsService(userId);
        return logs;
    } catch (error) {
        return rejectWithValue(String(error));
    }
});

// 非同期処理: ログを保存
export const saveLog = createAsyncThunk<
    boolean,
    HealthLog,
    { dispatch: AppDispatch; rejectValue: string }
>('logs/saveLog', async (logData, { dispatch, rejectWithValue }) => {
    try {
        await saveLogService(logData);
        // 保存成功後、最新のログを再取得
        dispatch(fetchLogs(logData.userId));
        return true;
    } catch (error) {
        return rejectWithValue(String(error));
    }
});

const initialState: LogsState = {
    items: [],
    loading: true,
    error: null,
};

const logsSlice = createSlice({
    name: 'logs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLogs.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Unknown error';
            })
            .addCase(saveLog.rejected, (state, action) => {
                state.error = action.payload ?? 'Unknown error';
            });
    },
});

export default logsSlice.reducer;
