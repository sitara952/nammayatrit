import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import ContentLoader, { Rect } from '@/typescript/designSystem/components/ContentLoader';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useMemo, useRef, useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, SlideInLeft } from 'react-native-reanimated';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import Svg, { Line, Path } from 'react-native-svg';
import mtIcMetroTransitReview from '../../../../assets/3D-assets/review-transits/mt_ic_metro_transit_review.webp';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { TransitArrowRight } from '../../../components/svg/Arrows';
import { MetroIndicator } from '../../../components/svg/MetroIndicator';
import { MetroIndicator as MetroIndicatorGreen } from '../../../components/svg/MetroIndicatorGreen';
import { PixelArrow } from '../../../components/svg/PixelArrow';
import { ShuffleHorizontal } from '../../../components/svg/ShuffleHorizontal';
import { TransitCost } from './TransitCost';
import { getIconBGFromType } from './TransitIconWrapper';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { TrackedLegInfoStaticInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { getMetroLineColorHex } from '../../LiveTicket/Tickets/TicketUtils';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { NewTimeTableUIProps } from '@/src-v2/multimodal/screens/NewTimeTable/types';
import { MemoizedNewTimeTableUI as NewTimeTableUI } from '@/src-v2/multimodal/screens/NewTimeTable/UI';
import ClockIcon from '../../../components/svg/ClockIcon';
import { ChevronRight } from '../../../components/svg/ChevronRight.tsx';
import MetroOptionsModal from '../components/MetroOptionsModal.tsx';
import MetroSwitchRouteModal from './MetroSwitchRoute.tsx';
import { useRefsContext } from '@/typescript/context/RefsContext.tsx';
import { mmEstimateRouteType } from '@/typescript/Maps/MapType.tsx';
import {
    getPossibleSourceDestStopLists,
    createMockRouteInfoFromTrackedLeg,
    transformSortedRouteToJourneyRoutes,
} from '@/typescript/utils/MultiModal.ts';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { getUserLanguageStringsForMetroLine } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import CustomButton from '@/typescript/components/common/CustomButton.tsx';
import { isBookingStatusConfirmed } from '@/typescript/utils/LegStatusUtils.ts';
import { ScrollView } from 'react-native-gesture-handler';
import TicketIcon from '@/src-v2/assets/svg/TIcketIcon.tsx';
import { useMetroSubwayServiceability } from '@/src-v2/multimodal/hooks/useMetroSubwayServiceability';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import { selectAppConfig } from '@/typescript/state/client/session.ts';

const MIndicator = () => {
    return (
        <Svg width="7" height="7" viewBox="0 0 7 7" fill="none">
            <Path
                d="M0 6.13882V0H1.456C2.0935 1.43239 2.72312 2.87265 3.35274 4.31292H3.36848C3.99811 2.87265 4.62773 1.43239 5.26522 0H6.72122V6.13882H5.53281V2.18794H5.50133C4.93467 3.50228 4.36014 4.82449 3.78561 6.13882H2.93562C2.36109 4.82449 1.78656 3.50228 1.21989 2.18794H1.18841V6.13882H0Z"
                fill="white"
            />
        </Svg>
    );
};

type MetroTransitCellProps = {
    isLastCell: boolean | undefined;
    legInfo: legInfo | TrackedLegInfoStaticInfo;
    ticketState: 'review' | 'scheduled' | 'expired' | undefined;
    appName: string;
    lastStopName: string | undefined;
    nextTwoArrivalTimes: number[] | undefined;
    firstArrivalTime: string | undefined;
    onViewTimetable: (() => void) | undefined;
    onBookButtonClick: () => void;
    timeTableData: NewTimeTableUIProps | undefined;
    isSingleMode: boolean | undefined;
    finalFare: number | undefined;
    transitTime: string | undefined;
    journeyMapData: Record<number, mmEstimateRouteType | mmEstimateRouteType[]> | undefined;
    onConfirmRoute: (
        legOrder: number | undefined,
        sourceCode: string | undefined,
        destinationCode: string | undefined,
    ) => void;
    isDataLoading: boolean | undefined;
    showMetroOptions: boolean | undefined; // New prop to control options visibility
    entryStationName: string | undefined;
    handleEditPress: () => void;
};

const CONTAINER_SECTION = SCREEN_WIDTH - 20 - 32 - 32 - 34;

export const MetroTransitCell = (props: MetroTransitCellProps) => {
    const {
        legInfo,
        isLastCell,
        ticketState,
        appName,
        onBookButtonClick,
        lastStopName,
        firstArrivalTime,
        onViewTimetable,
        timeTableData,
        isSingleMode,
        finalFare,
        transitTime,
        journeyMapData,
        onConfirmRoute,
        isDataLoading,
        showMetroOptions = false, // Default to false - options hidden by default
        entryStationName,
        handleEditPress,
    } = props;
    const isStatic = 'origin' in legInfo;
    const appConfig = useAppSelector(selectAppConfig);

    const routeInfo =
        !isStatic && legInfo.legExtraInfo.TAG === 'Metro'
            ? legInfo.legExtraInfo._0.routeInfo
            : isStatic && legInfo.travelMode === 'Metro'
              ? createMockRouteInfoFromTrackedLeg(legInfo)
              : undefined;
    const configManager = useConfigContext();

    const metroTransitCellRef = useRef<View>(null);
    const accessibilityManager = useAccessibilityFocus({
        mainContentRef: metroTransitCellRef,
        focusDelay: 100,
        accessibilityDelay: 50,
        maxStackSize: 20,
    });

    // Restore focus when data loading state changes
    useEffect(() => {
        if (!isDataLoading && metroTransitCellRef.current) {
            accessibilityManager.restoreFocus();
        }
    }, [isDataLoading]);
    const { metroOptionsModalRef, metroSwitchRouteModalRef } = useRefsContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const sortedRoute = routeInfo
        ? routeInfo.every(r => r.subOrder !== undefined)
            ? [...routeInfo]
                  .sort((route1, route2) =>
                      route1.subOrder !== undefined && route2.subOrder !== undefined
                          ? route1.subOrder - route2.subOrder
                          : 0,
                  )
                  .map(r => ({
                      ...r,
                      towardsStation: isStatic
                          ? legInfo && legInfo.allTowardsStations && legInfo.allTowardsStations
                          : timeTableData?.allTowardsStation,
                  }))
            : routeInfo
        : undefined;

    const originStop = isStatic ? legInfo.origin : sortedRoute?.[0]?.originStop;
    const destinationStop = isStatic ? legInfo.destination : sortedRoute?.[sortedRoute.length - 1]?.destinationStop;

    const initialOriginStopNameRef = useRef<string | undefined>(undefined);
    const initialDestinationStopNameRef = useRef<string | undefined>(undefined);
    if (originStop && !initialOriginStopNameRef.current) {
        initialOriginStopNameRef.current = 'stationName' in originStop ? originStop.stationName : originStop?.name;
    }
    if (destinationStop && !initialDestinationStopNameRef.current) {
        initialDestinationStopNameRef.current =
            'stationName' in destinationStop ? destinationStop.stationName : destinationStop?.name;
    }

    const { isMetroServiceable } = useMetroSubwayServiceability('METRO');

    const initialOriginStopName = initialOriginStopNameRef.current;
    const initialDestinationStopName = initialDestinationStopNameRef.current;

    // Compute metro arrival frequency (in minutes) using next arrivals or timetable headways
    const metroFrequencyMins = useMemo(() => {
        const times = timeTableData?.times ?? [];
        if (times.length >= 2) {
            const now = Date.now();
            const futureTimes = times.filter(t => t.time > now).map(t => t.time);
            const candidates = futureTimes.length >= 2 ? futureTimes.slice(0, 2) : times.slice(0, 2).map(t => t.time);

            const headwaysMs = candidates.reduce<number[]>((acc, val, idx, arr) => {
                if (idx === 0) return acc;
                const prev = arr[idx - 1];
                if (typeof prev !== 'number' || typeof val !== 'number') return acc;
                const delta = val - prev;
                return delta > 0 ? [...acc, delta] : acc;
            }, []);

            if (headwaysMs.length > 0) {
                const mins = Math.max(1, Math.round(Math.min(...headwaysMs) / 60000));
                return mins;
            }
        }
        return null;
    }, [timeTableData?.times]);

    const routeData = !isStatic ? journeyMapData?.[legInfo.order ?? 0] : null;
    const routes = !isStatic ? (Array.isArray(routeData) ? routeData : routeData ? [routeData] : []) : [];
    const allStops = !isStatic ? routes.flatMap(route => route.fullStopsList || []) : [];

    const { sourceStoplist, destinationStoplist } = useMemo(() => {
        return getPossibleSourceDestStopLists(legInfo, initialOriginStopName, initialDestinationStopName, allStops);
    }, [legInfo, initialOriginStopName, initialDestinationStopName, allStops]);

    if (!isStatic && (!routeInfo || !routeInfo.length || routeInfo.some(r => r === undefined))) {
        return null;
    }

    const destinationStopName =
        // destinationStop && 'stationName' in destinationStop && !isStatic ? destinationStop.stationName : lastStopName;
        destinationStop && 'stationName' in destinationStop
            ? !isStatic
                ? destinationStop.stationName
                : lastStopName
            : destinationStop?.name;
    const originStopName = entryStationName
        ? entryStationName
        : originStop && 'stationName' in originStop
          ? !isStatic
              ? originStop.stationName
              : originStop?.stationName
          : originStop?.name;
    const lineColors = isStatic
        ? (() => {
              const staticLegInfo = legInfo;
              if (staticLegInfo.lineColor) {
                  return staticLegInfo.lineColor;
              } else {
                  return [staticLegInfo.vehicleName?.replace('line', '')];
              }
          })()
        : sortedRoute?.map(sortedRoute => sortedRoute.lineColor);
    const lineColorCodes = isStatic
        ? lineColors?.map(lineColor => getMetroLineColorHex(lineColor?.toLowerCase() || '').replace('#', ''))
        : isStatic
          ? lineColors?.map(lineColor => getMetroLineColorHex(lineColor?.toLowerCase() || '').replace('#', ''))
          : sortedRoute?.map(
                sortedRoute =>
                    sortedRoute.lineColorCode ??
                    getMetroLineColorHex(sortedRoute.lineColor?.toLowerCase() || '').replace('#', ''),
            );
    // TODO: remove this once we have the inter corridor data from API
    const isInterCorridor = false;
    const finalDestinationName = lastStopName || destinationStopName;

    const showMetroIndicator =
        appName === 'anna' ? (
            <Animated.View
                style={tailwind.style(
                    'h-7 w-7 items-center justify-center rounded-[10px]',
                    `bg-[${getIconBGFromType('Metro')}]`,
                )}>
                <Icon style={tailwind.style('')} color="#1F2D3D" icon={<MetroIndicator fill={undefined} />} size={18} />
            </Animated.View>
        ) : (
            <Animated.View>
                <Icon style={tailwind.style('')} icon={<MetroIndicatorGreen fill={undefined} />} size={28} />
            </Animated.View>
        );

    const handleConfirmRouteChange = (
        legOrder: number | undefined,
        sourceCode: string | undefined,
        destinationCode: string | undefined,
    ) => {
        onConfirmRoute(legOrder, sourceCode, destinationCode);
    };
    const totalNumberOfStations = isStatic
        ? legInfo.allDestinationStations?.length
        : sortedRoute?.map(route => route.destinationStop).length;

    const isSwitchRequired = totalNumberOfStations && totalNumberOfStations === 2;
    const firstSwitchStation = isStatic ? legInfo.allDestinationStations?.[0] : sortedRoute?.[0]?.destinationStop?.name;

    // Transform sortedRoute data to journey routes for SuburbanSwitchRoute modal
    const journeyRoutes = transformSortedRouteToJourneyRoutes(
        sortedRoute,
        isStatic ? legInfo.allSourceStations : undefined,
        isStatic ? legInfo.allDestinationStations : undefined,
        isStatic ? legInfo.allTowardsStations : undefined,
    );

    return (
        <>
            <Animated.View
                ref={metroTransitCellRef}
                layout={LinearTransition.springify().damping(28).stiffness(200)}
                style={tailwind.style('flex-1', !isSingleMode && 'px-4', 'pt-3')}
                accessible={true}
                accessibilityLabel={`Take the ${lineColors?.[0] ?? ''} line metro from ${(originStopName ?? '').toLowerCase()} to ${(destinationStopName ?? '').toLowerCase()}`}>
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
                            style={tailwind.style('p-[14px] pt-4 flex-1 w-full pb-0')}>
                            <Animated.Image
                                accessible={false}
                                entering={SlideInLeft.springify().damping(48).stiffness(340)}
                                exiting={FadeOut.duration(200)}
                                source={mtIcMetroTransitReview}
                                style={tailwind.style('absolute bottom-0 left-0 w-[87px] h-[99px]')}
                            />
                            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    {showMetroIndicator}
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[14px] leading-[18px] font-areaNormal-extrabold  text-[#656565] px-1.5',
                                        )}>
                                        {userLanguageStrings.Metro}
                                    </Animated.Text>
                                    {isInterCorridor ? (
                                        <Animated.View style={tailwind.style('flex-row items-center')}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#656565]',
                                                )}>
                                                | {userLanguageStrings.InterCorridor}
                                            </Animated.Text>
                                        </Animated.View>
                                    ) : (
                                        lineColors?.[0] &&
                                        lineColors.length <= 2 && (
                                            <Animated.View style={tailwind.style('flex-row items-center')}>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#656565]',
                                                    )}>
                                                    |{' '}
                                                    {getUserLanguageStringsForMetroLine(
                                                        lineColors?.[0] ?? '',
                                                        userLanguageStrings,
                                                    )}{' '}
                                                    {!isStatic ? userLanguageStrings.Line : ''}
                                                </Animated.Text>
                                            </Animated.View>
                                        )
                                    )}
                                </Animated.View>
                                {/* @TODO -- have to check for this change button */}
                                {/* <Pressable testID={`9fbefc56-6887-47d6-8fab-88f1c47f8874`}> */}
                                {isDataLoading ? null : isSingleMode ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Edit options"
                                        testID={`metro-line-edit-options`}
                                        onPress={handleEditPress}
                                        style={tailwind.style(
                                            'w-6 h-6 rounded-full bg-[#E6E6E6] items-center justify-center -mr-1',
                                        )}>
                                        <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <Path
                                                fill-rule="evenodd"
                                                clip-rule="evenodd"
                                                d="M2.47645 12.2343C2.28855 12.2343 2.10065 12.1621 1.96334 12.0248C1.80435 11.8658 1.73208 11.6562 1.75376 11.4321L2.06452 8.59923C2.0862 8.43301 2.15847 8.28125 2.2741 8.16562L8.25069 2.18903C8.83606 1.60366 9.79 1.60366 10.3754 2.18903L11.7991 3.61272C12.0809 3.89456 12.2399 4.27036 12.2399 4.67506C12.2399 5.07976 12.0809 5.45556 11.7991 5.73741L5.82247 11.7068C5.69961 11.8224 5.54785 11.9019 5.38886 11.9163L2.55594 12.2271H2.47645V12.2343ZM3.13409 8.83772L2.88838 11.0997L5.15037 10.854L9.17647 6.82296L7.16019 4.80667L3.13409 8.83772ZM11.033 4.96413L9.94252 6.05597L7.92624 4.03968L9.01673 2.94785C9.18295 2.78163 9.45034 2.78163 9.60933 2.94785L11.033 4.37153C11.1125 4.45103 11.1559 4.5522 11.1559 4.66783C11.1559 4.78346 11.1125 4.88464 11.033 4.96413ZM8.59766 12.2417V11.1576L12.2491 11.1582V12.2422L8.59766 12.2417Z"
                                                fill="#656565"
                                            />
                                        </Svg>
                                    </Pressable>
                                ) : transitTime ? (
                                    <Animated.View style={tailwind.style('flex-row items-center')}>
                                        {/* <Animated.Text
                                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#656565]')}>
                                        Change
                                    </Animated.Text>
                                    <Icon
                                        color="#656565"
                                        style={tailwind.style('-mb-0.5 ml-0.5')}
                                        icon={<ChevronRight />}
                                        size={12}
                                    /> */}
                                        <Icon
                                            color="#656565"
                                            style={tailwind.style('items-center justify-center')}
                                            icon={<ClockIcon fill={undefined} />}
                                            size={14}
                                        />
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[13px] leading-[16px] font-areaNormal-extrabold text-[#656565] h-[14px] ml-1',
                                            )}>
                                            {transitTime}
                                        </Animated.Text>
                                    </Animated.View>
                                ) : null}
                                {/* </Pressable> */}
                                {ticketState === 'scheduled' || ticketState === 'expired' ? (
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[14px] font-areaNormal-extrabold capitalize',
                                            ticketState === 'scheduled' ? 'text-[#F27115]' : 'text-[#969696]',
                                        )}>
                                        {ticketState === 'scheduled'
                                            ? userLanguageStrings.Scheduled
                                            : ticketState === 'expired'
                                              ? userLanguageStrings.Expired
                                              : ticketState}
                                    </Animated.Text>
                                ) : null}
                            </Animated.View>
                            <Animated.View entering={FadeIn} style={tailwind.style('mt-2.5')}>
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
                            <Animated.View
                                style={tailwind.style('flex-row justify-between items-end relative pt-[17px]')}>
                                <Animated.View style={tailwind.style('pl-[60px]')}>
                                    {isDataLoading ? (
                                        <ContentLoader height={28} width={'75%'}>
                                            <Rect x="0" y="0" rx="6" ry="6" width="100%" height="48" />
                                        </ContentLoader>
                                    ) : (
                                        <Animated.Text
                                            layout={LinearTransition.springify().damping(30).stiffness(200)}
                                            numberOfLines={2}
                                            accessible={true}
                                            accessibilityLabel={`Take the ${lineColors?.[0]} line metro towards ${destinationStopName}`}
                                            style={tailwind.style(
                                                'text-[14px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C] capitalize',
                                                `max-w-[${CONTAINER_SECTION - 72}px]`,
                                            )}>
                                            {!isLastCell
                                                ? entryStationName
                                                    ? entryStationName
                                                    : originStop && 'stationName' in originStop
                                                      ? originStop.stationName
                                                      : originStop?.name
                                                : originStopName}
                                        </Animated.Text>
                                    )}
                                    <Animated.View style={tailwind.style('flex-row items-center pt-2.5')}>
                                        {isDataLoading ? (
                                            <ContentLoader height={28} width={'75%'}>
                                                <Rect x="0" y="0" rx="6" ry="6" width="100%" height="48" />
                                            </ContentLoader>
                                        ) : (
                                            <>
                                                <Icon
                                                    color="#7B8997"
                                                    style={tailwind.style('mt-[3px]')}
                                                    icon={<TransitArrowRight fill={undefined} />}
                                                    size={12}
                                                />
                                                <Animated.Text
                                                    layout={LinearTransition.springify().damping(30).stiffness(200)}
                                                    numberOfLines={2}
                                                    style={tailwind.style(
                                                        'text-[14px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C] pl-1 capitalize',
                                                        `max-w-[${CONTAINER_SECTION - 90}px]`,
                                                    )}>
                                                    {destinationStopName}
                                                </Animated.Text>
                                            </>
                                        )}
                                    </Animated.View>
                                </Animated.View>

                                {!isStatic && appConfig.flowConfig.metroBookingEnable && (
                                    <Animated.View
                                        entering={FadeIn.duration(200)}
                                        style={tailwind.style('flex-1 items-end justify-end pb-0.5')}
                                        accessible={true}
                                        accessibilityLabel={`Fare for metro is ${finalFare} rupees`}>
                                        {isDataLoading || !finalFare ? (
                                            <ContentLoader height={48} width={'75%'}>
                                                <Rect x="0" y="0" rx="6" ry="6" width="100%" height="48" />
                                            </ContentLoader>
                                        ) : finalFare ? (
                                            <TransitCost rupeeColor="#3B3A3C" numberColor="#3B3A3C" cost={finalFare} />
                                        ) : null}
                                    </Animated.View>
                                )}
                                {/* Change Class -> Open Bottom Sheet */}
                            </Animated.View>
                            {firstArrivalTime && (
                                <Animated.View
                                    style={tailwind.style(
                                        'ml-15 flex-wrap min-w-[120px] flex-row gap-2 items-center mt-2',
                                    )}>
                                    {isMetroServiceable ? (
                                        <Animated.View
                                            style={tailwind.style('py-[2px] px-[5px] rounded-[6px] bg-[#F4F4F4]')}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    `text-white font-extrabold text-[12px] ${'text-[#097B42]'}`,
                                                )}>
                                                {firstArrivalTime}
                                            </Animated.Text>
                                        </Animated.View>
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
                                                    // height={10}
                                                    // width={1}
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
                                            accessibilityLabel={`Timetable button`}
                                            accessibilityRole="button"
                                            onPress={onViewTimetable}
                                            testID={'track-source-timetable-button-metro'}
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
                        {isInterCorridor ? (
                            <Animated.View
                                style={tailwind.style(
                                    'flex-row justify-between items-center pt-[14px] px-[14px] pb-3',
                                )}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] leading-[18px] font-areaNormal-extrabold text-[#656565] tracking-[0.2px] pr-3',
                                    )}>
                                    {userLanguageStrings.TaketheIntercorridorlinetowards} {'ChennaiAirportMetroStation'}
                                    .
                                </Animated.Text>
                            </Animated.View>
                        ) : lineColorCodes?.length === 1 ? (
                            <Animated.View
                                style={tailwind.style(
                                    'flex-row justify-between items-center pt-[14px] px-[14px] pb-3',
                                )}>
                                <Animated.Text
                                    style={[
                                        tailwind.style(
                                            'text-[12px] leading-[18px] font-areaNormal-extrabold text-[#656565] tracking-[0.2px]',
                                        ),
                                    ]}>
                                    {userLanguageStrings.TakeThe}{' '}
                                    <Animated.View
                                        style={[
                                            tailwind.style(
                                                'w-[15px] h-[14px] items-center justify-center rounded-[4px]',
                                                `bg-[#${lineColorCodes[0]}]`,
                                            ),
                                            { transform: [{ translateY: Platform.OS === 'ios' ? 1 : 2 }] },
                                        ]}>
                                        <MIndicator />
                                    </Animated.View>{' '}
                                    {getUserLanguageStringsForMetroLine(lineColors?.[0] ?? '', userLanguageStrings)}{' '}
                                    {userLanguageStrings.LineTowards}{' '}
                                    <Animated.Text style={tailwind.style('capitalize')}>
                                        {finalDestinationName
                                            ? finalDestinationName
                                            : destinationStop && 'stationName' in destinationStop
                                              ? destinationStop.stationName
                                              : destinationStop?.name}
                                    </Animated.Text>
                                </Animated.Text>
                            </Animated.View>
                        ) : lineColorCodes?.length && lineColorCodes?.length >= 1 ? (
                            <>
                                <ScrollView
                                    horizontal
                                    scrollEnabled={true}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={tailwind.style('flex-grow justify-center  ')}>
                                    {lineColorCodes.map((_: unknown, index: number) => {
                                        return (
                                            <Animated.View key={index} style={tailwind.style('flex-row ')}>
                                                <Animated.View
                                                    style={tailwind.style(
                                                        ' gap-6 content-between rounded-[4px] h-[16px] px-2',
                                                        index % 2 === 0
                                                            ? 'flex-row items-center '
                                                            : 'flex-row-reverse items-center',
                                                        `bg-[#${lineColorCodes[index]}] `,
                                                    )}>
                                                    <Animated.Text
                                                        style={tailwind.style(
                                                            'text-[8px] max-h-[8px] leading-[9px] font-areaNormal-extrabold text-white uppercase opacity-60  mr-1',
                                                        )}>
                                                        M
                                                    </Animated.Text>
                                                    <Animated.Text
                                                        style={tailwind.style(
                                                            'text-[8px] max-h-[8px] leading-[9px] font-areaNormal-extrabold text-white uppercase opacity-60',
                                                        )}>
                                                        {getUserLanguageStringsForMetroLine(
                                                            lineColors?.[index] ?? '',
                                                            userLanguageStrings,
                                                        )}{' '}
                                                        {userLanguageStrings.Line}
                                                    </Animated.Text>
                                                </Animated.View>
                                                {index !== lineColorCodes?.length - 1 && (
                                                    <Icon
                                                        icon={<ShuffleHorizontal />}
                                                        size={18}
                                                        style={tailwind.style('mx-1')}
                                                    />
                                                )}
                                            </Animated.View>
                                        );
                                    })}
                                </ScrollView>
                                <Animated.View
                                    style={tailwind.style(
                                        `flex ${!isStatic || isSwitchRequired ? 'justify-center items-center' : 'justify-start items-start'} pt-2.5 pb-3 mx-4`,
                                    )}>
                                    {isSwitchRequired ? (
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] leading-[18px] text-center tracking-[0.2px] font-areaNormal-extrabold text-[#656565]',
                                            )}>
                                            {userLanguageStrings.Switchat}
                                            {'\n'}
                                            <Animated.Text style={tailwind.style('capitalize align-center')}>
                                                {firstSwitchStation}
                                            </Animated.Text>
                                        </Animated.Text>
                                    ) : totalNumberOfStations && totalNumberOfStations > 1 ? (
                                        <Animated.View style={tailwind.style('flex-row  w-full justify-between')}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[12px] leading-[18px] text-left tracking-[0.2px] font-areaNormal-extrabold text-[#656565]',
                                                )}>
                                                {`You need to switch metro lines ${totalNumberOfStations - 1} times`}
                                            </Animated.Text>
                                            <Pressable
                                                accessibilityRole="button"
                                                onPress={() => {
                                                    metroSwitchRouteModalRef.current?.present();
                                                }}
                                                testID={'view_plan_button'}
                                                style={tailwind.style('ml-2')}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[12px] leading-[18px] tracking-[0.2px] font-areaNormal-extrabold text-blue-600 ',
                                                    )}>
                                                    View Plan
                                                </Animated.Text>
                                            </Pressable>
                                        </Animated.View>
                                    ) : null}
                                </Animated.View>

                                {!isStatic && (
                                    <Animated.View style={tailwind.style('mt-1.5')}>
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
                                )}
                            </>
                        ) : null}
                        {/* Arrival frequency message for metro - show for all metro routes */}
                        {isStatic &&
                            legInfo.bookingStatus &&
                            !isBookingStatusConfirmed(legInfo.bookingStatus) &&
                            appConfig.flowConfig.metroBookingEnable && (
                                <CustomButton
                                    buttonText={`Book metro journey @ ₹${finalFare} `}
                                    onClick={onBookButtonClick}
                                    bgColor="#F4F4F4"
                                    style={tailwind.style('p-3')}
                                    textStyle={{
                                        fontFamily: 'AreaNormal',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: '#3B3A3C',
                                    }}
                                    testID="view-plan-button"
                                    leftIcon={undefined}
                                    children={<Icon icon={<TicketIcon fill="#3B3A3C" />} size={20} color="#3B3A3C" />}
                                />
                            )}

                        {lineColorCodes && lineColorCodes.length > 0 && !isStatic ? (
                            <Animated.View
                                style={tailwind.style('pt-2.5 pb-3 px-4 flex-row justify-between items-center')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] leading-[18px] tracking-[0.2px] font-areaNormal-extrabold text-[#656565]',
                                    )}>
                                    {metroFrequencyMins ? (
                                        <>
                                            {userLanguageStrings.ArrivalEvery}{' '}
                                            <Animated.Text
                                                style={[
                                                    tailwind.style('font-areaNormal-extrabold'),
                                                    { color: '#09941E' },
                                                ]}>
                                                {metroFrequencyMins} {userLanguageStrings.Mins}
                                            </Animated.Text>
                                        </>
                                    ) : null}
                                </Animated.Text>
                                {!isStatic && isDataLoading
                                    ? null
                                    : showMetroOptions && (
                                          <Pressable
                                              accessibilityLabel={`Options button`}
                                              accessibilityRole="button"
                                              onPress={() => {
                                                  metroOptionsModalRef.current?.present();
                                              }}
                                              style={tailwind.style('px-2 py-1')}
                                              testID="metro-transit-options">
                                              <Animated.View style={tailwind.style('flex-row items-center')}>
                                                  <Animated.Text
                                                      style={tailwind.style(
                                                          'text-[12px] leading-[14px] tracking-[0.2px] font-areaNormal-extrabold text-[#656565]',
                                                      )}>
                                                      {userLanguageStrings.Options}
                                                  </Animated.Text>
                                                  <Icon
                                                      color={`#656565`}
                                                      style={tailwind.style('ml-1')}
                                                      icon={<ChevronRight fill={undefined} />}
                                                      size={12}
                                                  />
                                              </Animated.View>
                                          </Pressable>
                                      )}
                            </Animated.View>
                        ) : null}
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
                    mode={legInfo.travelMode}
                    towardsStation={timeTableData.towardsStation}
                    onDismiss={undefined}
                    allTowardsStation={timeTableData.allTowardsStation}
                />
            )}
            {!isStatic && showMetroOptions && (
                <MetroOptionsModal
                    source={originStopName}
                    destination={destinationStopName}
                    sourceStoplist={sourceStoplist}
                    destinationStoplist={destinationStoplist}
                    handleConfirmRoute={handleConfirmRouteChange}
                    allStops={allStops}
                    legOrder={legInfo.order}
                />
            )}
            <MetroSwitchRouteModal journeyRoutes={journeyRoutes} />
        </>
    );
};
