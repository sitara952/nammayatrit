import React from 'react';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { hapticEffect } from '@/typescript/utils/useHaptic';

export interface HeaderProps extends ViewProps {
    title: string;
    onBackPress: () => void;
    style?: StyleProp<ViewStyle>;
    showNextView?: boolean;
    nextViewOnPress?: () => void;
    nextViewIcon?: React.JSX.Element;
    nextViewText?: string;
    backIcon?: React.JSX.Element;
    compactTitle?: boolean;
}
export const Header: React.FC<HeaderProps> = ({
    title,
    onBackPress,
    nextViewOnPress,
    style,
    showNextView,
    nextViewIcon,
    nextViewText,
    accessibilityElementsHidden,
    importantForAccessibility,
    backIcon,
    compactTitle = false,
}) => {
    const { top } = useSafeAreaInsets();
    return (
        <View
            accessibilityElementsHidden={accessibilityElementsHidden}
            importantForAccessibility={importantForAccessibility}
            style={[tailwind.style(`flex-row items-center px-4 justify-center w-full pt-[${top}px] pb-[15px]`), style]}>
            <View
                style={tailwind.style(
                    showNextView
                        ? ` flex-2 flex-row justify-start items-center gap-2`
                        : ` flex-1 flex-row items-center justify-start  `,
                )}>
                <Pressable
                    testID="a09c945f-3f25-4a40-bc57-4f647c4a33e3"
                    style={[tailwind.style('justify-self-start')]}
                    onPress={() => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        onBackPress();
                    }}
                    accessibilityLabel="Go Back button"
                    accessibilityRole="button">
                    {backIcon ? backIcon : <ChevronLeftIcon />}
                </Pressable>
                <View style={tailwind.style(compactTitle ? 'flex-1 items-center' : 'flex-1 items-center mr-10')}>
                    <Typography
                        type="subhead-1-rupee"
                        style={tailwind.style('font-areaNormal-extrabold text-[#3C3C43]')}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {title}
                    </Typography>
                </View>
            </View>
            {showNextView && nextViewText && (
                <Pressable
                    testID="fb6195fe-1fa8-49c7-90bc-024a93573857"
                    style={tailwind.style(' flex-row rounded-full border border-gray-300 px-5 py-2 bg-white ')}
                    onPress={nextViewOnPress}
                    accessibilityLabel={nextViewText + ' button'}
                    accessibilityRole="button">
                    {nextViewIcon ? nextViewIcon : <></>}
                    <Typography
                        type="subhead"
                        style={tailwind.style('ml-1 text-sm font-bold text-black')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={false}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {nextViewText}
                    </Typography>
                </Pressable>
            )}
            {showNextView && !nextViewText && nextViewIcon ? nextViewIcon : null}
        </View>
    );
};
