import token from '../../tokens';
import colors from '../../../designSystem/colorPalette';
import React from 'react';
import Typography from './Typography';
import { tailwind } from '../../../tailwindTheme/tailwind';
import { ChildrenType } from '../../../types/CommonTypes';
import Animated from 'react-native-reanimated';
import { ViewProps } from 'react-native';

interface BadgeScreenTypes extends ViewProps {
    text: string;
    icon?: ChildrenType;
    color?: string;
}

const Badge = ({ text, icon, accessible, accessibilityLabel, color }: BadgeScreenTypes) => {
    return (
        <Animated.View
            accessible={accessible}
            accessibilityLabel={accessibilityLabel}
            style={[
                tailwind.style(
                    `flex-row self-baseline items-center gap-[${token?.spacing?.[6]}] bg-[${color || colors?.recovered?.greenMidHigh}] h-[${token?.height?.xxs}] px-[${token?.spacing?.[10]}] rounded-[${token?.corner?.lg}] `,
                ),
                { fontWeight: 700 },
            ]}>
            {icon}
            <Typography
                accessible={false}
                type="body-5"
                style={tailwind?.style('text-white  font-areaNormal-bold')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {text}
            </Typography>
        </Animated.View>
    );
};
export default Badge;
