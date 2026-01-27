import { useEffect, useRef } from 'react';
import { selectAppState, AppStateHolder } from '../state/client/session';
import { useAppSelector } from '../state/hooks';

interface UseAppStateChangeParams {
    onActive?: () => void;
    onBackground?: () => void;
    onInactive?: () => void;
}

export function useAppStateChange({ onActive, onBackground, onInactive }: UseAppStateChangeParams) {
    const appState = useAppSelector(selectAppState);
    const prevAppStateRef = useRef<AppStateHolder | undefined>(undefined);

    useEffect(() => {
        // Run callbacks if state has changed from previous state or if previous state is undefined
        if (prevAppStateRef.current === undefined || appState !== prevAppStateRef.current) {
            if (appState === 'active' && onActive) {
                onActive();
            } else if (appState === 'background' && onBackground) {
                onBackground();
            } else if (appState === 'inactive' && onInactive) {
                onInactive();
            }

            // Update the previous state
            prevAppStateRef.current = appState;
        }
    }, [appState, onActive, onBackground, onInactive]);
}
