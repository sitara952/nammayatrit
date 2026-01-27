import React from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withDelay,
    withSpring,
} from 'react-native-reanimated';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { Icon } from '@/typescript/components/Icon';
import { StarFilled, StarUnfilled } from '@/typescript/components/svg/Star';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type RatingsComponentTypes = {
    rating: number;
    setRating: (rating: number) => void;
    isInteractive: boolean | undefined;
    clearSubmitApiData: (() => void) | undefined;
};

const RatingStar = ({
    item,
    rating,
    isInteractive,
    setRating,
    clearSubmitApiData,
    index,
}: {
    item: number;
    rating: number;
    isInteractive: boolean;
    setRating: (rating: number) => void;
    clearSubmitApiData: () => void;
    index: number;
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const { handlers, animatedStyle } = useScaleAnimation();
    const animatedSelectedValue = useSharedValue(0);
    const ratingValue = useDerivedValue(() => {
        return rating;
    }, [rating]);
    useAnimatedReaction(
        () => ratingValue.value,
        (newValue, previousValue) => {
            animatedSelectedValue.value =
                newValue >= item
                    ? withDelay(-((previousValue ?? 0) - index) * 100, withSpring(1, { damping: 10, stiffness: 200 }))
                    : withDelay(
                          ((previousValue ?? 0) - newValue - index) * 100,
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
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        AccessibilityInfo.announceForAccessibilityWithOptions(`Rated ${item} star`, { queue: true });
        if (isInteractive && rating !== item) {
            setRating(rating === item ? rating - 1 : item);
            clearSubmitApiData();
        }
    };

    return (
        <Pressable
            testID="review_feedback_rating_star"
            key={item}
            onPress={handleOnPress}
            {...handlers}
            accessible
            accessibilityRole="imagebutton"
            accessibilityLabel={`${item} Star button`}
            style={styles.starPressable}>
            <Animated.View style={[animatedStyle]}>
                <Animated.View accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
                    <Icon
                        icon={<StarUnfilled fill={themeColors.rating_star_unfilled} />}
                        color={themeColors.rating_star_unfilled}
                        size={32}
                        key={item}
                    />
                    <Animated.View style={[styles.absolutePosition, animatedRatingStyle]}>
                        <Icon icon={<StarFilled fill="#FBC504" />} size={32} key={item} />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const RatingsComponent = ({
    rating,
    setRating,
    isInteractive = true,
    clearSubmitApiData = () => {},
}: RatingsComponentTypes) => {
    const ratingsArray = [1, 2, 3, 4, 5];

    return (
        <Animated.View style={styles.container}>
            {ratingsArray?.map((item, index) => (
                <RatingStar
                    key={item}
                    item={item}
                    rating={rating}
                    isInteractive={isInteractive}
                    setRating={setRating}
                    clearSubmitApiData={clearSubmitApiData}
                    index={index}
                />
            ))}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 20,
    },
    starPressable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    absolutePosition: {
        position: 'absolute',
    },
});

export default RatingsComponent;
