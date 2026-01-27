import { ImageStyle } from 'react-native';
import React from 'react';
import Button from '@/src-v2/primitives/Button';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import CustomReanimatedImage from '@/typescript/components/common/CustomAnimatedImage';
import Typography from '../../../designSystem/components/primitives/Typography';
import { ChildrenType } from '../../../types/CommonTypes';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';

export enum BannerType {
    LeftAligned,
    CenterAligned,
    RightAligned,
    ImageBanner,
}

type BannerProps = {
    bannerType: BannerType | undefined;
    imageSource: string;
    imageStyle: ImageStyle;
    title: string | undefined;
    buttonText: string | undefined;
    buttonPrefix: ChildrenType | undefined;
    onClick: (() => void) | undefined;
};
export const Banner = (props: BannerProps) => {
    const placementLogic = (bannerType: BannerType | undefined) => {
        switch (bannerType) {
            case BannerType.CenterAligned:
                return tailwind?.style(`relative overflow-hidden items-center`);
            case BannerType.LeftAligned:
                return tailwind?.style(`flex flex-row justify-between`);
            case BannerType.RightAligned:
                return tailwind?.style(`flex flex-row-reverse justify-between`);
            default:
                return tailwind?.style(`flex flex-row-reverse justify-between`);
        }
    };

    const contentPlacementLogic = (bannerType: BannerType | undefined) => {
        switch (bannerType) {
            case BannerType.CenterAligned:
                return tailwind?.style(`absolute items-center gap-[12px] max-w-[180px] pt-[54px] pb-[32px] `);
            case BannerType.LeftAligned:
                return tailwind?.style('items-start');
            case BannerType.RightAligned:
                return tailwind?.style('items-end');
            default:
                return tailwind?.style('items-start');
        }
    };
    return (
        <Pressable
            accessibilityRole="button"
            testID="home_banner"
            accessibilityLabel={`Home Banner button`}
            onPress={props.onClick}>
            <Animated.View
                style={[
                    tailwind.style(`rounded-[14px] h-[230px] ml-4 mr-4`),
                    tailwind.style(placementLogic(props.bannerType)),
                ]}>
                <CustomReanimatedImage
                    cacheKey={props.imageSource}
                    source={{ uri: props.imageSource }}
                    style={props.imageStyle}
                />
                <Animated.View style={[tailwind.style(contentPlacementLogic(props.bannerType))]}>
                    {props.title && (
                        <Typography
                            type="subhead-1"
                            style={tailwind.style('text-center')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {props.title}
                        </Typography>
                    )}
                    {props.buttonText && (
                        <Button
                            testID="home_banner_action"
                            type="primary"
                            text={props.buttonText}
                            size="md"
                            prefix={props.buttonPrefix}
                        />
                    )}
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};
