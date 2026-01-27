import React from 'react';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import { Icon } from '@/typescript/components/Icon';
import { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { Path, Rect, Svg } from 'react-native-svg';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors } from 'config-types/src/domain/default/themes/colors';

// disabling this as props need to be passed, its taken care of in the parent component
// eslint-disable-next-line myCustomPlugin/enforce-optional-params
export const AddIcon = ({ fill = '#1363D2' }: { fill?: string }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 17 18" fill="none">
            <Rect x={0.75} y={1.25} width={15.5} height={15.5} rx={7.25} stroke={fill} strokeWidth={1.5} />
            <Path fill={fill} d="M7.77148 5.36328H9.22603V12.636009999999999H7.77148z" />
            <Path
                transform="rotate(90 12.137 8.273)"
                fill={fill}
                d="M12.1367 8.27344H13.591249999999999V15.54617H12.1367z"
            />
        </Svg>
    );
};

// disabling this as props need to be passed, its taken care of in the parent component
// eslint-disable-next-line myCustomPlugin/enforce-optional-params
export const HomeIcon = ({ fill = '#656565' }: { fill?: string }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 14 14" fill="none">
            <Path
                d="M11.78 4.973l-4.315-2.99a.815.815 0 00-.936 0l-4.308 2.99c-.296.202-.471.542-.471.898v5.2c0 .603.493 1.095 1.095 1.095h1.993a.549.549 0 00.547-.547V8.816a.55.55 0 01.547-.548h2.136a.55.55 0 01.547.548v2.803c0 .3.246.547.547.547h1.993c.602 0 1.095-.492 1.095-1.095v-5.2c0-.362-.175-.696-.47-.898z"
                fill={fill}
            />
        </Svg>
    );
};

// disabling this as props need to be passed, its taken care of in the parent component
// eslint-disable-next-line myCustomPlugin/enforce-optional-params
export const WorkIcon = ({ fill = '#656565' }: { fill?: string }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 14 14" fill="none">
            <Path
                d="M11.286 4.585H9.818V3.1c0-.742-.608-1.35-1.35-1.35H5.516c-.743 0-1.35.608-1.35 1.35v1.485H2.697c-.854 0-1.55.696-1.55 1.55V10.7c0 .847.696 1.549 1.55 1.549h8.6c.847 0 1.549-.696 1.549-1.55V6.136c0-.854-.696-1.55-1.55-1.55h-.011zM5.316 3.1a.19.19 0 01.194-.192h2.952a.19.19 0 01.193.192v1.485H5.317V3.1z"
                fill={fill}
            />
        </Svg>
    );
};

// disabling this as props need to be passed, its taken care of in the parent component
// eslint-disable-next-line myCustomPlugin/enforce-optional-params
export const OtherIcon = ({ fill = '#656565' }: { fill?: string }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 21 21" fill="none">
            <Path
                d="M14.964 2c-1.946 0-3.617 1.188-4.464 2.945C9.653 3.213 7.982 2 6.036 2 3.266 2 1 4.45 1 7.469c0 3.464 2.93 6.186 5.196 8.215.962.866 4.304 3.168 4.304 3.316 0-.148 3.342-2.45 4.304-3.316C17.07 13.655 20 10.933 20 7.47 20 4.449 17.734 2 14.941 2h.023z"
                fill={fill}
            />
        </Svg>
    );
};

const FavouritePill = ({
    type = 'home',
    selected = false,
    onPress = () => {},
    name = undefined,
    disabled = true,
}: {
    type: 'home' | 'work' | 'other';
    selected: boolean;
    onPress: () => void;
    name: string | undefined;
    disabled: boolean;
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const iconAndTextColor = disabled
        ? colors.gray300
        : selected
          ? themeColors.favourites_confirm_button_text
          : colors.gray665;

    const iconLogic = useMemo(() => {
        if (type === 'home') {
            return <Icon icon={<HomeIcon />} color={iconAndTextColor} size={14} />;
        } else if (type === 'work') {
            return <Icon icon={<WorkIcon />} color={iconAndTextColor} size={14} />;
        } else {
            return <Icon icon={<OtherIcon />} color={iconAndTextColor} size={14} />;
        }
    }, [type, selected]);

    const textLogic = useMemo(() => {
        if (type === 'home') {
            return userLanguageStrings.Home;
        } else if (type === 'work') {
            return userLanguageStrings.Work;
        } else {
            return userLanguageStrings.Other;
        }
    }, [type, userLanguageStrings]);

    return (
        <Pressable
            testID="favourite-pill"
            onPress={!disabled ? onPress : undefined}
            accessibilityRole="button"
            accessibilityLabel={name || textLogic}
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style('flex-row items-center gap-[6px] px-[16px] h-[44px] rounded-[16px]'),
                    tailwind.style(
                        selected
                            ? `bg-[${themeColors.favourites_confirm_button_bg}]`
                            : 'bg-white border border-[#E5E5E5]',
                    ),
                    tailwind.style(disabled ? 'bg-[#E5E5E5]' : ''),
                    !disabled && animatedStyle,
                ]}>
                {iconLogic}
                <Animated.Text
                    style={[tailwind.style(`font-areaNormal-extrabold text-[14px] text-[${iconAndTextColor}]`)]}>
                    {name || textLogic}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};

export default FavouritePill;
