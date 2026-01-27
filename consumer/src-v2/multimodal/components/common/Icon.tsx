import React, { forwardRef } from 'react';
import { View, ViewStyle } from 'react-native';
import { createComponent } from '../../../utils/createComponent';

export interface IconComponentProps {
    /**
     * Svg Icon
     */
    icon: React.ReactElement;
    /**
     * Bounding Box style for Icon
     */
    style?: ViewStyle;
    /**
     * Icon Size
     */
    size?: 10 | 12 | 16 | 20 | 24 | 32 | number;
    /**
     * Icon Color
     * @default gray-600
     */
    color?: string;
}

const RNIcon: React.FC<Partial<IconComponentProps>> = forwardRef<typeof View, Partial<IconComponentProps>>(
    (props, _) => {
        const { icon, style, size, color } = props;
        const iconAspectRatio = 1;
        // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
        type tempAny = any;

        return (
            <View style={[style, { aspectRatio: iconAspectRatio, width: size }]}>
                {/* eslint-disable-next-line myCustomPlugin/no-as-in-modified-files */}
                {icon && React.cloneElement(icon, { fill: color } as tempAny)}
            </View>
        );
    },
);

// RNIcon.displayName = 'RNIcon';

export const Icon = createComponent<Partial<IconComponentProps>>(RNIcon, {
    shouldMemo: true,
});
