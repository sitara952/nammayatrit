import { ChevronRight } from '@/src-v2/assets/svg/Arrows';
import { ClockSvg } from '@/src-v2/assets/svg/Clock';
import { DestinationSvg } from '@/src-v2/assets/svg/Destination';
import QuestionMark from '@/src-v2/assets/svg/QuestionMark';
import { Spinner } from '@/src-v2/multimodal/components/common/Spinner/UI';
import {
    AutoIcon,
    BusIcon,
    BusIconMissed,
    BusIconWillBeMissed,
    MetroIcon,
    MetroIconMissed,
    MetroIconWillBeMissed,
    TrainIcon,
    TrainIconMissed,
    TrainIconWillBeMissed,
    WalkIcon,
    BikeIconJourney,
} from '@/src-v2/multimodal/components/svg/transport';
import { CarIcon } from '@/src-v2/multimodal/components/svg/transport/CarIcon';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import { useEffect, useState } from 'react';

import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import TickIcon from '../assets/svg/TickIcon';
import { JourneyState, Transit } from '../components/Iternary/types';
import { capitalize } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { TransitMode } from '@/src-v2/multimodal/types/journeyTracking';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { strings } from 'config-types';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';

export const getColor = (type: Transit, state: JourneyState | undefined) => {
    switch (type) {
        case 'BUS':
            if (state === 'VEHICLEWASMISSED') {
                return '#F24649';
            } else {
                return '#FFE898';
            }
        case 'WALK':
            return '#828386';
        case 'SUBWAY':
            if (state === 'VEHICLEWASMISSED') {
                return '#F24649';
            } else {
                return '#C6E4B7';
            }
        case 'EXITSTATION':
        case 'METRO':
            if (state === 'VEHICLEWASMISSED') {
                return '#F24649';
            } else {
                return '#CCE6F6';
            }
        case 'DESTINATION':
            return '#097B42';
        case 'WAITING':
            if (state === 'VEHICLEALMOSTARRIVED') {
                return '#FD8505';
            } else {
                return '#5AB8FF';
            }
        case 'FARAWAY':
            return '#FF683A';
        case 'NOTMOVING':
            return '#656565';
        case 'AUTO':
        case 'BIKE':
        case 'TAXI':
            return state === 'RIDESKIPPED' ? '#F0F0F0' : '#E1D4F8';
        case 'REFRESHING':
        case 'RELOADING':
            return '#969696';
    }
};

export const getTransitHeading = (
    type: Transit,
    exitGate: string | undefined,
    state: JourneyState | undefined,
    distance: number | undefined,
    place: string | undefined,
    vehicleDetail: string | undefined,
    NextLeg: Transit | undefined,
    transitMode: TransitMode | undefined,
    userLanguageStrings: strings,
) => {
    switch (type) {
        case 'BUS':
            return userLanguageStrings.BusToPlace(vehicleDetail || '', place || '');
        case 'WALK':
            return userLanguageStrings.WalkToPlace(distance || 0, place || '');
        case 'SUBWAY':
            return userLanguageStrings.TrainToPlace(place || '');
        case 'EXITSTATION':
            return transitMode === 'SUBWAY'
                ? userLanguageStrings.TakeAvailableExitGate
                : exitGate
                  ? userLanguageStrings.ExitFrom(exitGate)
                  : userLanguageStrings.ScanTicketToExit;
        case 'METRO':
            return userLanguageStrings.MetroToPlace(vehicleDetail || '', place || '');
        case 'DESTINATION':
            return userLanguageStrings.DestinationPlace(place || '');
        case 'WAITING':
            return NextLeg === 'BUS'
                ? userLanguageStrings.WaitingForBusInPlace(vehicleDetail || '', place || '')
                : userLanguageStrings.WaitInPlaceFor(
                      place || '',
                      NextLeg === 'SUBWAY' ? 'train' : NextLeg?.toLowerCase() || '',
                  );
        case 'FARAWAY':
            return userLanguageStrings.YouAreFarAwayFrom(place || '');
        case 'NOTMOVING':
            return userLanguageStrings.YouAreNotMovingInBetweenTransit;
        case 'BIKE':
            if (state === 'RIDESKIPPED') {
                return userLanguageStrings.ReachOffline(place || '');
            } else if (state === 'NODRIVERFOUND') {
                return userLanguageStrings.BikeToPlace(place || '');
            } else {
                return userLanguageStrings.BikeToPlace(place || '');
            }
        case 'AUTO':
            if (state === 'RIDESKIPPED') {
                return userLanguageStrings.ReachOffline(place || '');
            } else if (state === 'NODRIVERFOUND') {
                return userLanguageStrings.AutoToPlace(place || '');
            } else {
                return userLanguageStrings.AutoToPlace(place || '');
            }
        case 'TAXI':
            if (state === 'RIDESKIPPED') {
                return userLanguageStrings.ReachOffline(place || '');
            } else if (state === 'NODRIVERFOUND') {
                return userLanguageStrings.CabToPlace(place || '');
            } else {
                return userLanguageStrings.CabToPlace(place || '');
            }
        case 'REFRESHING':
            return userLanguageStrings.RefreshingToGetCurrentLocation;
        case 'RELOADING':
            return userLanguageStrings.ProcessingYourRequest;
    }
};

export const getTransitDesc = (
    type: Transit,
    time: number | undefined,
    state: JourneyState | undefined,
    NoOfStops: number | undefined,
    switchToWalk: (() => void) | undefined,
    onCall: (() => void) | undefined,
    onBoost: (() => void) | undefined,
    onRetryBooking: (() => Promise<void>) | undefined,
    onViewTimetable: (() => void) | undefined,
    onCheckIn: () => void,
    NextLeg: Transit | undefined,
    onSafety: (() => void) | undefined,
    scheduledArrivalTime: string | undefined,
    completeJourneyModalRef: React.RefObject<BottomSheetModal | null> | null,
    userLanguageStrings: strings,
) => {
    const mapVehicleType = (
        type: Transit, //
    ) =>
        type === 'BUS'
            ? 'bus'
            : type === 'SUBWAY'
              ? 'train'
              : type === 'METRO'
                ? 'metro'
                : type === 'AUTO'
                  ? 'auto'
                  : type === 'BIKE'
                    ? 'bike'
                    : 'cab';

    const types = type === 'WAITING' && NextLeg ? mapVehicleType(NextLeg) : mapVehicleType(type);

    switch (type) {
        case 'BUS':
        case 'SUBWAY':
        case 'METRO':
            if (state === 'VEHICLEISARRIVING' || state === 'VEHICLEALMOSTARRIVED') {
                return (
                    <Animated.Text style={tailwind.style('text-[#097B42] text-[14px] font-areaNormal-extrabold')}>
                        {userLanguageStrings.NextVehicleIn(
                            getUserLanguageStringsForMode(types, userLanguageStrings),
                            time || 0,
                        )}
                    </Animated.Text>
                );
            } else if (state === 'VEHICLEARRIVED') {
                return (
                    <Animated.View
                        layout={LinearTransition}
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={tailwind.style('flex-row  justify-between w-full')}>
                        <Animated.Text
                            numberOfLines={2}
                            style={tailwind.style('text-[14px] text-[#656565] mt-1 font-areaNormal-extrabold w-[60%]')}>
                            {userLanguageStrings.YouAreIn(getUserLanguageStringsForMode(types, userLanguageStrings))}
                        </Animated.Text>
                        <CheckInTimer onCheckIn={onCheckIn} userLanguageStrings={userLanguageStrings} />
                    </Animated.View>
                );
            } else if (state === 'RIDESTARTED') {
                return (
                    <Animated.Text style={tailwind.style('text-[#EF7C00] text-[14px] font-areaNormal-extrabold')}>
                        {NoOfStops && NoOfStops > 0
                            ? userLanguageStrings.StopsLeft(NoOfStops)
                            : userLanguageStrings.GetDownInNextStop}
                    </Animated.Text>
                );
            } else if (state === 'RIDEREACHEDDESTINATION') {
                return (
                    <Animated.Text style={tailwind.style('text-[#EF7C00] text-[14px] font-areaNormal-extrabold')}>
                        {userLanguageStrings.ReachedDestination}
                    </Animated.Text>
                );
            } else if (state === 'VEHICLEWILLBEMISSED') {
                return (
                    <Animated.Text style={tailwind.style('text-[#EF7C00] text-[14px] font-areaNormal-extrabold ')}>
                        {userLanguageStrings.YouWillMissLastScheduled(
                            getUserLanguageStringsForMode(types, userLanguageStrings),
                        )}
                    </Animated.Text>
                );
            } else if (state === 'VEHICLEWASMISSED') {
                return (
                    <Animated.Text style={tailwind.style('text-[#FC5518] text-[14px] font-areaNormal-extrabold ')}>
                        {userLanguageStrings.YouMissedThe(getUserLanguageStringsForMode(types, userLanguageStrings))}
                    </Animated.Text>
                );
            } else if (state === 'NOLIVEDATA') {
                const getScheduledText = () => {
                    if (scheduledArrivalTime) {
                        return userLanguageStrings.ScheduledAt(scheduledArrivalTime);
                    }
                    return time && time > 0
                        ? userLanguageStrings.ScheduledIn(time)
                        : userLanguageStrings.ScheduledForNow;
                };

                return (
                    <Animated.View style={tailwind.style('w-full mb-2 flex-row justify-between')}>
                        <Animated.Text
                            style={tailwind.style('text-[#3B3A3C] text-[14px] font-areaNormal-extrabold mt-1 w-[50%]')}
                            numberOfLines={2}>
                            {getScheduledText()}
                        </Animated.Text>
                        <Pressable
                            onPress={onViewTimetable}
                            accessibilityLabel={'Timetable button'}
                            accessibilityRole="button"
                            accessible={true}
                            testID={'new_live_journey_view_timetable'}>
                            <Animated.Text
                                accessibilityRole="button"
                                style={tailwind.style(
                                    'text-[#016ACD] text-[14px] font-areaNormal-extrabold mt-1 text-left',
                                )}>
                                {userLanguageStrings.Timetable}
                            </Animated.Text>
                        </Pressable>
                    </Animated.View>
                );
            } else {
                return (
                    <Animated.Text style={tailwind.style('text-[#EF7C00] text-[14px] font-areaNormal-extrabold')}>
                        {userLanguageStrings.GetDownInNextStopAction}
                    </Animated.Text>
                );
            }

        case 'AUTO':
        case 'BIKE':
        case 'TAXI':
            if (state === 'VEHICLEBOOKINGPENDING') {
                return (
                    <Animated.View style={tailwind.style('w-full mb-2 flex-row justify-between')}>
                        <Pressable
                            accessibilityLabel={'Switch to walk button'}
                            accessibilityRole="button"
                            onPress={switchToWalk}
                            testID={'new_live_journey_book_now'}>
                            <Animated.Text
                                accessibilityRole="button"
                                style={tailwind.style(
                                    'text-[#016ACD] text-[14px] font-areaNormal-extrabold mt-1 w-full text-left',
                                )}>
                                {userLanguageStrings.SwitchToWalk}
                            </Animated.Text>
                        </Pressable>
                    </Animated.View>
                );
            } else if (state === 'SEARCHINGFORVEHICLE') {
                return (
                    <Animated.View style={tailwind.style('flex-row justify-between w-full')}>
                        <Animated.Text
                            style={tailwind.style('text-[#3B3A3C] text-[14px] font-areaNormal-extrabold w-[50%]')}>
                            {userLanguageStrings.SearchingRide}
                        </Animated.Text>
                        <Pressable
                            accessibilityRole="button"
                            onPress={onBoost}
                            testID={'new_live_journey_boost'}
                            accessibilityLabel={'Boost search button'}>
                            <Animated.Text
                                accessibilityRole="button"
                                style={tailwind.style('text-[#016ACD] text-[14px] font-areaNormal-extrabold w-full')}>
                                {userLanguageStrings.BoostSearch}
                            </Animated.Text>
                        </Pressable>
                    </Animated.View>
                );
            } else if (state === 'RIDESKIPPED') {
                return (
                    <Animated.View style={tailwind.style('flex-row justify-between w-full ')}>
                        <Animated.Text style={tailwind.style('text-[#969696] text-[14px] font-areaNormal-extrabold')}>
                            {userLanguageStrings.RideCancelled}
                        </Animated.Text>
                        <Pressable
                            accessibilityLabel={'Retry button'}
                            accessibilityRole="button"
                            onPress={onRetryBooking}
                            testID={'new_live_journey_retry_booking'}>
                            <Animated.Text
                                accessibilityRole="button"
                                style={tailwind.style('text-[#016ACD] text-[14px] font-areaNormal-extrabold w-full')}>
                                {userLanguageStrings.Retry}
                            </Animated.Text>
                        </Pressable>
                    </Animated.View>
                );
            } else if (state === 'NODRIVERFOUND') {
                return (
                    <Animated.View style={tailwind.style('flex-col justify-between w-full ')}>
                        <Animated.Text style={tailwind.style('text-[#3B3A3C] text-[14px] font-areaNormal-extrabold ')}>
                            {userLanguageStrings.CouldntFindDriver}
                        </Animated.Text>
                        <Pressable
                            accessibilityLabel={'Retry button'}
                            accessibilityRole="button"
                            onPress={onRetryBooking}
                            style={tailwind.style('w-full')}
                            testID={'new_live_journey_retry'}>
                            <Animated.Text
                                accessibilityRole="button"
                                style={tailwind.style('text-[#016ACD] text-[14px] font-areaNormal-extrabold w-full')}>
                                {userLanguageStrings.Retry}
                            </Animated.Text>
                        </Pressable>
                    </Animated.View>
                );
            } else if (state === 'VEHICLEISARRIVING' || state === 'VEHICLEALMOSTARRIVED') {
                return (
                    <Animated.View style={tailwind.style('flex-row justify-between w-full pt-1')}>
                        <Animated.Text
                            numberOfLines={2}
                            style={tailwind.style('text-[#097B42] text-[14px] font-areaNormal-extrabold w-[70%]')}>
                            {userLanguageStrings.DriverIsOnTheWay}
                        </Animated.Text>
                        <Pressable
                            accessibilityLabel={'Call button'}
                            accessibilityRole="button"
                            onPress={onCall}
                            testID={'new_live_journey_call_driver_on_the_way'}>
                            <Animated.Text
                                accessibilityRole="button"
                                style={tailwind.style('text-[#016ACD] text-[14px] font-areaNormal-extrabold')}>
                                {userLanguageStrings.Call}
                            </Animated.Text>
                        </Pressable>
                    </Animated.View>
                );
            } else if (state === 'VEHICLEARRIVED') {
                return (
                    <Animated.View
                        layout={LinearTransition}
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={tailwind.style('flex-row justify-between w-full pt-1')}>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style('text-[14px] text-[#097B42] font-areaNormal-extrabold')}>
                            {userLanguageStrings.DriverArrived}
                        </Animated.Text>
                        <Pressable
                            accessibilityLabel={'Call button'}
                            accessibilityRole="button"
                            onPress={onCall}
                            testID={'new_live_journey_call_driver_arrived'}>
                            <Animated.Text
                                accessibilityRole="button"
                                style={tailwind.style('text-[#016ACD] text-[14px] font-areaNormal-extrabold')}>
                                {userLanguageStrings.Call}
                            </Animated.Text>
                        </Pressable>
                    </Animated.View>
                );
            } else if (state === 'RIDEREACHEDDESTINATION') {
                return (
                    <Animated.Text style={tailwind.style('text-[#EF7C00] text-[14px] font-areaNormal-extrabold')}>
                        {userLanguageStrings.ReachedDestination}
                    </Animated.Text>
                );
            }
            return (
                <Animated.View style={tailwind.style('flex-row justify-between w-full pt-1')}>
                    <Animated.Text
                        numberOfLines={2}
                        style={tailwind.style('text-[#969696] text-[14px] font-areaNormal-extrabold w-[60%]')}>
                        {`Reaching `} {time === 0 ? 'now' : `in ${time} mins`}
                    </Animated.Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={'Safety button'}
                        onPress={onSafety}
                        testID={'new_live_journey_safety'}>
                        <Animated.Text
                            style={tailwind.style('text-[#016ACD] text-[14px] font-areaNormal-extrabold')}
                            accessibilityRole="button">
                            {userLanguageStrings.Safety}
                        </Animated.Text>
                    </Pressable>
                </Animated.View>
            );
        case 'WALK':
            return (
                <Animated.Text style={tailwind.style('text-[#969696] text-[14px] font-areaNormal-extrabold')}>
                    {time && time > 0 ? `${time} ${userLanguageStrings.Mins}` : userLanguageStrings.Now}
                </Animated.Text>
            );
        case 'DESTINATION':
            return [
                'RIDESTARTED',
                'RIDECLOSETODESTINATION',
                'ARRIVEDATSTATIONPLATFORM',
                'RIDEREACHEDDESTINATION',
            ].includes(state ?? '') ? (
                <Animated.View style={tailwind.style('w-full mb-2 flex-row justify-between')}>
                    <Pressable
                        accessibilityLabel="Complete button"
                        testID="new_live_journey_complete_btn"
                        accessible={true}
                        accessibilityRole="button"
                        onPress={() => completeJourneyModalRef?.current?.present()}>
                        <Animated.Text style={tailwind.style('text-[#016ACD] text-[14px] font-areaNormal-extrabold')}>
                            {userLanguageStrings.Complete}
                        </Animated.Text>
                    </Pressable>
                </Animated.View>
            ) : (
                <Animated.View style={tailwind.style('flex-row items-center justify-between w-full')}>
                    <Animated.Text style={tailwind.style('text-[#097B42] text-[14px] font-areaNormal-extrabold')}>
                        {time && time > 0 ? `${time} ${userLanguageStrings.Mins}` : userLanguageStrings.Now}
                    </Animated.Text>
                    <Pressable
                        accessibilityLabel={'Complete button'}
                        testID="new_live_journey_complete"
                        accessibilityRole="button"
                        onPress={() => completeJourneyModalRef?.current?.present()}>
                        <Animated.Text
                            style={tailwind.style('text-[#016ACD] text-[14px] font-areaNormal-extrabold')}
                            accessibilityRole="button">
                            {userLanguageStrings.Complete}
                        </Animated.Text>
                    </Pressable>
                </Animated.View>
            );
        case 'WAITING':
            if (state === 'VEHICLEARRIVED') {
                return (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[#EF7C00] font-areaNormal-extrabold',
                        )}>{`${capitalize(NextLeg === 'SUBWAY' ? 'Train' : NextLeg)} Arrived. Board Now!`}</Animated.Text>
                );
            } else if (state === 'NOLIVEDATA') {
                return (
                    <Animated.View
                        layout={LinearTransition}
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={tailwind.style('flex-row items-center justify-between w-full')}>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style('text-[14px] text-[#656565] mt-1 font-areaNormal-extrabold')}>
                            {`${userLanguageStrings.BoardedVehicle(getUserLanguageStringsForMode(types, userLanguageStrings))} `}
                        </Animated.Text>
                        <CheckInTimer onCheckIn={onCheckIn} userLanguageStrings={userLanguageStrings} />
                    </Animated.View>
                );
            } else {
                // Hide "Takes X mins" for bus next leg since the bus card already shows arrival time and singleModeBus is true
                if (NextLeg === 'BUS') {
                    return null;
                }
                return (
                    <Animated.Text style={tailwind.style('text-[#969696] text-[14px] font-areaNormal-extrabold')}>
                        {time && time > 0 ? userLanguageStrings.TakesMins(time) : userLanguageStrings.Now}
                    </Animated.Text>
                );
            }
        case 'REFRESHING':
            return (
                <Animated.Text style={tailwind.style('text-[#969696] text-[14px] font-areaNormal-extrabold')}>
                    {time} {userLanguageStrings.Seconds}
                </Animated.Text>
            );
        case 'EXITSTATION':
            return (
                <Animated.Text
                    style={tailwind.style(
                        'text-[#EF7C00] text-[14px] font-areaNormal-extrabold',
                    )}>{`${userLanguageStrings.ReachedDestination}`}</Animated.Text>
            );
        default:
            return null;
    }
};

export const getIcon = (
    type: Transit | '>',
    size = 24,
    color: string | undefined,
    state: JourneyState | undefined,
    transitMode: TransitMode | undefined,
) => {
    const getSubwayIcon = () => {
        return color ? (
            <Icon icon={<TrainIcon />} size={size} color={color} />
        ) : state === 'VEHICLEWILLBEMISSED' ? (
            <Icon icon={<TrainIconMissed />} size={size} color={color} />
        ) : state === 'VEHICLEWASMISSED' ? (
            <Icon icon={<TrainIconWillBeMissed />} size={size} />
        ) : (
            <Icon icon={<TrainIcon />} size={size} />
        );
    };

    const getMetroIcon = () => {
        return color ? (
            <Icon icon={<MetroIcon />} size={size} color={color} />
        ) : state === 'VEHICLEWILLBEMISSED' ? (
            <Icon icon={<MetroIconWillBeMissed />} size={size} color={color} />
        ) : state === 'VEHICLEWASMISSED' ? (
            <Icon icon={<MetroIconMissed />} size={size} />
        ) : (
            <Icon icon={<MetroIcon />} size={size} />
        );
    };

    switch (type) {
        case 'BUS':
            return color ? (
                <Icon icon={<BusIcon />} size={size} color={color} />
            ) : state === 'VEHICLEWILLBEMISSED' ? (
                <Icon icon={<BusIconWillBeMissed />} size={size} color={color} />
            ) : state === 'VEHICLEWASMISSED' ? (
                <Icon icon={<BusIconMissed />} size={size} color={color} />
            ) : (
                <Icon icon={<BusIcon />} size={size} />
            );
        case 'WALK':
            return color ? (
                <Icon icon={<WalkIcon />} size={size} color={color} />
            ) : (
                <Icon icon={<WalkIcon />} size={size} />
            );
        case 'EXITSTATION':
            return transitMode === 'SUBWAY' ? getSubwayIcon() : getMetroIcon();
        case 'SUBWAY':
            return getSubwayIcon();
        case 'METRO':
            return getMetroIcon();
        case 'WAITING':
            return <Icon icon={<ClockSvg />} size={size} color={color} />;
        case 'DESTINATION':
            return <Icon icon={<DestinationSvg />} size={size} />;
        case '>':
            return <Icon icon={<ChevronRight />} size={size} color={color} style={tailwind.style('pt-0.5')} />;
        case 'FARAWAY':
            return <Icon icon={<QuestionMark />} style={tailwind.style('pl-1')} />;
        case 'NOTMOVING':
            return <Animated.View style={tailwind.style('w-[12px] h-[12px] bg-white rounded-[4px]')}></Animated.View>;
        case 'AUTO':
            return <Icon icon={<AutoIcon />} size={size} color={color} />;
        case 'BIKE':
            return <Icon icon={<BikeIconJourney />} size={size} color={color} />;
        case 'TAXI':
            return <Icon icon={<CarIcon />} size={size} color={color} />;
        case 'REFRESHING':
        case 'RELOADING':
            return <Spinner size="md" themeColor="primary" track="transparent" stroke={'white'} />;
    }
};

export const getIsJourneyStatusHeading = (
    state: Transit | undefined,
    distance: number | undefined,
    toLocation: string | undefined,
    origin: string | undefined,
    isJourneyComplete: boolean,
    vehicleDetail: string | undefined,
    _exitGate: string | undefined,
    isFirstItem: boolean = false,
    isShowUpdate: boolean = true,
    userLanguageStrings: strings,
) => {
    // const commonPadding = `pt-[23px] pb-[18px] border-b border-red-500 `;
    const commonPadding = isFirstItem ? `` : `pt-[24px]`;
    switch (state) {
        case 'WALK':
            return (
                <Animated.View
                    style={tailwind.style(
                        `justify-between items-end ${commonPadding}`,
                        isJourneyComplete ? 'flex-col' : 'flex-row',
                    )}>
                    <Animated.Text
                        numberOfLines={2}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[20px] w-[80%]',
                            isJourneyComplete ? 'text-[#969696] w-full' : 'text-[#3B3A3C] ',
                        )}>
                        {userLanguageStrings.WalkToPlaceWithDistance(distance || 0, toLocation || '')}
                    </Animated.Text>
                    <Animated.View
                        style={tailwind.style(
                            isJourneyComplete ? 'w-full pt-[10px] pb-[10px] flex-row justify-between' : '',
                        )}>
                        {isJourneyComplete && (
                            <Animated.View style={tailwind.style('flex-row items-center gap-[4px]')}>
                                <Icon icon={<TickIcon fill="#09941E" />} size={14} />
                                <Animated.Text
                                    style={tailwind.style('text-[#656565] text-[12px] font-areaNormal-extrabold')}>
                                    {userLanguageStrings.WalkCompleted}
                                </Animated.Text>
                            </Animated.View>
                        )}
                        {isShowUpdate && (
                            <Animated.Text
                                style={tailwind.style('text-[#016ACD] text-[12px] font-areaNormal-extrabold')}>
                                {userLanguageStrings.Update}
                            </Animated.Text>
                        )}
                    </Animated.View>
                </Animated.View>
            );
        case 'BUS':
            return (
                <Animated.View
                    style={tailwind.style(
                        `justify-between items-end ${commonPadding}`,
                        isJourneyComplete ? 'flex-col' : 'flex-row',
                    )}>
                    <Animated.Text
                        numberOfLines={3}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[20px] w-[80%]',
                            isJourneyComplete ? 'text-[#969696] w-full' : 'text-[#3B3A3C] ',
                        )}>
                        {userLanguageStrings.BusFromToPlace(vehicleDetail || '', origin || '', toLocation || '')}
                    </Animated.Text>
                    <Animated.View
                        style={tailwind.style(
                            isJourneyComplete ? 'w-full pt-[10px] pb-[10px] flex-row justify-between' : '',
                        )}>
                        {isJourneyComplete && (
                            <Animated.View style={tailwind.style('flex-row items-center gap-[4px]')}>
                                <Icon icon={<TickIcon fill="#09941E" />} size={14} />
                                <Animated.Text
                                    style={tailwind.style('text-[#656565] text-[12px] font-areaNormal-extrabold')}>
                                    {userLanguageStrings.JourneyCompleted}
                                </Animated.Text>
                            </Animated.View>
                        )}
                        {isShowUpdate && (
                            <Animated.Text
                                style={tailwind.style('text-[#016ACD] text-[12px] font-areaNormal-extrabold')}>
                                {userLanguageStrings.Update}
                            </Animated.Text>
                        )}
                    </Animated.View>
                </Animated.View>
            );
        case 'METRO':
            return (
                <Animated.View
                    style={tailwind.style(
                        `justify-between items-end ${commonPadding}`,
                        isJourneyComplete ? 'flex-col' : 'flex-row',
                    )}>
                    <Animated.Text
                        numberOfLines={3}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[20px] w-[80%]',
                            isJourneyComplete ? 'text-[#969696] w-full' : 'text-[#3B3A3C] ',
                        )}>
                        {userLanguageStrings.MetroFromToPlace(vehicleDetail || '', origin || '', toLocation || '')}
                    </Animated.Text>
                    <Animated.View
                        style={tailwind.style(
                            isJourneyComplete ? 'w-full pt-[10px] pb-[10px] flex-row justify-between' : '',
                        )}>
                        {isJourneyComplete && (
                            <Animated.View style={tailwind.style('flex-row items-center gap-[4px]')}>
                                <Icon icon={<TickIcon fill="#09941E" />} size={14} />
                                <Animated.Text
                                    style={tailwind.style('text-[#656565] text-[12px] font-areaNormal-extrabold')}>
                                    {userLanguageStrings.JourneyCompleted}
                                </Animated.Text>
                            </Animated.View>
                        )}
                        {isShowUpdate && (
                            <Animated.Text
                                style={tailwind.style('text-[#016ACD] text-[12px] font-areaNormal-extrabold')}>
                                {userLanguageStrings.Update}
                            </Animated.Text>
                        )}
                    </Animated.View>
                </Animated.View>
            );
        case 'TAXI':
        case 'AUTO':
        case 'BIKE':
            return (
                <Animated.View
                    style={tailwind.style(
                        `justify-between items-end ${commonPadding}`,
                        isJourneyComplete ? 'flex-col' : 'flex-row',
                    )}>
                    <Animated.Text
                        numberOfLines={3}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[20px] w-[80%]',
                            isJourneyComplete ? 'text-[#969696] w-full' : 'text-[#3B3A3C] ',
                        )}>
                        {state === 'TAXI'
                            ? userLanguageStrings.TaxiFromToPlace(origin || '', toLocation || '')
                            : userLanguageStrings.AutoFromToPlace(origin || '', toLocation || '')}
                    </Animated.Text>
                    <Animated.View
                        style={tailwind.style(
                            isJourneyComplete ? 'w-full pt-[10px] pb-[10px] flex-row justify-between' : '',
                        )}>
                        {isJourneyComplete && (
                            <Animated.View style={tailwind.style('flex-row items-center gap-[4px]')}>
                                <Icon icon={<TickIcon fill="#09941E" />} size={14} />
                                <Animated.Text
                                    style={tailwind.style('text-[#656565] text-[12px] font-areaNormal-extrabold')}>
                                    {userLanguageStrings.RideCompleted}
                                </Animated.Text>
                            </Animated.View>
                        )}
                        {isShowUpdate && (
                            <Animated.Text
                                style={tailwind.style('text-[#016ACD] text-[12px] font-areaNormal-extrabold')}>
                                {userLanguageStrings.Update}
                            </Animated.Text>
                        )}
                    </Animated.View>
                </Animated.View>
            );
        case 'SUBWAY':
            return (
                <Animated.View
                    style={tailwind.style(
                        `justify-between items-end ${commonPadding}`,
                        isJourneyComplete ? 'flex-col' : 'flex-row',
                    )}>
                    <Animated.Text
                        numberOfLines={3}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[20px] w-[80%]',
                            isJourneyComplete ? 'text-[#969696] w-full' : 'text-[#3B3A3C] ',
                        )}>
                        {userLanguageStrings.SuburbanFromToPlace(origin || '', toLocation || '')}
                    </Animated.Text>
                    <Animated.View
                        style={tailwind.style(
                            isJourneyComplete ? 'w-full pt-[10px] pb-[10px] flex-row justify-between' : '',
                        )}>
                        {isJourneyComplete && (
                            <Animated.View style={tailwind.style('flex-row items-center gap-[4px]')}>
                                <Icon icon={<TickIcon fill="#09941E" />} size={14} />
                                <Animated.Text
                                    style={tailwind.style('text-[#656565] text-[12px] font-areaNormal-extrabold')}>
                                    {userLanguageStrings.JourneyCompleted}
                                </Animated.Text>
                            </Animated.View>
                        )}
                        {isShowUpdate && (
                            <Animated.Text
                                style={tailwind.style('text-[#016ACD] text-[12px] font-areaNormal-extrabold')}>
                                {userLanguageStrings.Update}
                            </Animated.Text>
                        )}
                    </Animated.View>
                </Animated.View>
            );
        case 'DESTINATION':
            return (
                <Animated.View style={tailwind.style(`flex-row  justify-between items-end ${commonPadding}`)}>
                    <Animated.Text
                        numberOfLines={2}
                        style={tailwind.style('text-[#3B3A3C] text-[13px] font-areaNormal-extrabold leading-[20px]')}>
                        {userLanguageStrings.DestinationPlace(toLocation || '')}
                    </Animated.Text>
                </Animated.View>
            );
        default:
            return null;
    }
};

const CheckInTimer = ({ onCheckIn, userLanguageStrings }: { onCheckIn: () => void; userLanguageStrings: strings }) => {
    const [seconds, setSeconds] = useState(10);
    useEffect(() => {
        if (seconds === 0) return;
        const interval = setInterval(() => {
            setSeconds(s => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [seconds]);
    // if (seconds === 0) return <></>;
    return (
        <Pressable
            accessibilityLabel={'Check in button'}
            accessibilityRole="button"
            onPress={onCheckIn}
            style={tailwind.style('text-[#016ACD]')}
            testID={'new_live_journey_check_in'}>
            <Animated.Text
                layout={LinearTransition}
                entering={FadeIn}
                exiting={FadeOut}
                accessibilityRole="button"
                style={tailwind.style('text-[14px]  text-[#016ACD] mt-1 font-areaNormal-extrabold  ')}>
                {userLanguageStrings.CheckIn}
            </Animated.Text>
        </Pressable>
    );
};
