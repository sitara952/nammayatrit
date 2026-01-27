/* eslint-disable myCustomPlugin/enforce-optional-params */
import { ChildrenType } from '@/typescript/types/CommonTypes';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView as RNBlurView, BlurType } from '@sbaiahmed1/react-native-blur';
import { useCallback, useState } from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';

export const BlurView = ({
    children,
    blurType,
    blurAmount,
    style,
}: {
    children?: ChildrenType;
    blurType: BlurType | undefined;
    blurAmount: number | undefined;
    style?: StyleProp<ViewStyle>;
}) => {
    const [isScreenBlurred, setIsScreenBlurred] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setIsScreenBlurred(false);
            return () => setIsScreenBlurred(true);
        }, []),
    );

    if (Platform.OS === 'ios') {
        return (
            <RNBlurView blurType={blurType || 'light'} blurAmount={blurAmount} style={style}>
                {children}
            </RNBlurView>
        );
    }

    return !isScreenBlurred ? (
        <RNBlurView blurType={blurType || 'light'} blurAmount={blurAmount} style={style}>
            {children}
        </RNBlurView>
    ) : (
        <>{children}</>
    );
};
