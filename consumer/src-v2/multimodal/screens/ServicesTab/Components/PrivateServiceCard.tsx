import { Pressable } from '@/src-v2/primitives/Pressable';
import { useHaptic } from '@/src-v2/utils/useHaptic';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Animated, { SlideInRight } from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import React from 'react';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { ImageSourcePropType } from 'react-native';
import { ServiceTag, ActionConfig } from '@/src-v2/systems/configs/types';
import { useHomeActions } from '@/typescript/homeActions/useHomeActions';

type PrivateServiceCardProps = {
    title: string;
    subtitle: string | undefined;
    imgSrc: ImageSourcePropType;
    serviceTag: ServiceTag;
    testID: string;
    onClick: ActionConfig | undefined; // Type-safe action configuration
};

const maxWidth = SCREEN_WIDTH / 2 - 28;

export const PrivateServiceCard: React.FC<PrivateServiceCardProps> = props => {
    const { onClick } = props;
    const { animatedStyle, handlers } = useScaleAnimation();
    const triggerHaptic = useHaptic(HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
    const { triggerHomeAction } = useHomeActions();

    const handleOnPress = () => {
        triggerHaptic();

        if (!onClick) {
            console.warn('[PrivateServiceCard] No onClick provided');
            return;
        }

        triggerHomeAction(onClick.actionName, {
            source: props.serviceTag,
            actionData: onClick.actionData,
        });
    };

    return (
        <Pressable
            testID={props.testID}
            accessibilityRole="button"
            accessibilityLabel={props.title + ' button'}
            {...handlers}
            style={{ width: maxWidth }}
            onPress={handleOnPress}>
            <Animated.View
                style={[
                    {
                        justifyContent: 'center',
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        backgroundColor: 'white',
                        borderRadius: 20,
                        overflow: 'hidden',
                    },
                    animatedStyle,
                ]}>
                <Animated.View style={{ alignItems: 'center' }}>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="transit"
                        entering={SlideInRight.delay(200).springify().damping(28).stiffness(300)}
                        source={props.imgSrc}
                        style={{ height: 70, width: 125 }}
                    />
                </Animated.View>
                <Typography
                    type={'callout-1'}
                    style={{ marginTop: 14, fontSize: 13 }}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {props.title}
                </Typography>
                {props.subtitle ? (
                    <Typography
                        type={'callout-1'}
                        style={{ fontSize: 12, color: '#7E7E7E' }}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {props.subtitle}
                    </Typography>
                ) : null}
            </Animated.View>
        </Pressable>
    );
};
