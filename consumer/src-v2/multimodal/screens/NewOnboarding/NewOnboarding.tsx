import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, ListRenderItem, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ReactVideoSourceProperties, VideoRef } from 'react-native-video';
import { tailwind } from '../../../tailwind-theme/tailwind';
import { OnboardingIndicator } from './GettingStartedButton';
import { VideoPlayer } from '@/src-v2/components/VideoPlayer';
import NewOboarding_1 from '@/src-v2/assets/onboardingScreens/mt_ic_onboarding_1.webp';
import NewOboarding_2 from '@/src-v2/assets/onboardingScreens/mt_ic_onboarding_2.webp';
import NewOboarding_3 from '@/src-v2/assets/onboardingScreens/mt_ic_onboarding_3.webp';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const { width: screenWidth } = Dimensions.get('window');

const CarouselItems = [
    {
        id: 0,
        videoFile: {
            uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/onboardingVideos/vid-mt_ic_onboarding_1-1753358920646.mp4',
        },
        fallbackElement: (
            <Image
                accessible={false}
                source={NewOboarding_1}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
            />
        ),
    },
    {
        id: 1,
        videoFile: {
            uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/onboardingVideos/vid-mt_ic_onboarding_2-1753358923505.mp4',
        },
        fallbackElement: (
            <Image
                accessible={false}
                accessibilityLabel="onboarding 2"
                source={NewOboarding_2}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
            />
        ),
    },
    {
        id: 2,
        videoFile: {
            uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/onboardingVideos/vid-mt_ic_onboarding_3-1753358926235.mp4',
        },
        fallbackElement: (
            <Image
                accessible={false}
                accessibilityLabel="onboarding 3"
                source={NewOboarding_3}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
            />
        ),
    },
];

interface CarouselItem {
    id: number;
    videoFile: ReactVideoSourceProperties;
    fallbackElement: React.ReactNode;
}

type NewOnboardingProps = {
    onPressGetStartedButton: () => void;
};

const NewOnboarding = ({ onPressGetStartedButton }: NewOnboardingProps) => {
    const flatListRef = useRef<FlatList>(null);
    const videoRefs = useRef<{ [key: number]: VideoRef | null }>({});
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { bottom } = useSafeAreaInsets();

    // Handle scroll end to update selected index
    const onMomentumScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            if (newIndex !== selectedIndex) {
                setSelectedIndex(newIndex);
                // Restart video when index changes
                const videoRef = videoRefs.current[newIndex];
                if (videoRef) {
                    videoRef.seek(0);
                }
            }
        },
        [selectedIndex],
    );

    // Handle indicator button press
    const onIndicatorChange = useCallback((index: number) => {
        setSelectedIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
        // Restart video when manually selecting
        setTimeout(() => {
            const videoRef = videoRefs.current[index];
            if (videoRef) {
                videoRef.seek(0);
            }
        }, 300); // Small delay to ensure scroll animation completes
    }, []);

    const renderCarouselItem: ListRenderItem<CarouselItem> = useCallback(
        ({ item, index }) => {
            return (
                <Animated.View style={[tailwind.style('flex-1'), { width: screenWidth }]}>
                    <VideoPlayer
                        source={item.videoFile}
                        videoRef={videoRefs.current[index]}
                        shouldLoop={true}
                        style={tailwind.style('absolute h-full w-full')}
                        resizeMode="cover"
                        pauseVideo={selectedIndex !== index} // Only play current video
                        containerStyle={undefined}
                        fallbackElement={item.fallbackElement}
                        bufferingElement={item.fallbackElement}
                        onVideoEnd={undefined}
                        autoPlay={undefined}
                        bufferConfig={undefined}
                        videoControls={undefined}
                        onStateChange={undefined}
                        onError={undefined}
                        muted={undefined}
                        bufferingDelay={undefined}
                        enableNetworkOptimizations={undefined}
                        networkOptimizationConfig={undefined}
                        onBuffer={undefined}
                        bufferingElementStyle={tailwind.style('w-full h-full')}
                        enablePauseOnGesture={undefined}
                        showMuteControl={undefined}
                        muteControlStyle={undefined}
                        onGesturePress={undefined}
                        handleMuteToggle={undefined}
                        disableFocus={true}
                        ignoreSilentSwitch={'obey'}
                        preventsDisplaySleepDuringVideoPlayback={false}
                    />
                </Animated.View>
            );
        },
        [selectedIndex],
    );

    const keyExtractor = useCallback((item: CarouselItem) => item.id.toString(), []);

    return (
        <Animated.View entering={FadeIn} style={tailwind.style('flex-1')}>
            <FlatList
                ref={flatListRef}
                data={CarouselItems}
                renderItem={renderCarouselItem}
                keyExtractor={keyExtractor}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onMomentumScrollEnd}
                scrollEventThrottle={16}
                decelerationRate="fast"
                bounces={false}
            />
            <Animated.View style={tailwind.style('absolute px-11', `bottom-[${bottom}px] w-[${SCREEN_WIDTH}px]`)}>
                <OnboardingIndicator
                    onPressGetStartedButton={onPressGetStartedButton}
                    data={CarouselItems.map((_, index: number) => index)}
                    onChange={onIndicatorChange}
                    selectedIndex={selectedIndex}
                />
            </Animated.View>
        </Animated.View>
    );
};

export default NewOnboarding;
