import React from 'react';
import Animated, {
    interpolateColor,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { PopUpModalConfig } from '../StatusPopUpModal/PopUpModalConfig';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { JourneyState, Transit } from '../Iternary/types';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { getColor, getIcon } from '../../utils/getIternaryUtils';
import { useMemo, useState, useEffect } from 'react';
import { View } from 'react-native';
import busSideV2 from '@/src-v2/assets/3D-assets/live-journey/bus-side-v2.webp';
import stopSideView from '@/src-v2/assets/3D-assets/live-journey/stop-side-view.webp';
import metroSideView from '@/src-v2/assets/3D-assets/live-journey/metro-side-view.webp';
import suburbanSideView from '@/src-v2/assets/3D-assets/live-journey/suburban-side-view.webp';

import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import IconRectangleGradient from '../../assets/svg/IconRectangleGradient';
import { MetroConfirmLocation, MetroConfirmLocationProps } from './MetroConfirmLocation';
import { Stop } from '@/src-v2/multimodal/types/journeyTracking';
import { getFilteredMetroStations } from '@/src-v2/multimodal/rules/JourneyRuleHelpers';
import { getNextLegOrder, getPreviousLegOrder } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { ProcessedLegInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { ChevronRight } from '@/src-v2/assets/svg/Arrows';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface TransitOptionType {
    status: LegUpdateStatus;
    title: string;
    icon: React.ReactNode;
}

const TransitOptionItem = ({
    option,
    isSelected,
    onSelect,
}: {
    option: TransitOptionType;
    isSelected: boolean;
    onSelect: (status: LegUpdateStatus) => void;
}) => {
    const progress = useSharedValue(0);
    const { animatedStyle: pressableAnimatedStyle, handlers: pressableHandlers } = useScaleAnimation();

    useEffect(() => {
        progress.value = withSpring(isSelected ? 1 : 0, {
            damping: 15,
            stiffness: 120,
        });
    }, [isSelected]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(progress.value, [0, 1], ['#F4F4F4', '#016ACD']);
        const textColor = interpolateColor(progress.value, [0, 1], ['#3B3A3C', '#FFFFFF']);
        return {
            backgroundColor,
            color: textColor,
        };
    });

    return (
        <Pressable
            testID={`transit-option-${option.status}`}
            onPress={() => onSelect(option.status)}
            accessibilityRole="button"
            accessibilityLabel={option.title + ' button'}
            {...pressableHandlers}>
            <Animated.View
                style={[
                    tailwind.style(
                        `flex-row overflow-hidden items-center h-[66px] rounded-[18px] mb-[16px] pr-[18px] ${
                            option.icon ? 'pl-[68px]' : 'pl-[18px]'
                        } relative`,
                    ),
                    pressableAnimatedStyle,
                ]}>
                <Animated.View style={[tailwind.style('absolute inset-0'), animatedStyle]} />
                {option.icon}
                <Animated.Text
                    numberOfLines={2}
                    style={[
                        tailwind.style('flex-1 text-[14px] leading-[24px] font-areaNormal-extrabold'),
                        animatedStyle,
                    ]}>
                    {option.title}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};

export type LegUpdateStatus = 'WAITING' | 'INVEHICLE' | 'EXITSTATION' | 'COMPLETED';

const UpdateTransitBottomSheet = ({
    type,
    onConfirmPress,
    state,
    fromLocation = 'NA',
    toLocation = 'NA',
    animatedIndex,
    animatedPosition,
    metroConfirmProps,
    currentVehicleStop,
    allLegs = [],
    currentLeg,
    onLegChange,
}: {
    type: Transit;
    onConfirmPress: (status: LegUpdateStatus) => void;
    state: JourneyState;
    fromLocation: string;
    toLocation: string;
    animatedIndex: SharedValue<number>;
    animatedPosition: SharedValue<number>;
    metroConfirmProps: MetroConfirmLocationProps | null | undefined;
    currentVehicleStop: Stop | undefined;
    allLegs: ProcessedLegInfo[];
    currentLeg: ProcessedLegInfo | undefined;
    onLegChange: ((leg: ProcessedLegInfo) => void) | undefined;
}) => {
    const { liveJourneyUpdateTransitBottomSheetRef } = useRefsContext();
    const sheetRef = liveJourneyUpdateTransitBottomSheetRef;
    const { animatedStyle, handlers } = useScaleAnimation();
    const { bottom } = useSafeAreaInsets();
    const [selectedOption, setSelectedOption] = useState<LegUpdateStatus | null>(null);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const [selectedLegForViewing, setSelectedLegForViewing] = useState<ProcessedLegInfo | null>(null);
    const currentlyViewedLeg = selectedLegForViewing || currentLeg;

    const currentFromLocation = currentlyViewedLeg?.staticInfo.origin.stationName || fromLocation;
    const currentToLocation = currentlyViewedLeg?.staticInfo.destination.stationName || toLocation;
    const currentTransitMode = currentlyViewedLeg?.transitMode || type;
    const currentVehicleState = currentlyViewedLeg?.vehicleState || state;

    const canGoToPrevious = useMemo(() => {
        return currentlyViewedLeg && allLegs.length > 0
            ? getPreviousLegOrder(allLegs, currentlyViewedLeg.staticInfo?.legOrder) !== undefined
            : false;
    }, [allLegs, currentlyViewedLeg?.staticInfo?.legOrder]);

    const canGoToNext = useMemo(() => {
        return currentlyViewedLeg && allLegs.length > 0
            ? getNextLegOrder(allLegs, currentlyViewedLeg.staticInfo?.legOrder) !== undefined
            : false;
    }, [allLegs, currentlyViewedLeg?.staticInfo?.legOrder]);

    const handlePreviousLeg = () => {
        if (currentlyViewedLeg && allLegs.length > 0) {
            const previousLeg = getPreviousLegOrder(allLegs, currentlyViewedLeg.staticInfo?.legOrder);
            if (previousLeg) {
                setSelectedLegForViewing(previousLeg);
                onLegChange?.(previousLeg);
            }
        }
    };

    const handleNextLeg = () => {
        if (currentlyViewedLeg && allLegs.length > 0) {
            const nextLeg = getNextLegOrder(allLegs, currentlyViewedLeg.staticInfo?.legOrder);
            if (nextLeg) {
                setSelectedLegForViewing(nextLeg);
                onLegChange?.(nextLeg);
            }
        }
    };

    const currentStatus: LegUpdateStatus = useMemo(() => {
        if (['RIDESTARTED', 'RIDECLOSETODESTINATION'].includes(currentVehicleState)) {
            return 'INVEHICLE';
        } else if (currentVehicleState === 'ARRIVEDATSTATIONPLATFORM') {
            return 'EXITSTATION';
        } else if (currentVehicleState === 'RIDEREACHEDDESTINATION') {
            return 'COMPLETED';
        }
        return 'WAITING';
    }, [currentVehicleState]);

    const transitOptions: TransitOptionType[] = useMemo(() => {
        const allOptions: TransitOptionType[] = (() => {
            switch (currentTransitMode) {
                case 'METRO':
                case 'SUBWAY':
                    return [
                        {
                            status: 'WAITING',
                            title: userLanguageStrings.IAmWaitingAt(currentFromLocation),
                            icon: (
                                <Animated.Image
                                    accessible={false}
                                    source={stopSideView}
                                    style={tailwind.style('w-[60px] h-[64px] absolute bottom-[-7px] left-[-10px]')}
                                />
                            ),
                        },
                        {
                            status: 'INVEHICLE',
                            title: userLanguageStrings.IAmCurrentlyTravellingIn(
                                currentTransitMode?.toLowerCase() || '',
                            ),
                            icon: (
                                <Animated.Image
                                    accessible={false}
                                    source={currentTransitMode === 'METRO' ? metroSideView : suburbanSideView}
                                    style={tailwind.style(
                                        'absolute',
                                        currentTransitMode === 'METRO'
                                            ? 'left-[0px] bottom-[-5px] w-[73px] h-[75px]'
                                            : 'left-[-10px] bottom-[-7px] w-[90px] h-[75px] ',
                                    )}
                                />
                            ),
                        },
                        {
                            status: 'EXITSTATION',
                            title: userLanguageStrings.IAmAtStation(
                                currentToLocation,
                                currentTransitMode === 'METRO' ? 'metro' : 'train',
                            ),
                            icon: (
                                <Animated.Image
                                    accessible={false}
                                    source={stopSideView}
                                    style={tailwind.style('w-[60px] h-[64px] absolute bottom-[-7px] left-[-10px]')}
                                />
                            ),
                        },
                    ];
                case 'WALK':
                    return [
                        {
                            status: 'INVEHICLE',
                            title: userLanguageStrings.IAmWalkingTo(currentToLocation),
                            icon: null,
                        },
                        {
                            status: 'COMPLETED',
                            title: userLanguageStrings.IReached(currentToLocation),
                            icon: null,
                        },
                    ];
                case 'TAXI':
                case 'AUTO':
                case 'BIKE':
                    return [
                        {
                            status: 'WAITING',
                            title: userLanguageStrings.IAmWaitingFor(
                                currentTransitMode === 'AUTO' ? 'auto' : 'taxi',
                                currentFromLocation,
                            ),
                            icon: null,
                        },
                    ];
                case 'BUS':
                    return [
                        {
                            status: 'WAITING',
                            title: userLanguageStrings.IAmWaitingForBusIn(currentFromLocation),
                            icon: (
                                <Animated.Image
                                    accessible={false}
                                    source={stopSideView}
                                    style={tailwind.style('w-[60px] h-[64px] absolute bottom-[-7px] left-[-10px]')}
                                />
                            ),
                        },
                        {
                            status: 'INVEHICLE',
                            title: userLanguageStrings.IAmCurrentlyTravellingInBus(
                                currentTransitMode?.toLowerCase() || '',
                            ),
                            icon: (
                                <Animated.Image
                                    accessible={false}
                                    source={busSideV2}
                                    style={tailwind.style('h-[64px] absolute ', 'left-[-10px] bottom-[-7px] w-[60px] ')}
                                />
                            ),
                        },
                    ];
                default:
                    return [];
            }
        })();

        // Status sequence: WAITING -> INVEHICLE -> EXITSTATION -> COMPLETED
        // const allowedStatus = {
        //     WAITING: ['WAITING', 'INVEHICLE', 'EXITSTATION', 'COMPLETED'],
        //     INVEHICLE: ['WAITING', 'INVEHICLE', 'EXITSTATION', 'COMPLETED'],
        //     EXITSTATION: ['WAITING', 'INVEHICLE', 'EXITSTATION', 'COMPLETED'],
        //     COMPLETED: ['WAITING', 'INVEHICLE', 'EXITSTATION', 'COMPLETED'],
        // };

        // return allOptions.filter(option => allowedStatus[currentStatus]?.includes(option.status));
        return allOptions;
    }, [currentTransitMode, currentFromLocation, currentToLocation, currentStatus]);

    const handleOptionSelect = (status: LegUpdateStatus) => {
        setSelectedOption(status);
    };

    return (
        <>
            <PopUpModalConfig
                onClosePress={() => {}}
                sheetRef={sheetRef}
                style="bg-white"
                isScrollable={false}
                enablePanDownToClose={false}
                stackBehavior="push"
                animatedIndex={animatedIndex}
                animatedPosition={animatedPosition}>
                <BottomSheetView style={tailwind.style(`pb-[${(bottom || 16) + 20}px] px-[28px] pt-[28px]`)}>
                    {allLegs.length > 1 && (canGoToPrevious || canGoToNext) && (
                        <View
                            style={tailwind.style(
                                'absolute bg-[#FBFBFB] w-[100vw] rounded-t-3xl h-15 top-0 left-0 right-0 z-2 flex-row justify-between items-center px-4 pt-4 pb-2 ',
                            )}>
                            {canGoToPrevious ? (
                                <Pressable
                                    accessibilityRole="button"
                                    testID="previous-leg-button"
                                    accessibilityLabel="Previous Transit button"
                                    onPress={handlePreviousLeg}
                                    style={tailwind.style('flex-row items-center')}>
                                    <Icon
                                        icon={<ChevronRight />}
                                        color="#656565"
                                        style={{ transform: [{ scaleX: -1 }] }}
                                    />
                                    <Animated.Text
                                        style={tailwind.style(
                                            'ml-2 text-base text-[12px] text-[#656565] font-areaNormal-bold',
                                        )}>
                                        {userLanguageStrings.PreviousTransit}
                                    </Animated.Text>
                                </Pressable>
                            ) : (
                                <View />
                            )}
                            {canGoToNext ? (
                                <Pressable
                                    accessibilityRole="button"
                                    testID="next-leg-button"
                                    accessibilityLabel="Next Transit button"
                                    onPress={handleNextLeg}
                                    style={tailwind.style('flex-row items-center')}>
                                    <Animated.Text
                                        style={tailwind.style('mr-2 text-[12px] text-[#656565] font-areaNormal-bold')}>
                                        {userLanguageStrings.NextTransit}
                                    </Animated.Text>
                                    <Icon icon={<ChevronRight />} color="#656565" />
                                </Pressable>
                            ) : (
                                <View />
                            )}
                        </View>
                    )}
                    <View style={tailwind.style(`${allLegs.length > 1 ? 'mt-12' : 'mt-0'}`)}>
                        <Animated.View style={tailwind.style('relative')}>
                            <Icon
                                icon={<IconRectangleGradient />}
                                size={27}
                                style={tailwind.style('absolute top-[-28px] left-[24px] z-[1]')}
                            />
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        `bg-[${getColor(
                                            currentTransitMode || 'WALK',
                                            currentVehicleState,
                                        )}] rounded-[20px] w-[56px] h-[56px] items-center justify-center relative`,
                                    ),
                                    { elevation: 2, zIndex: 2 },
                                ]}>
                                {getIcon(currentTransitMode || 'WALK', 27, undefined, currentVehicleState, undefined)}
                            </Animated.View>
                        </Animated.View>

                        <Animated.Text
                            style={tailwind.style(
                                'text-[#3B3A3C] text-[18px] pt-[18px] leading-[28px] font-areaNormal-extrabold',
                            )}>
                            {userLanguageStrings.WhichPartOfTransitAreYouCheckingInto(
                                currentTransitMode?.toLowerCase() || '',
                            )}
                        </Animated.Text>

                        <View style={tailwind.style('mt-6')}>
                            {transitOptions.map(option => (
                                <TransitOptionItem
                                    key={option.status}
                                    option={option}
                                    isSelected={selectedOption === option.status}
                                    onSelect={handleOptionSelect}
                                />
                            ))}
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Confirm button"
                            testID="confirm"
                            style={tailwind.style('mt-[28px]')}
                            onPress={() => onConfirmPress(selectedOption ?? 'WAITING')}
                            {...handlers}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'bg-[#3B3A3C] h-[57px] rounded-[17px] flex-row items-center justify-center',
                                    ),
                                    animatedStyle,
                                ]}>
                                <Animated.Text
                                    style={tailwind.style('text-white text-[14px] font-areaNormal-extrabold')}>
                                    {userLanguageStrings.Confirm}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                    </View>
                </BottomSheetView>
            </PopUpModalConfig>
            {metroConfirmProps ? (
                <MetroConfirmLocation
                    {...metroConfirmProps}
                    currentVehicleStop={currentVehicleStop}
                    stations={(() => {
                        // Use helper function from JourneyRuleHelpers for proper separation of concerns
                        return getFilteredMetroStations(
                            metroConfirmProps.stations,
                            currentVehicleStop,
                            metroConfirmProps.possibleCheckInStations,
                        );
                    })()}
                />
            ) : null}
        </>
    );
};

export default UpdateTransitBottomSheet;
