import React, { useEffect, useRef } from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Dimensions, ImageSourcePropType } from 'react-native';

import { getIconFromType } from '../../JourneyInfoScreen/components/TransitIconWrapper';
import churchImg from '@/src-v2/assets/church.webp';
import BeachImg from '@/src-v2/assets/beach.webp';
import GrtImg from '@/src-v2/assets/grt.webp';
import GroupSvgs from '@/src-v2/assets/groupsvgs.webp';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { TransitMode } from './MultiTransitCard';
import Sparkle from '@/src-v2/multimodal/components/svg/Sparkle';
import OlympiaImg from '@/src-v2/assets/olympia.webp';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    interpolate,
    cancelAnimation,
    withTiming,
} from 'react-native-reanimated';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import { TransportationTypes } from '../../SingleModeSearch/Types';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';
export const ScrollingCards = ({
    cardDetials = [
        {
            type: 'popular',
            place: 'Annai Velankanni Shrine',
            searchItem: [
                { mode: 'Auto', busName: 'D70' },
                { mode: 'Bus', duration: 10 },
                { mode: 'Bus', duration: 10 },
            ],
            image: churchImg,
            price: 32,
            onPress: () => {},
        },
        {
            type: 'popular',
            place: 'Marina Beach, Chennai',
            searchItem: [
                { mode: 'Bus', busName: 'D70' },
                { mode: 'Metro', duration: 10 },
            ],
            image: BeachImg,
            price: 29,
            onPress: () => {},
        },
        {
            type: 'transit',
            onPress: () => {},
        },
        {
            type: 'fromto',
            onPress: () => {},
        },
        {
            type: 'recent',
            place: 'Olympia Cyberspace, Guindy',
            searchItem: [
                { mode: 'Bus', busName: 'D70' },
                { mode: 'Metro', duration: 10 },
            ],
            image: OlympiaImg,
            price: 29,
            onPress: () => {},
        },
        {
            type: 'recent',
            place: 'GRT Jewellers, Velachery',
            searchItem: [
                { mode: 'Auto', busName: 'D70' },
                { mode: 'Metro', duration: 10 },
                { mode: 'Auto', busName: 'D70' },
            ],
            image: GrtImg,
            price: 29,
            onPress: () => {},
        },
        {
            type: 'recent',
            place: 'Annai Velankanni Shrine',
            searchItem: [
                { mode: 'Auto', busName: 'D70' },
                { mode: 'Bus', duration: 10 },
                { mode: 'Bus', duration: 10 },
            ],
            image: churchImg,
            price: 45,
            onPress: () => {},
        },
        {
            type: 'recent',
            place: 'Marina Beach, Chennai',
            searchItem: [
                { mode: 'Bus', busName: 'D70' },
                { mode: 'Metro', duration: 10 },
            ],
            image: BeachImg,
            price: 29,
            onPress: () => {},
        },
        {
            type: 'transit',
            onPress: () => {},
        },
        {
            type: 'recent',
            place: 'Olympia Cyberspace, Guindy',
            searchItem: [
                { mode: 'Bus', busName: 'D70' },
                { mode: 'Metro', duration: 10 },
            ],
            image: OlympiaImg,
            price: 29,
            onPress: () => {},
        },
        {
            type: 'fromto',
            onPress: () => {},
        },
    ],
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const scrollRef = useRef(null);
    const TRANSIT_MODES = ['Bus', 'Train', 'Metro', 'Auto'];
    const { sheetAnimatedIndex, sheetAnimatedPosition } = useAnimatedContextValues(undefined);

    const { width: screenWidth } = Dimensions.get('window');

    // Shared value for translation
    const translateX = useSharedValue(screenWidth);

    useEffect(() => {
        // Cancel any existing animation first
        cancelAnimation(translateX);

        // Animate from right to left across the screen
        translateX.value = withRepeat(
            withTiming(-screenWidth * (cardDetials.length / 1.6), {
                duration: 40000,
            }),
            -1,
            false,
        );

        // Cleanup animation on unmount
        return () => {
            cancelAnimation(translateX);
        };
    }, []);

    // Animated style for horizontal movement
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: translateX.value,
                },
                {
                    translateY: sheetAnimatedPosition.value - 90,
                },
            ],
            opacity: interpolate(sheetAnimatedIndex.value, [0.8, 1], [1, 0]),
        };
    });

    return (
        <Animated.View style={[tailwind.style(' pl-5 flex-row'), animatedStyle]} ref={scrollRef}>
            {cardDetials.map((item, index) => {
                return (
                    <>
                        {item.type === 'popular' || item.type === 'recent' ? (
                            <PopularCards
                                place={item.place}
                                searchItem={(item.searchItem || []).map(search => ({
                                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                                    mode: search.mode as MultimodalTravelMode_multimodalTravelMode,
                                    busName: search.busName || '',
                                }))}
                                image={item.image}
                                price={item.price}
                                text={item.type}
                                onPress={item.onPress}
                            />
                        ) : null}
                        {item.type === 'transit' ? (
                            <Animated.View
                                style={tailwind.style(
                                    ' mr-2 px-[18px] h-[78px] bg-white border border-[#F1F2F2] rounded-[20px] flex-row justify-center items-center ',
                                )}>
                                <Animated.View
                                    style={tailwind.style('flex-row gap-[14px] justify-between items-center')}>
                                    {TRANSIT_MODES.map(mode => (
                                        <TransitMode
                                            isCompact={true}
                                            key={mode}
                                            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                                            mode={mode as TransportationTypes}
                                            onPressModes={item.onPress}
                                        />
                                    ))}
                                </Animated.View>
                            </Animated.View>
                        ) : null}

                        {item.type === 'fromto' ? (
                            <Pressable
                                accessibilityRole="button"
                                testID={`b2eb6461-eb1f-45f5-b263-14d76b00367f-${index}`}
                                accessibilityLabel="From your location to home button"
                                onPress={item.onPress}>
                                <Animated.View
                                    style={tailwind.style(
                                        'w-[256px] h-[78px] mr-2 bg-white border border-[#F1F2F2] rounded-[20px] flex-col justify-center items-center ',
                                    )}>
                                    <Animated.Image
                                        accessible={false}
                                        source={GroupSvgs}
                                        style={tailwind.style('w-[213px] h-[39px]')}
                                    />
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[10px] font-areaNormal-semibold text-[#89898A] pt-[6px]',
                                        )}>
                                        {userLanguageStrings.FromYourLocationToHome}
                                    </Animated.Text>
                                </Animated.View>
                            </Pressable>
                        ) : null}
                    </>
                );
            })}
        </Animated.View>
    );
};

const PopularCards = ({
    place = '',
    text = 'Popular',
    searchItem = [{ mode: 'Bus', busName: 'D70' }],
    price = 20,
    image = churchImg,
    onPress = () => {},
}: {
    place: string | undefined;
    text: string | undefined;
    searchItem: {
        mode: MultimodalTravelMode_multimodalTravelMode | undefined;
        busName: string | undefined;
    }[];
    price: number | undefined;
    image: ImageSourcePropType | undefined;
    onPress: (() => void) | undefined;
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${place} popular location button`}
            testID={`d6e8f9a4-a5da-4c89-a8d8-395a6e1004dd`}
            onPress={onPress}
            style={tailwind.style('flex-row justify-between items-start')}>
            <Animated.View
                style={tailwind.style(
                    'w-[246px] bg-white h-[82px] mr-2 rounded-[17px] pt-[9px] pb-3 pr-[10px] pl-[14px]',
                )}>
                <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                    <Animated.View>
                        <Animated.View style={tailwind.style('flex-row  items-center gap-[3px]')}>
                            <Icon icon={<Sparkle />} size={7} />
                            <Animated.Text
                                style={tailwind.style(
                                    ' pl-0.4 text-[#89898A] font-areaNormal-black text-[10px]  leading-[10px] uppercase pt-0.5 tracking-[0.65px]',
                                )}>
                                {text}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.View style={tailwind.style('flex flex-col items-start ')}>
                            <Animated.Text
                                numberOfLines={1}
                                style={tailwind.style(
                                    'pt-[8px] font-areaNormal-black text-[13px] text-[#3B3A3C]  max-w-[92%]',
                                )}>
                                {place}
                            </Animated.Text>
                            <Animated.View style={tailwind.style('flex-row items-end gap-[10px] mt-[7px] ')}>
                                <Animated.View
                                    style={tailwind.style(
                                        'flex flex-row gap-1 items-center px-[3.5px] bg-[#F5F5F5] rounded-[7px] h-[22px]',
                                    )}>
                                    {searchItem.map((mode, index) => {
                                        return (
                                            <Animated.View
                                                key={index}
                                                style={tailwind.style('flex flex-row items-center gap-1 ')}>
                                                {mode.mode && getIconFromType(mode.mode, 14, '#585758')}

                                                {index < searchItem.length - 1 ? (
                                                    <Animated.Text
                                                        numberOfLines={1}
                                                        style={tailwind.style(
                                                            'text-[13px] font-areaNormal-black text-[#655C6F] leading-[22px]',
                                                        )}>
                                                        +
                                                    </Animated.Text>
                                                ) : null}
                                            </Animated.View>
                                        );
                                    })}
                                </Animated.View>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] font-areaNormal-extrabold text-[#3B3A3C] pb-0.5',
                                    )}>
                                    ₹{price}
                                </Animated.Text>
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                    <Animated.View>
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel={`${place} popular location image`}
                            source={image}
                            style={tailwind.style('w-[42px] h-[42px] rounded-[8px]')}
                        />
                        <Animated.Text
                            style={tailwind.style('text-[#89898A] text-[9px] font-bold leading-[9px] pt-[8px] ')}>
                            {userLanguageStrings.Four_Two_MINS}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};
