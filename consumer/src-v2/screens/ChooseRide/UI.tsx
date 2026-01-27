import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { CardEstimatesShimmer } from '@/typescript/designSystem/components/CardEstimates';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { RateCard } from '@/typescript/designSystem/components/RateCard';
import token from '@/typescript/designSystem/tokens';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { FareTypes, getFareType } from '@/typescript/utils/fareEntityHelper';
import { isUndefined } from 'lodash';
import {
    PricingItemType,
    selectIsPetRide,
    selectPricingItems,
    selectSelectedPricingItems,
    selectTripTypeSelection,
    TripCategory,
    setIsPetRide,
    setTripTypeSelection,
    setSelectedJourney,
} from '@/typescript/state/client/search';
import { selectSearchId, selectUserProfile } from '@/typescript/state/client/user';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { getBoolItem, MMKVKey, setBoolItem } from '@/typescript/utils/MMKV';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { BottomSheetSectionList } from '@gorhom/bottom-sheet';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageSourcePropType, StyleProp, View, ViewStyle } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import Animated, {
    Easing,
    Extrapolation,
    FadeIn,
    FadeOut,
    interpolate,
    SlideInDown,
    SlideOutUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { TimeAndDistanceMemo, TimeViewMemo } from './chooseRideComponents/TimeAndDistanceView';
import { ChooseRideViewProps } from './Types';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Shimmer from '@/src-v2/multimodal/screens/Search/components/SearchSectionListItem/Shimmer';
import MyRidesFilter from '@/typescript/assets/svg/symbols/MyRidesFilter';
import { TripTypeSelectorModal } from '@/src-v2/components/TripTypeSelectorModal';
import type { TripTypeSelection } from '@/typescript/state/client/search';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CrossIcon from '@/src-v2/assets/svg/CrossIcon';
import BusinessTrip from '@/typescript/assets/svg/symbols/BusinessTrip';
import { PetPaw } from '@/typescript/components/svg/PetPaw';

// Type-safe property access using Object.getOwnPropertyDescriptor
const getProp = (obj: object, key: string) => {
    if (obj && typeof obj === 'object') {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        if (descriptor) {
            return descriptor.value;
        }

        // Check prototype chain using recursive approach instead of mutation
        const checkPrototypeChain = (current: object | null): unknown => {
            if (!current) return undefined;

            const desc = Object.getOwnPropertyDescriptor(current, key);
            if (desc) return desc.value;

            return checkPrototypeChain(Object.getPrototypeOf(current));
        };

        return checkPrototypeChain(obj);
    }
    return undefined;
};

// Create a simple wrapper that avoids generic type constraints
const AnimatedSectionList = Animated.createAnimatedComponent(BottomSheetSectionList);

interface AlternatingImageProps {
    autoImageSrc: ImageSourcePropType;
    cabImageSrc: ImageSourcePropType;
    style?: StyleProp<ViewStyle>;
}

export const AlternatingImageComponent: FC<AlternatingImageProps> = React.memo(
    ({ autoImageSrc, cabImageSrc, style }) => {
        const animationValue = useSharedValue(0);

        useEffect(() => {
            // Start the alternating animation - smooth bouncy scale effect with natural transitions
            animationValue.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }), // Auto entering (0->1) with smooth scale
                    withTiming(1, { duration: 1000 }), // Auto holding
                    withTiming(0, { duration: 1000, easing: Easing.in(Easing.cubic) }), // Auto exiting, Cab entering (1->0) with smooth scale
                    withTiming(0, { duration: 1000 }), // Cab holding
                ),
                -1, // infinite repeat
                false, // don't reverse
            );
        }, []);

        const autoAnimatedStyle = useAnimatedStyle(() => {
            const value = animationValue.value;
            const isVisible = value > 0.5;

            const scale = (() => {
                if (value >= 0.5 && value <= 1) {
                    // Auto entering: bouncy scale from 0.8 -> 1.1 -> 1.0
                    const progress = (value - 0.5) * 2; // 0 to 1
                    if (progress <= 0.7) {
                        // First part: scale from 0.8 to 1.1 with smooth easing
                        const scaleProgress = progress / 0.7;
                        const easedProgress = 1 - Math.pow(1 - scaleProgress, 3); // ease-out cubic
                        return 0.8 + easedProgress * 0.3; // 0.8 to 1.1
                    } else {
                        // Second part: scale from 1.1 to 1.0 (bounce down)
                        const bounceProgress = (progress - 0.7) / 0.3;
                        const easedBounce = Math.pow(bounceProgress, 2); // ease-in quad for smooth settle
                        return 1.1 - easedBounce * 0.1; // 1.1 to 1.0
                    }
                } else if (value < 0.5 && value >= 0) {
                    // Auto exiting: scale down from 1 to 0.8 as value goes from 0.5 to 0
                    const progress = value * 2; // 0 to 1 for values 0 to 0.5
                    return 1 - (1 - progress) * 0.2; // scale from 1 to 0.8
                }
                return 0.8;
            })();

            return {
                opacity: isVisible ? 1 : 0,
                transform: [{ scale }],
                position: 'absolute',
                width: '100%',
                height: '100%',
            };
        });

        const cabAnimatedStyle = useAnimatedStyle(() => {
            const value = animationValue.value;
            const isVisible = value <= 0.5;

            const scale = (() => {
                if (value <= 0.5 && value >= 0) {
                    // Cab entering: bouncy scale from 0.8 -> 1.1 -> 1.0
                    const progress = (0.5 - value) * 2; // 0 to 1
                    if (progress <= 0.7) {
                        // First part: scale from 0.8 to 1.1 with smooth easing
                        const scaleProgress = progress / 0.7;
                        const easedProgress = 1 - Math.pow(1 - scaleProgress, 3); // ease-out cubic
                        return 0.8 + easedProgress * 0.3; // 0.8 to 1.1
                    } else {
                        // Second part: scale from 1.1 to 1.0 (bounce down)
                        const bounceProgress = (progress - 0.7) / 0.3;
                        const easedBounce = Math.pow(bounceProgress, 2); // ease-in quad for smooth settle
                        return 1.1 - easedBounce * 0.1; // 1.1 to 1.0
                    }
                } else if (value > 0.5 && value <= 1) {
                    // Cab exiting: scale down from 1 to 0.8 as value goes from 0.5 to 1
                    const progress = (1 - value) * 2; // 0 to 1 for values 1 to 0.5
                    return 1 - (1 - progress) * 0.2; // scale from 1 to 0.8
                }
                return 0.8;
            })();

            return {
                opacity: isVisible ? 1 : 0,
                transform: [{ scale }],
                position: 'absolute',
                width: '100%',
                height: '100%',
            };
        });

        return (
            <View style={[{ position: 'relative', width: '100%', height: '100%' }, style]}>
                <Animated.Image
                    accessible={false}
                    source={autoImageSrc}
                    style={autoAnimatedStyle}
                    resizeMode="contain"
                />
                <Animated.Image
                    accessible={false}
                    source={cabImageSrc}
                    resizeMethod={'scale'}
                    style={cabAnimatedStyle}
                    resizeMode="contain"
                />
            </View>
        );
    },
);

export const ChooseRideView: React.FC<ChooseRideViewProps> = ({
    derivedAddTipState,
    hideAccessibility,
    setHideAccessibility,
    screenReaderEnabled,
    selectedCard,
    renderPriceItem,
    distance,
    duration,
    hasMultiModalView,
    stopPolling,
    showPublicTransportAboveEstimates,
    publicTransportData,
    appConfig,
    renderPublicTransportOptions,
    sectionData,
    fareProductType,
    isAddStop,
    showRateCardModal,
    setShowRateCardModal,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { showNammaTransitOnTop } = useAppSelector(selectNewFeatureFlags);
    const { bottom } = useSafeAreaInsets();
    const { newBookingFlowSheetRef } = useRefsContext();
    const dispatch = useAppDispatch();
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const isPetRide = useAppSelector(state => selectIsPetRide(state, searchId));
    const selectedTripType = useAppSelector(state => selectTripTypeSelection(state, searchId));
    const pricingItems = useAppSelector(state => selectPricingItems(state, searchId));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, searchId));
    const estimatesLoaded = pricingItems.length > 0;
    const userProfile = useAppSelector(selectUserProfile);
    const isNormalRide = fareProductType !== 'RENTAL' && fareProductType !== 'INTERCITY';
    const isTripTypeSelectorVisible = estimatesLoaded && userProfile?.businessProfileVerified && isNormalRide;
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const cancellationCharges = selectedPricingItems[0]?.fareBreakup?.find(
        val => getFareType(val.title).name === FareTypes.CANCELLATION_CHARGES,
    )?.priceWithCurrency?.amount;
    const isCancellationFeeVisible =
        featureFlags?.customerCancellationConfig?.enableCancellationCharges &&
        !isUndefined(cancellationCharges) &&
        cancellationCharges > 0;
    const cancellationFeeHeight = isCancellationFeeVisible ? 25 : 0;
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [isBusinessRidesInfoVisible, setIsBusinessRidesInfoVisible] = useState(false);
    const filterModalRef = useRef<BottomSheetModal | null>(null);

    useEffect(() => {
        newBookingFlowSheetRef.current?.snapToIndex(0);
    }, []);

    const hasBusinessProfile =
        userProfile?.businessEmail != null &&
        userProfile?.businessProfileVerified != null &&
        userProfile?.businessProfileVerified !== false;

    useEffect(() => {
        const hasBeenDismissed = getBoolItem(MMKVKey.BUSINESS_RIDES_INFO_DISMISSED);
        if (estimatesLoaded && isTripTypeSelectorVisible && !hasBeenDismissed && hasBusinessProfile) {
            const timer = setTimeout(() => {
                setIsBusinessRidesInfoVisible(true);
            }, 500);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [estimatesLoaded, isTripTypeSelectorVisible, hasBusinessProfile]);

    useEffect(() => {
        if (isFilterModalVisible) {
            filterModalRef.current?.present();
        } else {
            filterModalRef.current?.dismiss();
        }
    }, [isFilterModalVisible]);
    const estimatesTipEnabled = useAppSelector(selectNewFeatureFlags).estimatesTipEnabled;

    const animatedPaddingBottom = useAnimatedStyle(() => {
        return {
            height: hasMultiModalView
                ? interpolate(
                      derivedAddTipState.value,
                      [0, 1],
                      [38 + 76 + cancellationFeeHeight, 90 + 76 + cancellationFeeHeight + bottom],
                      Extrapolation.CLAMP,
                  )
                : interpolate(
                      derivedAddTipState.value,
                      [0, 1],
                      [
                          38 + 40 + (estimatesTipEnabled ? 36 : 0) + cancellationFeeHeight + bottom,
                          90 + 40 + (estimatesTipEnabled ? 36 : 0) + cancellationFeeHeight + bottom,
                      ],
                      Extrapolation.CLAMP,
                  ),
        };
    });

    const renderShimmer = useCallback(() => {
        return <CardEstimatesShimmer />;
    }, []);

    const sectionHeaderRenderer = useCallback(
        (info: object) => {
            const section = getProp(info, 'section');
            const type = getProp(section, 'type');
            const title = getProp(section, 'title');

            if (type === 'MULTIMODAL' && stopPolling && !publicTransportData) return null;

            return (
                <Animated.View
                    style={tailwind.style(`flex-row justify-between bg-[${themeColors.Fill_neutralUltraLow}]`)}>
                    <Typography
                        type="subhead-2"
                        style={tailwind.style(`text-[${token?.text['text-base']}] pb-[4px]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {String(title)}
                    </Typography>
                </Animated.View>
            );
        },
        [publicTransportData, themeColors, distance, duration],
    );

    const sectionFooter = useCallback(
        (info: object) => {
            const section = getProp(info, 'section');
            const sectionType = getProp(section, 'type');
            const data = getProp(section, 'data');

            // Check if this section contains Bharat Transit cards
            const hasNammaTransit = data?.some(
                (item: PricingItemType | undefined) => item?.serviceTierName === appConfig.textConfig.publicTransitText,
            );

            // Don't add section footer if section contains Bharat Transit cards
            if ((hasNammaTransit && showNammaTransitOnTop) || !data || !data[0]) {
                return null;
            }

            if (
                (showPublicTransportAboveEstimates && sectionType === 'NORMAL') ||
                (!showPublicTransportAboveEstimates &&
                    (sectionType === 'MULTIMODAL' || (sectionData.length === 1 && sectionData[0]?.type === 'NORMAL')))
            ) {
                return <Animated.View style={[animatedPaddingBottom]} />;
            }
            return null;
        },
        [animatedPaddingBottom, showPublicTransportAboveEstimates, sectionData],
    );

    const renderItems = useCallback(
        (info: object) => {
            const section = getProp(info, 'section');
            const item = getProp(info, 'item');
            const index = getProp(info, 'index');
            const sectionData = getProp(section, 'data');
            const sectionType = getProp(section, 'type');
            if (
                sectionData &&
                sectionData[0] &&
                sectionType === 'MULTIMODAL' &&
                fareProductType !== 'INTERCITY' &&
                fareProductType !== 'RENTAL' &&
                !isAddStop
            ) {
                return renderPublicTransportOptions({ item, index });
            } else if (sectionData && sectionData[0] && sectionType === 'NORMAL') {
                return renderPriceItem({ item, index });
            }
            return renderShimmer();
        },
        [renderPublicTransportOptions, renderPriceItem, renderShimmer, isAddStop],
    );

    const handleFilterPress = () => {
        setIsFilterModalVisible(true);
    };

    const handleFilterModalClose = () => {
        filterModalRef.current?.dismiss();
    };

    const handleFilterUpdate = (tripType: TripTypeSelection, petRide: boolean) => {
        if (searchId) {
            dispatch(setTripTypeSelection({ id: searchId, payload: tripType }));
            dispatch(setIsPetRide({ id: searchId, payload: petRide }));
            if (tripType === 'BUSINESS') {
                dispatch(setSelectedJourney({ id: searchId, payload: null }));
            }
        }
        // Close modal after update
        filterModalRef.current?.dismiss();
    };

    const activeFiltersCount = useMemo(() => {
        // Add more toggle/switch button checks here in the future
        const activeFilters = [isPetRide, selectedTripType === 'BUSINESS'];
        return activeFilters.filter(Boolean).length;
    }, [isPetRide, selectedTripType]);

    const filterButtonBorderColor = activeFiltersCount > 0 ? '#000000' : themeColors.Border_neutralMidLow;

    // Animation for filter button text rotation - using same pattern as useAnimationFlipper
    const [currentAnimationStep, setCurrentAnimationStep] = useState(0);
    const [showFilterIcon, setShowFilterIcon] = useState(false);
    const buttonWidth = useSharedValue(120);
    const isAnimatingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Animation steps: 0 = Business ride (conditional), 1 = Pet ride, 2 = Ride filters, 3 = Show icon
    type IconType = 'business' | 'pet' | 'filter';
    type AnimationStep = { text: string | undefined; iconType: IconType };

    const animationSteps = useMemo<AnimationStep[]>(() => {
        // Only include business ride if user has business profile
        const businessStep: AnimationStep[] = hasBusinessProfile
            ? [{ text: userLanguageStrings.BusinessRide, iconType: 'business' }]
            : [];
        // Always include pet ride and ride filter
        const commonSteps: AnimationStep[] = [
            { text: userLanguageStrings.PetRide, iconType: 'pet' },
            { text: userLanguageStrings.RideFilter, iconType: 'filter' },
        ];
        return [...businessStep, ...commonSteps];
    }, [userLanguageStrings, hasBusinessProfile]);

    const animationStepsLength = useMemo(() => animationSteps.length, [animationSteps]);

    // Get current step data for rendering
    const currentStepData = useMemo(() => {
        if (currentAnimationStep < animationStepsLength) {
            return animationSteps[currentAnimationStep];
        }
        return null;
    }, [currentAnimationStep, animationSteps, animationStepsLength]);

    useEffect(() => {
        if (!estimatesLoaded || showFilterIcon) {
            return undefined;
        }

        if (isAnimatingRef.current) {
            return undefined;
        }

        isAnimatingRef.current = true;
        const stepDuration = 1000;

        const animateStep = (step: number) => {
            if (step >= animationStepsLength) {
                // After all steps, shrink button and show the filter icon
                buttonWidth.value = withTiming(40, {
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                });
                setShowFilterIcon(true);
                isAnimatingRef.current = false;
                return;
            }

            setCurrentAnimationStep(step);

            // Move to next step after showing current text for stepDuration
            timeoutRef.current = setTimeout(() => {
                animateStep(step + 1);
            }, stepDuration);

            return undefined;
        };

        // Start animation after a delay to allow estimates to fully load
        const startTimeout = setTimeout(() => {
            animateStep(0);
        }, 300);

        return () => {
            clearTimeout(startTimeout);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            isAnimatingRef.current = false;
        };
    }, [estimatesLoaded, showFilterIcon, animationStepsLength]);

    // Animated style for button width
    const buttonWidthAnimatedStyle = useAnimatedStyle(() => {
        return {
            width: buttonWidth.value,
        };
    });

    const handleCloseBusinessRidesInfo = () => {
        setIsBusinessRidesInfoVisible(false);
        setBoolItem(MMKVKey.BUSINESS_RIDES_INFO_DISMISSED, true);
    };

    return (
        <Animated.View style={{ height: '100%' }}>
            {/* Header with "Choose a ride" and Filter button */}
            <Animated.View
                entering={FadeIn.delay(50)}
                exiting={FadeOut.duration(100)}
                style={tailwind.style(`px-[${token?.spacing?.[16]}] pt-[5px] pb-[12px]`)}>
                <View style={tailwind.style('flex-row items-center justify-between')}>
                    <View style={tailwind.style('flex-1')}>
                        <Typography
                            type="body-7"
                            style={tailwind.style(`text-[${themeColors.Text_neutralMax}] text-base`)}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.ChooseARide}
                        </Typography>
                        {estimatesLoaded ? (
                            <View style={tailwind.style('mt-[4px]')}>
                                {(distance && !showNammaTransitOnTop) ||
                                (distance &&
                                    showNammaTransitOnTop &&
                                    !pricingItems?.some(
                                        (item: PricingItemType | undefined) =>
                                            item?.serviceTierName === appConfig.textConfig.publicTransitText,
                                    )) ? (
                                    <TimeAndDistanceMemo distance={distance} duration={duration} />
                                ) : (publicTransportData?.[0]?.type === 'MULTIMODAL' && !showNammaTransitOnTop) ||
                                  (publicTransportData?.[0]?.type === 'MULTIMODAL' &&
                                      showNammaTransitOnTop &&
                                      !pricingItems?.some(
                                          (item: PricingItemType | undefined) =>
                                              item?.serviceTierName === appConfig.textConfig.publicTransitText,
                                      )) ? (
                                    <TimeViewMemo
                                        duration={publicTransportData?.[0]?.data?.[0]?.duration || duration}
                                    />
                                ) : null}
                            </View>
                        ) : (
                            <View style={tailwind.style('mt-[4px]')}>
                                <Shimmer width={120} height={16} borderRadius={8} backgroundColor="#E0E0E0" />
                            </View>
                        )}
                    </View>
                    {isNormalRide && (
                        <>
                            {estimatesLoaded ? (
                                <Tooltip
                                    isVisible={isBusinessRidesInfoVisible}
                                    content={
                                        <View testID="business_rides_info_popup" style={{ width: 280 }}>
                                            {/* Close Button */}
                                            <TouchableOpacity
                                                testID="business_rides_info_close_button"
                                                onPress={handleCloseBusinessRidesInfo}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    width: 24,
                                                    height: 24,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    zIndex: 10,
                                                }}
                                                accessible={true}
                                                accessibilityRole="button"
                                                accessibilityLabel="Close">
                                                <CrossIcon fill="#3B3A3C" />
                                            </TouchableOpacity>

                                            <Typography
                                                type="body-1"
                                                style={tailwind.style(
                                                    `text-[${themeColors.Text_neutralMax}] text-[14px] mb-[8px] pr-[32px]`,
                                                )}
                                                numberOfLines={undefined}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {userLanguageStrings.TapHereForBusinessRides}
                                            </Typography>

                                            <Typography
                                                type="body-1"
                                                style={tailwind.style(`text-[#656565] text-[14px]`)}
                                                numberOfLines={undefined}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {userLanguageStrings.SwitchProfilesAndAdjustFiltersForSmoothRide}
                                            </Typography>
                                        </View>
                                    }
                                    placement="top"
                                    onClose={handleCloseBusinessRidesInfo}
                                    showChildInTooltip={false}
                                    topAdjustment={-20}
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 10,
                                        padding: 20,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 8,
                                    }}
                                    backgroundColor="rgba(0, 0, 0, 0.6)">
                                    <View style={{ position: 'relative' }}>
                                        <Animated.View style={buttonWidthAnimatedStyle}>
                                            <TouchableOpacity
                                                testID="choose_ride_filter_button"
                                                onPress={handleFilterPress}
                                                accessible={true}
                                                accessibilityRole="button"
                                                accessibilityLabel="Filter rides"
                                                style={[
                                                    tailwind.style(
                                                        `h-[40px] items-center justify-center rounded-[${token?.corner?.md}] border overflow-hidden`,
                                                    ),
                                                    {
                                                        borderColor: filterButtonBorderColor,
                                                        borderWidth: 1,
                                                        width: '100%',
                                                    },
                                                ]}>
                                                {showFilterIcon ? (
                                                    <MyRidesFilter color={themeColors.Text_neutralMax} size={15} />
                                                ) : (
                                                    <View
                                                        style={{
                                                            position: 'relative',
                                                            width: '100%',
                                                            height: '100%',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            overflow: 'hidden',
                                                        }}>
                                                        {currentStepData && currentStepData.text && (
                                                            <Animated.View
                                                                entering={SlideInDown.duration(400).easing(
                                                                    Easing.out(Easing.cubic),
                                                                )}
                                                                exiting={SlideOutUp.duration(400).easing(
                                                                    Easing.in(Easing.cubic),
                                                                )}
                                                                key={`step-${currentAnimationStep}-${currentStepData.text}`}
                                                                style={{
                                                                    position: 'absolute',
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: 4,
                                                                    width: '100%',
                                                                    height: '100%',
                                                                }}>
                                                                {currentStepData.iconType === 'business' && (
                                                                    <View
                                                                        style={{
                                                                            width: 20,
                                                                            height: 20,
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center',
                                                                        }}>
                                                                        <BusinessTrip
                                                                            color={themeColors.Text_neutralMax}
                                                                            backgroundColor="transparent"
                                                                        />
                                                                    </View>
                                                                )}
                                                                {currentStepData.iconType === 'pet' && (
                                                                    <View
                                                                        style={{
                                                                            width: 14,
                                                                            height: 14,
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center',
                                                                        }}>
                                                                        <PetPaw fill={themeColors.Text_neutralMax} />
                                                                    </View>
                                                                )}
                                                                {currentStepData.iconType === 'filter' && (
                                                                    <View
                                                                        style={{
                                                                            width: 14,
                                                                            height: 14,
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center',
                                                                        }}>
                                                                        <MyRidesFilter
                                                                            color={themeColors.Text_neutralMax}
                                                                            size={14}
                                                                        />
                                                                    </View>
                                                                )}
                                                                <Typography
                                                                    type="body-7"
                                                                    style={tailwind.style(
                                                                        `text-[${themeColors.Text_neutralMax}] text-[12px]`,
                                                                    )}
                                                                    numberOfLines={1}
                                                                    isAnimate={undefined}
                                                                    accessible={false}
                                                                    accessibilityLabel={undefined}
                                                                    accessibilityRole={undefined}>
                                                                    {currentStepData.text}
                                                                </Typography>
                                                            </Animated.View>
                                                        )}
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        </Animated.View>
                                        {activeFiltersCount > 0 && (
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    top: -4,
                                                    right: -8,
                                                    backgroundColor: '#000000',
                                                    borderRadius: 15,
                                                    minWidth: 20,
                                                    height: 20,
                                                    paddingHorizontal: 6,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    borderWidth: 2,
                                                    borderColor: '#FFFFFF',
                                                }}>
                                                <Typography
                                                    type="body-5"
                                                    style={[
                                                        tailwind.style('text-white text-[12px]'),
                                                        { lineHeight: 14 },
                                                    ]}
                                                    numberOfLines={1}
                                                    isAnimate={undefined}
                                                    accessible={false}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {activeFiltersCount.toString()}
                                                </Typography>
                                            </View>
                                        )}
                                    </View>
                                </Tooltip>
                            ) : (
                                <View style={tailwind.style('ml-[12px]')}>
                                    <Shimmer width={40} height={40} borderRadius={8} backgroundColor="#E0E0E0" />
                                </View>
                            )}
                        </>
                    )}
                </View>
            </Animated.View>
            <View
                style={tailwind.style(
                    `h-[1px] bg-[${themeColors.Border_neutralMidLow}] mx-[${token?.spacing?.[16]}] mb-[12px]`,
                )}
            />
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut.duration(100)}
                accessibilityElementsHidden={hideAccessibility}
                style={{ flex: 1 }}
                importantForAccessibility={hideAccessibility ? 'no-hide-descendants' : 'yes'}>
                <AnimatedSectionList
                    maxToRenderPerBatch={5}
                    initialNumToRender={5}
                    windowSize={2}
                    directionalLockEnabled={true}
                    sections={sectionData}
                    keyExtractor={(_item, index) => {
                        return index.toString();
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    style={tailwind.style(`px-[${token?.spacing?.[16]}]`)}
                    contentContainerStyle={[{ gap: 8 }]}
                    renderItem={renderItems}
                    renderSectionHeader={sectionHeaderRenderer}
                    renderSectionFooter={sectionFooter}
                />
            </Animated.View>
            <AnimatedModal
                visible={showRateCardModal}
                setVisible={setShowRateCardModal}
                contentStyle={{ backgroundColor: 'transparent' }}
                showCloseButton={true}
                onClose={() => {
                    if (screenReaderEnabled) {
                        setHideAccessibility(false);
                    }
                }}>
                <RateCard
                    serviceTier={selectedCard?.serviceTierName ?? ''}
                    fareItems={selectedCard?.fareBreakup ?? []}
                    onClose={() => setShowRateCardModal(false)}
                    isIntercityOrRental={
                        selectedCard?.tripCategory === TripCategory.InterCity ||
                        selectedCard?.tripCategory === TripCategory.Rental
                    }
                    isRoundTrip={selectedCard?.isRoundTrip ?? false}
                    isPetRide={isPetRide}
                    selectedTripType={selectedTripType}
                    businessDiscountInfo={selectedCard?.businessDiscountInfo}
                />
            </AnimatedModal>
            {estimatesLoaded && (
                <PopUpModal
                    sheetRef={filterModalRef}
                    enableDynamicSizing={true}
                    showBackdrop={undefined}
                    onDismiss={() => {
                        setIsFilterModalVisible(false);
                    }}
                    onHardwareBackPress={undefined}
                    isScrollable={true}
                    activeOffsetX={undefined}
                    activeOffsetY={undefined}
                    failOffsetY={undefined}
                    failOffsetX={undefined}
                    simultaneousHandlers={undefined}
                    waitFor={undefined}>
                    <TripTypeSelectorModal
                        onClose={handleFilterModalClose}
                        selectedTripType={selectedTripType}
                        isPetRide={isPetRide}
                        onUpdate={handleFilterUpdate}
                        searchId={searchId}
                        showTripTypeSelector={isTripTypeSelectorVisible ?? false}
                    />
                </PopUpModal>
            )}
        </Animated.View>
    );
};
