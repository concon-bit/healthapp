// src/redux/hooks.ts

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// 型安全なdispatchフック
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// 型安全なselectorフック
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
