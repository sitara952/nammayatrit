import React, { useState } from 'react';
import colors from '../../colorPalette';
import { Dimensions, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { tailwind } from '../../../tailwindTheme/tailwind';
import token from '../../tokens';
import { Icon } from '../../../components/Icon';
import Button from '@/src-v2/primitives/Button';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import Typography from '@/typescript/designSystem/components/primitives/Typography';

type ToolCenterCardProps = {
    specialLocationTag: string | undefined;
    label: string;
    imgSrc: React.ReactElement;
    imgSize: number | undefined;
    imgFill: string | undefined;
    id: string;
    numberOfElements: number;
    flexDirection: string | undefined;
    horizontalAlignment: string | undefined;
    style: ViewStyle | undefined;
    textStyle: TextStyle | undefined;
    canToggle: boolean;
    gap: number | undefined;
    activeImgSrc: React.ReactElement | undefined;
    disabled: boolean | undefined;
    onPress: ((id: string) => void) | undefined;
    onPressActive: ((id: string) => void) | undefined;
    initialActiveState: boolean;
};

const SCREEN_WIDTH = Dimensions.get('screen').width;

const ITEM_WIDTH = (numberOfElements: number) => {
    if (numberOfElements > 1) {
        return (SCREEN_WIDTH - 50) / numberOfElements;
    } else {
        return SCREEN_WIDTH - 32;
    }
};

export const ToolCenterCard = (props: ToolCenterCardProps) => {
    const {
        specialLocationTag = '',
        label,
        imgSrc,
        activeImgSrc,
        id,
        flexDirection,
        style,
        imgFill,
        imgSize,
        horizontalAlignment = 'items-start',
        textStyle,
        disabled = false,
        initialActiveState,
        onPress,
        onPressActive,
    } = props;
    const [isToolActive, setIsActive] = useState<boolean>(initialActiveState);

    const handleToolClick = (id: string): void => {
        if (props.canToggle) {
            if (isToolActive) {
                if (onPressActive) onPressActive(id);
                setIsActive(false);
            } else {
                if (onPress) {
                    onPress(id);
                }
                setIsActive(true);
            }
        } else {
            if (onPress) {
                onPress(id);
            }
        }
    };
    const isSpecialLocationWithTag = (tag: string): boolean => {
        return specialLocationTag.search(tag) !== -1;
    };
    const backgroundColorStyle =
        isToolActive === undefined || !isToolActive ? tailwind.style('bg-[#FFFFFF]') : tailwind.style('bg-[#F1F2F7]');
    return (
        <Button
            testID="a2d6e375-219b-49a4-a40e-1981bfa578a0"
            type="secondary"
            size="xl"
            disabled={disabled}
            numberOfLines={0}
            style={[
                tailwind.style(
                    `text-sm flex-grow justify-center w-[${ITEM_WIDTH(props.numberOfElements) - (props.gap ?? 0)}px]`,
                ),
                styles.containerShadow,
                style,
                backgroundColorStyle,
            ]}
            onPress={() => {
                handleToolClick(id);
            }}
            prefix={
                <View
                    style={tailwind.style(`${flexDirection} justify-center ${horizontalAlignment} py-[5px] gap-[6px]`)}>
                    {id === 'WalkingDirection' && isSpecialLocationWithTag('Airport') ? (
                        <LottieWithFallback
                            fallback={undefined}
                            style={tailwind.style('w-[20px] h-[20px]')}
                            source={require('../../../assets/ny-service/mt_ic_walk_animation.lottie')}
                            autoPlay
                            loop
                        />
                    ) : (
                        <Icon
                            icon={isToolActive ? (activeImgSrc !== undefined ? activeImgSrc : imgSrc) : imgSrc}
                            size={imgSize ? imgSize : token?.icon?.sizer?.[20]}
                            color={imgFill}
                        />
                    )}

                    <Typography
                        type="sub-body-800"
                        style={textStyle}
                        numberOfLines={2}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {label}
                    </Typography>
                </View>
            }
        />
    );
};

const styles = StyleSheet.create({
    containerShadow: {
        shadowColor: '' + `${colors?.recovered?.neutralMax}` + '02',
        shadowRadius: 4.5,
        shadowOpacity: 1.0,
        shadowOffset: { width: 0, height: 5.5 },
    },
});
