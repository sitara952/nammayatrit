import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createMMKV } from '@/utils/mmkvUtils';
import Animated from 'react-native-reanimated';
import AnimatedLinearGradient from './AnimatedLinearGradient';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { useConfigContext } from '../../../../../src/typescript/context/ConfigContext';
import { JourneyId } from '../../../../../src/typescript/state/client/user';
import { expiryDateAndTime } from '../Hooks/useTicketData';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';

const AnimatedTimer = ({
    duration,
    journeyId,
    modes,
    busTicketNotActivated = false,
}: {
    duration: string | undefined;
    journeyId: JourneyId | null;
    modes: ('METRO' | 'BUS')[] | undefined;
    busTicketNotActivated: boolean;
}) => {
    const formatTime = useCallback((totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
            2,
            '0',
        )}`;
    }, []);

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const storage = createMMKV();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Memoize the timer data to avoid JSON parsing on every render
    const timerData = useMemo(() => {
        if (!journeyId) return null;
        const storageKey = `ticket_timer_${journeyId}`;
        const storedData = storage.getString(storageKey);
        return storedData ? safeJsonParse(storedData, null) : null;
    }, [journeyId]);

    useEffect(() => {
        if (!journeyId || !duration) {
            setTimeLeft(0);
            return;
        }

        const initializeTimer = () => {
            try {
                if (timerData) {
                    const { startTime, durationSecs } = timerData;
                    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                    const remainingTime = Math.max(0, durationSecs - elapsedSeconds);
                    setTimeLeft(remainingTime);
                } else if (duration) {
                    const { remainingTime } = expiryDateAndTime(duration);
                    setTimeLeft(remainingTime);
                    // Store timer data for persistence
                    const storageKey = `ticket_timer_${journeyId}`;
                    storage.set(
                        storageKey,
                        JSON.stringify({
                            startTime: Date.now(),
                            durationSecs: remainingTime,
                        }),
                    );
                } else {
                    setTimeLeft(0);
                }
            } catch (error) {
                console.error('Error initializing timer:', error);
                setTimeLeft(0);
            }
        };

        initializeTimer();
    }, [journeyId, duration, timerData]);

    useEffect(() => {
        if (timeLeft === null) return;

        // Simple interval that updates exactly every second
        timerRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime === null || prevTime <= 0) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [timeLeft]);

    // Memoize the formatted time to avoid unnecessary recalculations
    const formattedTime = useMemo(() => {
        if (timeLeft === null) return '';
        return formatTime(timeLeft);
    }, [timeLeft, formatTime]);

    if (timeLeft === null) {
        return null;
    }
    const colors = busTicketNotActivated
        ? ['#E6E6E6', '#E6E6E6', '#E6E6E6', '#E6E6E6', '#E6E6E6', '#E6E6E6', '#E6E6E6']
        : timeLeft > 3600
          ? ['#DFEDE2', '#CFE8D0', '#A5DBA3', '#8ED18B', '#A5DBA3', '#CFE8D0', '#DFEDE2']
          : timeLeft < 600
            ? ['#F54C3D', '#EC9076', '#ED866E', '#EEE1D5', '#ED866E', '#EC9076', '#F54C3D']
            : ['#F2D08E', '#F2DEAA', '#F1E6BF', '#F5F4EF', '#F1E6BF', '#F5F4EF', '#F2D08E'];

    const textColor = busTicketNotActivated
        ? '#111111'
        : timeLeft > 3600
          ? '#43745A'
          : timeLeft < 600
            ? '#744343'
            : '#745543';

    return (
        <AnimatedLinearGradient
            points={{ start: { x: 1, y: 1 }, end: { x: -1, y: -1 } }}
            customColors={colors}
            speed={320}
            style={tailwind.style('rounded-[24px] items-center flex-row w-[20px]')}>
            <Animated.Text
                style={tailwind.style(
                    `text-[${textColor}] text-[12px] leading-[16px] text-center pt-3 font-areaNormal-extrabold`,
                )}>
                {modes && (
                    <Animated.Text
                        style={tailwind.style(
                            `capitalize`,
                        )}>{`${modes?.map(mode => (mode === 'METRO' ? userLanguageStrings.Metro : mode === 'BUS' ? userLanguageStrings.Bus : mode)).join(', ')} `}</Animated.Text>
                )}
                {busTicketNotActivated ? userLanguageStrings.TicketisValidtill : userLanguageStrings.TicketisValidFor}
            </Animated.Text>
            <Animated.Text
                style={tailwind.style(
                    `text-[38px] text-[${textColor}] text-center pt-4 leading-[40px] font-departureMono-regular`,
                )}>
                {busTicketNotActivated && duration
                    ? new Date(duration).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                      })
                    : formattedTime}
            </Animated.Text>
        </AnimatedLinearGradient>
    );
};

export default AnimatedTimer;
