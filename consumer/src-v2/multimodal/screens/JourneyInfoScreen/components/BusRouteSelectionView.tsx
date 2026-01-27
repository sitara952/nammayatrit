import { BottomSheetScrollView, BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import BookBusItem from '../../NewLiveJourney/components/BookBusItem';
import Shimmer from '../../Search/components/SearchSectionListItem/Shimmer';

import { useRefsContext } from '@/typescript/context/RefsContext';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';
import { formatTimeFromSeconds } from '@/src-v2/utils/common';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { isUndefined } from 'lodash';
import { removeWordBuses } from '../DirectBooking/components/BusTransitCard';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface BusRouteSelectionViewProps {
    availableRoutes: availableRoute[] | undefined;
    leg: legInfo | null;
    bottom: number;
    busTrackingRouteInfo: availableRoute | undefined;
    onSwitchBusRoute: (routeInfo: availableRoute) => void;
    onConfirmBusChange: (routeInfo: availableRoute) => void;
}

interface ArrivalTime {
    time: string;
    isLate: boolean;
}

// Internal loader component
const BusRouteSelectionLoader = React.memo(() => {
    return (
        <Animated.View style={tailwind.style('px-5 pt-[8px]')}>
            {/* Header skeleton */}
            <Animated.View style={tailwind.style('items-center mb-6 mt-4')}>
                <Shimmer finalOpacity={1} height={20} width={200} borderRadius={10} backgroundColor={'#CFCFD580'} />
            </Animated.View>

            {/* Bus items skeleton */}
            <View style={tailwind.style('gap-4')}>
                {[1, 2, 3].map((_, index) => (
                    <Animated.View key={index} style={tailwind.style('p-4 rounded-[20px] bg-white')}>
                        {/* Top row with bus info and book button */}
                        <View
                            style={tailwind.style(
                                'flex-row items-center justify-between pb-3 border-b border-[#F4F4F4]',
                            )}>
                            <View style={tailwind.style('flex-row items-center gap-2')}>
                                <Shimmer
                                    finalOpacity={1}
                                    height={24}
                                    width={24}
                                    borderRadius={8}
                                    backgroundColor={'#CFCFD580'}
                                />
                                <Shimmer
                                    finalOpacity={1}
                                    height={16}
                                    width={60}
                                    borderRadius={4}
                                    backgroundColor={'#CFCFD580'}
                                />
                                <Shimmer
                                    finalOpacity={1}
                                    height={16}
                                    width={80}
                                    borderRadius={4}
                                    backgroundColor={'#CFCFD580'}
                                />
                            </View>
                            <Shimmer
                                finalOpacity={1}
                                height={20}
                                width={60}
                                borderRadius={4}
                                backgroundColor={'#CFCFD580'}
                            />
                        </View>

                        {/* Bottom row with arrival times */}
                        <View style={tailwind.style('pt-3 flex-row items-center gap-2')}>
                            <Shimmer
                                finalOpacity={1}
                                height={14}
                                width={60}
                                borderRadius={4}
                                backgroundColor={'#CFCFD580'}
                            />
                            <View style={tailwind.style('flex-row gap-2')}>
                                <Shimmer
                                    finalOpacity={1}
                                    height={25}
                                    width={50}
                                    borderRadius={8}
                                    backgroundColor={'#CFCFD580'}
                                />
                                <Shimmer
                                    finalOpacity={1}
                                    height={25}
                                    width={60}
                                    borderRadius={8}
                                    backgroundColor={'#CFCFD580'}
                                />
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>
        </Animated.View>
    );
});

// Main component
export const BusRouteSelectionView: React.FC<BusRouteSelectionViewProps> = ({
    availableRoutes,
    leg,
    bottom,
    busTrackingRouteInfo,
    onSwitchBusRoute,
    onConfirmBusChange,
}) => {
    const { busRouteSelectionModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const destination = leg?.legExtraInfo.TAG === 'Bus' ? leg?.legExtraInfo._0?.destinationStop.name : undefined;

    const mkArrivalTimes = (seconds: number[]): ArrivalTime[] => {
        const uniqueSeconds = [...new Set(seconds.map(second => Math.round(second / 60)))].slice(0, 5);
        return uniqueSeconds.map(second => ({
            time: formatTimeFromSeconds(second * 60, true, userLanguageStrings),
            isLate: second > 20 * 60,
        }));
    };

    const snapPoints = useMemo(() => ['50%', '90%'], []);

    // Limit routes to top 5 (routes are already sorted)
    const limitedRoutes = useMemo(() => {
        if (!availableRoutes || availableRoutes.length === 0) return availableRoutes;

        // Take first 5 routes
        const top5 = availableRoutes.slice(0, 5);

        // If there's a selected route not in top 5, replace the 5th with it
        if (busTrackingRouteInfo && availableRoutes.length > 5) {
            const selectedInTop5 = top5.some(
                route =>
                    route.routeCode === busTrackingRouteInfo.routeCode &&
                    route.serviceTierType === busTrackingRouteInfo.serviceTierType,
            );

            if (!selectedInTop5) {
                const selectedRoute = availableRoutes.find(
                    route =>
                        route.routeCode === busTrackingRouteInfo.routeCode &&
                        route.serviceTierType === busTrackingRouteInfo.serviceTierType,
                );
                if (selectedRoute) {
                    // Create new array with selected route replacing the 5th item
                    return [...top5.slice(0, 4), selectedRoute];
                }
            }
        }

        return top5;
    }, [availableRoutes, busTrackingRouteInfo]);

    return (
        <BottomSheetModal
            ref={busRouteSelectionModalRef}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            enableDismissOnClose={true}
            enableOverDrag={false}
            enableDynamicSizing={false}
            bottomInset={bottom}
            backgroundStyle={tailwind.style(' bg-[#F5F5F5] rounded-t-[20px]')}
            handleIndicatorStyle={tailwind.style('w-[46px] h-1 bg-[#E0E0E0] rounded-full')}
            animateOnMount={true}
            index={0}
            backdropComponent={undefined}
            activeOffsetX={undefined}
            activeOffsetY={undefined}
            failOffsetY={undefined}
            failOffsetX={undefined}
            simultaneousHandlers={undefined}
            waitFor={undefined}>
            {/* Header */}
            <Animated.Text
                style={tailwind.style(
                    'text-[16px] leading-[20px] font-areaNormal-extrabold text-[#313131] text-center mb-6 mt-4 capitalize px-4',
                )}>
                {userLanguageStrings.BusesAvailableTo(destination || '')}
            </Animated.Text>

            {!limitedRoutes || limitedRoutes.length === 0 ? (
                <BottomSheetScrollView
                    contentContainerStyle={tailwind.style(`pb-[${bottom ? bottom : 16}px]`)}
                    showsVerticalScrollIndicator={false}>
                    <BusRouteSelectionLoader />
                </BottomSheetScrollView>
            ) : (
                <BottomSheetScrollView style={tailwind.style('flex-1')}>
                    <View style={tailwind.style('gap-4 mx-4')}>
                        {limitedRoutes.map((option, index) => (
                            <BookBusItem
                                key={`${option.routeCode}-${index}`}
                                arrivalTimes={mkArrivalTimes(option.routeTimings)}
                                busNumber={option.routeShortName}
                                busType={
                                    removeWordBuses(option.serviceTierName) ??
                                    option.serviceTierType?.split('_').join(' ')
                                }
                                isSelected={
                                    option.routeCode === busTrackingRouteInfo?.routeCode &&
                                    option.serviceTierType === busTrackingRouteInfo?.serviceTierType
                                }
                                onBookBus={() => {
                                    onConfirmBusChange(option);
                                }}
                                onPress={() => {
                                    onSwitchBusRoute(option);
                                }}
                                allowSwitch={!isUndefined(option.quoteId)}
                                source={option.source}
                            />
                        ))}
                    </View>
                </BottomSheetScrollView>
            )}
        </BottomSheetModal>
    );
};

export default BusRouteSelectionView;
