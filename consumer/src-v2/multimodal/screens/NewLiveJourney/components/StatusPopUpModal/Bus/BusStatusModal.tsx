import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import busArrivingPng from '@/src-v2/assets/3D-assets/live-journey/bus-arriving.webp';
import busArrivedPng from '@/src-v2/assets/3D-assets/live-journey/bus-arrived.webp';
import busUserReachedPickupZonePng from '@/src-v2/assets/3D-assets/live-journey/bus-user-reached-pickup-zone.webp';
import busSideViewPng from '@/src-v2/assets/3D-assets/live-journey/bus-side-view.webp';
import { Icon } from '@/typescript/components/Icon';
import { PopUpModalConfig } from '../PopUpModalConfig';
import { CloseButton } from '../CloseButton';
import MagnifyingGlass from '@/src-v2/assets/svg/MagnifyingGlass';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DownArrowTriangle from '@/src-v2/assets/svg/DownArrowTriangle';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SmartTicketButton } from '@/src-v2/multimodal/components/SmartTicketButton';
import { JourneyId } from '@/typescript/state/client/user';

const dummyBusNumbers = ['527A', '527B', '527C', '527D', '527E'];

export interface BusStatusModalProps {
    status:
        | 'userReachedPickupZone'
        | 'arrivingToPickupZone'
        | 'busArrivedToPickupZone'
        | 'getDownInNextStop'
        | 'arrivedDestination'
        | 'checkIn';
    onShowTicketPress: () => void;
    nextBuses: string[];
    busNumber: string;
    arrivalTime: string;
    onSecondaryOptionButtonPress: () => void;
    onClosePress: () => void;
    onTrackVehiclePress: () => void;
    originStop: string;
    destinationStop: string;
    originTime: string;
    destinationTime: string;
    numberOfStopsAwayFromPickupZone: number;
    onCheckInPress: () => void;
    previousStationName: string;
    journeyId: JourneyId;
}

const BusStatusModal: React.FC<BusStatusModalProps> = ({
    status,
    onShowTicketPress = () => {},
    nextBuses = dummyBusNumbers,
    busNumber = 'NA',
    arrivalTime = 'NA',
    onClosePress = () => {},
    originStop = 'NA',
    destinationStop = 'NA',
    originTime = 'NA',
    destinationTime = 'NA',
    numberOfStopsAwayFromPickupZone = 0,
    onCheckInPress = () => {},
    onTrackVehiclePress = () => {},
    previousStationName = 'NA',
    journeyId,
}) => {
    const { liveJourneyBusStatusModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const headerText = useMemo(() => {
        switch (status) {
            case 'arrivingToPickupZone':
                return userLanguageStrings.BusIsArrivingToYourStopGetReadyToBoard(busNumber);
            case 'busArrivedToPickupZone':
                return userLanguageStrings.BusHasArrivedToYourStopGetIn(busNumber);
            case 'getDownInNextStop':
                return userLanguageStrings.IfYouCrossedStationBeReadyToGetDownAt(previousStationName, destinationStop);
            case 'userReachedPickupZone':
                return userLanguageStrings.YouHaveEnteredThe(originStop);
            case 'arrivedDestination':
                return userLanguageStrings.YouHaveArrivedPleaseGetDownNow;
            case 'checkIn':
                return userLanguageStrings.CheckInIntoYourBus;
            default:
                return '';
        }
    }, [status, busNumber, originStop, previousStationName, destinationStop, userLanguageStrings]);

    const subText = useMemo(() => {
        switch (status) {
            case 'arrivingToPickupZone':
            case 'busArrivedToPickupZone':
                return (
                    <Animated.View style={tailwind.style('pt-[18px] flex-row flex-wrap justify-center')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[14px] font-areaNormal-extrabold leading-[23px] text-[#3B3A3C]',
                            )}>
                            {userLanguageStrings.NextBusComesIn}
                        </Animated.Text>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[14px] font-areaNormal-extrabold leading-[23px] text-[#09941E]',
                            )}>
                            {arrivalTime}
                        </Animated.Text>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[14px] font-areaNormal-extrabold leading-[23px] text-[#3B3A3C]',
                            )}>
                            {userLanguageStrings.IfYouWantToSkipThisBus}
                        </Animated.Text>
                    </Animated.View>
                );
            case 'getDownInNextStop':
                return (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] mx-auto font-areaNormal-extrabold text-[#3B3A3C] text-center pt-[12px] tracking-[0.2px] leading-[24px] w-[304px]',
                        )}>
                        {userLanguageStrings.YourDestinationStopWillBeArrivingInMins(destinationStop, destinationTime)}
                    </Animated.Text>
                );

            case 'userReachedPickupZone':
                return (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] mx-auto font-areaNormal-extrabold text-[#3B3A3C] text-center pt-[12px] tracking-[0.2px] leading-[24px] w-[304px]',
                        )}>
                        {userLanguageStrings.PleaseWaitForYourBusIsJustStopsAway(
                            originTime,
                            busNumber,
                            numberOfStopsAwayFromPickupZone
                                ? numberOfStopsAwayFromPickupZone.toString()
                                : userLanguageStrings.Few,
                        )}
                    </Animated.Text>
                );

            case 'arrivedDestination':
                return (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] mx-auto font-areaNormal-extrabold text-[#3B3A3C] text-center pt-[12px] tracking-[0.2px] leading-[24px] w-[304px]',
                        )}>
                        {userLanguageStrings.YourDestinationStopHasArrived(destinationStop)}
                    </Animated.Text>
                );

            case 'checkIn':
                return (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] mx-auto font-areaNormal-extrabold text-[#3B3A3C] text-center pt-[12px] tracking-[0.2px] leading-[24px] w-[304px]',
                        )}>
                        {userLanguageStrings.ThisHelpsUsTrackTheBusAndAccurateMentionYourWhenYouCanGetDown}
                    </Animated.Text>
                );

            default:
                return null;
        }
    }, [status, arrivalTime, destinationStop, destinationTime]);

    const image = useMemo(() => {
        if (status === 'checkIn') {
            return (
                <>
                    <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="bus side view image"
                            style={tailwind.style('w-[181px] h-[69px]')}
                            source={busSideViewPng}
                        />
                    </Animated.View>
                    <Animated.View style={tailwind.style('h-[2px] w-full bg-[#DA8E14]')} />
                </>
            );
        }

        if (status === 'busArrivedToPickupZone') {
            return (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="bus arrived image"
                    style={tailwind.style('w-[281px] h-[190px] ml-[12px]')}
                    source={busArrivedPng}
                />
            );
        }

        if (status === 'userReachedPickupZone') {
            return (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="bus user reached pickup zone image"
                    style={tailwind.style('w-[100%] h-[300px]')}
                    resizeMode="contain"
                    source={busUserReachedPickupZonePng}
                />
            );
        }

        return (
            <>
                <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="bus arriving image"
                        style={tailwind.style('w-[249px] h-[137px]')}
                        source={busArrivingPng}
                    />
                </Animated.View>
                <Animated.View style={tailwind.style('h-[2px] w-full bg-[#DA8E14]')} />
            </>
        );
    }, [status]);

    return (
        <PopUpModalConfig sheetRef={liveJourneyBusStatusModalRef} onClosePress={onClosePress}>
            <BottomSheetView
                style={tailwind.style(
                    `pb-[${bottom || 16}px]`,
                    status === 'userReachedPickupZone' ? 'pt-[18px]' : 'pt-[36px]',
                )}>
                <CloseButton onPress={onClosePress} style={'absolute top-[16px] right-[16px] z-1'} />

                <Animated.View>{image}</Animated.View>

                <Animated.Text
                    style={tailwind.style(
                        'text-[19px] font-areaNormal-extrabold text-[#313131] leading-[26px] tracking-[0.14px] text-center w-[301px] mx-auto',
                        status === 'userReachedPickupZone' ? 'pt-[0px]' : 'pt-[32px]',
                    )}>
                    {headerText}
                </Animated.Text>

                {(status === 'arrivingToPickupZone' || status === 'busArrivedToPickupZone') && (
                    <SmartTicketButton journeyId={journeyId} onPressViewTicket={onShowTicketPress} />
                )}

                <Animated.View
                    style={tailwind.style(
                        ' flex-col items-center',
                        status === 'userReachedPickupZone' || status === 'arrivedDestination' || status === 'checkIn'
                            ? ''
                            : 'border-t border-t-[#333B3A3C] mt-[20px] mx-[24px] ',
                    )}>
                    {subText}

                    {status === 'userReachedPickupZone' && (
                        <SmartTicketButton
                            icon={<Icon icon={<MagnifyingGlass fill={colors.view_ticket_text} />} size={20} />}
                            journeyId={journeyId}
                            onPressViewTicket={onTrackVehiclePress}
                            ticketText={userLanguageStrings.TrackBusNumber(busNumber)}
                            wrapperStyle="w-full px-[32px]"
                        />
                    )}

                    {status === 'checkIn' && (
                        <SmartTicketButton
                            icon={<Icon icon={<DownArrowTriangle />} size={20} />}
                            journeyId={journeyId}
                            onPressViewTicket={onCheckInPress}
                            ticketText={userLanguageStrings.CheckInInBus}
                            wrapperStyle="w-full"
                        />
                    )}
                    {(status === 'arrivingToPickupZone' || status === 'busArrivedToPickupZone') && (
                        <>
                            <Animated.View
                                style={tailwind.style('flex-row flex-wrap justify-center gap-[10px] pt-[14px]')}>
                                {nextBuses.map((busNumber, index) => (
                                    <Animated.View
                                        key={index}
                                        style={tailwind.style(
                                            'bg-white h-[31px] rounded-[10px] flex-row items-center justify-center px-[10px]',
                                        )}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[13px] font-areaNormal-extrabold text-[#3B3A3C]',
                                            )}>
                                            {busNumber}
                                        </Animated.Text>
                                    </Animated.View>
                                ))}
                            </Animated.View>
                            {/* @TODO -- implement this after skip bus functionality  */}
                            {/* <Pressable
                                testID="view-options-button"
                                onPress={onSecondaryOptionButtonPress}
                                style={tailwind.style('mt-[35px] flex-row items-center gap-[8px]')}>
                                <Animated.Text
                                    style={tailwind.style('text-[15px] font-areaNormal-extrabold text-[#016ACD]')}>
                                    {status === 'busArrivedToPickupZone'
                                        ? 'Skip & wait for next bus'
                                        : 'View options and switch'}
                                </Animated.Text>
                                <Icon
                                    icon={<DoubleChevronRight fill={color.blue200} />}
                                    size={15}
                                    color={color.blue200}
                                />
                            </Pressable> */}
                        </>
                    )}
                </Animated.View>
            </BottomSheetView>
        </PopUpModalConfig>
    );
};

export default BusStatusModal;
