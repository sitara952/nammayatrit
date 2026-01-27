import transitMulti from '../../../assets/3D-assets/transits/transit_multi.webp';
import BottomSheet, { BottomSheetView, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated, { withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '../../../../src/typescript/tailwindTheme/tailwind';
import { hideSplash, createAction } from '../../../../src/typescript/utils/common';
import { Icon } from '../../components/common/Icon';
import { PriceArrow } from '../../components/svg/PriceArrow';
import { Support } from '../../components/svg/Support';
import { TransitSplitSection } from './components/TransitSplitSection';
import { MultiTransitFeedbackBottomSheet } from './components/MultiTransitFeedbackBottomSheet';
import transitBus from '../../../assets/3D-assets/transits/transit_bus.webp';
import transitMetro from '../../../assets/3D-assets/transits/transit_metro.webp';
import transitSubway from '../../../assets/3D-assets/transits/transit_subway.webp';
import { MultiTransitFeedbackScreenProps } from './types';
import { FeedbackBgIcon } from '../../components/svg/FeedbackBgIcon';
import { View } from 'react-native';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { isUndefined } from 'lodash';
import { Rect } from 'react-native-svg';
import ContentLoader from '@/typescript/designSystem/components/ContentLoader';
import { canBookLeg } from '@/typescript/utils/LegStatusUtils';

export const MultiTransitFeedbackScreen: React.FC<MultiTransitFeedbackScreenProps> = props => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    useEffect(() => {
        hideSplash();
        return () => {
            try {
                bottomSheetRef.current?.close();
            } catch (error) {
                console.error(error);
            }
        };
    }, []);

    const { top, bottom } = useSafeAreaInsets();
    const transitAsset = useMemo(() => {
        const isSingle = props.isSingleTransit;
        return !isUndefined(props.uniqueMode)
            ? (() => {
                  switch (props.uniqueMode) {
                      case 'bus':
                          return { image: transitBus, width: isSingle ? 250 : 200, height: 150 };
                      case 'metro':
                          return { image: transitMetro, width: isSingle ? 250 : 200, height: 150 };
                      case 'train':
                          return { image: transitSubway, width: 200, height: 120 };
                      default:
                          return { image: transitMulti, width: 200, height: 120 };
                  }
              })()
            : { image: transitMulti, width: 200, height: 120 };
    }, [props.uniqueMode]);

    const { image: transitImage, width, height } = transitAsset;
    const CustomEnteringAnimation = () => {
        'worklet';
        // your animations
        return {
            initialValues: { transform: [{ translateX: 0 }] },
            animations: {
                transform: [{ translateX: withDelay(100, withTiming(SCREEN_WIDTH, { duration: 1000 })) }],
            },
        };
    };
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [textWidth, setTextWidth] = useState(0);

    // Add snap points for bottom sheet if you feel it is not working in small screens
    // The current implementation should work fine for both expanded and collapsed states
    // const snapPoints = useMemo(() => {
    //     return isJourneyRated ? ['25%', '50%'] : undefined;
    // }, [isJourneyRated]);

    return (
        <Animated.View style={tailwind.style('flex-1 bg-[#EBEBEB]', `pt-[${top}px]`)}>
            <View
                style={{
                    position: 'absolute',
                    top: 530,
                    width: SCREEN_WIDTH,
                    height: 331,
                    alignItems: 'center',
                }}>
                <FeedbackBgIcon />
            </View>
            <Animated.View
                entering={CustomEnteringAnimation}
                style={tailwind.style('absolute h-full w-full bg-[#EBEBEB]')}
            />
            <Pressable
                accessibilityLabel={`Need help button`}
                accessibilityRole="button"
                testID={`4269352e-6d4e-4da7-b021-2d0c3536a33c`}
                onPress={() => {
                    props.mpDispatch(createAction('NEED_HELP', undefined));
                }}
                style={tailwind.style('h-11 flex-row items-center justify-end mt-3')}>
                <View
                    style={tailwind.style(
                        'flex-row items-center mr-4 border px-[14px] py-[10px] rounded-[20px] bg-white border-[#E1E3E7]',
                    )}>
                    <Icon icon={<Support />} size={20} />
                    <Animated.Text
                        style={tailwind.style(
                            'text-[#000000] text-[14px] font-areaNormal-extrabold leading-[20px] pl-2',
                        )}>
                        {userLanguageStrings.NeedHelp_QuestionMark}
                    </Animated.Text>
                </View>
            </Pressable>
            <Animated.View style={tailwind.style('mt-6 px-4 w-full')}>
                {props.isSingleTransit ? (
                    // Single transit
                    <View
                        style={tailwind.style('items-center justify-center')}
                        accessibilityLabel={`Ride completed at ${props.finalAmount} rupees.`}>
                        <Animated.Image
                            accessible={false}
                            source={transitImage}
                            style={tailwind.style(`w-[${width}px] h-[${height}px]`)}
                            resizeMode="cover"
                        />

                        <Animated.Text style={tailwind.style('text-[16px] font-areaNormal-extrabold text-black mt-2')}>
                            {userLanguageStrings.RideCompleted}
                        </Animated.Text>
                        {props.legs && props.legs.length > 0 ? (
                            <Animated.Text style={tailwind.style('text-[36px] text-black font-areaNormal-extrabold')}>
                                ₹{props.finalAmount}
                            </Animated.Text>
                        ) : (
                            <ContentLoader height={40} width={120} style={tailwind.style('mt-2')}>
                                <Rect x="0" y="0" rx="6" ry="6" width="120" height="40" />
                            </ContentLoader>
                        )}
                    </View>
                ) : (
                    <View style={tailwind.style('flex-row justify-between items-center')}>
                        <Animated.Image
                            accessible={false}
                            source={transitImage}
                            style={tailwind.style(`w-[${width}px] h-[${height}px] -ml-6`)}
                            resizeMode="cover"
                        />
                        <View style={tailwind.style('items-end')}>
                            <Animated.Text style={tailwind.style('text-[18px] text-black font-areaNormal-extrabold')}>
                                {userLanguageStrings.TripCompleted}
                            </Animated.Text>

                            <View style={tailwind.style('flex-row gap-3 mt-1')}>
                                {Math.abs((props.finalAmount ?? 0) - (props.estimatedAmount ?? 0)) >= 1 &&
                                    !props.legs.some(leg => canBookLeg(leg)) && (
                                        <View style={tailwind.style('flex-row items-end relative pr-2')}>
                                            <Icon
                                                color="#AEAFB1"
                                                icon={
                                                    <PriceArrow fill={undefined} width={textWidth + 35} height={34} />
                                                }
                                                style={tailwind.style('absolute')}
                                            />
                                            <Animated.Text style={tailwind.style('text-[#AEAFB1] text-[30px]')}>
                                                ₹
                                            </Animated.Text>
                                            <Animated.Text
                                                style={tailwind.style('text-[#AEAFB1] text-[30px]')}
                                                onLayout={event => {
                                                    const { width } = event.nativeEvent.layout;
                                                    setTextWidth(width);
                                                }}>
                                                {props.estimatedAmount}
                                            </Animated.Text>
                                        </View>
                                    )}
                                {props.legs && props.legs.length > 0 ? (
                                    <View style={tailwind.style('flex-row items-end')}>
                                        {props.finalAmount !== 0 ? (
                                            <>
                                                <Animated.Text style={tailwind.style('text-black text-[30px]')}>
                                                    ₹
                                                </Animated.Text>
                                                <Animated.Text style={tailwind.style('text-black text-[30px]')}>
                                                    {props.finalAmount}
                                                </Animated.Text>
                                            </>
                                        ) : (
                                            <>
                                                {/* <LottieWithFallback fallback={undefined}. //TODO - once we have proper design - @AyushMittal42
                                                    style={tailwind.style('h-[75px] w-[100px]')}
                                                    autoPlay={true}
                                                    loop={false}
                                                    speed={1.5}
                                                    source={require('/typescript/assets/ny-service/success_lottie_v2.lottie')}
                                                /> */}
                                            </>
                                        )}
                                    </View>
                                ) : (
                                    <ContentLoader height={36} width={100}>
                                        <Rect x="0" y="0" rx="6" ry="6" width="100" height="36" />
                                    </ContentLoader>
                                )}
                            </View>

                            {/* {props.savedAmount ? (  //TODO - once we have the end-to-end cab fare - @AyushMittal42
                                <Animated.Text
                                    style={tailwind.style('text-black text-[14px] mt-1 font-areaNormal-bold')}>
                                    {userLanguageStrings.Youvesaved} ₹ {props.savedAmount}
                                </Animated.Text>
                            ) : null} */}
                        </View>
                    </View>
                )}
            </Animated.View>
            <TransitSplitSection
                handleOnPressFullDetails={() => props.mpDispatch(createAction('GET_FULL_JOURNEY_SUMMARY', undefined))}
                journeySummary={props.journeySummary ?? []}
                singleTransit={props.isSingleTransit}
            />
            <BottomSheet
                ref={bottomSheetRef}
                enableDynamicSizing
                style={tailwind.style('bg-white rounded-t-[20px]')}
                key={`bottom-sheet-${props.journeyId}`}>
                <BottomSheetView style={tailwind.style(`bg-white pb-[${bottom + 12}px]`)}>
                    <MultiTransitFeedbackBottomSheet
                        transcitLegRating={props.transcitLegRating}
                        fromJourney={false}
                        legs={props.legs}
                        journeyId={props.journeyId}
                        bookingDetailsFeedbackRef={null}
                        initialRating={0}
                        onRatingSubmitted={() => {}}
                    />
                </BottomSheetView>
            </BottomSheet>
        </Animated.View>
    );
};
