// src/hooks/useLongPress.ts
// 長押し対応ボタンのカスタムフック

import { useRef, useCallback, useEffect } from 'react';

export const useLongPress = (callback: () => void, delay = 100) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPressed = useRef(false);

    const start = useCallback(() => {
        isPressed.current = true;
        callback(); // 即座に1回実行
        intervalRef.current = setInterval(() => {
            if (isPressed.current) {
                callback();
            }
        }, delay);
    }, [callback, delay]);

    const stop = useCallback(() => {
        isPressed.current = false;
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
