import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useHaptic } from '../../../../utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface SegmentedControlProps {
    /**
     * The Segments Text Array
     */
    segments: Array<string>;
    /**
     * The Current Active Segment Index
     * If not provided, component will use internal state (uncontrolled mode)
     */
    currentIndex?: number;
    /**
     * Default index for uncontrolled mode
     */
    defaultIndex?: number;
    /**
     * A callback onPress of a Segment
     */
    onChange?: (index: number) => void;
    /**
     * An array of Badge Values corresponding to the Segment
     */
    badgeValues?: Array<number | null>;
    /**
     * Is right-to-left mode.
     */
    isRTL?: boolean;
    /**
     * Fixed width for the control.
     * If not provided, will size to content
     */
    width?: number;
    /**
     * Active Segment Text Style
     */
    activeTextStyle?: TextStyle;
    /**
     * InActive Segment Text Style
     */
    inactiveTextStyle?: TextStyle;
    /**
     * Segment Container Styles
     */
    segmentedControlWrapper?: ViewStyle;
    /**
     * Pressable Container Styles
     */
    pressableWrapper?: ViewStyle;
    /**
     * The moving Tile Container Styles
     */
    tileStyle?: ViewStyle;
    /**
     * Active Badge Styles
     */
    activeBadgeStyle?: ViewStyle;
    /**
     * Inactive Badge Styles
     */
    inactiveBadgeStyle?: ViewStyle;
    /**
     * Badge Text Styles
     */
    badgeTextStyle?: TextStyle;
    /**
     * If true, segments will have equal width regardless of content
     * If false, segments will adapt to content width
     */
    equalWidths?: boolean;
}

const defaultShadowStyle = {
    shadowColor: '#000',
    shadowOffset: {
        width: 1,
        height: 1,
    },
    shadowOpacity: 0.025,
    shadowRadius: 1,

    elevation: 1,
};

const DEFAULT_SPRING_CONFIG = {
    stiffness: 150,
    damping: 20,
    mass: 1,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
};

const SegmentedControl: React.FC<SegmentedControlProps> = ({
    segments,
    currentIndex,
    defaultIndex = 0,
    onChange,
    badgeValues = [],
    isRTL = false,
    width,
    equalWidths = false,
    activeTextStyle,
    inactiveTextStyle,
    segmentedControlWrapper,
    pressableWrapper,
    tileStyle,
    activeBadgeStyle,
    inactiveBadgeStyle,
    badgeTextStyle,
}: SegmentedControlProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const haptic = useHaptic(HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
    // Internal state for uncontrolled mode
    const [internalIndex, setInternalIndex] = useState(defaultIndex);

    // Determine if we're in controlled or uncontrolled mode
    const isControlled = currentIndex !== undefined;
    const activeIndex = isControlled ? currentIndex : internalIndex;

    // State to store the measured container width
    const [measuredWidth, setMeasuredWidth] = useState(0);

    // Use provided width or measured width
    const controlWidth = width || measuredWidth;

    // Refs to store segment positions and widths
    const segmentMeasures = useRef<Array<{ x: number; width: number }>>([]);

    // For equal widths calculation (only valid if we know the total width)
    const segmentWidth = controlWidth > 0 ? controlWidth / segments.length : 0;

    // For animated position of the active tile
    const tabTranslateValue = useSharedValue(0);
    const tabWidthValue = useSharedValue(0);

    // useCallBack with an empty array as input, which will call inner lambda only once and memoize the reference for future calls
    const memoizedTabPressCallback = React.useCallback(
        (index: number) => {
            if (!isControlled) {
                setInternalIndex(index);
            }
            onChange?.(index);
            haptic?.();
        },
        [onChange, isControlled],
    );

    // Update the position and width of the active tile
    useEffect(() => {
        if (!segmentMeasures.current || segmentMeasures.current.length <= activeIndex) return;

        // If using equal widths and we know the control width
        if (equalWidths && controlWidth > 0) {
            const transitionMultiplier = isRTL ? -1 : 1;
            tabTranslateValue.value = withSpring(
                activeIndex * (segmentWidth * transitionMultiplier),
                DEFAULT_SPRING_CONFIG,
            );
            tabWidthValue.value = withSpring(
                segmentWidth - 4, // Subtract padding
                DEFAULT_SPRING_CONFIG,
            );
        } else {
            // Use measured widths and positions
            const segment = segmentMeasures.current[activeIndex];
            if (segment) {
                const { x, width: segWidth } = segment;
                tabTranslateValue.value = withSpring(x, DEFAULT_SPRING_CONFIG);
                tabWidthValue.value = withSpring(
                    segWidth - 4, // Subtract padding
                    DEFAULT_SPRING_CONFIG,
                );
            }
        }
    }, [activeIndex, segmentWidth, isRTL, equalWidths, controlWidth]);

    // Handler for measuring each segment
    const handleSegmentLayout = (index: number, event: LayoutChangeEvent) => {
        const { x, width: segWidth } = event.nativeEvent.layout;

        // Store the measurements
        segmentMeasures.current[index] = { x, width: segWidth };

        // If this is the active segment and we're not using equal widths, update the tile
        if (index === activeIndex && !equalWidths) {
            tabTranslateValue.value = withSpring(x, DEFAULT_SPRING_CONFIG);
            tabWidthValue.value = withSpring(
                segWidth - 4, // Subtract padding
                DEFAULT_SPRING_CONFIG,
            );
        }
    };

    // Handler for measuring the container
    const handleContainerLayout = (event: LayoutChangeEvent) => {
        const containerWidth = event.nativeEvent.layout.width;
        setMeasuredWidth(containerWidth);

        // Reset measurements when container size changes
        segmentMeasures.current = [];
    };

    // Animated styles for position
    const tabTranslateAnimatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: tabTranslateValue.value }],
            width: tabWidthValue.value,
        };
    });

    const finalisedActiveTextStyle: TextStyle = {
        fontSize: 15,
        lineHeight: 20,
        fontFamily: 'AreaNormal-Extrabold',
        textAlign: 'center',
        color: '#3B3A3C',
        ...activeTextStyle,
    };

    const finalisedInActiveTextStyle: TextStyle = {
        fontSize: 15,
        lineHeight: 20,
        fontFamily: 'AreaNormal-Extrabold',
        textAlign: 'center',
        color: '#969696',
        ...inactiveTextStyle,
    };

    const finalisedActiveBadgeStyle: ViewStyle = {
        backgroundColor: '#27272a',
        marginLeft: 4,
        alignItems: 'center',
        justifyContent: 'center',
        ...activeBadgeStyle,
    };

    const finalisedInActiveBadgeStyle: ViewStyle = {
        backgroundColor: '#6b7280',
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
        ...inactiveBadgeStyle,
    };

    const finalisedBadgeTextStyle: TextStyle = {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        color: '#FFFFFF',
        ...badgeTextStyle,
    };

    return (
        <Animated.View
            style={[
                styles.defaultSegmentedControlWrapper,
                // If width prop is provided, use it
                width ? { width } : { alignSelf: 'flex-start' },
                segmentedControlWrapper,
            ]}
            onLayout={handleContainerLayout}>
            <Animated.View
                style={[
                    styles.movingSegmentStyle,
                    defaultShadowStyle,
                    tileStyle,
                    StyleSheet.absoluteFill,
                    tabTranslateAnimatedStyles,
                ]}
            />
            {segments.map((segment, index) => {
                return (
                    <Pressable
                        onPress={() => memoizedTabPressCallback(index)}
                        onLayout={event => handleSegmentLayout(index, event)}
                        testID={`b236ae61-cd21-4c9d-a14d-add2570f11d0-${index}`}
                        key={index}
                        accessibilityRole="button"
                        accessibilityLabel={`${segment}${activeIndex === index ? ', selected' : ''}`}
                        style={[
                            styles.touchableContainer,
                            // Only apply flex: 1 if equalWidths is true and we know the container width
                            equalWidths && controlWidth > 0 ? { flex: 1 } : undefined,
                            pressableWrapper,
                        ]}>
                        <View style={styles.textWrapper}>
                            <Text
                                style={[activeIndex === index ? finalisedActiveTextStyle : finalisedInActiveTextStyle]}>
                                {segment === 'All'
                                    ? userLanguageStrings.All
                                    : segment === 'Routes'
                                      ? userLanguageStrings.Routes
                                      : segment === 'Stops'
                                        ? userLanguageStrings.Stops
                                        : segment}
                            </Text>
                            {badgeValues[index] && (
                                <View
                                    style={[
                                        styles.defaultBadgeContainerStyle,
                                        activeIndex === index ? finalisedActiveBadgeStyle : finalisedInActiveBadgeStyle,
                                    ]}>
                                    <Text style={finalisedBadgeTextStyle}>{badgeValues[index]}</Text>
                                </View>
                            )}
                        </View>
                    </Pressable>
                );
            })}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    defaultSegmentedControlWrapper: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: '#E6E6E6',
    },
    touchableContainer: {
        paddingVertical: 12,
        paddingHorizontal: 12, // Reduced horizontal padding to tighten the control
        elevation: 9,
    },
    textWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    movingSegmentStyle: {
        top: 0,
        marginVertical: 2,
        marginHorizontal: 2,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    // Badge Styles
    defaultBadgeContainerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 16,
        width: 16,
        borderRadius: 9999,
        alignContent: 'flex-end',
    },
});

export default SegmentedControl;
