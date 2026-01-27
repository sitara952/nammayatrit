import React from 'react';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import LeftArrow from '@/typescript/assets/svg/direction/LeftArrow';
import { View } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Pressable } from '@/src-v2/primitives/Pressable';

export interface HeaderProps {
    title: string;
    onBackPress: () => void;
}
export const Header: React.FC<HeaderProps> = ({ title, onBackPress }) => {
    return (
        <View style={[tailwind.style(`flex-row items-center px-4 justify-center pt-[16px] pb-[10px]`)]}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go Back button"
                testID="my_rides_back_press"
                style={[tailwind.style('justify-self-start')]}
                onPress={() => {
                    onBackPress();
                }}>
                <LeftArrow />
            </Pressable>

            <View style={tailwind.style('flex-1 items-center w-full pr-20px')}>
                <Typography
                    type="subhead-700"
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {title}
                </Typography>
            </View>
        </View>
    );
};
