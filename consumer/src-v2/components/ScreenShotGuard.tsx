import { ReactNode, memo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import ScreenGuard from 'react-native-screenguard';
import Config from 'react-native-config';

export const ScreenshotGuard = memo(({ children }: { children: ReactNode }) => {
    useFocusEffect(
        useCallback(() => {
            const isProd = Config['SDK_ENV'] === 'production';
            if (isProd) {
                ScreenGuard.registerWithoutEffect();
            } else {
                ScreenGuard.unregister();
            }

            return () => {
                ScreenGuard.unregister();
            };
        }, []),
    );

    return <>{children}</>;
});
