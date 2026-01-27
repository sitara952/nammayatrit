import React, { forwardRef, ReactElement } from 'react';
import { View, ViewStyle } from 'react-native';
import { createComponent } from '../utils/createComponent';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';
import Animated from 'react-native-reanimated';
import { AnimationProps } from '@/src-v2/primitives/Button';

export interface IconComponentProps extends ViewProps, AnimationProps {
    /**
     * Svg Icon
     */
    icon: ReactElement;
    /**
     * Bounding Box style for Icon
     */
    style?: ViewStyle;
    /**
     * Icon Size
     */
    size: number | undefined;
    /**
     * Icon Color
     * @default gray-600
     */
    color?: string;
}

const RNIcon = Object.assign(
    forwardRef<typeof View, Partial<IconComponentProps>>((props, _) => {
        const { icon, style, size, color, accessible, accessibilityLabel, accessibilityState, accessibilityRole } =
            props;
        const iconAspectRatio = 1;

        if (icon === undefined) {
            return;
        }
        // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
        type tempAny = any;

        return (
            <Animated.View
                entering={props.entering}
                exiting={props.exiting}
                style={[style, { aspectRatio: iconAspectRatio, width: size }]}
                accessible={accessible}
                accessibilityLabel={accessibilityLabel ?? 'Icon'}
                accessibilityState={accessibilityState}
                accessibilityRole={accessibilityRole ?? 'image'}>
                {/* eslint-disable-next-line myCustomPlugin/no-as-in-modified-files */}
                {React.cloneElement(icon, { fill: color } as tempAny)}
            </Animated.View>
        );
    }),
    { displayName: 'RNIcon' },
);

export const Icon = createComponent<Partial<IconComponentProps>>(RNIcon, {
    shouldMemo: true,
});
