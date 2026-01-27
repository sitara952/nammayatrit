// import { busLegServiceTier } from '@/readOnly/api/types/BusLegServiceTier.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { subwayLegExtraInfo } from '@/readOnly/api/types/SubwayLegExtraInfo.gen';
// import { ChevronRight } from '@/src-v2/multimodal/components/svg/ChevronRight';
import { TrainIcon } from '@/src-v2/multimodal/components/svg/transport/TrainIcon';
import { getIconBGFromType } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/TransitIconWrapper';
import { MemoizedNewTimeTableUI as NewTimeTableUI } from '@/src-v2/multimodal/screens/NewTimeTable/UI';
import { TrackedLegInfoStaticInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useRef, useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, SlideInLeft } from 'react-native-reanimated';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import Svg, { Line } from 'react-native-svg';
import mtIcTrainTransitReview from '../../../../assets/3D-assets/review-transits/mt_ic_train_transit_review.webp';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { Spinner } from '../../../components/common/Spinner/UI';
import { TransitArrowRight } from '../../../components/svg/Arrows';
import { ChevronRight } from '../../../components/svg/ChevronRight';
import { PixelArrow } from '../../../components/svg/PixelArrow';
import { legRouteInfo } from '@/readOnly/api/types/LegRouteInfo.gen';
import { NewTimeTableUIProps } from '../../NewTimeTable/types';
import { ExtendedInfo } from '../DirectBooking/components/SubwayTransitCard';
import { formatArrivalTime } from '../utils';
import { TransitCost } from './TransitCost';
import ClockIcon from '@/src-v2/multimodal/components/svg/ClockIcon';
import { RouteOptionCardProps } from './RouteOptionCard';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectIsSubwayServiceable } from '@/typescript/state/client/session';

type TrainCellProps = {
    isLastCell: boolean | undefined;
    legInfo: legInfo | TrackedLegInfoStaticInfo;
    onClassChange: (() => void) | undefined;
    ticketState: 'review' | 'scheduled' | 'expired' | undefined;
    isDataLoading: boolean | undefined;
    finalFare: number | undefined;
    nextTwoArrivalTimes: number[] | undefined;
    firstArrivalTime: string | undefined;
    onViewTimetable: (() => void) | undefined;
    timeTableData: NewTimeTableUIProps | undefined;
    onViaChangePress: () => void;
    transitTime: string | undefined;
    tranformedRouteOptions: RouteOptionCardProps[] | undefined;
    isLoading: boolean;
};

const CONTAINER_SECTION = SCREEN_WIDTH - 20 - 32 - 32 - 34;

export const TrainTransitCell = (props: TrainCellProps) => {
    // const [collapsed, setCollapsed] = useState(false);
    const {
        isLastCell,
        ticketState,
        legInfo,
        nextTwoArrivalTimes,
        onViewTimetable,
        timeTableData,
        onViaChangePress,
        finalFare,
        transitTime,
        tranformedRouteOptions,
        isLoading,
    } = props;
    const isStatic = 'origin' in legInfo;
    const legExtraInfo: subwayLegExtraInfo | undefined =
        !isStatic && legInfo.legExtraInfo.TAG === 'Subway' ? legInfo.legExtraInfo._0 : undefined;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const isSubwayServiceable = useAppSelector(selectIsSubwayServiceable);

    const trainTransitCellRef = useRef<View>(null);
    const accessibilityManager = useAccessibilityFocus({
        mainContentRef: trainTransitCellRef,
        focusDelay: 100,
        accessibilityDelay: 50,
        maxStackSize: 20,
    });

    // Restore focus when data loading state changes
    useEffect(() => {
        if (!props.isDataLoading && trainTransitCellRef.current) {
            accessibilityManager.restoreFocus();
        }
    }, [props.isDataLoading]);

    const route: legRouteInfo | undefined = legExtraInfo?.routeInfo?.[0];
    const finalDestinationStop = legExtraInfo?.routeInfo.at(-1)?.destinationStop;
    if (!route && !isStatic) return null;

    const originStop = isStatic ? legInfo.origin : route?.originStop;
    const destinationStop = isStatic ? legInfo.destination : finalDestinationStop;
    const trainNumber = isStatic ? legInfo.vehicleName : route?.trainNumber;
    const platformNumber = isStatic ? legInfo.platform : route?.platformNumber;
    const serviceTierName = isStatic
        ? legInfo.selectedServiceTierName
        : legExtraInfo?.selectedServiceTier?.serviceTierName;
    const cost = !isStatic ? finalFare : undefined;
    const originName = originStop && 'stationName' in originStop ? originStop.stationName : originStop?.name;
    const destinationName =
        destinationStop && 'stationName' in destinationStop ? destinationStop.stationName : destinationStop?.name;

    function getAccessibilityLabel() {
        const cap = (text: string | undefined) => (text ?? '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

        const parts = [
            `Train from ${cap(originName)} to ${cap(destinationName)}.`,
            trainNumber ? `Train number ${trainNumber}.` : null,
            serviceTierName ? `Class: ${cap(serviceTierName)}.` : null,
            platformNumber ? `Platform ${platformNumber}.` : null,
            cost ? `Fare is ${cost} rupees.` : null,
        ];

        return parts.filter(Boolean).join(' ');
    }

    const sortedRouteInfo = legExtraInfo?.routeInfo?.slice().sort((a, b) => (a.subOrder ?? 0) - (b.subOrder ?? 0));

    const routeInfoLength = sortedRouteInfo?.length ?? 0;
    const transformedRouteOptionsLength = tranformedRouteOptions?.length ?? 0;

    return (
        <>
            <Animated.View
                ref={trainTransitCellRef}
                layout={LinearTransition.springify().damping(28).stiffness(200)}
                style={tailwind.style('flex-1 px-4 pt-3')}
                accessibilityLabel={getAccessibilityLabel()}>
                <Animated.View style={tailwind.style('overflow-hidden')}>
                    {ticketState === 'expired' ? (
                        <Animated.View
                            style={tailwind.style('absolute inset-0 bg-white opacity-50 z-30 rounded-[16px]')}
                        />
                    ) : null}
                    <Animated.View
                        style={tailwind.style('flex-1 border-[1px] border-[#F1F2F7] rounded-[16px] bg-white')}>
                        <Animated.View
                            layout={LinearTransition.springify().damping(28).stiffness(200)}
                            style={tailwind.style('p-[14px] pt-4 flex-1 w-full')}>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="train transit review image"
                                entering={SlideInLeft.springify().damping(48).stiffness(340)}
                                exiting={FadeOut.duration(200)}
                                source={mtIcTrainTransitReview}
                                resizeMode="contain"
                                style={tailwind.style('absolute bottom-0 left-0 w-[87px] h-[99px]')}
                            />
                            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    <Animated.View
                                        style={tailwind.style(
                                            'h-7 w-7 items-center justify-center rounded-[10px]',
                                            `bg-[${getIconBGFromType('Subway')}]`,
                                        )}>
                                        <Icon color="#17402F" icon={<TrainIcon fill={undefined} />} size={16} />
                                    </Animated.View>
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(28).stiffness(200)}
                                        style={tailwind.style(
                                            'pl-3 text-[14px] leading-[18px] font-areaNormal-extrabold text-[#656565]',
                                        )}>
                                        {userLanguageStrings.LocalTrain}
                                    </Animated.Text>
                                    {serviceTierName && (
                                        <Animated.Text
                                            layout={LinearTransition.springify().damping(28).stiffness(200)}
                                            style={tailwind.style(
                                                'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#656565] pl-1',
                                            )}>
                                            | {serviceTierName}
                                        </Animated.Text>
                                    )}
                                </Animated.View>

                                {ticketState === 'review' ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Change button"
                                        testID={`98e3c816-2c42-4009-8a65-77343a9922a6`}
                                        disabled={isLoading}
                                        onPress={props.onClassChange}>
                                        <Animated.View style={tailwind.style('flex-row items-center')}>
                                            {props.isDataLoading ? (
                                                <Spinner
                                                    stroke={`border-[#105BCD]`}
                                                    size="sm"
                                                    style={tailwind.style('mr-4')}
                                                />
                                            ) : (
                                                <>
                                                    <Animated.Text
                                                        style={tailwind.style(
                                                            'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#656565]',
                                                        )}>
                                                        {userLanguageStrings.Change}
                                                    </Animated.Text>
                                                    <Icon
                                                        color="#656565"
                                                        style={tailwind.style('ml-0.5')}
                                                        icon={<ChevronRight />}
                                                        size={12}
                                                    />
                                                </>
                                            )}
                                        </Animated.View>
                                    </Pressable>
                                ) : ticketState === 'scheduled' || ticketState === 'expired' ? (
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[14px] leading-[18px] font-areaNormal-extrabold capitalize',
                                            ticketState === 'scheduled' ? 'text-[#F27115]' : 'text-[#969696]',
                                        )}>
                                        {ticketState === 'scheduled'
                                            ? userLanguageStrings.Scheduled
                                            : userLanguageStrings.Expired}
                                    </Animated.Text>
                                ) : null}
                                {isStatic && transitTime && (
                                    <>
                                        <Animated.View style={tailwind.style('flex-row items-center')}>
                                            <Icon icon={<ClockIcon fill={undefined} />} size={16} color="#656565" />
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[13px] leading-[15.6px] tracking-[0.2px] font-areaNormal-extrabold text-[#656565] pl-1',
                                                )}>
                                                {transitTime}
                                            </Animated.Text>
                                        </Animated.View>
                                    </>
                                )}
                            </Animated.View>
                            <Animated.View entering={FadeIn} style={tailwind.style('pt-2.5')}>
                                <Svg height={1}>
                                    <Line
                                        strokeDasharray="5.2, 7"
                                        x1={0}
                                        x2={SCREEN_WIDTH}
                                        y1={1}
                                        y2={1}
                                        stroke="#F5F5F5"
                                        strokeWidth="2"
                                    />
                                </Svg>
                            </Animated.View>
                            <Animated.View style={tailwind.style('flex-row justify-between items-end')}>
                                <Animated.View style={tailwind.style('pl-[60px] pt-[17px]')}>
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(30).stiffness(200)}
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            'text-[14px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C]',
                                            `max-w-[${CONTAINER_SECTION - 92}px]`,
                                        )}>
                                        {originName}
                                    </Animated.Text>
                                    <Animated.View style={tailwind.style('flex-row items-center pt-2.5')}>
                                        <Icon
                                            color="#7B8997"
                                            style={tailwind.style('mt-[3px]')}
                                            icon={<TransitArrowRight fill={undefined} />}
                                            size={12}
                                        />
                                        <Animated.Text
                                            layout={LinearTransition.springify().damping(30).stiffness(200)}
                                            numberOfLines={1}
                                            style={tailwind.style(
                                                'text-[14px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C] pl-1',
                                                `max-w-[${CONTAINER_SECTION - 92}px]`,
                                            )}>
                                            {destinationStop && 'stationName' in destinationStop
                                                ? destinationStop.stationName
                                                : destinationStop?.name}
                                        </Animated.Text>
                                    </Animated.View>
                                </Animated.View>
                                {!isStatic && (
                                    <Animated.View
                                        entering={FadeIn.duration(200)}
                                        style={tailwind.style('flex-1 items-end justify-end pb-0.5')}>
                                        <TransitCost rupeeColor="#3B3A3C" numberColor="#3B3A3C" cost={cost} />
                                    </Animated.View>
                                )}
                            </Animated.View>
                            {nextTwoArrivalTimes && nextTwoArrivalTimes.length > 0 && (
                                <Animated.View
                                    style={tailwind.style(
                                        'ml-15 flex-wrap min-w-[120px] flex-row gap-2 items-center mt-2',
                                    )}>
                                    {isSubwayServiceable ? (
                                        nextTwoArrivalTimes.map((timeInMinutes, index) => (
                                            <Animated.View
                                                key={index}
                                                style={tailwind.style('py-[2px] px-[5px] rounded-[6px] bg-[#F4F4F4]')}>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        `text-white font-extrabold text-[12px] ${
                                                            timeInMinutes < 30 ? 'text-[#097B42]' : 'text-[#FF7301]'
                                                        }`,
                                                    )}>
                                                    {formatArrivalTime(timeInMinutes, userLanguageStrings)}
                                                </Animated.Text>
                                            </Animated.View>
                                        ))
                                    ) : (
                                        <Animated.View
                                            style={tailwind.style('py-[2px] px-[2px] rounded-[6px]   flex-row')}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[14px] font-bold bg-[#F1F2F7] text-[#EA4848] px-[4px]  rounded-[6px]',
                                                )}>
                                                {userLanguageStrings.CurrentlyUnserviceable}
                                            </Animated.Text>
                                            <Animated.View style={tailwind.style(' ml-[10px] h-[20px]')}>
                                                <Divider
                                                    direction="vertical"
                                                    type={undefined}
                                                    style={undefined}
                                                    labelPosition={undefined}
                                                    offset={undefined}
                                                    offsetBackground={undefined}
                                                    dividerColor={undefined}
                                                    strokeDashArray={undefined}
                                                />
                                            </Animated.View>
                                        </Animated.View>
                                    )}
                                    {onViewTimetable && (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="View Timetable button"
                                            onPress={onViewTimetable}
                                            testID={'track-source-timetable-button'}
                                            style={tailwind.style('ml-1')}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[14px] font-bold underline text-[#016ACD]',
                                                )}>
                                                {userLanguageStrings.Timetable}
                                            </Animated.Text>
                                        </Pressable>
                                    )}
                                </Animated.View>
                            )}
                        </Animated.View>
                        <Animated.View entering={FadeIn} style={tailwind.style('mt-2.5')}>
                            <Svg height={1} style={tailwind.style('mx-[14px]')}>
                                <Line
                                    strokeDasharray="5.2, 7"
                                    x1={0}
                                    x2={SCREEN_WIDTH}
                                    y1={1}
                                    y2={1}
                                    stroke="#F5F5F5"
                                    strokeWidth="2"
                                />
                            </Svg>
                        </Animated.View>
                        <Animated.View style={tailwind.style('pt-2.5 pb-3 px-[14px]')}>
                            <Animated.View style={tailwind.style('flex-row justify-between')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] max-w-[70%] leading-[15px] tracking-[0.2px] font-areaNormal-extrabold text-[#656565] pr-1.5',
                                    )}>
                                    {userLanguageStrings.TrainAt(trainNumber || '', originName || '')}
                                </Animated.Text>
                            </Animated.View>
                        </Animated.View>
                        {/* {viaStations && viaStations.length > 0 && (
                            <Animated.View
                                layout={LinearTransition.springify().damping(24).stiffness(240)}
                                entering={FadeIn}
                                style={tailwind.style('p-[20px] flex-row items-center justify-between')}>
                                <Animated.View style={tailwind.style('flex-row items-center flex-1')}>
                                    {viaStations.length === 0 ||
                                    isUndefined(legExtraInfo?.selectedServiceTier?.via) ||
                                    legExtraInfo?.selectedServiceTier?.via.trim() === '' ? (
                                        <>
                                            <Icon icon={<TrainIcon fill={'#09941E'} />} size={16} color="#09941E" />
                                            <Animated.Text
                                                numberOfLines={1}
                                                style={tailwind.style(
                                                    'text-[12px] font-areaNormal-extrabold text-[#656565] pl-[8px] flex-1',
                                                )}>
                                                {userLanguageStrings.DirectTrain}
                                            </Animated.Text>
                                        </>
                                    ) : (
                                        <>
                                            <ViaPointIcon />
                                            <Animated.Text
                                                numberOfLines={1}
                                                style={tailwind.style(
                                                    'text-[12px] font-areaNormal-extrabold text-[#656565] pl-[8px] flex-1',
                                                )}>
                                                Via: {viaStations.join(' → ')}
                                            </Animated.Text>
                                        </>
                                    )}
                                </Animated.View>
                                <Pressable
                                    accessibilityRole="button"
                                    testID="change-via-button"
                                    onPress={onViaChangePress}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Animated.Text
                                        style={tailwind.style('text-[14px] font-bold underline text-[#016ACD]')}>
                                        {userLanguageStrings.Change}
                                    </Animated.Text>
                                </Pressable>
                            </Animated.View>
                        )} */}
                        {(routeInfoLength > 1 || transformedRouteOptionsLength > 1) && (
                            <ExtendedInfo
                                canChange={transformedRouteOptionsLength > 1}
                                routes={sortedRouteInfo || []}
                                isConfirmingJourney={false}
                                onViaChangePress={onViaChangePress}
                                viewStyle={tailwind.style('-mx-1.5 -mt-3')}
                            />
                        )}
                    </Animated.View>
                    {!isLastCell ? (
                        <Animated.View style={tailwind.style('pt-4 pl-4')}>
                            <PixelArrow />
                        </Animated.View>
                    ) : null}
                </Animated.View>
            </Animated.View>
            {timeTableData && (
                <NewTimeTableUI
                    times={timeTableData.times}
                    source={timeTableData.source}
                    sheetRef={timeTableData.sheetRef}
                    mode="Subway"
                    towardsStation={timeTableData.towardsStation}
                    onDismiss={undefined}
                    allTowardsStation={timeTableData.allTowardsStation}
                />
            )}
        </>
    );
};
