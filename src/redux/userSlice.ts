// src/redux/userSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserState, AppUser } from '../types';

const initialState: UserState = {
    currentUser: null,
    loading: true,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<AppUser | null>) {
            state.currentUser = action.payload;
            state.loading = false;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
    },
});

export const { setUser, setLoading } = userSlice.actions;
export default userSlice.reducer;
