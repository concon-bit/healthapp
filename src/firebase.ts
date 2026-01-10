// src/firebase.ts

import { initializeApp } from 'firebase/app';
import {
    initializeAuth,
    browserLocalPersistence,
    indexedDBLocalPersistence,
    browserPopupRedirectResolver,
    GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// .envファイルから環境変数を読み込む
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);

// 各サービスをエクスポート
export const db = getFirestore(app);

// 認証の初期化（永続化メカニズムとリダイレクト解決機能を明示的に設定）
// indexedDBLocalPersistenceを優先し、失敗した場合はbrowserLocalPersistenceにフォールバック
// browserPopupRedirectResolverはsignInWithRedirectに必要
export const auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
});

export const googleProvider = new GoogleAuthProvider();
