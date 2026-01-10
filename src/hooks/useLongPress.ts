// src/hooks/useLongPress.ts
// 長押し対応ボタンのカスタムフック

import { useRef, useCallback, useEffect } from 'react';

interface UseLongPressOptions {
    repeatDelay?: number;      // 連打時の間隔（ミリ秒）
    longPressThreshold?: number; // 長押し判定の閾値（ミリ秒）
}

export const useLongPress = (
    callback: () => void,
    options: UseLongPressOptions = {}
) => {
    const { repeatDelay = 100, longPressThreshold = 1000 } = options;

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isPressed = useRef(false);
    const hasCalledOnce = useRef(false);

    const startRepeat = useCallback(() => {
        // 2秒後に連打開始
        intervalRef.current = setInterval(() => {
            if (isPressed.current) {
                callback();
            }
        }, repeatDelay);
    }, [callback, repeatDelay]);

    const start = useCallback(() => {
        isPressed.current = true;
        hasCalledOnce.current = false;

        // 即座に1回実行（タップ対応）
        callback();
        hasCalledOnce.current = true;

        // 長押し閾値（2秒）後に連打機能を開始
        longPressTimeoutRef.current = setTimeout(() => {
            if (isPressed.current) {
                startRepeat();
            }
        }, longPressThreshold);
    }, [callback, longPressThreshold, startRepeat]);

    const stop = useCallback(() => {
        isPressed.current = false;

        // 長押しタイマーをクリア
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }

        // 連打インターバルをクリア
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
            }
        };
    }, []);

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchEnd: stop,
    };
};
