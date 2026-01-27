import { VideoRef } from 'react-native-video';
import { useRef, useState, useCallback, useEffect } from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
    LinearTransition,
    interpolateColor,
} from 'react-native-reanimated';
import { View, FlatList, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { VideoPlayer } from '@/src-v2/components/VideoPlayer';

// Define constants at the top level for reuse
const AUTOSCROLL_INTERVAL = 6000; // 6 seconds

const CarouselItems = [
    {
        title: 'Navigating City is \nEasy Now!',
        description: 'Experience fastest, connected ways to travel with all your options in one place.',
    },
    {
        title: 'Real-time Bus, Train, Metro schedules for booking!',
        description: 'Never miss a connection with live updates keeping your journey on track.',
    },
    {
        title: 'Your place to anywhere! Travel with public transport seamlessly',
        description: 'With a single QR for all the travel modes, skip the queues at all stations.',
    },
];

const PaginationDot = ({ isActive }: { isActive: boolean }) => {
    // For the inactive state, we want a small circle with equal width and height
    const DOT_SIZE = 10;

    const progressWidth = useSharedValue(isActive ? 8 : 0);
    const containerWidth = useSharedValue(isActive ? 56 : DOT_SIZE);
    const containerHeight = useSharedValue(DOT_SIZE);
    const animationState = useSharedValue(isActive ? 1 : 0);
    const progressOpacity = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
        // Animate the state value for interpolation
        animationState.value = withTiming(isActive ? 1 : 0, {
            duration: 350,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        if (isActive) {
            // First expand the container
            containerWidth.value = withTiming(56, {
                duration: 350,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });

            // Make progress visible immediately
            progressOpacity.value = 1;
            progressWidth.value = 8;

            // Start progress animation after container expands
            setTimeout(() => {
                progressWidth.value = withTiming(54, {
                    duration: AUTOSCROLL_INTERVAL,
                    easing: Easing.linear,
                });
            }, 350);
        } else {
            // Fade out progress bar first
            progressOpacity.value = withTiming(0, { duration: 150 });

            // Then shrink container to a perfect circle
            containerWidth.value = withTiming(DOT_SIZE, {
                duration: 350,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });

            // Reset progress width after animation
            setTimeout(() => {
                progressWidth.value = 8;
            }, 350);
        }
    }, [isActive]);

    const animatedProgressStyles = useAnimatedStyle(() => {
        return {
            width: progressWidth.value,
            height: 8,
            backgroundColor: '#969696',
            borderRadius: 32,
            position: 'absolute',
            left: 1,
            top: 1,
            opacity: progressOpacity.value,
        };
    });

    const containerStyles = useAnimatedStyle(() => {
        return {
            width: containerWidth.value,
            height: containerHeight.value,
            borderRadius: containerHeight.value / 2,
            backgroundColor: interpolateColor(
                animationState.value,
                [0, 1],
                ['rgb(209, 213, 219)', 'rgb(229, 231, 235)'],
            ),
            overflow: 'hidden',
            position: 'relative',
            marginHorizontal: 4,
        };
    });

    return (
        <Animated.View layout={LinearTransition.springify().damping(35).stiffness(340)} style={containerStyles}>
            <Animated.View style={animatedProgressStyles} />
        </Animated.View>
    );
};

const Carousel = ({
    onPressGetStartedButton,
    onLongPressGetStartedButton,
}: {
    onPressGetStartedButton: () => void;
    onLongPressGetStartedButton: () => void;
}) => {
    const { bottom } = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const activeIndexRef = useRef(0);
    const configManaer = useConfigContext();
    const colors = configManaer.get('themeColors');

    const { handlers, animatedStyle } = useScaleAnimation();

    const scrollToIndex = useCallback((index: number) => {
        if (index >= 0 && index < CarouselItems.length) {
            flatListRef.current?.scrollToIndex({ index, animated: true });
        }
    }, []);

    const viewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0]?.index ?? 0;
            setActiveIndex(newIndex);
            activeIndexRef.current = newIndex;
        }
    }, []);

    const viewConfig = {
        viewAreaCoveragePercentThreshold: 50,
    };

    // Setup auto-scroll functionality
    const setupAutoScroll = useCallback(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set new interval for auto scrolling
        intervalRef.current = setInterval(() => {
            const nextIndex = (activeIndexRef.current + 1) % CarouselItems.length;
            scrollToIndex(nextIndex);
        }, AUTOSCROLL_INTERVAL);
    }, []);

    // Manual navigation
    const handleDotPress = useCallback(
        (index: number) => {
            // Stop auto-scroll
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = undefined;
            }

            // Navigate to the selected slide
            scrollToIndex(index);

            // Restart auto-scroll after delay
            setTimeout(setupAutoScroll, 2000);
        },
        [scrollToIndex, setupAutoScroll],
    );

    // Initialize auto-scroll on mount
    useEffect(() => {
        setupAutoScroll();

        // Clean up on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = undefined;
            }
        };
    }, []);

    const renderItem = ({ item }: { item: (typeof CarouselItems)[0] }) => {
        return (
            <View style={tailwind.style(`w-[${SCREEN_WIDTH}px] px-6`)}>
                <Animated.Text
                    style={tailwind.style('text-[18px] font-areaNormal-extrabold text-[#313131] leading-[30px] pr-5')}>
                    {item.title}
                </Animated.Text>
                <Animated.Text
                    style={tailwind.style('text-[15px] font-areaNormal-bold text-[#656565] mt-3 leading-[29px] pr-5')}>
                    {item.description}
                </Animated.Text>
            </View>
        );
    };

    return (
        <Animated.View style={tailwind.style('bg-white', `pb-[${bottom ? bottom : 16}px]`)}>
            <FlatList
                ref={flatListRef}
                data={CarouselItems}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(_, index) => index.toString()}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                style={tailwind.style('pt-7')}
            />
            <View style={tailwind.style('flex-row pt-[26px] w-full px-6')}>
                <Animated.View style={[animatedStyle, tailwind.style('w-full')]}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Get Started button"
                        onPress={onPressGetStartedButton}
                        onLongPress={onLongPressGetStartedButton}
                        testID="get-started-button"
                        style={tailwind.style(
                            `bg-[${colors.Button_for_modes_bg}] w-full rounded-2xl justify-center items-center px-4 min-h-14`,
                        )}
                        {...handlers}>
                        <Animated.Text
                            style={tailwind.style(
                                `text-[${colors.Button_for_modes_text}] font-areaNormal-extrabold   text-[15px]`,
                            )}>
                            Get Started
                        </Animated.Text>
                    </Pressable>
                </Animated.View>
            </View>
            <Animated.View style={tailwind.style('flex-row justify-center items-center pt-[28px] mb-4')}>
                {CarouselItems.map((_, index) => (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Pagination Dot button"
                        key={index}
                        onPress={() => handleDotPress(index)}
                        testID={`pagination-dot-${index}`}>
                        <PaginationDot isActive={index === activeIndex} />
                    </Pressable>
                ))}
            </Animated.View>
        </Animated.View>
    );
};

export const MultimodalOnboarding = ({
    onPressGetStartedButton,
    onLongPressGetStartedButton,
}: {
    onPressGetStartedButton: () => void;
    onLongPressGetStartedButton: () => void;
}) => {
    const videoRef = useRef<VideoRef>(null);
    const { top } = useSafeAreaInsets();

    const onBuffer = () => {
        console.info('onBuffer');
    };
    const onError = () => {
        console.info('onError');
    };
    return (
        <Animated.View style={tailwind.style('flex-1')}>
            <VideoPlayer
                // Can be a URL or a local file.
                source={{
                    uri: require('../../../assets/videos/mt_ic_onboarding.mp4'),
                }}
                // Store reference
                videoRef={videoRef}
                shouldLoop={true}
                // Callback when remote video is buffering
                onBuffer={onBuffer}
                // Callback when the video cannot be loaded
                onError={onError}
                resizeMode="cover"
                style={tailwind.style('absolute h-full w-full')}
                containerStyle={undefined}
                fallbackElement={undefined}
                bufferingElement={undefined}
                onVideoEnd={undefined}
                autoPlay={undefined}
                bufferConfig={undefined}
                pauseVideo={undefined}
                videoControls={undefined}
                onStateChange={undefined}
                muted={undefined}
                bufferingDelay={undefined}
                enableNetworkOptimizations={undefined}
                networkOptimizationConfig={undefined}
                bufferingElementStyle={undefined}
                enablePauseOnGesture={undefined}
                showMuteControl={undefined}
                muteControlStyle={undefined}
                onGesturePress={undefined}
                handleMuteToggle={undefined}
                disableFocus={true}
                ignoreSilentSwitch={'obey'}
                preventsDisplaySleepDuringVideoPlayback={false}
            />
            <Animated.View style={tailwind.style('flex-1', `pt-[${top}px]`)}></Animated.View>
            <Carousel
                onPressGetStartedButton={onPressGetStartedButton}
                onLongPressGetStartedButton={onLongPressGetStartedButton}
            />
        </Animated.View>
    );
};
