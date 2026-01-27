import metroTransit from '../../../../../assets/3D-assets/full-asset/metro_transit.webp';
import suburbanTransit from '../../../../../assets/3D-assets/full-asset/suburban_transit.webp';
import mtIcMetroSideView from '../../../../../assets/3D-assets/mt_ic_metro_side_view.webp';
import mtIcTrainSideView from '../../../../../assets/3D-assets/mt_ic_train_side_view.webp';
import mtIcStationZone from '../../../../../assets/3D-assets/mt_ic_station_zone.webp';
import { tailwind } from '../../../../../../src/typescript/tailwindTheme/tailwind';
import React from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition, SlideInLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { ExpandCollapseTrackingButtonNew } from '../../screens/TransitTracking/components/ExpandCollapseTrackingButtonNew';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { DoubleArrowsWhite } from '@/src-v2/assets/svg/DopubleArrowWhite';
import { Icon } from '@/typescript/components/Icon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { SmartTicketButton } from '../../../../components/SmartTicketButton';
import { JourneyId } from '@/typescript/state/client/user';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { strings } from 'config-types';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';

const CheckInButton = ({
    onCheckInPress,
    userLanguageStrings,
}: {
    onCheckInPress: () => void;
    userLanguageStrings: strings;
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                accessibilityLabel="Check in button"
                style={tailwind.style('mt-6')}
                testID="check-in-transit-button"
                accessibilityRole="button"
                onPress={onCheckInPress}
                {...handlers}>
                <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                    <Animated.View>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[15px] font-areaNormal-extrabold tracking-[0.2px] leading-[18px] text-[#016ACD]',
                            )}>
                            {userLanguageStrings.CheckInIfYouHaveBoarded}
                        </Animated.Text>
                    </Animated.View>
                    <Icon
                        style={tailwind.style('ml-1.5')}
                        icon={<DoubleArrowsWhite fill="#016ACD" />}
                        color="#016ACD"
                        size={18}
                    />
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

/**
 * Base props interface for station zone components
 * @property mode - The transit mode, either 'metro' or 'train'
 * @property stationName - The name of the current station
 */
interface BaseStationZoneProps {
    mode: 'metro' | 'train';
    stationName: string;
}

/**
 * Props for the waiting state of station zone
 * @property status - Indicates the component is in 'waiting' state
 */
interface WaitingStationZoneProps extends BaseStationZoneProps {
    status: 'waiting';
}

interface InTransitProps extends BaseStationZoneProps {
    status: 'inTransit';
    toStationName: string;
    vehicleIdentifier: string;
}

/**
 * Props for when transit is one stop away
 * @property status - Indicates transit is one stop away
 * @property nextTransitArrivalTime - The arrival time of the next transit vehicle
 */
interface TransitOneStopAwayProps extends BaseStationZoneProps {
    status: 'transitOneStopAway';
    nextTransitArrivalTime: string | null;
    onPressTrackMode: (() => void) | undefined;
    onShowTicketPress: (() => void) | undefined;
    onCheckInPress: (() => void) | undefined;
    journeyId: JourneyId;
}

/**
 * Props for when transit has arrived at the station
 * @property status - Indicates transit has arrived
 * @property transitArrivedMessage - Message to display when transit arrives
 * @property trainMetroBadeInfo - Information to display in the transit badge
 * @property nextTransitArrivalTime - The arrival time of the next transit vehicle
 */
interface TransitArrivedProps extends BaseStationZoneProps {
    status: 'transitArrived';
    transitArrivedMessage: string;
    trainMetroBadeInfo: string;
    nextTransitArrivalTime: string | null;
    onShowTicketPress: (() => void) | undefined;
    onSkipAndTakeNextPress: (() => void) | undefined;
    onCheckInPress: (() => void) | undefined;
    journeyId: JourneyId;
}

/**
 * Union type of all possible station zone prop variants
 */
export type InStationZoneProps =
    | InTransitProps
    | WaitingStationZoneProps
    | TransitOneStopAwayProps
    | TransitArrivedProps;

/**
 * Props type for the station zone content component
 */
type StationZoneContentProps = InStationZoneProps;

/**
 * Component that displays the waiting view in the station zone
 * @param props - Component props
 * @param props.stationName - The name of the current station
 */
const WaitingView: React.FC<{ stationName: string; userLanguageStrings: strings }> = ({
    stationName,
    userLanguageStrings,
}) => (
    <Animated.View
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(100)}
        style={tailwind.style('pb-8 items-center')}>
        <Animated.Text
            numberOfLines={3}
            style={tailwind.style('text-[20px] font-areaNormal-extrabold text-[#313131] text-center px-11')}>
            {userLanguageStrings.YouAreInStationZone(stationName)}
        </Animated.Text>
    </Animated.View>
);

const InTransitView: React.FC<{ toStation: string; vehicleIdentifier: string; userLanguageStrings: strings }> = ({
    toStation,
    vehicleIdentifier,
    userLanguageStrings,
}) => (
    <Animated.View
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(100)}
        style={tailwind.style('pb-8 items-center')}>
        <Animated.Text
            numberOfLines={4}
            style={tailwind.style('text-[20px] font-areaNormal-extrabold text-[#313131] text-center px-11')}>
            {userLanguageStrings.YouAreInMetroToStation(vehicleIdentifier, toStation)}
        </Animated.Text>
    </Animated.View>
);
/**
 * Component that displays the transit tracking view
 * @param props - Component props
 * @param props.mode - The transit mode ('metro' or 'train')
 * @param props.nextTransitArrivalTime - The arrival time of the next transit vehicle
 */
const TransitTrackingView: React.FC<{
    mode: 'metro' | 'train';
    nextTransitArrivalTime: string | null;
    onPressTrackMode: (() => void) | undefined;
    onShowTicketPress: (() => void) | undefined;
    onCheckInPress: (() => void) | undefined;
    journeyId: JourneyId;
    userLanguageStrings: strings;
}> = ({
    mode,
    nextTransitArrivalTime,
    onPressTrackMode,
    onShowTicketPress,
    onCheckInPress,
    journeyId,
    userLanguageStrings,
}) => {
    return (
        <Animated.View entering={FadeIn.delay(100).duration(1000)} style={tailwind.style('pt-9')}>
            <Animated.Text
                style={tailwind.style(
                    'text-[20px] leading-[32px] font-areaNormal-extrabold text-[#313131] text-center tracking-[0.14px] px-11',
                )}>
                {mode === 'metro'
                    ? userLanguageStrings.MetroIsArrivingToYourStopGetReadyToBoard
                    : userLanguageStrings.TrainIsArrivingToYourStopGetReadyToBoard}
            </Animated.Text>
            <SmartTicketButton journeyId={journeyId} onPressViewTicket={onShowTicketPress ?? (() => {})} />
            <CheckInButton onCheckInPress={onCheckInPress ?? (() => {})} userLanguageStrings={userLanguageStrings} />
            <Animated.View style={tailwind.style('h-[1px] bg-[#D8C479] opacity-20 mx-6 mt-6 mb-[14px]')} />
            <Animated.Text
                style={tailwind.style(
                    'text-[14px] leading-[24px] font-areaNormal-extrabold text-[#3B3A3C] text-center tracking-[0.14px] px-6 border-t-[1px] border-[#3B3A3C] pb-4',
                )}>
                {userLanguageStrings.TransitHasLeftPreviousStopIfYouMiss(
                    getUserLanguageStringsForMode(mode, userLanguageStrings),
                    nextTransitArrivalTime,
                )}
                {nextTransitArrivalTime ? (
                    <Animated.Text style={tailwind.style('text-[#E55101]')}>{nextTransitArrivalTime}</Animated.Text>
                ) : null}
            </Animated.Text>
            <ExpandCollapseTrackingButtonNew
                buttonText={
                    mode === 'metro'
                        ? userLanguageStrings.TrackMetroOrTrain(userLanguageStrings.Metro)
                        : userLanguageStrings.TrackTrain
                }
                onPress={() => onPressTrackMode && onPressTrackMode()}
                isExpanded={false}
            />
        </Animated.View>
    );
};

/**
 * Component that displays the view when transit has arrived
 * @param props - Component props
 * @param props.mode - The transit mode ('metro' or 'train')
 * @param props.transitArrivedMessage - Message to display when transit arrives
 * @param props.nextTransitArrivalTime - The arrival time of the next transit vehicle
 * @param props.trainMetroBadeInfo - Information to display in the transit badge
 */
const TransitArrivedView: React.FC<{
    mode: 'metro' | 'train';
    transitArrivedMessage: string;
    nextTransitArrivalTime: string | null;
    trainMetroBadeInfo: string;
    onShowTicketPress: (() => void) | undefined;
    onSkipAndTakeNextPress: (() => void) | undefined;
    onCheckInPress: (() => void) | undefined;
    journeyId: JourneyId;
    userLanguageStrings: strings;
}> = ({
    mode,
    transitArrivedMessage,
    nextTransitArrivalTime,
    trainMetroBadeInfo,
    onSkipAndTakeNextPress,
    onShowTicketPress,
    onCheckInPress,
    journeyId,
    userLanguageStrings,
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();

    return (
        <Animated.View entering={FadeIn.delay(100).duration(1000)} style={tailwind.style('')}>
            <Animated.Text
                style={tailwind.style(
                    'text-[20px] leading-[32px] font-areaNormal-extrabold text-[#313131] text-center tracking-[0.14px] px-11',
                )}>
                {transitArrivedMessage}
            </Animated.Text>
            <SmartTicketButton journeyId={journeyId} onPressViewTicket={onShowTicketPress ?? (() => {})} />
            <CheckInButton onCheckInPress={onCheckInPress ?? (() => {})} userLanguageStrings={userLanguageStrings} />
            <Animated.View style={tailwind.style('h-[1px] bg-[#D8C479] opacity-20 mx-6 mt-6 mb-[14px]')} />
            <Animated.Text
                style={tailwind.style(
                    'text-[14px] leading-[24px] font-areaNormal-extrabold text-[#3B3A3C] text-center tracking-[0.14px] px-6 border-t-[1px] border-[#3B3A3C] pb-4',
                )}>
                {userLanguageStrings.TransitLeavesInAMinuteIfYouMiss(mode, nextTransitArrivalTime)}
                {nextTransitArrivalTime ? (
                    <Animated.Text style={tailwind.style('text-[#E55101]')}>{nextTransitArrivalTime}</Animated.Text>
                ) : null}
            </Animated.Text>
            <Animated.View>
                <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                    <Animated.View style={tailwind.style('px-2 rounded-[10px] min-h-[30px] justify-center bg-white')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[#3B3A3C] text-[13px] font-areaNormal-extrabold tracking-[0.2px]',
                            )}>
                            {trainMetroBadeInfo}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
            <Pressable
                accessibilityLabel="Skip & wait for next button"
                testID="show-ticket-button"
                accessibilityRole="button"
                onPress={onSkipAndTakeNextPress ?? (() => {})}
                style={({ pressed }: { pressed: boolean }) =>
                    tailwind.style('mt-6 mx-6', pressed && 'bg-[#FFE06E] rounded-[18px]')
                }
                {...handlers}>
                <Animated.View
                    style={[
                        tailwind.style('h-[60px] flex-row items-center justify-center rounded-[18px]'),
                        animatedStyle,
                    ]}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[#016ACD] text-center',
                        )}>
                        {mode === 'metro'
                            ? userLanguageStrings.SkipAndWaitForNextMetro
                            : userLanguageStrings.SkipAndWaitForNextTrain}
                    </Animated.Text>
                    <Icon
                        style={tailwind.style('ml-2.5')}
                        icon={<DoubleArrowsWhite fill="#016ACD" />}
                        color="#016ACD"
                    />
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

/**
 * Component that renders the content of the station zone based on the current status
 * @param props - Component props of type StationZoneContentProps
 */
const StationZoneContent: React.FC<StationZoneContentProps & { userLanguageStrings: strings }> = props => {
    const { status, mode, stationName, userLanguageStrings } = props;

    return (
        <>
            <Animated.View
                layout={LinearTransition.springify().damping(34).stiffness(300).mass(1)}
                style={tailwind.style('flex-1 justify-center')}>
                {status === 'waiting' && (
                    <WaitingView stationName={stationName} userLanguageStrings={userLanguageStrings} />
                )}
                {status === 'inTransit' && (
                    <InTransitView
                        toStation={props.toStationName}
                        vehicleIdentifier={props.vehicleIdentifier}
                        userLanguageStrings={userLanguageStrings}
                    />
                )}
                <Animated.View
                    layout={LinearTransition.springify().damping(34).stiffness(300).mass(1)}
                    style={tailwind.style('relative')}>
                    {status === 'transitArrived' ? null : (
                        <>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="metro station zone image"
                                layout={LinearTransition.springify().damping(34).stiffness(300).mass(1)}
                                entering={FadeIn.duration(300)}
                                source={mtIcStationZone}
                                resizeMode={'contain'}
                                style={[
                                    tailwind.style(
                                        'h-[222px] w-[514px]',
                                        status === 'transitOneStopAway' ? 'left-10' : '',
                                    ),
                                ]}
                            />
                            <Animated.View
                                style={[tailwind.style('absolute bottom-0 left-0 w-full h-[2px] bg-[#DA8E14]')]}
                            />
                        </>
                    )}
                    {mode === 'metro' && status === 'transitOneStopAway' ? (
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="metro side view image"
                            entering={SlideInLeft.delay(100).duration(1000)}
                            resizeMode={'contain'}
                            source={mtIcMetroSideView}
                            style={tailwind.style(
                                'absolute h-[100px] w-full bottom-0',
                                `-left-[${SCREEN_WIDTH / 1.6}px]`,
                            )}
                        />
                    ) : null}
                    {mode === 'train' && status === 'transitOneStopAway' ? (
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="train side view image"
                            entering={SlideInLeft.delay(100).duration(1000)}
                            resizeMode={'contain'}
                            source={mtIcTrainSideView}
                            style={tailwind.style(
                                'absolute h-[100px] w-full bottom-0',
                                `-left-[${SCREEN_WIDTH / 1.6}px]`,
                            )}
                        />
                    ) : null}
                </Animated.View>
                {status === 'transitArrived' && (
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel={
                            mode === 'metro' ? 'Metro has arrived at your station' : 'Train has arrived at your station'
                        }
                        entering={SlideInLeft.delay(300).springify().damping(34).stiffness(240)}
                        source={mode === 'train' ? suburbanTransit : metroTransit}
                        resizeMode={'cover'}
                        style={[
                            tailwind.style('h-full w-full'),
                            {
                                aspectRatio: 1,
                                transform: [
                                    { scale: 2 },
                                    { translateX: -SCREEN_WIDTH * 0.25 },
                                    { translateY: -SCREEN_HEIGHT * 0.025 },
                                ],
                            },
                        ]}
                    />
                )}
            </Animated.View>
            <Animated.View
                layout={LinearTransition.springify().damping(34).stiffness(300).mass(1)}
                style={tailwind.style('flex-1 justify-end')}>
                {status === 'transitOneStopAway' && (
                    <TransitTrackingView
                        mode={mode}
                        nextTransitArrivalTime={props.nextTransitArrivalTime}
                        onPressTrackMode={props.onPressTrackMode}
                        onShowTicketPress={props.onShowTicketPress}
                        onCheckInPress={props.onCheckInPress}
                        journeyId={props.journeyId}
                        userLanguageStrings={userLanguageStrings}
                    />
                )}
                {status === 'transitArrived' && (
                    <TransitArrivedView
                        mode={mode}
                        transitArrivedMessage={props.transitArrivedMessage}
                        nextTransitArrivalTime={props.nextTransitArrivalTime}
                        trainMetroBadeInfo={props.trainMetroBadeInfo}
                        onShowTicketPress={props.onShowTicketPress}
                        onSkipAndTakeNextPress={props.onSkipAndTakeNextPress}
                        onCheckInPress={props.onCheckInPress}
                        journeyId={props.journeyId}
                        userLanguageStrings={userLanguageStrings}
                    />
                )}
            </Animated.View>
        </>
    );
};

/**
 * Main component that renders the in-station zone experience
 * @param props - Component props of type InStationZoneProps
 */
export const InStationZone = (props: InStationZoneProps) => {
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Animated.View
            style={tailwind.style('flex-1 bg-[#FFE688]', `pt-[${(top ? top : 12) + 40 + 20}px] pb-[${bottom}px]`)}>
            <StationZoneContent {...props} userLanguageStrings={userLanguageStrings} />
        </Animated.View>
    );
};
