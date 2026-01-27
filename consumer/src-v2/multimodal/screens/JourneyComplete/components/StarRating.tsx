import Svg, { Path } from 'react-native-svg';

import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { StarRatingProps, RatingStarProps } from '../types';

import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import React, { useCallback } from 'react';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Animated, {
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withDelay,
    withSpring,
} from 'react-native-reanimated';

const RatingStar: React.FC<RatingStarProps> = props => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const animatedSelectedValue = useSharedValue(0);
    const ratingValue = useDerivedValue(() => {
        return props.rating;
    }, [props.rating]);
    useAnimatedReaction(
        () => ratingValue.value,
        (newValue, previousValue) => {
            animatedSelectedValue.value =
                newValue >= props.item
                    ? withDelay(
                          -((previousValue ?? 0) - props.index) * 100,
                          withSpring(1, { damping: 10, stiffness: 200 }),
                      )
                    : withDelay(
                          ((previousValue ?? 0) - newValue - props.index) * 100,
                          withSpring(0, { damping: 10, stiffness: 200 }),
                      );
        },
    );

    const animatedRatingStyle = useAnimatedStyle(() => {
        return {
            opacity: animatedSelectedValue.value,
            transform: [{ scale: animatedSelectedValue.value }],
        };
    });

    const handleOnPress = useCallback(() => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        props.onPressStar(props.item);
    }, [props.onPressStar, props.item]);

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                testID={`d15491c4-c1e8-4724-b480-f417d1090007`}
                key={props.item}
                onPress={handleOnPress}
                {...handlers}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${props.item} of 5 Stars button`}
                accessibilityState={{ selected: props.rating === props.item }}>
                <Animated.View accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
                    <Icon icon={<StarEmpty />} size={32} />
                    <Animated.View style={[tailwind.style('absolute'), animatedRatingStyle]}>
                        <Icon icon={<StarFiled />} size={32} />
                    </Animated.View>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export const StarRating = ({ rating, onRatingChange }: StarRatingProps) => {
    const ratingsArray = [1, 2, 3, 4, 5];

    const handleStarPress = useCallback(
        (starRating: number) => {
            if (onRatingChange !== undefined) {
                onRatingChange(starRating);
            }
        },
        [onRatingChange],
    );

    return (
        <Animated.View style={tailwind.style(`flex-row justify-between px-3`)}>
            {ratingsArray.map((item, index) => (
                <RatingStar key={item} item={item} rating={rating} onPressStar={handleStarPress} index={index} />
            ))}
        </Animated.View>
    );
};

const StarEmpty = () => {
    return (
        <Svg width="33" height="32" viewBox="0 0 33 32" fill="none">
            <Path
                d="M15.5646 1.21612C15.8686 0.431754 16.9784 0.431755 17.2824 1.21612L20.8653 10.4605C20.996 10.7977 21.3119 11.0273 21.673 11.0474L31.5722 11.5983C32.4121 11.645 32.7551 12.7005 32.103 13.232L24.4183 19.4962C24.1379 19.7248 24.0173 20.0962 24.1097 20.4458L26.6448 30.0307C26.8599 30.8439 25.962 31.4963 25.255 31.0404L16.9227 25.6675C16.6187 25.4715 16.2282 25.4715 15.9243 25.6675L7.59192 31.0404C6.88493 31.4963 5.98706 30.8439 6.20216 30.0306L8.73724 20.4458C8.82971 20.0962 8.70904 19.7247 8.42871 19.4962L0.743947 13.232C0.0919094 12.7005 0.434867 11.645 1.27479 11.5983L11.1739 11.0474C11.535 11.0273 11.851 10.7977 11.9816 10.4605L15.5646 1.21612Z"
                fill="#ECEDEF"
            />
        </Svg>
    );
};

const StarFiled = () => {
    return (
        <Svg width="33" height="32" viewBox="0 0 33 32" fill="none">
            <Path
                d="M15.5646 1.21612C15.8686 0.431754 16.9784 0.431755 17.2824 1.21612L20.8653 10.4605C20.996 10.7977 21.3119 11.0273 21.673 11.0474L31.5722 11.5983C32.4121 11.645 32.7551 12.7005 32.103 13.232L24.4183 19.4962C24.1379 19.7248 24.0173 20.0962 24.1097 20.4458L26.6448 30.0307C26.8599 30.8439 25.962 31.4963 25.255 31.0404L16.9227 25.6675C16.6187 25.4715 16.2282 25.4715 15.9243 25.6675L7.59192 31.0404C6.88493 31.4963 5.98706 30.8439 6.20216 30.0306L8.73724 20.4458C8.82971 20.0962 8.70904 19.7247 8.42871 19.4962L0.743947 13.232C0.0919094 12.7005 0.434867 11.645 1.27479 11.5983L11.1739 11.0474C11.535 11.0273 11.851 10.7977 11.9816 10.4605L15.5646 1.21612Z"
                fill="#F5B63B"
            />
        </Svg>
    );
};
