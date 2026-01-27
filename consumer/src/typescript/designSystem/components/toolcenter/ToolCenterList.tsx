import React from 'react';
import { strings } from 'config-types';
import { Linking } from 'react-native';
import { tailwind } from '../../../tailwindTheme/tailwind';
import { ToolCenterCard } from './ToolCenterCard';
import { BookingId, createBookingId } from '../../../state/client/user';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import Typography from '../primitives/Typography';
import WalkIcon from '../../../assets/svg/symbols/WalkIcon';
import ShareRideIcon from '../../../assets/svg/symbols/ShareRideIcon';
import SafetyTools from '../../../assets/svg/symbols/SafetyTools';
import GoogleNavigation from '../../../assets/svg/symbols/GoogleNavigation';

import { selectRideDetailsWithId } from '@/typescript/state/client/ride';
import { ToolCenterFlags } from '../../../../../src-v2/systems/configs/types';
import {
    selectBookedSourceWithId,
    selectBookedStopsWithId,
    selectBookingDetailsWithId,
    selectRideIdWithBookingId,
} from '@/typescript/state/client/booking';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import { resetSosState } from '../../../state/client/sos';
import { EventName, logEvent } from '@/typescript/utils/logger';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import Animated from 'react-native-reanimated';
import { getGoogleMapsURL } from '@/typescript/constants/common';
import { getPickupInstructions } from '@/src-v2/utils/common';

const Elements = (userLanguageStrings: strings, destination: FormatedLocation | undefined) => [
    {
        imgSrc: <WalkIcon fill={undefined} />,
        label: userLanguageStrings.WalkingDirection,
        id: 'WalkingDirection',
        disabled: false,
    },
    {
        imgSrc: <GoogleNavigation fill={undefined} />,
        label: userLanguageStrings.GoogleNavigation,
        id: 'GoogleNavigation',
        disabled: destination === undefined,
    },
    {
        imgSrc: <ShareRideIcon fill={undefined} />,
        label: userLanguageStrings.Shareride,
        id: 'ShareRide',
        disabled: false,
    },
    {
        imgSrc: <SafetyTools fill={undefined} />,
        label: userLanguageStrings.SafetyTools,
        id: 'SafetyTools',
        disabled: false,
    },
];

export const ToolCenterList = ({
    toolCenterFlags,
    bookingId = null,
}: {
    toolCenterFlags: ToolCenterFlags;
    bookingId: BookingId | null | undefined;
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const bookedSource = useAppSelector(state => selectBookedSourceWithId(state, bookingId));
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
    const bookedStops = useAppSelector(state => selectBookedStopsWithId(state, bookingId));

    const toolCenterList = (userLanguageStrings: strings, flags: ToolCenterFlags, isDriverAssigned: boolean) => {
        return Elements(userLanguageStrings, bookedStops[bookedStops.length - 1]).filter(element => {
            switch (element.id) {
                case 'WalkingDirection':
                    return flags.walkDirection;
                case 'GoogleNavigation':
                    return flags.googleNavigation;
                case 'ShareRide':
                    return flags.shareToFriends && isDriverAssigned;
                case 'SafetyTools':
                    return flags.safetyTools;
                default:
                    return false;
            }
        });
    };

    const toolCenterItems = toolCenterList(userLanguageStrings, toolCenterFlags, rideDetails ? true : false);

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const dispatch = useAppDispatch();

    const openGoogleMapsWalking = async (src: FormatedLocation | undefined) => {
        if (src && src.lat && src.lng) {
            const url = getGoogleMapsURL(src, undefined, undefined);
            Linking.openURL(url);
        } else {
            console.error('Missing locations');
        }
    };

    const openGoogleMapsNavigation = async (destination: FormatedLocation | undefined, stops: FormatedLocation[]) => {
        if (destination) {
            const waypoints = stops.map(stop => `${stop.lat},${stop.lng}`).join('|');
            const url = getGoogleMapsURL(destination, waypoints, undefined);
            Linking.openURL(url);
        } else {
            console.error('Missing locations');
        }
    };

    function toolCardClick(id: string): void {
        switch (id) {
            case 'WalkingDirection':
                if (bookedSource) {
                    const url = getGoogleMapsURL(bookedSource, undefined, undefined);
                    const instructions = getPickupInstructions(
                        bookedSource,
                        bookingDetails?.specialLocationName,
                        bookingDetails?.fromLocation.title,
                    );
                    if (instructions.length > 0) {
                        // navigation.navigate('pickupInstructions', {
                        //     instructions: instructions,
                        //     openMapsUri: url,
                        // });
                        navigation.navigate('LiveTab', {
                            screen: 'pickupInstructions',
                            params: {
                                instructions: instructions,
                                openMapsUri: url,
                            },
                        });
                    } else {
                        openGoogleMapsWalking(bookedSource);
                    }
                }
                break;
            case 'GoogleNavigation':
                logEvent(EventName.NY_USER_RIDE_TRACK_GMAPS);
                openGoogleMapsNavigation(bookedStops[bookedStops.length - 1], bookedStops.slice(0, -1));
                break;
            case 'ShareRide':
                if (rideDetails) navigation.navigate('safetyCard', { bookingId: null, hideSideDrawer: false });
                break;
            case 'SafetyTools':
                logEvent(EventName.NY_IC_SAFETY_CENTER_CLICKED);
                dispatch(resetSosState());
                navigation.navigate('safetyTools', {
                    bookingId: createBookingId(bookingDetails?.id ?? ''),
                    isRideEnded: false,
                });
                break;
        }
    }

    if (toolCenterItems.length > 0) {
        return (
            <Animated.View style={tailwind.style('px-[16px] mt-[18px]')}>
                <Typography
                    type="body-1"
                    style={tailwind.style(`text-[${themeColors.Text_neutralHigh}] mb-[12px]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.ToolCenter}
                </Typography>
                <Animated.View style={tailwind.style('flex-row flex justify-between')}>
                    {toolCenterItems.map((tool, index) => {
                        return (
                            <ToolCenterCard
                                specialLocationTag={bookingDetails?.specialLocationTag}
                                initialActiveState={false}
                                key={index + tool.label}
                                id={tool.id}
                                label={tool.label}
                                imgSrc={tool.imgSrc}
                                numberOfElements={toolCenterItems.length}
                                canToggle={false}
                                onPress={toolCardClick}
                                horizontalAlignment="items-center"
                                disabled={tool.disabled}
                                textStyle={tailwind.style(`text-[${themeColors.Text_neutralHigh}]`)}
                                imgSize={undefined}
                                imgFill={undefined}
                                flexDirection={undefined}
                                style={undefined}
                                gap={undefined}
                                activeImgSrc={undefined}
                                onPressActive={undefined}
                            />
                        );
                    })}
                </Animated.View>
            </Animated.View>
        );
    } else {
        return null;
    }
};
