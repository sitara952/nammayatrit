import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import suburbanArrivingPng from '@/src-v2/assets/3D-assets/live-journey/suburban-arriving.webp';
import suburbanArrivedPng from '@/src-v2/assets/3D-assets/live-journey/suburban-arrived.webp';
import suburbanDestinationArrivedPng from '@/src-v2/assets/3D-assets/live-journey/suburban-destination-arrived.webp';
import suburbanUserReachedPickupZonePng from '@/src-v2/assets/3D-assets/live-journey/train-user-reached-pickup-zone.webp';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/typescript/components/Icon';
import DoubleChevronRight from '@/src-v2/assets/svg/DoubleChevronRight';
import MagnifyingGlass from '@/src-v2/assets/svg/MagnifyingGlass';
import { PopUpModalConfig } from './PopUpModalConfig';
import { WalkIcon } from '@/src-v2/multimodal/components/svg/transport';
import { CloseButton } from './CloseButton';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors as color } from 'config-types/src/domain/default/themes/colors';
import { SmartTicketButton } from '@/src-v2/multimodal/components/SmartTicketButton';
import { JourneyId } from '@/typescript/state/client/user';

export interface SuburbanStatusModalProps {
    status:
        | 'userReachedPickupZone'
        | 'arrivingToPickupZone'
        | 'trainArrivedToPickupZone'
        | 'getDownInNextStop'
        | 'arrivedDestination';
    onShowTicketPress: () => void;
    onTrackVehiclePress: () => void;
    onClosePress: () => void;
    originStop: string;
    destinationStop: string;
    originTime: string;
    destinationTime: string;
    nextTransitArrivalTime: number | null;
    onSecondaryOptionButtonPress: () => void;
    destinationArrivedWalkTime: string | null;
    destinationArrivedWalkInstruction: string;
    trainNumber: string;
    numberOfStopsAwayFromPickupZone: number;
    previousStationName: string;
    journeyId: JourneyId;
}

const SuburbanStatusModal: React.FC<SuburbanStatusModalProps> = ({
    status,
    onShowTicketPress = () => {},
    onClosePress = () => {},
    originStop = 'NA',
    destinationStop = 'NA',
    destinationTime = 'NA',
    originTime = 'NA',
    nextTransitArrivalTime,
    onSecondaryOptionButtonPress = () => {},
    destinationArrivedWalkTime = null,
    destinationArrivedWalkInstruction = 'NA',
    trainNumber,
    numberOfStopsAwayFromPickupZone,
    previousStationName,
    journeyId,
}) => {
    const { liveJourneySuburbanStatusModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const headerText = useMemo(() => {
        switch (status) {
            case 'userReachedPickupZone':
                return `${userLanguageStrings.YouHaveEnteredThe(originStop)}`;
            case 'arrivingToPickupZone':
                return userLanguageStrings.TrainIsArrivingToYourStopGetReadyToBoard;
            case 'trainArrivedToPickupZone':
                return userLanguageStrings.TrainHasArrivedAtYourStationGetIn;
            case 'getDownInNextStop':
                return userLanguageStrings.IfYouCrossedStationBeReadyToGetDownAtMetro(
                    previousStationName,
                    destinationStop,
                );
            case 'arrivedDestination':
                return userLanguageStrings.YouHaveArrivedAtStopGetDownNow(destinationStop);
            default:
                return '';
        }
    }, [status, originStop]);

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
                            numberOfStopsAwayFromPickupZone,
                        )}
                    </Animated.Text>
                );
            case 'arrivingToPickupZone':
            case 'trainArrivedToPickupZone':
                return (
                    <Animated.View style={tailwind.style('pt-[18px]')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[14px] text-center font-areaNormal-extrabold leading-[23px] text-[#3B3A3C]',
                            )}>
                            {userLanguageStrings.TransitHasLeftPreviousStopIfYouMiss(
                                userLanguageStrings.Train,
                                String(nextTransitArrivalTime ?? null),
                            )}
                            {nextTransitArrivalTime ? (
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] font-areaNormal-extrabold leading-[23px] text-[#E55101]',
                                    )}>
                                    {' '}
                                    {userLanguageStrings.InMins(nextTransitArrivalTime)}
                                </Animated.Text>
                            ) : null}
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
                        {userLanguageStrings.YouAreRightOnTimeGetDownAndFollowNextSteps}
                    </Animated.Text>
                );
            default:
                return null;
        }
    }, [status, destinationStop, destinationTime, trainNumber, numberOfStopsAwayFromPickupZone]);

    const image = useMemo(() => {
        switch (status) {
            case 'userReachedPickupZone':
                return (
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="suburban user reached pickup zone image"
                        style={tailwind.style('w-[100%] h-[300px]')}
                        resizeMode="contain"
                        source={suburbanUserReachedPickupZonePng}
                    />
                );
            case 'getDownInNextStop':
            case 'arrivingToPickupZone':
                return (
                    <Animated.View>
                        <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="suburban arriving image"
                                style={tailwind.style('w-full h-[160px]')}
                                source={suburbanArrivingPng}
                            />
                        </Animated.View>
                        <Animated.View style={tailwind.style('h-[2px] w-full bg-[#DA8E14]')} />
                    </Animated.View>
                );
            case 'trainArrivedToPickupZone':
                return (
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="suburban arrived image"
                        style={tailwind.style('w-[272px] h-[189px] ml-[12px]')}
                        source={suburbanArrivedPng}
                    />
                );

            case 'arrivedDestination':
                return (
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="suburban destination arrived image"
                        style={tailwind.style('w-[341px] h-[216px]')}
                        source={suburbanDestinationArrivedPng}
                    />
                );
        }
    }, [status]);

    return (
        <PopUpModalConfig sheetRef={liveJourneySuburbanStatusModalRef} onClosePress={onClosePress}>
            <BottomSheetView
                style={tailwind.style('pb-10', status === 'userReachedPickupZone' ? 'pt-[18px]' : 'pt-[36px]')}>
                <CloseButton onPress={onClosePress} style={'absolute top-[16px] right-[16px] z-1'} />
                {image}

                <Animated.Text
                    style={tailwind.style(
                        'text-[18px] font-areaNormal-extrabold text-[#313131] leading-[26px] tracking-[0.14px] text-center w-[301px] mx-auto',
                        status === 'arrivedDestination' ? 'pt-[20px]' : '',
                        status === 'getDownInNextStop' ? 'pt-[44px]' : '',
                        status === 'trainArrivedToPickupZone' ? 'pt-[16px]' : '',
                        status === 'arrivingToPickupZone' ? 'pt-[49px]' : '',
                        status === 'userReachedPickupZone' ? 'pt-[0px]' : '',
                    )}>
                    {headerText}
                </Animated.Text>

                {(status === 'arrivingToPickupZone' || status === 'trainArrivedToPickupZone') && (
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
                            onPressViewTicket={onShowTicketPress}
                            ticketText={`Track Train ${trainNumber}`}
                            wrapperStyle="w-full px-[32px]"
                        />
                    )}

                    {status === 'arrivedDestination' && destinationArrivedWalkTime && (
                        <Animated.View
                            style={tailwind.style(
                                'h-[58px] w-full bg-white flex-col justify-center rounded-[16px] px-[10px] mt-[24px]',
                            )}>
                            <Animated.View style={tailwind.style('flex-row items-center gap-[4px]')}>
                                <Icon icon={<WalkIcon />} size={14} color="#7E7E7E" />
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[13px] leading-[14px] font-areaNormal-extrabold text-[#7E7E7E]',
                                    )}>
                                    {destinationArrivedWalkTime} {userLanguageStrings.Mins}
                                </Animated.Text>
                            </Animated.View>
                            <Animated.Text
                                numberOfLines={1}
                                style={tailwind.style(
                                    'text-[13px] leading-[14px] font-areaNormal-extrabold text-[#3B3A3C] pt-[9px]',
                                )}>
                                {destinationArrivedWalkInstruction}
                            </Animated.Text>
                        </Animated.View>
                    )}

                    {status === 'trainArrivedToPickupZone' && (
                        <Pressable
                            accessibilityRole="button"
                            testID="view-options-button"
                            accessibilityLabel="Skip & wait for next train button"
                            onPress={onSecondaryOptionButtonPress}
                            style={tailwind.style('mt-[29px] flex-row items-center gap-[8px]')}>
                            <Animated.Text
                                style={tailwind.style('text-[15px] font-areaNormal-extrabold text-[#016ACD]')}>
                                {userLanguageStrings.SkipAndWaitForNextTrain}
                            </Animated.Text>
                            <Icon icon={<DoubleChevronRight fill={color.blue200} />} size={15} color={color.blue200} />
                        </Pressable>
                    )}
                </Animated.View>
            </BottomSheetView>
        </PopUpModalConfig>
    );
};

export default SuburbanStatusModal;
