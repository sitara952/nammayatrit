import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import metroArrivingPng from '@/src-v2/assets/3D-assets/live-journey/train-arriving.webp';
import metroUserReachedPickupZonePng from '@/src-v2/assets/3D-assets/live-journey/metro-user-reached-pickup-zone.webp';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/typescript/components/Icon';
import DoubleChevronRight from '@/src-v2/assets/svg/DoubleChevronRight';
import MagnifyingGlass from '@/src-v2/assets/svg/MagnifyingGlass';
import { PopUpModalConfig } from './PopUpModalConfig';
import { CloseButton } from './CloseButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors as color } from 'config-types/src/domain/default/themes/colors';
import { SmartTicketButton } from '@/src-v2/multimodal/components/SmartTicketButton';
import { JourneyId } from '@/typescript/state/client/user';

export interface MetroStatusModalProps {
    status:
        | 'userReachedPickupZone'
        | 'arrivingToPickupZone'
        | 'metroArrivedToPickupZone'
        | 'getDownInNextStop'
        | 'arrivedDestination';
    onShowTicketPress: () => void;
    onClosePress: () => void;
    onTrackVehiclePress: () => void;
    originStop: string;
    destinationStop: string;
    originTime: string;
    destinationTime: string;
    nextTransitArrivalTime: number | null;
    onSecondaryOptionButtonPress: () => void;
    trainNumber: string;
    numberOfStopsAwayFromPickupZone: number;
    previousStationName: string;
    journeyId: JourneyId;
}

const MetroStatusModal: React.FC<MetroStatusModalProps> = ({
    status,
    onShowTicketPress = () => {},
    onTrackVehiclePress = () => {},
    onClosePress = () => {},
    originStop = 'NA',
    destinationStop = 'NA',
    originTime = 'NA',
    destinationTime = 'NA',
    nextTransitArrivalTime,
    onSecondaryOptionButtonPress = () => {},
    trainNumber = 'NA',
    numberOfStopsAwayFromPickupZone = 0,
    previousStationName = 'NA',
    journeyId,
}) => {
    const { liveJourneyMetroStatusModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const headerText = useMemo(() => {
        switch (status) {
            case 'userReachedPickupZone':
                return userLanguageStrings.YouHaveEnteredThe(originStop);
            case 'arrivingToPickupZone':
                return userLanguageStrings.MetroIsArrivingToYourStopGetReadyToBoard;
            case 'metroArrivedToPickupZone':
                return userLanguageStrings.MetroHasArrivedAtYourStationGetIn;
            case 'getDownInNextStop':
                return userLanguageStrings.IfYouCrossedStationBeReadyToGetDownAt(previousStationName, destinationStop);
            case 'arrivedDestination':
                return userLanguageStrings.YouHaveArrivedPleaseGetDownNow;
            default:
                return '';
        }
    }, [status, originStop, userLanguageStrings]);

    const subText = useMemo(() => {
        switch (status) {
            case 'userReachedPickupZone':
                return (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] mx-auto font-areaNormal-extrabold text-[#3B3A3C] text-center pt-[12px] tracking-[0.2px] leading-[24px] w-[304px]',
                        )}>
                        {userLanguageStrings.PleaseWaitForYourMetroIsStopsAway(
                            originTime,
                            trainNumber,
                            numberOfStopsAwayFromPickupZone || 0,
                        )}
                    </Animated.Text>
                );
            case 'arrivingToPickupZone':
            case 'metroArrivedToPickupZone':
                return (
                    <Animated.View style={tailwind.style('pt-[18px]')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[14px] text-center font-areaNormal-extrabold leading-[23px] text-[#3B3A3C]',
                            )}>
                            {nextTransitArrivalTime
                                ? userLanguageStrings.MetroHasLeftPreviousStopIfYouMissWithTime(
                                      nextTransitArrivalTime.toString(),
                                  )
                                : userLanguageStrings.MetroHasLeftPreviousStopIfYouMissNoNext}
                        </Animated.Text>
                    </Animated.View>
                );
            case 'getDownInNextStop':
                return (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] mx-auto font-areaNormal-extrabold text-[#3B3A3C] text-center pt-[12px] tracking-[0.2px] leading-[24px] w-[304px]',
                        )}>
                        {userLanguageStrings.YourDestinationStopWillBeArrivingIn(destinationStop, destinationTime)}
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
            default:
                return null;
        }
    }, [status, destinationStop, destinationTime, trainNumber, numberOfStopsAwayFromPickupZone, userLanguageStrings]);

    const getImage = () => {
        if (status === 'userReachedPickupZone') {
            return (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="metro user reached pickup zone image"
                    style={tailwind.style('w-[100%] h-[300px]')}
                    resizeMode="contain"
                    source={metroUserReachedPickupZonePng}
                />
            );
        }

        return (
            <Animated.View>
                <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="metro arriving image"
                        style={tailwind.style('w-full h-[137px]')}
                        source={metroArrivingPng}
                    />
                </Animated.View>
                <Animated.View style={tailwind.style('h-[2px] w-full bg-[#DA8E14]')} />
            </Animated.View>
        );
    };

    return (
        <PopUpModalConfig sheetRef={liveJourneyMetroStatusModalRef} onClosePress={onClosePress}>
            <BottomSheetView
                style={tailwind.style(
                    `pb-[${bottom || 16}px]`,
                    status === 'userReachedPickupZone' ? 'pt-[18px]' : 'pt-[66px]',
                )}>
                <CloseButton onPress={onClosePress} style={'absolute top-[16px] right-[16px] z-1'} />
                {getImage()}

                <Animated.Text
                    style={tailwind.style(
                        'text-[18px] font-areaNormal-extrabold text-[#313131] leading-[26px] tracking-[0.14px] text-center w-[301px] mx-auto',
                        status === 'getDownInNextStop' ? 'pt-[44px]' : '',
                        status === 'userReachedPickupZone' ? 'pt-[0px]' : 'pt-[49px]',
                    )}>
                    {headerText}
                </Animated.Text>

                {(status === 'arrivingToPickupZone' || status === 'metroArrivedToPickupZone') && (
                    <SmartTicketButton journeyId={journeyId} onPressViewTicket={onShowTicketPress} />
                )}

                <Animated.View
                    style={tailwind.style(
                        'flex-col items-center',
                        status === 'userReachedPickupZone' ? '' : 'mt-[20px] border-t border-t-[#333B3A3C] mx-[24px]',
                    )}>
                    {subText}

                    {status === 'userReachedPickupZone' && (
                        <SmartTicketButton
                            icon={<Icon icon={<MagnifyingGlass fill={colors.view_ticket_text} />} size={20} />}
                            journeyId={journeyId}
                            onPressViewTicket={onTrackVehiclePress}
                            ticketText={userLanguageStrings.TrackMetro(trainNumber)}
                        />
                    )}

                    {status === 'metroArrivedToPickupZone' && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Skip & wait for next metro button"
                            testID="view-options-button"
                            onPress={onSecondaryOptionButtonPress}
                            style={tailwind.style('mt-[29px] flex-row items-center gap-[8px]')}>
                            <Animated.Text
                                style={tailwind.style('text-[15px] font-areaNormal-extrabold text-[#016ACD]')}>
                                {userLanguageStrings.SkipAndWaitForNextMetro}
                            </Animated.Text>
                            <Icon icon={<DoubleChevronRight fill={color.blue200} />} size={15} color={color.blue200} />
                        </Pressable>
                    )}
                </Animated.View>
            </BottomSheetView>
        </PopUpModalConfig>
    );
};

export default MetroStatusModal;
