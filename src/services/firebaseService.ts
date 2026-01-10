// src/services/firebaseService.ts

import { auth, googleProvider, db } from '../firebase';
import {
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserLocalPersistence,
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

export const onAuthChange = (callback: (user: User | null) => void): Unsubscribe => {
    return onAuthStateChanged(auth, callback);
};

export const loginWithGoogle = async (): Promise<void> => {
    try {
        // 認証状態をローカルに保存する設定
        await setPersistence(auth, browserLocalPersistence);
        // リダイレクトでログインを実行（iOSのSafariでも動作する）
        await signInWithRedirect(auth, googleProvider);
    } catch (error) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code === 'auth/missing-or-invalid-nonce') {
            console.error('認証エラー(nonce):', error);
            alert('認証に失敗しました。ブラウザのストレージ設定を確認してください。');
        } else {
            console.error('Firebase ログインに失敗:', error);
        }
        throw error;
    }
};

// リダイレクト後の認証結果を確認する関数
export const checkRedirectResult = async (): Promise<void> => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            console.log('リダイレクトログイン成功:', result.user.email);
        }
    } catch (error) {
        const firebaseError = error as { code?: string };
        console.error('リダイレクト認証エラー:', error);
        if (firebaseError.code === 'auth/missing-or-invalid-nonce') {
            alert('認証に失敗しました。ブラウザのストレージ設定を確認してください。');
        }
        throw error;
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
