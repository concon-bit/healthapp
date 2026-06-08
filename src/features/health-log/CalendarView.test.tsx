import React from 'react';
import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import CalendarView from './CalendarView';

jest.mock('../../redux/hooks', () => ({
    useAppDispatch: () => () => undefined,
    useAppSelector: (selector: (state: unknown) => unknown) =>
        selector({
            logs: {
                items: [],
            },
        }),
}));

jest.mock('./LogDetailModal', () => () => null);

jest.mock('@fullcalendar/daygrid', () => ({
    __esModule: true,
    default: {},
}));

jest.mock('@fullcalendar/interaction', () => ({
    __esModule: true,
    default: {},
}));

jest.mock('@fullcalendar/core/locales/ja', () => ({
    __esModule: true,
    default: {},
}));

jest.mock('@fullcalendar/react', () => {
    const React = require('react');

    return {
        __esModule: true,
        default: React.forwardRef((props: { datesSet: (arg: unknown) => void }, ref: React.Ref<unknown>) => {
            const notified = React.useRef(false);
            const api = React.useRef({
                prev: () => undefined,
                next: () =>
                    props.datesSet({
                        start: new Date(2026, 5, 28),
                        end: new Date(2026, 7, 2),
                        view: {
                            currentStart: new Date(2026, 6, 1),
                            currentEnd: new Date(2026, 7, 1),
                        },
                    }),
            });
            const instance = React.useRef({
                getApi: () => api.current,
            });

            React.useImperativeHandle(ref, () => instance.current, []);

            React.useEffect(() => {
                if (!notified.current) {
                    notified.current = true;
                    props.datesSet({
                        start: new Date(2026, 4, 31),
                        end: new Date(2026, 6, 5),
                        view: {
                            currentStart: new Date(2026, 5, 1),
                            currentEnd: new Date(2026, 6, 1),
                        },
                    });
                }
            }, [props]);

            return <div data-testid="full-calendar" />;
        }),
    };
});

describe('CalendarView', () => {
    it('shows the current month and advances exactly one month', async () => {
        render(<CalendarView />);

        expect(await screen.findByText('2026年6月')).toBeTruthy();
        expect(screen.queryByText('2026年5月')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: '次の月' }));

        expect(await screen.findByText('2026年7月')).toBeTruthy();
        expect(screen.queryByText('2026年8月')).toBeNull();
    });
});
