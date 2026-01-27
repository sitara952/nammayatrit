import React from 'react';
import Typography from './primitives/Typography';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

import Animated from 'react-native-reanimated';
import { colors } from 'config-types/src/domain/default/themes/colors.ts';
import { Pressable } from '@/src-v2/primitives/Pressable';

interface FeedbackCardProps {
    text?: string;
    onPressYes: () => void;
    onPressNo: () => void;
}

const FeedbackCard = ({ text = 'Did your driver charge extra fare?', onPressYes, onPressNo }: FeedbackCardProps) => {
    return (
        <Animated.View style={[tailwind.style(`absolute z-100 w-full top--34`)]}>
            <Animated.View style={tailwind.style('bg-white mx-4 pl-4 pt-[22px] pb-[18px] rounded-[20px]')}>
                <Typography
                    type={undefined}
                    style={tailwind.style(`font-bold text-[15px] leading-[15px] text-[${colors.gray550}]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {text}
                </Typography>
                <Animated.View style={tailwind.style('flex-row items-center gap-2 pt-[18px]')}>
                    <Pressable
                        accessibilityRole="button"
                        testID="30b07762-9081-4f7f-9b08-f1616bd5c427"
                        style={tailwind.style('bg-[#363439] rounded-[32px]')}
                        accessibilityLabel="Yes button"
                        onPress={onPressYes}>
                        <Typography
                            type={undefined}
                            style={tailwind.style('text-[15px] font-bold leading-[15px] text-white py-[9px] px-3 ')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            yes
                        </Typography>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        testID="49c4081d-055b-4c06-97a4-969cb210563e"
                        style={tailwind.style('bg-[#363439] rounded-[32px]')}
                        accessibilityLabel="No button"
                        onPress={onPressNo}>
                        <Typography
                            type={undefined}
                            style={tailwind.style('text-[15px] leading-[15px] font-bold text-white py-[9px] px-3 ')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            no
                        </Typography>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default FeedbackCard;
