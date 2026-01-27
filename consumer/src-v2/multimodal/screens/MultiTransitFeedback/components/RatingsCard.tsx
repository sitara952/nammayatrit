import { createAction } from '@/typescript/utils/common';
import { StarEmpty, StarFilled } from '../../../../../src/typescript/components/svg/Star';
import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import { hapticEffect } from '../../../../../src/typescript/utils/useHaptic';
import { useScaleAnimation } from '../../../../../src/typescript/utils/useScaleAnimation';
import { RatingsCardTypes, RatingStarProps } from '../types';

import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated, {
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withDelay,
    withSpring,
} from 'react-native-reanimated';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';

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

    const handleOnPress = () => {
        hapticEffect(undefined, undefined);
        props.mpDispatch(createAction('TOGGLE_RATING_STARS', { index: props.item }));
    };

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                testID={`d15491c4-c1e8-4724-b480-f417d1090007`}
                key={props.item}
                onPress={handleOnPress}
                {...handlers}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${props.item} of 5 Star button`}
                accessibilityState={{ selected: props.rating === props.item }}>
                <Animated.View accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
                    <Icon icon={<StarEmpty fill={'#6D7280'} />} size={32} />
                    <Animated.View style={[tailwind.style('absolute'), animatedRatingStyle]}>
                        <Icon icon={<StarFilled fill="#FBC504" />} size={32} />
                    </Animated.View>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export const RatingsCard = ({ rating, mpDispatch }: RatingsCardTypes) => {
    const ratingsArray = [1, 2, 3, 4, 5];
    return (
        <Animated.View style={tailwind.style(`flex-row justify-between px-10`)} accessible={false}>
            {ratingsArray.map((item, index) => (
                <RatingStar key={item} item={item} rating={rating} mpDispatch={mpDispatch} index={index} />
            ))}
        </Animated.View>
    );
};

export default RatingsCard;
