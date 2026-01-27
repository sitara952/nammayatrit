import React, { ReactElement, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useAppDispatch } from '../state/hooks';
import { setScreenReaderEnabled } from '../state/client/session';

const AccessibilityContext: React.FC<{ children: ReactElement }> = ({ children }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const checkScreenReaderStatus = async () => {
            const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
            dispatch(setScreenReaderEnabled(isEnabled));
        };

        checkScreenReaderStatus();

        const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', enabled => {
            dispatch(setScreenReaderEnabled(enabled));
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return children;
};

export default AccessibilityContext;
