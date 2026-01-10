// src/redux/store.ts

import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import userReducer from './userSlice';
import logsReducer from './logsSlice';

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        user: userReducer,
        logs: logsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

// Redux Store 型定義
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
