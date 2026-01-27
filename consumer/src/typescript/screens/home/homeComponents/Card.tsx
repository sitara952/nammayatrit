import React from 'react';
import Animated from 'react-native-reanimated';
import Typography from '../../../designSystem/components/primitives/Typography';
import { Image } from 'react-native';
import { tailwind } from '../../../tailwindTheme/tailwind';
import { useScaleAnimation } from '../../../utils/useScaleAnimation';
import { StyleType } from '../../../types/CommonTypes';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

export enum CategoryType {
    Airport,
    Park,
    Heritage,
    Museum,
    SciencePark,
    Promotional,
    Events,
    NammaVideos, // @deprecated
    Videos,
    Shopping,
    Eateries,
    PublicTransport,
    Beach,
    Sports,
    Office,
}
export type CardProps = {
    imgSrc: string;
    borderRadius: number | undefined;
    title: string;
    subTitle: string | undefined;
    description: string | undefined;
    category: CategoryType;
    style: StyleType | undefined;
    onClick: (() => void) | undefined;
};
export const Card = (props: CardProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const { handlers } = useScaleAnimation();

    return (
        <Animated.View style={[tailwind.style('flex flex-col'), props.style]} accessibilityRole="button">
            <Pressable
                accessibilityLabel="Home Card Item button"
                testID="home_card_item"
                onPress={props.onClick}
                accessibilityRole="button"
                {...handlers}
                style={tailwind.style('mb-14px')}>
                <Image
                    accessible={false}
                    accessibilityLabel="home card item image"
                    style={{ height: 180, width: 240 }}
                    source={{ uri: props.imgSrc }}
                    resizeMethod="resize"
                    borderRadius={16}
                />
            </Pressable>
            <Typography
                type="subhead-1"
                style={[tailwind.style(`text-[#2F2D32] max-w-[240px]`)]}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {props.title}
            </Typography>
            {props.description != undefined ? (
                <Typography
                    type="body-1"
                    style={[tailwind.style(`text-[${themeColors.Text_neutralMidHigh}]`)]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {props.description}
                </Typography>
            ) : null}
        </Animated.View>
    );
};
