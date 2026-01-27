import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../tokens';
import Typography from './primitives/Typography';
import { Icon } from '../../components/Icon';
import { ImageSourcePropType } from 'react-native';
import { Sizer } from '../../components/svg/Sizer';
import colors from '../colorPalette';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

type CardTipTypes = {
    imgSrc: ImageSourcePropType;
    title: string;
    description: string;
    count: number;
    cost: number;
    time: number;
    onPress: (() => void) | undefined;
};

const CardTip = ({ title, description, onPress }: CardTipTypes) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    return (
        <Pressable
            accessibilityRole="button"
            testID="906f65a6-f8a2-4251-b488-9ef24d644098"
            onPress={onPress}
            accessibilityLabel={`${title} card tip button`}>
            {({ pressed }) => (
                <Animated.View
                    style={tailwind.style(
                        `py-[${token?.spacing?.[16]}] px-[${token?.spacing?.[16]}] flex-row justify-between gap-[${
                            token?.gap.spacing[10]
                        }] rounded-[${token?.corner?.md}]  ${
                            pressed ? `bg-[${themeColors.Fill_neutralMidLow}]` : `bg-[${themeColors.Fill_neutralMin}]`
                        }`,
                    )}>
                    <Animated.View style={tailwind.style(`flex-col gap-[${token?.spacing[6]}] flex-1`)}>
                        <Animated.View style={tailwind.style('flex-row items-center')}>
                            <Typography
                                type="subhead-1"
                                style={tailwind.style(`text-[${token?.text['text-highContrast']}]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {title}
                            </Typography>
                            <Animated.View style={tailwind.style(`ml-[${token?.spacing?.[8]}]`)}>
                                <Icon
                                    color={colors?.primitive?.gray?.[8]}
                                    icon={<Sizer fill={undefined} />}
                                    size={12}
                                />
                            </Animated.View>
                        </Animated.View>
                        <Animated.View style={tailwind.style('flex-row items-center gap-[7px]')}>
                            <Typography
                                type="body-1"
                                style={tailwind.style(`text-[${token?.text['text-weak']}]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {description}
                            </Typography>
                        </Animated.View>
                    </Animated.View>
                    <Animated.View style={tailwind.style(`flex-col gap-[${token?.gap.spacing[6]}]`)}>
                        <Icon color={colors?.primitive?.gray?.[8]} icon={<Sizer fill={undefined} />} size={24} />
                    </Animated.View>
                </Animated.View>
            )}
        </Pressable>
    );
};

export default CardTip;
