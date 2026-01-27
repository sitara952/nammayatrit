import React, { PropsWithChildren } from 'react';
import Animated, { FlipInXDown, FlipInXUp } from 'react-native-reanimated';
import { tailwind } from '../../../tailwindTheme/tailwind';
import { StyleType } from '../../../types/CommonTypes';
import { AccessibilityRole } from 'react-native/Libraries/Components/View/ViewAccessibility';

export type TypographyTypes =
    | 'callout'
    | 'callout-1'
    | 'callout-2'
    | 'subhead'
    | 'subhead-800'
    | 'subhead-700'
    | 'subhead-600'
    | 'subhead-1'
    | 'subhead-2'
    | 'subhead-4'
    | 'subhead-3'
    | 'body-6'
    | 'body-7'
    | 'body-8'
    | 'body'
    | 'body-subtext'
    | 'body-1'
    | 'body-3'
    | 'body-4'
    | 'body-5'
    | 'title'
    | 'title-2'
    | 'title-3'
    | 'title-4'
    | 'title-800'
    | 'title-800-rupee'
    | 'subhead-1-rupee'
    | 'body-2'
    | 'body-5'
    | 'micro'
    | 'sub-body-700'
    | 'sub-body-800'
    | 'subhead-900'
    | 'sub-body-500';

type TypographyPropTypes = PropsWithChildren<{
    type: TypographyTypes | undefined;
    style: StyleType | undefined;
    numberOfLines: number | undefined;
    isAnimate: boolean | undefined;
    accessible: boolean | undefined;
    accessibilityLabel: string | undefined;
    accessibilityRole: AccessibilityRole | undefined;
}>;

const Typography = ({
    children,
    type,
    style = {},
    numberOfLines,
    isAnimate = false,
    accessible = true,
    accessibilityLabel,
    accessibilityRole,
}: TypographyPropTypes) => {
    return (
        <Animated.Text
            style={[tailwind.style(`text-black ${type}`), style]} // by default color same as IOS
            numberOfLines={numberOfLines}
            entering={isAnimate ? FlipInXDown.springify().damping(20).stiffness(100) : undefined}
            exiting={isAnimate ? FlipInXUp.springify().damping(20).stiffness(100) : undefined}
            accessible={accessible}
            accessibilityRole={accessibilityRole}
            accessibilityLabel={accessibilityLabel}>
            {children}
        </Animated.Text>
    );
};

export default Typography;
