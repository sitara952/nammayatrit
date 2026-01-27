import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import Button from '@/src-v2/primitives/Button';
import { createAction } from '@/typescript/utils/common';
import BottomSheet, { BottomSheetScrollView, BottomSheetView, SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Animated, {
    interpolateColor,
    LinearTransition,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '../../../tailwind-theme/tailwind';
import { TransitType } from '@/src-v2/multimodal/components/PublicTransportCard/types';
import AutoInfoPopUp from './components/AutoInfoPopUp';
import { MetroTransitCell } from './components/MetroTransitCell';
import SwitchPopUp from './components/SwitchPopUp';
import { WalkTransitCell } from './components/WalkTransitCell';
import { JourneyDetailScreenAction, JourneyDetailScreenProps, PopUpType } from './Types';

import { availableRoutesByTier } from '@/readOnly/api/types/AvailableRoutesByTier.gen';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';
import { legServiceTierOptionsResp } from '@/readOnly/api/types/LegServiceTierOptionsResp.gen';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { ChooseRideFlow } from '@/src-v2/screens/ChooseRide/Flow';
import LeftArrow from '@/typescript/assets/svg/direction/LeftArrow';
import CrossIcon from '@/typescript/assets/svg/symbols/Cross';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext.tsx';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { Resolver } from '@/typescript/utils/common';
import { getTransitType } from '@/typescript/utils/MultiModal';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { Platform, View } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import RecenterButton from '../../../../src/typescript/designSystem/components/RecenterButton';
import Shimmer from '../Search/components/SearchSectionListItem/Shimmer';
import { TransportServiceTierCard } from './components/TransportServiceTierCard';

import { PTReviewHeader } from './components/PTReviewHeader';
import { TrainTransitCell } from './components/TrainTransitCell';
import DirectBusBookingFlow from './DirectBooking/Flow';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { BusTransitCellFlow } from './components/BusTransitCell/Flow';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { transportRoute } from '@/readOnly/api/types/PublicTransportData.gen';
import { calculateEndTime, findNextAvailableTime, getLastStopForMetroLeg } from './utils';
import useOnBottomSheetAnimate from '@/typescript/hooks/useOnBottomSheetAnimate';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import destinationArrivalTime from '@/typescript/assets/destination_arrival_time.webp';
import { mmEstimateRouteType } from '@/typescript/Maps/MapType';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { Icon } from '@/typescript/components/Icon';
import { formatTimeFromSeconds, convertUTCtoIST } from '@/src-v2/utils/common';
import { NewTimeTableUIProps } from '@/src-v2/multimodal/screens/NewTimeTable/types';
import { ViaPointsModal } from './components/ViaPointsModal';
import { RouteOptionCardProps } from './components/RouteOptionCard';

import { logger } from '@/src-v2/systems/logger';
import { createJourneyId } from '@/typescript/state/client/user';
import BusRouteSelectionView from './components/BusRouteSelectionView';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import { DisclaimerBox } from './components/DisclaimerBox';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import { MultimodalWarningPopup } from './components/MultimodalWarningPopup';
import { homeSheetBg } from '@/src-v2/screens/HomeScreen/HomeScreenFragment';
import { useMetroSubwayServiceability } from '@/src-v2/multimodal/hooks/useMetroSubwayServiceability';
import { calculateTotalTickets, LegCategorySelections } from '../../components/JourneyPayment/Types';
import { calculateTotalFareForLeg } from '../../components/JourneyPayment/journeyPaymentUtils';

const SkeletonLoader = React.memo(() => {
    return (
        <View style={tailwind?.style(`h-[500px]`)}>
            {Array.from({ length: 4 }, (_, index) => (
                <React.Fragment key={index}>
                    <Animated.View style={tailwind.style('flex-row h-[126px] gap-x-4 px-4 my-2')}>
                        <Animated.View style={tailwind.style('w-full rounded-[16px] bg-white')}>
                            <View style={tailwind.style('flex-row h-[126px] gap-x-4 px-4')}>
                                <View style={tailwind.style('flex-row gap-x-2')}>
                                    <Animated.View style={tailwind.style('mt-[13px]')}>
                                        <Shimmer
                                            finalOpacity={1}
                                            height={100}
                                            width={100}
                                            borderRadius={10}
                                            backgroundColor={'#CFCFD580'}
                                        />
                                    </Animated.View>
                                    <Animated.View style={tailwind.style('gap-y-2 mt-8')}>
                                        <Shimmer
                                            finalOpacity={1}
                                            height={20}
                                            width={150}
                                            borderRadius={10}
                                            backgroundColor={'#CFCFD580'}
                                        />
                                        <Shimmer
                                            finalOpacity={1}
                                            height={20}
                                            width={170}
                                            borderRadius={10}
                                            backgroundColor={'#CFCFD580'}
                                        />
                                    </Animated.View>
                                </View>
                            </View>
                        </Animated.View>
                    </Animated.View>
                </React.Fragment>
            ))}
        </View>
    );
});

const JourneyLegs = React.memo(
    ({
        legs,
        mpDispatch,
        loadingDataForLeg,
        skippedLegOrders,
        appName,
        journeyMapData,
        onViewTimetable,
        nextTwoArrivalTimes,
        firstArrivalTime,
        timeTableData,
        legCategorySelections,
        fromJourneyInfoScreen,
        transformedRouteOptions,
        handleOnConfirmRoute,
        isLoading,
        handleConfirmBusChange,
        journeyId,
    }: {
        legs: legInfo[];
        mpDispatch: Resolver<JourneyDetailScreenAction>;
        loadingDataForLeg: number | null;
        skippedLegOrders: Record<number, boolean>;
        appName: string;
        journeyMapData: Record<number, mmEstimateRouteType | mmEstimateRouteType[]>;
        onViewTimetable: (mode: VehicleCategory_vehicleCategory | undefined) => void;
        nextTwoArrivalTimes: Record<number, number[]> | undefined;
        firstArrivalTime: Record<number, string | undefined>;
        legCategorySelections: LegCategorySelections;
        timeTableData: Record<number, NewTimeTableUIProps> | undefined;
        fromJourneyInfoScreen: boolean;
        transformedRouteOptions: RouteOptionCardProps[] | undefined;
        handleOnConfirmRoute: (
            legOrder: number | undefined,
            sourceCode: string | undefined,
            destinationCode: string | undefined,
        ) => void;
        isLoading: boolean;
        handleConfirmBusChange: ((routeInfo: availableRoute, legOrder?: number) => Promise<unknown>) | undefined;
        journeyId: string | undefined;
    }) => {
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');
        const totalTicketCount = calculateTotalTickets(legCategorySelections);
        return (
            <View>
                {legs.map((leg: legInfo, index) => {
                    const isLastCell = index === legs.length - 1;
                    const isSkipped = skippedLegOrders[leg.order] || false;
                    const isDataLoading = leg.order === loadingDataForLeg;
                    const legCategorySelection = legCategorySelections.find(
                        selection => selection.legOrder === leg.order,
                    );
                    const legFinalFare = legCategorySelection
                        ? calculateTotalFareForLeg(legCategorySelection.categories, legCategorySelection.selections)
                        : 0;
                    // Get lastStop data for Metro legs from journeyMapData
                    const lastStopName = getLastStopForMetroLeg(journeyMapData, leg.order);

                    switch (leg?.travelMode) {
                        case 'Walk':
                        case 'Taxi':
                            return (
                                <WalkTransitCell
                                    key={leg.order}
                                    isLastCell={isLastCell}
                                    legInfo={leg}
                                    mpDispatch={mpDispatch}
                                    isDataLoading={isDataLoading}
                                    isSkipped={isSkipped}
                                    walkOrAutoTime={formatTimeFromSeconds(
                                        leg.estimatedDuration || 0,
                                        true,
                                        userLanguageStrings,
                                    )}
                                />
                            );
                        case 'Metro':
                            return (
                                <MetroTransitCell
                                    ticketState={'review'}
                                    key={leg.order}
                                    isLastCell={isLastCell}
                                    legInfo={leg}
                                    appName={appName}
                                    onBookButtonClick={() => {}}
                                    lastStopName={lastStopName}
                                    onViewTimetable={() => onViewTimetable('METRO')}
                                    nextTwoArrivalTimes={nextTwoArrivalTimes?.[leg.order]}
                                    firstArrivalTime={firstArrivalTime?.[leg.order]}
                                    timeTableData={timeTableData?.[leg.order]}
                                    finalFare={legFinalFare}
                                    isSingleMode={undefined}
                                    transitTime={formatTimeFromSeconds(
                                        leg.estimatedDuration || 0,
                                        true,
                                        userLanguageStrings,
                                    )}
                                    journeyMapData={journeyMapData}
                                    onConfirmRoute={handleOnConfirmRoute}
                                    isDataLoading={isDataLoading}
                                    showMetroOptions={true}
                                    entryStationName={undefined}
                                    handleEditPress={() => {}}
                                />
                            );
                        case 'Bus':
                            return (
                                <BusTransitCellFlow
                                    key={leg.order}
                                    isLastCell={isLastCell}
                                    legInfo={leg}
                                    onClassChange={() =>
                                        mpDispatch(createAction('SHOW_SWITCH_BUS_ROUTE_MODAL', { legOrder: leg.order }))
                                    }
                                    isDataLoading={isDataLoading}
                                    fromJourneyInfoScreen={fromJourneyInfoScreen}
                                    transitTime={formatTimeFromSeconds(
                                        leg.estimatedDuration || 0,
                                        true,
                                        userLanguageStrings,
                                    )}
                                    onBusRouteSwitch={handleConfirmBusChange}
                                    journeyId={journeyId}
                                    totalTicketCount={totalTicketCount}
                                />
                            );
                        case 'Subway':
                            return (
                                <TrainTransitCell
                                    ticketState={'review'}
                                    key={leg.order}
                                    finalFare={legFinalFare}
                                    isLastCell={isLastCell}
                                    legInfo={leg}
                                    isDataLoading={isDataLoading}
                                    onClassChange={() =>
                                        mpDispatch(createAction('SHOW_VEHICLE_TIER_OPTIONS', { legOrder: leg.order }))
                                    }
                                    onViewTimetable={() => onViewTimetable('SUBWAY')}
                                    nextTwoArrivalTimes={nextTwoArrivalTimes?.[leg.order]}
                                    firstArrivalTime={firstArrivalTime?.[leg.order]}
                                    timeTableData={timeTableData?.[leg.order]}
                                    onViaChangePress={() =>
                                        mpDispatch(createAction('SHOW_VIA_POINTS_MODAL', { legOrder: leg.order }))
                                    }
                                    transitTime={formatTimeFromSeconds(
                                        leg.estimatedDuration || 0,
                                        true,
                                        userLanguageStrings,
                                    )}
                                    tranformedRouteOptions={transformedRouteOptions}
                                    isLoading={isLoading}
                                />
                            );
                        default:
                            return null;
                    }
                })}
            </View>
        );
    },
);

const BusOptionsShimmer = () => {
    return (
        <Animated.View style={tailwind.style('p-4')}>
            <Animated.View style={tailwind.style('h-6 w-48 bg-gray-200 rounded mb-4')} />
            {[1, 2, 3].map((_, index) => (
                <Animated.View key={index} style={tailwind.style('mb-4')}>
                    <Animated.View style={tailwind.style('h-20 bg-gray-200 rounded-lg')} />
                </Animated.View>
            ))}
        </Animated.View>
    );
};

const TierOptionItem = React.memo(
    ({
        option,
        isSelected,
        onPress,
        isFetchingTierOptions,
        type,
        getRouteByCode,
        nextAvailableTimings,
    }: {
        option: availableRoutesByTier;
        isSelected: boolean;
        onPress: () => void;
        isFetchingTierOptions: boolean;
        type: TransitType | undefined;
        getRouteByCode: (code: string) => transportRoute | undefined;
        nextAvailableTimings: string[][] | undefined;
    }) => {
        const derivedSelectedValue = useDerivedValue(() => {
            return isSelected
                ? withSpring(1, { damping: 48, stiffness: 480 })
                : withSpring(0, { damping: 48, stiffness: 480 });
        });
        const animatedSelectedStyle = useAnimatedStyle(() => {
            return {
                borderColor: interpolateColor(derivedSelectedValue.value, [0, 1], ['#F1F2F2', '#1F67CB']),
            };
        });
        const trainNumber = option.availableRoutes?.[0];
        const route = useMemo(
            () => (trainNumber ? getRouteByCode(trainNumber) : undefined),
            [trainNumber, getRouteByCode],
        );
        const nextAvailableTime = useMemo(() => {
            const timings = findNextAvailableTime(nextAvailableTimings ?? []);
            return timings?.[0] || '';
        }, [nextAvailableTimings]);

        const tapGesture = Gesture.Tap().onEnd(() => {
            runOnJS(onPress)();
        });

        return (
            <GestureDetector gesture={tapGesture}>
                <Animated.View style={[tailwind.style(`mb-4 rounded-[20px] border-[2px]`), animatedSelectedStyle]}>
                    <TransportServiceTierCard
                        type={type}
                        serviceTierName={option.serviceTierName}
                        serviceTier={option.serviceTier}
                        frequency={Math.round(Math.min(...option.nextAvailableBuses) / 60)}
                        price={option.fare?.amount}
                        busDataSource={option.source}
                        busList={option.availableRoutes}
                        trainNumber={trainNumber}
                        routeName={route?.shortName}
                        isFetchingTierOptions={isFetchingTierOptions}
                        trainArrivalOrDepartureTimeText={nextAvailableTime}
                    />
                </Animated.View>
            </GestureDetector>
        );
    },
);

const TierOptions = React.memo(
    ({
        tierOptionsResp,
        selectedTier,
        isFetchingTierOptions,
        getRouteByCode,
        mpDispatch,
        type,
    }: {
        tierOptionsResp: legServiceTierOptionsResp | undefined;
        selectedTier: availableRoutesByTier | undefined;
        isFetchingTierOptions: boolean;
        getRouteByCode: (code: string) => transportRoute | undefined;
        mpDispatch: Resolver<JourneyDetailScreenAction>;
        type: TransitType | undefined;
    }) => {
        return (
            <>
                {tierOptionsResp?.options
                    .filter(option => option.via === selectedTier?.via)
                    .map((option, index) => (
                        <TierOptionItem
                            key={index}
                            option={option}
                            nextAvailableTimings={selectedTier?.nextAvailableTimings}
                            isSelected={selectedTier === option}
                            onPress={() => mpDispatch(createAction('SELECT_VEHICLE_TIER', { legTier: option }))}
                            isFetchingTierOptions={isFetchingTierOptions}
                            getRouteByCode={getRouteByCode}
                            type={type}
                        />
                    ))}
            </>
        );
    },
);

// Utility function to convert UTC time to IST using dayjs
const convertUTCToIST = (utcTimeString: string | undefined): string => {
    if (!utcTimeString) return '';

    try {
        return convertUTCtoIST(utcTimeString, 'hh:mm A');
    } catch (error) {
        console.error('Error converting UTC to IST:', error);
        return utcTimeString; // Return original string if conversion fails
    }
};

export const PublicTransitOverview = (props: JourneyDetailScreenProps) => {
    const { bottom, top } = useSafeAreaInsets();

    const {
        journeyInfo,
        mpDispatch,
        destination,
        popUpType,
        confirmEnable,
        selectedMultimodalLeg,
        navigation,
        skippedLegOrders,
        loadingDataForLeg,
        source,
        isSingleMode,
        getRouteByCode,
        legCount,
        vehicleLegToSwitch,
        journeySegments,
        fetchingLegsFare,
        journeyMapData,
        appName,
        selectedPricingItem,
        switchModeLoading,
        nextTwoArrivalTimes,
        firstArrivalTime,
        onViewTimetable,
        timeSavedByMultimodal,
        transformedRouteOptions,
        handleOnConfirmRoute,
        totalFare,
        switchToAuto,
        sourceInfo,
        legRideOptionsPopup,
        isTicketModalOpen = false,
        isSwitchPopupOpen = false,
        setIsSwitchPopupOpen,
        isFetchingVehicleTierOptions,
        handleConfirmBusChange,
    } = props;
    const {
        rideOptionModalRef,
        multimodalJourneyInfoSheetRef,
        autoInfoModalRef,
        vehicleOptionsModalRef,
        viaPointsModalRef,
    } = useRefsContext();

    const mainContentRef = useRef<View>(null);
    const vehicleOptionsRef = useRef<View>(null);
    const accessibilityManager = useAccessibilityFocus({
        mainContentRef,
        focusDelay: 100,
        accessibilityDelay: 50,
        maxStackSize: 50,
    });

    useEffect(() => {
        if (legRideOptionsPopup !== null) {
            accessibilityManager.hideAccessibility(mainContentRef);
        } else {
            accessibilityManager.showAccessibility(mainContentRef);
        }
    }, [legRideOptionsPopup]);

    useEffect(() => {
        if (isTicketModalOpen) {
            accessibilityManager.hideAccessibility(mainContentRef);
        } else {
            accessibilityManager.showAccessibility(mainContentRef);
        }
    }, [isTicketModalOpen]);

    useEffect(() => {
        if (isSwitchPopupOpen) {
            accessibilityManager.hideAccessibility(mainContentRef);
        } else {
            accessibilityManager.showAccessibility(mainContentRef);
        }
    }, [isSwitchPopupOpen]);

    const { sheetAnimatedPosition, sheetAnimatedIndex } = useAnimatedContextValues('journeyDetails');
    const bottomPadOffset = Platform.OS == 'ios' ? 10 : 100;

    const transitMode = useMemo(() => {
        const journeyLeg = journeyInfo?.legs.find(item => item.order === vehicleLegToSwitch);
        return journeyLeg ? getTransitType(journeyLeg.legExtraInfo.TAG) : undefined;
    }, [journeyInfo?.legs, vehicleLegToSwitch]);

    const shouldApplyStaticMapPadding = useMemo<boolean | undefined>(() => {
        if (!isSingleMode || transitMode === 'bus') {
            return true;
        }
        if (transitMode === undefined) {
            return undefined;
        }
        return false;
    }, [isSingleMode, transitMode]);

    useOnBottomSheetAnimate(
        sheetAnimatedPosition,
        useRef(true),
        {
            left: 20,
            right: 20,
            top: 60,
            bottom: bottomPadOffset,
        },
        shouldApplyStaticMapPadding,
    );
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // const swipeToViewMapValue = useSharedValue(0);
    const buttonPositionUpwardsBy = useSharedValue(0);

    const { bottom: bottomSafeArea } = useSafeAreaInsets();
    const screenHeightWithBottom = SCREEN_HEIGHT + bottomSafeArea + (Platform.OS === 'ios' ? 70 : 0);
    const { isMetroServiceable, isSubwayServiceable } = useMetroSubwayServiceability(undefined);
    const singleModeSafeArea =
        isMetroServiceable || isSubwayServiceable
            ? [
                  screenHeightWithBottom * 0.42,
                  transitMode === 'metro' ? (Platform.OS === 'ios' ? '65%' : '57%') : '65%',
                  '92%',
              ]
            : [screenHeightWithBottom * 0.42, '70%', '95%'];

    const snapPoints = useMemo(() => {
        if (isSingleMode) return singleModeSafeArea;
        else
            return popUpType === PopUpType.ChooseRidePopUp
                ? [screenHeightWithBottom * 0.48, '80%']
                : [screenHeightWithBottom * 0.42, '60%', '90%'];
    }, [isSingleMode, popUpType, screenHeightWithBottom, singleModeSafeArea]);

    const changeVehicleText =
        (selectedPricingItem && selectedPricingItem[0]?.serviceTierName) ??
        (selectedMultimodalLeg?.legExtraInfo.TAG === 'Taxi'
            ? selectedMultimodalLeg?.legExtraInfo._0.serviceTierName
            : undefined);

    const handleBackPress = useCallback(() => {
        mpDispatch(
            popUpType === PopUpType.ChooseRidePopUp
                ? createAction('REMOVE_CHANGE_VEHICLE', undefined)
                : createAction('GO_BACK', undefined),
        );
    }, [mpDispatch, popUpType]);

    const handleRecenter = useCallback(() => {
        mpDispatch({
            type: 'RECENTER_MAP',
            payload: undefined,
        });
    }, [mpDispatch]);
    const handleMoreOptions = useCallback(() => {
        mpDispatch(createAction('MORE_OPTIONS', undefined));
    }, [mpDispatch]);

    const handleChangeVehicle = useCallback(() => {
        logger.logInfo(
            `Journey Id: ${journeyInfo?.journeyId || 'No Journey Id'} - Change Vehicle Button Clicked`,
            'BookingFlow',
        );
        // Accessibility: idempotent push + hide before focus
        if (!accessibilityManager.isActive('VehicleOptions')) {
            accessibilityManager.pushToFocusStack(vehicleOptionsRef, 'VehicleOptions');
            accessibilityManager.hideAccessibility(mainContentRef);
        }
        accessibilityManager.setFocus(vehicleOptionsRef);

        mpDispatch(
            createAction('CONFIRM_CHANGE_VEHICLE', {
                legOrder: selectedMultimodalLeg?.order,
            }),
        );
    }, [mpDispatch, selectedMultimodalLeg?.order, accessibilityManager]);

    const bottomPadding = useMemo(() => bottom + 220, [bottom]);
    const bottomViewPadding = useMemo(() => (bottom ? bottom : 16), [bottom]);

    const getRouteCode = (leg: legInfo | null) => {
        if (leg?.legExtraInfo.TAG === 'Bus') {
            return leg?.legExtraInfo?._0.routeCode;
        }
        if (leg?.legExtraInfo.TAG === 'Metro' || leg?.legExtraInfo.TAG === 'Subway') {
            return leg?.legExtraInfo?._0.routeInfo[0]?.routeCode;
        }
        return undefined;
    };

    const otherOptionsHeader = useMemo(() => {
        if (props.vehicleTierOptionsResp?.options.length === 0) {
            return userLanguageStrings.Nootheroptionsavailable(transitMode);
        }
        if (transitMode === 'bus') {
            return userLanguageStrings.AvailableBusTypes;
        }
        if (transitMode === 'train') {
            return userLanguageStrings.AvailableTrainTypes;
        }
        return userLanguageStrings.AvailableTransitTypes;
    }, [transitMode, props.vehicleTierOptionsResp]);

    const destinationArrivalTimeView = appName === 'nammaYatri' && (
        <Animated.View style={tailwind.style('items-center justify-center py-3 z-10 ')}>
            <Animated.Image
                accessible={true}
                accessibilityLabel="destination arrival time image"
                source={destinationArrivalTime}
                style={{ width: 42, height: 53, marginVertical: 16 }}
                resizeMode="contain"
            />
            <Typography
                type="subhead-1"
                style={tailwind.style('text-[14px] text-[#656565] text-center pb-5 max-w-[60%]')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.YouWillReachDestinationAt}{' '}
                {journeyInfo?.estimatedDuration && journeyInfo?.estimatedDuration > 0
                    ? new Date(Date.now() + journeyInfo?.estimatedDuration * 1000).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                      })
                    : convertUTCToIST(calculateEndTime(journeyInfo?.startTime, journeyInfo?.legs))}
            </Typography>
        </Animated.View>
    );

    const singleLegOrder = journeyInfo?.legs?.[0]?.order ?? 0;

    const totalEtaTime = Date.now() + (journeyInfo?.estimatedDuration ?? 0) * 1000;
    const formattedEtaTime = new Date(totalEtaTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    const distinctBusServiceTiers = useMemo(() => {
        if (!journeyInfo?.legs) return [];

        const busServiceTiers = journeyInfo.legs
            .filter(leg => leg.legExtraInfo.TAG === 'Bus')
            .map(leg => {
                if (leg.legExtraInfo.TAG === 'Bus') {
                    return leg.legExtraInfo._0?.selectedServiceTier?.serviceTierType;
                }
                return undefined;
            })
            .filter(t => t != undefined);

        return [...new Set(busServiceTiers)];
    }, [journeyInfo?.legs]);

    const hasSubwayLeg = journeyInfo?.legs.some(leg => leg.travelMode === 'Subway');

    return (
        <HardwareBackpressHandler onHardwareBackPress={handleBackPress}>
            <>
                <Animated.View style={tailwind.style(`absolute top-[${top ? top : 12}px] left-4 z-100`)}>
                    <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                        <Button
                            accessibilityRole="imagebutton"
                            accessibilityLabel={`Go Back button`}
                            size="md"
                            type="secondary"
                            prefix={
                                popUpType !== PopUpType.ChooseRidePopUp ? (
                                    <Icon
                                        icon={<CrossIcon fill={colors.neutral900} />}
                                        color={colors.neutral800}
                                        size={16}
                                    />
                                ) : (
                                    <LeftArrow />
                                )
                            }
                            onPress={handleBackPress}
                            testID={'4f1352c3-7374-46fd-8e06-24cdc17694ee'}
                        />
                    </Animated.View>
                </Animated.View>

                {!journeyInfo && !['nammaYatri', 'odishaYatri'].includes(appName) ? (
                    <Animated.View
                        layout={LinearTransition}
                        style={[
                            tailwind.style('absolute w-[350px] h-[250px] left-1/2 top-1/3'),
                            { transform: [{ translateX: -175 }, { translateY: -125 }] },
                        ]}>
                        <LottieWithFallback
                            fallback={undefined}
                            style={tailwind.style('w-full h-full')}
                            source={require('../../../assets/lottie/route-estimated.lottie')}
                            autoPlay
                            loop
                        />
                    </Animated.View>
                ) : null}

                {isSingleMode && transitMode === 'metro' ? null : (
                    <RecenterButton
                        onPress={handleRecenter}
                        sheetAnimatedIndex={sheetAnimatedIndex}
                        sheetAnimatedPosition={sheetAnimatedPosition}
                        buttonPositionUpwardsBy={buttonPositionUpwardsBy}
                        additionalOffset={-20}
                    />
                )}
                {/* {popUpType !== PopUpType.ChooseRidePopUp ? ( // To be re-evaluated
                    <SwipeToViewMap
                        onPress={() => {
                            multimodalJourneyInfoSheetRef.current?.snapToIndex(sheetAnimatedIndex.value === 0 ? 1 : 0);
                        }}
                        screenName={'journeyDetails'}
                        buttonPositionUpwardsBy={swipeToViewMapValue}
                        isFloatingHeader
                    />
                ) : (
                    <></>
                )} */}

                <BottomSheet
                    index={popUpType === PopUpType.ChooseRidePopUp ? 0 : 1}
                    ref={multimodalJourneyInfoSheetRef}
                    snapPoints={snapPoints}
                    enableDynamicSizing={false}
                    maxDynamicContentSize={
                        isSingleMode && transitMode === 'metro'
                            ? SCREEN_HEIGHT * 0.6
                            : Platform.OS === 'ios'
                              ? SCREEN_HEIGHT * 0.76
                              : SCREEN_HEIGHT * 0.73
                    }
                    enableOverDrag={isSingleMode && transitMode === 'metro' ? false : true}
                    backgroundStyle={{ backgroundColor: 'transparent' }}
                    handleStyle={{ backgroundColor: homeSheetBg, borderTopLeftRadius: 400, borderTopRightRadius: 400 }}
                    handleIndicatorStyle={{ backgroundColor: colors.gray100 }}
                    animatedPosition={sheetAnimatedPosition}
                    animatedIndex={popUpType === PopUpType.ChooseRidePopUp ? undefined : sheetAnimatedIndex}
                    topInset={top}
                    activeOffsetX={undefined}
                    activeOffsetY={undefined}
                    failOffsetY={undefined}
                    failOffsetX={undefined}
                    simultaneousHandlers={undefined}
                    waitFor={undefined}>
                    {popUpType !== PopUpType.ChooseRidePopUp ? (
                        isSingleMode && journeyInfo && props.hasPublicTransport ? (
                            <Animated.View style={{ flex: 1, backgroundColor: homeSheetBg }} ref={mainContentRef}>
                                <DirectBusBookingFlow
                                    source={source?.title || source?.formattedAddress || ''}
                                    sourceInfo={sourceInfo}
                                    destination={destination?.title || destination?.formattedAddress || ''}
                                    fare={totalFare}
                                    duration={
                                        journeyInfo?.estimatedDuration
                                            ? Math.round(journeyInfo?.estimatedDuration / 60).toString()
                                            : undefined
                                    }
                                    routeCode={getRouteCode(journeyInfo?.legs[0] ?? null) ?? ''}
                                    getRouteByCode={getRouteByCode}
                                    transitMode={
                                        journeyInfo?.legs[0]
                                            ? getTransitType(journeyInfo?.legs[0]?.legExtraInfo.TAG)
                                            : 'metro'
                                    }
                                    moreOptionsPress={() => mpDispatch(createAction('MORE_OPTIONS', undefined))}
                                    time={undefined}
                                    otherVehicleOptions={props.otherVehicleOptions}
                                    onChangeBusType={() => {
                                        mpDispatch(
                                            createAction('SHOW_SWITCH_BUS_ROUTE_MODAL', {
                                                legOrder: singleLegOrder,
                                            }),
                                        );
                                    }}
                                    legInfo={journeyInfo?.legs[0]}
                                    journeyTypes={undefined}
                                    mpDispatch={mpDispatch}
                                    legOrder={singleLegOrder}
                                    nextAvailableTimings={props.selectedVehicleTier?.nextAvailableTimings}
                                    vehicleTierOptionsResp={props.vehicleTierOptionsResp}
                                    journeyMapData={journeyMapData}
                                    journeyId={
                                        journeyInfo?.journeyId ? createJourneyId(journeyInfo?.journeyId) : undefined
                                    }
                                    onViewTimetable={props.onViewTimetable}
                                    nextTwoArrivalTimes={props.nextTwoArrivalTimes?.[singleLegOrder]}
                                    firstArrivalTime={props.firstArrivalTime?.[singleLegOrder]}
                                    timeTableData={props.timeTableData?.[singleLegOrder]}
                                    isSingleMode={isSingleMode}
                                    isLoadingData={loadingDataForLeg === singleLegOrder}
                                    transformViaPointName={props.transformViaPointName}
                                    transformedRouteOptions={props.transformedRouteOptions}
                                    handleOnConfirmRoute={handleOnConfirmRoute}
                                    serviceableStartTime={undefined}
                                    isConfirmingJourney={props.isConfirmingJourney}
                                    isLoading={props.isLoading}
                                    onBusRouteSwitch={handleConfirmBusChange}
                                />
                            </Animated.View>
                        ) : (
                            <Animated.View style={{ backgroundColor: homeSheetBg }} ref={mainContentRef}>
                                <BottomSheetScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={tailwind.style(`pb-[${bottomPadding}px]`)}>
                                    <PTReviewHeader
                                        handleClickMoreRoutes={handleMoreOptions}
                                        startLocation={source?.title || source?.formattedAddress || ''}
                                        duration={
                                            journeyInfo?.estimatedDuration
                                                ? formatTimeFromSeconds(
                                                      journeyInfo?.estimatedDuration,
                                                      true,
                                                      userLanguageStrings,
                                                  )
                                                : undefined
                                        }
                                        dropLocation={destination?.title || destination?.formattedAddress || ''}
                                        journey={journeySegments}
                                        legCount={legCount}
                                        renderShowDetailsSection={true}
                                        price={totalFare}
                                        screenName={'journeyDetails'}
                                        appName={props.appName}
                                        fetchingLegsFare={fetchingLegsFare}
                                        totalTimeSaved={timeSavedByMultimodal}
                                        journeyETATime={formattedEtaTime}
                                        switchToAuto={switchToAuto}
                                    />

                                    {journeyInfo ? (
                                        <JourneyLegs
                                            legs={journeyInfo.legs}
                                            mpDispatch={mpDispatch}
                                            loadingDataForLeg={loadingDataForLeg}
                                            skippedLegOrders={skippedLegOrders}
                                            appName={appName}
                                            legCategorySelections={props.legCategorySelections ?? []}
                                            journeyMapData={journeyMapData}
                                            onViewTimetable={onViewTimetable}
                                            nextTwoArrivalTimes={nextTwoArrivalTimes}
                                            firstArrivalTime={firstArrivalTime}
                                            timeTableData={props.timeTableData}
                                            fromJourneyInfoScreen={true}
                                            transformedRouteOptions={transformedRouteOptions}
                                            handleOnConfirmRoute={handleOnConfirmRoute}
                                            isLoading={props.isLoading}
                                            handleConfirmBusChange={handleConfirmBusChange}
                                            journeyId={journeyInfo.journeyId}
                                        />
                                    ) : (
                                        <SkeletonLoader />
                                    )}

                                    {destinationArrivalTimeView}

                                    {hasSubwayLeg ? (
                                        <Animated.View style={tailwind.style('mx-4')}>
                                            <DisclaimerBox legmode="Subway" serviceTiers={undefined} />
                                        </Animated.View>
                                    ) : null}
                                    {appName == 'anna' && distinctBusServiceTiers.length > 0 ? (
                                        <Animated.View style={tailwind.style('mx-4')}>
                                            <DisclaimerBox legmode="Bus" serviceTiers={distinctBusServiceTiers} />
                                        </Animated.View>
                                    ) : null}
                                </BottomSheetScrollView>
                            </Animated.View>
                        )
                    ) : (
                        <Animated.View style={{ backgroundColor: homeSheetBg }} ref={mainContentRef}>
                            <ChooseRideFlow
                                navigation={navigation}
                                showErrorStatesModal={() => {}}
                                hideAccessibility={false}
                                setHideAccessibility={() => {}}
                                selectedMultimodalLeg={{
                                    pricingId: selectedMultimodalLeg?.pricingId,
                                    distance: selectedMultimodalLeg?.estimatedDistance?.value,
                                    duration: selectedMultimodalLeg?.estimatedDuration,
                                }}
                                searchId={selectedMultimodalLeg?.searchId ?? null}
                                bookAnyVisible={false}
                                setIsScrolled={() => {}}
                            />
                        </Animated.View>
                    )}
                </BottomSheet>

                <PopUpModal
                    sheetRef={rideOptionModalRef}
                    handleComponent={null}
                    enableDynamicSizing={true}
                    bottomInset={0}
                    backgroundStyle={{ backgroundColor: '#F8F9FB' }}
                    isScrollable={false}
                    showBackdrop={undefined}
                    onHardwareBackPress={undefined}
                    onDismiss={() => {
                        setIsSwitchPopupOpen(false);
                        accessibilityManager.showAccessibility(mainContentRef);
                    }}>
                    <BottomSheetView>
                        <Animated.View style={tailwind.style(`absolute top-[4px] right-4 mt-4 z-100`)}>
                            <Button
                                accessibilityRole="imagebutton"
                                accessibilityLabel="Close ride options modal"
                                size="md"
                                type="secondary"
                                prefix={
                                    <Icon
                                        icon={<CrossIcon fill={colors.neutral900} />}
                                        color={colors.neutral900}
                                        size={16}
                                    />
                                }
                                onPress={() => {
                                    rideOptionModalRef.current?.dismiss();
                                }}
                                testID="3d9df20a-f24b-467c-8159-b020607d4d03"
                            />
                        </Animated.View>
                        <SwitchPopUp mpDispatch={mpDispatch} selectedMultimodalLeg={selectedMultimodalLeg} />
                    </BottomSheetView>
                </PopUpModal>
                <PopUpModal
                    sheetRef={autoInfoModalRef}
                    handleComponent={null}
                    enableDynamicSizing={true}
                    showBackdrop={undefined}
                    isScrollable={false}
                    onHardwareBackPress={() => autoInfoModalRef.current?.dismiss()}
                    bottomInset={0}>
                    <BottomSheetView style={tailwind.style('bg-white rounded-15')}>
                        <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Close auto information"
                                onPress={() => autoInfoModalRef.current?.dismiss()}
                                testID="ce9cad78-9dd0-4418-b239-3e8833101eaf">
                                <View
                                    style={{
                                        backgroundColor: '#F1F2F6',
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    <CrossIcon fill={colors.neutral900} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <AutoInfoPopUp />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Got it button`}
                            testID="3f3a33be-ed69-4640-93b6-1fd7fef5b066"
                            onPress={() => autoInfoModalRef.current?.dismiss()}
                            style={tailwind.style(
                                'my-4 h-12 flex-row items-center justify-center bg-[#F74940] rounded-[12px] mx-5 mb-10',
                            )}>
                            <Animated.Text style={tailwind.style('text-[16px] font-areaNormal-extrabold text-white')}>
                                {userLanguageStrings.Gotit}
                            </Animated.Text>
                        </Pressable>
                    </BottomSheetView>
                </PopUpModal>
                <PopUpModal
                    sheetRef={vehicleOptionsModalRef}
                    isScrollable={true}
                    onHardwareBackPress={undefined}
                    onDismiss={() => {
                        // Accessibility: Restore focus when modal is dismissed
                        if (accessibilityManager.isActive('VehicleOptions')) {
                            accessibilityManager.popFromFocusStack();
                        }
                        accessibilityManager.showAccessibility(mainContentRef);
                        accessibilityManager.restoreFocus();
                    }}
                    maxDynamicContentSize={SCREEN_HEIGHT - top}
                    showBackdrop={undefined}
                    enableDynamicSizing
                    enablePanDownToClose={false}>
                    <BottomSheetScrollView
                        contentContainerStyle={tailwind.style(`px-5 pt-[22px] pb-[${bottom ? bottom : 16}px]`)}>
                        <View ref={vehicleOptionsRef} accessible accessibilityLabel="Vehicle options selection">
                            {isFetchingVehicleTierOptions ? (
                                <BusOptionsShimmer />
                            ) : (
                                <>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[13px] leading-[15px] font-areaNormal-extrabold text-[#969696] text-center mb-6',
                                        )}
                                        accessible
                                        accessibilityLabel={otherOptionsHeader}>
                                        {otherOptionsHeader}
                                    </Animated.Text>

                                    <TierOptions
                                        tierOptionsResp={props.vehicleTierOptionsResp}
                                        isFetchingTierOptions={props.isFetchingVehicleTierOptions}
                                        selectedTier={props.selectedVehicleTier}
                                        mpDispatch={props.mpDispatch}
                                        type={transitMode}
                                        getRouteByCode={getRouteByCode}
                                    />

                                    <Button
                                        style={tailwind.style('bg-[#313131] justify-center items-center')}
                                        type="primary"
                                        text={
                                            props.vehicleTierOptionsResp?.options &&
                                            props.vehicleTierOptionsResp?.options.length > 0
                                                ? userLanguageStrings.Confirm
                                                : userLanguageStrings.GotIt
                                        }
                                        isLoading={props.isChangingVehicleClass}
                                        onPress={() => {
                                            if (
                                                props.vehicleTierOptionsResp?.options &&
                                                props.vehicleTierOptionsResp?.options.length > 0
                                            ) {
                                                props.mpDispatch(createAction('CHANGE_TRANSIT_CLASS', undefined));
                                            } else {
                                                vehicleOptionsModalRef.current?.dismiss();
                                            }
                                        }}
                                        testID="9f663243-32f0-4dcb-a954-7bacc313682b"
                                    />
                                </>
                            )}
                        </View>
                    </BottomSheetScrollView>
                </PopUpModal>
                <ViaPointsModal
                    bottomSheetModalRef={viaPointsModalRef}
                    onTrainClassChange={newJourneyLegId => {
                        if (newJourneyLegId) {
                            mpDispatch(
                                createAction('SELECT_ALTERNATE_JOURNEY_LEG', {
                                    legOrder: props.legForViaChange,
                                    newJourneyLegId: newJourneyLegId,
                                }),
                            );
                        }
                    }}
                    routeOptions={props.transformedRouteOptions}
                    selectedLeg={journeyInfo?.legs.find(leg => leg.order === props.legForViaChange)}
                    isLoading={props.isFetchingSimilarJourneyLegs}
                />
                {/* Sticky Change Vehicle Button for ChooseRidePopUp */}
                {popUpType === PopUpType.ChooseRidePopUp && (
                    <Animated.View
                        style={[
                            tailwind?.style(`absolute bottom-0 pb-[${bottomViewPadding}px] w-full bg-white`),
                            {
                                shadowColor: '#000',
                                shadowOffset: {
                                    width: 0,
                                    height: 6,
                                },
                                shadowOpacity: 0.15,
                                shadowRadius: 7.49,
                                elevation: 12,
                                overflow: 'visible',
                            },
                        ]}>
                        <Animated.View style={tailwind?.style(`px-4 py-4`)}>
                            <Button
                                disabled={!confirmEnable}
                                type="primary"
                                isLoading={switchModeLoading}
                                accessibilityRole="button"
                                accessibilityLabel="Change Vehicle"
                                text={
                                    changeVehicleText
                                        ? userLanguageStrings.ChangeVehicleTo + ' ' + changeVehicleText
                                        : userLanguageStrings.ChangeVehicle
                                }
                                style={tailwind.style(`items-center justify-center`)}
                                onPress={handleChangeVehicle}
                                testID="5dbd6456-2934-42cb-b0a6-1c339c840088"
                            />
                        </Animated.View>
                    </Animated.View>
                )}
                {props.isMultimodalWarningVisible && (
                    <AnimatedModal
                        visible={props.isMultimodalWarningVisible}
                        setVisible={props.setMultimodalWarningVisible}>
                        <MultimodalWarningPopup
                            multimodalWarning={props.multimodalWarning}
                            actualVehicleType={props.actualVehicleType}
                            setVisible={props.setMultimodalWarningVisible}
                            onPress={() => {
                                if (appName === 'nammaYatri' || appName === 'odishaYatri') navigation.goBack();
                            }}
                        />
                    </AnimatedModal>
                )}

                <BusRouteSelectionView
                    leg={journeyInfo?.legs.find(leg => leg.order === props.vehicleLegToSwitch) ?? null}
                    onSwitchBusRoute={routeInfo => {
                        mpDispatch(createAction('SWITCH_BUS_ROUTE', { routeInfo: routeInfo }));
                    }}
                    availableRoutes={props.availableRoutes}
                    bottom={bottom}
                    busTrackingRouteInfo={props.busTrackingRouteInfo}
                    onConfirmBusChange={routeInfo => {
                        mpDispatch(createAction('CONFIRM_BUS_CHANGE', { routeInfo: routeInfo }));
                    }}
                />
            </>
        </HardwareBackpressHandler>
    );
};
