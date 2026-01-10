// src/services/firebaseService.ts

import { auth, googleProvider, db } from '../firebase';
import {
    signInWithRedirect,
    signInWithPopup,
    getRedirectResult,
    onAuthStateChanged,
    signOut,
    type User,
    type Unsubscribe,
} from 'firebase/auth';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    setDoc,
} from 'firebase/firestore';
import type { HealthLog } from '../types';

// --- Authentication ---

// モバイルデバイス判定
const isMobileDevice = (): boolean => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const onAuthChange = (callback: (user: User | null) => void): Unsubscribe => {
    return onAuthStateChanged(auth, callback);
};

export const loginWithGoogle = async (): Promise<void> => {
    try {
        console.log('ログイン開始 - デバイス:', isMobileDevice() ? 'モバイル' : 'PC');

        if (isMobileDevice()) {
            // モバイル: リダイレクト認証を使用
            console.log('signInWithRedirect を実行...');
            await signInWithRedirect(auth, googleProvider);
        } else {
            // PC: ポップアップ認証を使用（より安定）
            console.log('signInWithPopup を実行...');
            await signInWithPopup(auth, googleProvider);
        }
    } catch (error) {
        console.error('Firebase ログインに失敗:', error);
        throw error;
    }
};

// リダイレクト後の認証結果を確認する関数
export const checkRedirectResult = async (): Promise<void> => {
    try {
        console.log('リダイレクト結果を確認中...');
        const result = await getRedirectResult(auth);
        if (result) {
            console.log('リダイレクトログイン成功:', result.user.email);
        } else {
            console.log('リダイレクト結果なし（通常起動）');
        }
    } catch (error) {
        // リダイレクト結果の取得に失敗してもエラーをthrowしない
        console.error('リダイレクト認証確認中にエラー発生:', error);
    }
};

export const logout = (): Promise<void> => {
    return signOut(auth);
};

// --- Firestore (Health Logs) ---

const LOGS_COLLECTION = 'logs';

export const fetchLogs = async (userId: string): Promise<HealthLog[]> => {
    if (!userId) return [];
    try {
        const logsCollection = collection(db, LOGS_COLLECTION);
        const q = query(logsCollection, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
        })) as HealthLog[];
    } catch (error) {
        console.error('体調記録の取得に失敗しました:', error);
        throw error;
    }
};

export const saveLog = async (logData: HealthLog): Promise<void> => {
    const { userId, date } = logData;
    if (!userId || !date) {
        throw new Error('ユーザーIDと日付は必須です。');
    }

    try {
        const logsCollection = collection(db, LOGS_COLLECTION);
        const q = query(
            logsCollection,
            where('userId', '==', userId),
            where('date', '==', date)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // 既存の記録を更新
            const docId = querySnapshot.docs[0].id;
            await setDoc(doc(db, LOGS_COLLECTION, docId), logData);
        } else {
            // 新規記録を追加
            await addDoc(logsCollection, logData);
        }
    } catch (error) {
        console.error('体調記録の保存に失敗しました:', error);
        throw error;
    }
};
