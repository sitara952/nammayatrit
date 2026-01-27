import { View } from 'react-native';
import Animated, {
    LinearTransition,
    SlideInDown,
    SlideInLeft,
    SlideInRight,
    SlideOutDown,
    SlideOutLeft,
    SlideOutRight,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { createAction } from '@/typescript/utils/common';
import React, { useMemo, useState, useCallback } from 'react';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Svg, { Path } from 'react-native-svg';
import { tailwind } from '../../../tailwind-theme/tailwind';
import { useHaptic } from '../../../utils/useHaptic';
import { Icon } from '../../components/common/Icon';
import { NotchedHandle } from '../MetroSubwayBooking/UI';
import CrossIcon from '../Search/components/svg/CloseIcon';
import { SingleModeTicketBookingProps, SingleModeTicketBookingAction } from './Types';
import { GenericStopsPicker, GenericStopsPickerItem } from './components/GenericStopsPicker';
import { useBusRouteToggle } from './hooks/useBusRouteToggle';
import { BusTransitInfoCard } from './components/BusTransitInfoCard';
import { transportRoute } from '@/readOnly/api/types/PublicTransportData.gen';
import { Resolver } from '@/typescript/utils/common';
import { logger } from '@/src-v2/systems/logger';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { MemoizedNewTimeTableUI as NewTimeTableUI } from '@/src-v2/multimodal/screens/NewTimeTable/UI';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { getUserLanguageStringsForMode } from '../../utils/BusServiceUtils';

export const ToggleBusRoute = ({ fill }: { fill: string }) => {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.216 6.9866L14.2118 2.98242L13.1512 4.04308L16.114 7.00589H5.10571V8.50589H16.1105L13.1512 11.4653L14.2118 12.5259L18.216 8.52174C18.642 8.09576 18.642 7.41258 18.216 6.9866ZM7.88856 15.495H18.8945V16.995H7.88822L10.8495 19.9562L9.78881 21.0169L5.78464 17.0127C5.35866 16.5868 5.35866 15.9036 5.78464 15.4776L9.78881 11.4734L10.8495 12.5341L7.88856 15.495Z"
                fill={fill}
            />
        </Svg>
    );
};

const NoToggleBusRoute = ({ fill }: { fill: string }) => {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M20.7064 11.152L15.3395 5.78516L14.2789 6.84582L18.6857 11.2526H3.31519V12.7526H18.681L14.2789 17.1547L15.3395 18.2154L20.7064 12.8486C21.1776 12.3773 21.1776 11.6232 20.7064 11.152ZM19.4001 12.0335L19.4333 12.0003L19.4001 11.9671V12.0335Z"
                fill={fill}
            />
        </Svg>
    );
};

const RouteToggleButton = React.memo(
    ({
        route,
        mpDispatch,
    }: {
        route: transportRoute | undefined;
        mpDispatch: Resolver<SingleModeTicketBookingAction>;
    }) => {
        const routeNameParts = useMemo(() => route?.longName?.split('To') || [], [route?.longName]);
        const configManager = useConfigContext();
        const colors = configManager.get('themeColors');
        return (
            <Pressable
                onPress={() => mpDispatch(createAction('TOGGLE_ROUTE', undefined))}
                testID={'a02a9433-c756-4a8d-ae25-792f79b2b5c8'}
                accessibilityRole="button"
                accessibilityLabel={
                    route?.reverseRoute
                        ? `Switch route direction from ${routeNameParts[1]?.trim()} to ${routeNameParts[0]?.trim()}`
                        : `Switch route direction from ${routeNameParts[0]?.trim()} to ${routeNameParts[1]?.trim()}`
                }>
                <Animated.View
                    style={tailwind.style(
                        `flex-row justify-between items-center bg-[${colors.CrossButton_bg}] rounded-[12px] min-h-[38px] px-3`,
                    )}>
                    <Animated.View style={tailwind.style('flex-1 justify-center items-center overflow-hidden')}>
                        <Animated.Text
                            entering={SlideInRight}
                            exiting={SlideOutRight}
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] text-center capitalize',
                            )}>
                            {routeNameParts[0]?.trim()}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View
                        style={tailwind.style('bg-white rounded-[12px] justify-center items-center w-[38px] h-9 mx-3')}>
                        <Icon
                            style={tailwind.style('bg-white')}
                            icon={
                                route?.reverseRoute ? (
                                    <ToggleBusRoute fill="#0356CA" />
                                ) : (
                                    <NoToggleBusRoute fill="#0356CA" />
                                )
                            }
                            size={24}
                            color="#0356CA"
                        />
                    </Animated.View>
                    <Animated.View style={tailwind.style('flex-1 justify-center items-center overflow-hidden')}>
                        <Animated.Text
                            entering={SlideInLeft}
                            exiting={SlideOutLeft}
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] text-center capitalize',
                            )}>
                            {routeNameParts[1]?.trim()}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            </Pressable>
        );
    },
);

export const SingleModeTicketBookingUI = React.memo<SingleModeTicketBookingProps>(props => {
    const {
        route,
        routeStops,
        sourceCode,
        destCode,
        mode,
        mpDispatch,
        upcomingBusInfo,
        numberOfBuses,
        appName,
        timeTableProps,
    } = props;
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    console.info(destCode, 'destCodedestCodedestCodedestCodedestCodedestCodedestCode');
    const [destinationPickerSheetVisible, setDestinationPickerSheetVisible] = useState(true);
    const tenHoursInSeconds = 10 * 60 * 60;
    const themeColors = configManager.get('themeColors');
    const { directBusBookingTimeTableRef } = useRefsContext();

    const formattedArrivalTime = useMemo(() => {
        if (!upcomingBusInfo?.arrivalTimeInSeconds) return '';
        const minutes = Math.floor(upcomingBusInfo.arrivalTimeInSeconds / 60);
        if (minutes === 0) return '';
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours > 0) {
            return `${hours} ${userLanguageStrings.Hour} ${remainingMinutes} ${userLanguageStrings.Minutes}`;
        }
        return `${minutes} ${userLanguageStrings.Minutes}`;
    }, [upcomingBusInfo?.arrivalTimeInSeconds]);

    const handleSelectDestination = (item: GenericStopsPickerItem, isExpanded: boolean) => {
        handleOnChangeDestination(item);
        setDestinationPickerSheetVisible(isExpanded);
    };

    const handleSelectSource = (item: GenericStopsPickerItem, _isExpanded: boolean) => {
        handleOnChangeSource(item);
    };

    const haptic = useHaptic(HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });

    const selectedSourceStop = useMemo(() => {
        return routeStops?.find(stop => stop.stopCode === sourceCode);
    }, [routeStops, sourceCode]);

    // Use our custom hook for bus route toggle logic
    const {
        selectedSourceItem,
        selectedDestinationItem,
        sourceStopsList,
        destinationStopsList,
        handleOnChangeSource,
        handleOnChangeDestination,
    } = useBusRouteToggle(routeStops || [], sourceCode || '', destCode || '', props.setSourceCode, props.setDestCode);

    const handleOnBookTicket = useCallback(() => {
        logger.logInfo(`Route Code: ${route?.code} - Book Ticket Button Clicked`, 'BookingFlow');
        haptic?.();
        mpDispatch(createAction('BOOK_TICKET', undefined));
    }, [haptic, mpDispatch]);

    const handleLiveOrGTFSClick = useCallback(() => {
        logEvent(EventName.NY_BUS_TRACK_BUS);
        mpDispatch(createAction('LIVE_OR_GTFS_CLICK', undefined));
    }, [mpDispatch]);

    const handleGoBack = useCallback(() => {
        mpDispatch(createAction('GO_BACK', undefined));
    }, [mpDispatch]);

    const contentContainerStyle = useMemo(
        () => tailwind.style(`pb-[${bottom + 16}px] flex justify-start items-start`),
        [bottom],
    );

    const bookTicketButtonStyle = useMemo(
        () =>
            tailwind.style(
                `bg-[${
                    themeColors.single_mode_book_ticket_bg_color
                }] mx-5 min-h-14 justify-center items-center rounded-[16px]`,
                `mb-[${bottom ? bottom : 16}px]`,
            ),
        [bottom, themeColors],
    );

    return (
        <HardwareBackpressHandler>
            <>
                <View style={tailwind.style('flex-1 bg-[#F4F4F4]')}>
                    {/* Overlay container allows touches to pass through except on card */}
                    <View
                        style={[
                            { flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
                            tailwind.style('z-10'),
                        ]}
                        pointerEvents="box-none">
                        <Animated.View
                            pointerEvents="auto"
                            style={[
                                tailwind.style(`mt-[${top + 16}px]`, 'bg-[#f4f4f4] flex-1'),
                                {
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.18,
                                    shadowRadius: 35.0,
                                    elevation: 24,
                                },
                            ]}>
                            <Animated.View style={tailwind.style('flex justify-start items-start')}>
                                <NotchedHandle />
                                <Animated.View style={tailwind.style('pl-4 flex')}>
                                    <Pressable
                                        onPress={handleGoBack}
                                        testID={'8853cdcd-96a0-41e9-bc1c-681015f21eae'}
                                        accessibilityRole="button"
                                        accessibilityLabel="Go back to previous screen button">
                                        <Animated.View
                                            style={[
                                                tailwind.style(
                                                    `p-[10px] rounded-full bg-[${themeColors.CrossButton_bg}] `,
                                                ),
                                            ]}>
                                            <Icon icon={<CrossIcon />} size={16} />
                                        </Animated.View>
                                    </Pressable>
                                </Animated.View>
                            </Animated.View>
                            <Animated.View style={tailwind.style('px-[18px] pt-[18px]')}>
                                <RouteToggleButton route={route} mpDispatch={mpDispatch} />
                            </Animated.View>
                            <Animated.ScrollView
                                showsVerticalScrollIndicator={false}
                                style={tailwind.style('mt-4')}
                                contentContainerStyle={contentContainerStyle}
                                accessibilityLabel={`Booking details for ${route?.longName}. Use this screen to choose source and destination stops, view bus timing, and book your ticket.`}>
                                <Animated.View style={tailwind.style(' w-full')}>
                                    <Animated.View
                                        style={tailwind.style(
                                            'bg-white mx-4 rounded-[24px] border border-[#F1F2F2] overflow-hidden',
                                        )}>
                                        <BusTransitInfoCard
                                            routeShortName={route?.shortName}
                                            serviceType={upcomingBusInfo?.serviceType}
                                            serviceName={upcomingBusInfo?.serviceName}
                                            arrivalTimeInSeconds={
                                                upcomingBusInfo?.arrivalTimeInSeconds
                                                    ? [upcomingBusInfo?.arrivalTimeInSeconds]
                                                    : undefined
                                            }
                                            onTrackBus={handleLiveOrGTFSClick}
                                            selectedStopName={selectedSourceStop?.stopName ?? undefined}
                                            mode={mode}
                                            userLanguageStrings={userLanguageStrings}
                                            source={upcomingBusInfo?.source}
                                            busesOnRoute={numberOfBuses}
                                            hasUpcomingBusInfo={upcomingBusInfo !== null}
                                        />

                                        {/* Source Picker */}
                                        <Animated.View
                                            layout={LinearTransition.springify().damping(34).stiffness(240)}
                                            style={tailwind.style('pt-0.5')}>
                                            {sourceStopsList && sourceStopsList.length > 0 ? (
                                                <GenericStopsPicker
                                                    onSelect={handleSelectSource}
                                                    initialSelectedItem={
                                                        selectedSourceItem ?? {
                                                            id: 0,
                                                            name: userLanguageStrings.SelectSource,
                                                            code: undefined,
                                                        }
                                                    }
                                                    list={sourceStopsList}
                                                    initialExpanded={false}
                                                    shouldCollapseAfterSelect={true}
                                                    title={
                                                        upcomingBusInfo?.arrivalTimeInSeconds !== undefined &&
                                                        upcomingBusInfo?.arrivalTimeInSeconds <= tenHoursInSeconds &&
                                                        appName !== 'odishaYatri'
                                                            ? formattedArrivalTime
                                                                ? userLanguageStrings.ArrivesInAt(formattedArrivalTime)
                                                                : userLanguageStrings.ArrivesAt
                                                            : userLanguageStrings.Source
                                                    }
                                                    expandedTitle={userLanguageStrings.Source}
                                                    isStandAlone={false}
                                                    routeToggle={undefined}
                                                    pickerType="SOURCE"
                                                />
                                            ) : null}
                                        </Animated.View>
                                        {/* Source Picker */}
                                    </Animated.View>

                                    {/* Destination Picker */}
                                    <Animated.View
                                        layout={LinearTransition.springify().damping(34).stiffness(240)}
                                        style={tailwind.style('mt-4 mx-4 rounded-[24px] overflow-hidden')}>
                                        {destinationStopsList && destinationStopsList.length > 0 ? (
                                            <GenericStopsPicker
                                                onSelect={handleSelectDestination}
                                                initialSelectedItem={
                                                    selectedDestinationItem ?? {
                                                        id: 0,
                                                        name: userLanguageStrings.SelectDestination,
                                                        code: undefined,
                                                    }
                                                }
                                                list={destinationStopsList}
                                                initialExpanded={true}
                                                shouldCollapseAfterSelect={true}
                                                title={userLanguageStrings.Destination}
                                                expandedTitle={userLanguageStrings.Destination}
                                                isStandAlone={true}
                                                routeToggle={undefined}
                                                pickerType="DESTINATION"
                                            />
                                        ) : null}
                                    </Animated.View>
                                    {/* Destination Picker */}
                                </Animated.View>
                            </Animated.ScrollView>
                            {!destinationPickerSheetVisible ? (
                                <Animated.View
                                    entering={SlideInDown.springify().damping(29).stiffness(300)}
                                    exiting={SlideOutDown.springify().damping(29).stiffness(300)}
                                    style={tailwind.style('justify-end bg-[#F5F5F5] pt-4')}>
                                    <Pressable
                                        style={bookTicketButtonStyle}
                                        onPress={handleOnBookTicket}
                                        testID={'fcafd56d-1f5b-4a75-aaa3-5fa7f2b967bc'}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Book ${
                                            mode === 'SUBWAY' ? 'train' : mode?.toLowerCase()
                                        } ticket button`}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[16px] leading-[22px] font-areaNormal-bold text-center capitalize text-white',
                                            )}>
                                            {userLanguageStrings.BookTicket(
                                                getUserLanguageStringsForMode(
                                                    mode === 'SUBWAY' ? 'Train' : mode,
                                                    userLanguageStrings,
                                                ),
                                            )}
                                        </Animated.Text>
                                    </Pressable>
                                </Animated.View>
                            ) : null}
                        </Animated.View>
                    </View>
                </View>
                {timeTableProps && <NewTimeTableUI {...timeTableProps} sheetRef={directBusBookingTimeTableRef} />}
            </>
        </HardwareBackpressHandler>
    );
});
