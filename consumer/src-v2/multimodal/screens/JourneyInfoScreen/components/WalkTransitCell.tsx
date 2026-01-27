import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { formatDistanceWithUnit } from '@/src-v2/utils/common';
import mtIcCarRideComplete from '@/typescript/assets/ny-service/mt_ic_car_ride_complete.webp';
import { createAction, Resolver } from '@/typescript/utils/common';
import { getPlaceArea } from '@/typescript/utils/placeUtils';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { AccessibilityInfo } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, SlideInLeft } from 'react-native-reanimated';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import mtIcAutoReviewTransit from '../../../../assets/3D-assets/review-transits/mt_ic_auto_review_transit.webp';
import transitAuto from '../../../../assets/3D-assets/transits/transit_auto.webp';
import transitWalk from '../../../../assets/3D-assets/transits/transit_walk.webp';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { Spinner } from '../../../components/common/Spinner/UI';
import { TransitArrowRight } from '../../../components/svg/Arrows';
import { ChevronRight } from '../../../components/svg/ChevronRight';
import { NammaYatriIcon } from '../../../components/svg/NammaYatri';
import { PixelArrow } from '../../../components/svg/PixelArrow';
import { AutoIcon, BikeIconJourney, WalkIcon } from '../../../components/svg/transport';
import { JourneyDetailScreenAction } from '../Types';
import { JourneyPlanScreenAction } from '../../JourneyPlanScreen/Types';
import { TransitCost } from './TransitCost';
import { getIconBGFromType } from './TransitIconWrapper';
import { CarIcon } from '../../../components/svg/transport/CarIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SkipIcon } from '@/src-v2/multimodal/components/svg/transport/SkipIcon';
import { TrackedLegInfoStaticInfo } from '@/src-v2/multimodal/types/journeyTracking';
import ClockIcon from '@/src-v2/multimodal/components/svg/ClockIcon';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';
import { getOrder } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';
import ContentLoader from '@/typescript/designSystem/components/ContentLoader';

export const Plus = ({ color = '#005FCB' }: { color: string }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
            <Path
                d="M6.70078 1.5V1.25H6.45078H5.55078H5.30078V1.5V10.5V10.75H5.55078H6.45078H6.70078V10.5V1.5Z"
                fill={color}
                stroke={color}
                strokeWidth="0.5"
            />
            <Path
                d="M10.75 5.55005V5.30005H10.5H1.5H1.25V5.55005V6.45005V6.70005H1.5H10.5H10.75V6.45005V5.55005Z"
                fill={color}
                stroke={color}
                strokeWidth="0.5"
            />
        </Svg>
    );
};

type WalkCellProps = {
    isLastCell: boolean | undefined;
    legInfo: legInfo | TrackedLegInfoStaticInfo;
    mpDispatch: Resolver<JourneyDetailScreenAction> | Resolver<JourneyPlanScreenAction> | undefined;
    isDataLoading: boolean | undefined;
    isSkipped: boolean | undefined;
    walkOrAutoTime: string | undefined;
};

const CONTAINER_SECTION = SCREEN_WIDTH - (28 + 38 + 34);
const PADDING_HORIZONTAL = 28; // Replace with actual horizontal padding
const MARGIN_HORIZONTAL = 34; // Replace with actual horizontal margin
const EXTRA_SPACING = 50; // Replace with any additional spacing
const CONTAINER_SECTION_WITH_NAMMA_YATRI = CONTAINER_SECTION - PADDING_HORIZONTAL - MARGIN_HORIZONTAL - EXTRA_SPACING;

type CELL_STATE = 'WALK' | 'AUTO';

export const WalkTransitCell = (props: WalkCellProps) => {
    const { legInfo, mpDispatch, isLastCell, isSkipped, walkOrAutoTime } = props;
    const isStatic = 'origin' in legInfo;
    const [fetchAutoPrice, _setFetchAutoPrice] = useState(false);
    const defaultCellState: CELL_STATE = legInfo.travelMode === 'Walk' ? 'WALK' : 'AUTO';
    const [cellState, setCellState] = useState<CELL_STATE>(defaultCellState);
    const appConfig = useAppSelector(selectAppConfig);
    const { origin, destination } = isStatic
        ? { origin: legInfo.origin, destination: legInfo.destination }
        : legInfo.legExtraInfo.TAG === 'Walk' || legInfo.legExtraInfo.TAG === 'Taxi'
          ? { origin: legInfo.legExtraInfo._0.origin, destination: legInfo.legExtraInfo._0.destination }
          : { origin: undefined, destination: undefined };
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const legPrice = !isStatic
        ? legInfo.travelMode === 'Taxi'
            ? legInfo.estimatedMaxFare?.amount
            : legInfo.estimatedMinFare?.amount
        : undefined;

    const startPoint = origin && ('stationName' in origin ? origin.stationName : getPlaceArea(origin.address));
    const destinationPoint =
        destination && ('stationName' in destination ? destination.stationName : getPlaceArea(destination.address));

    const serviceTierName = isStatic
        ? legInfo.selectedServiceTierName
        : legInfo.legExtraInfo.TAG === 'Taxi'
          ? legInfo.legExtraInfo._0.serviceTierName
          : '';
    const vehicleIconUrl =
        !isStatic && legInfo.legExtraInfo.TAG === 'Taxi'
            ? legInfo.legExtraInfo._0.vehicleIconUrl
            : isStatic
              ? legInfo.vehicleIconUrl
              : '';

    const distance = formatDistanceWithUnit(
        isStatic ? legInfo.distance || 0 : legInfo.estimatedDistance?.value || 0,
        (!isStatic && legInfo.estimatedDistance?.unit) || 'Meter',
        userLanguageStrings,
    );

    const memoizedCostValue = useMemo(
        () => (cellState === 'WALK' ? 0 : fetchAutoPrice ? 0 : legPrice),
        [cellState, fetchAutoPrice, legPrice],
    );

    useEffect(() => {
        setCellState(legInfo.travelMode === 'Walk' ? 'WALK' : 'AUTO');
    }, [legInfo.travelMode]);

    const changeToModeText =
        appConfig.languageTextConfig.changeToModeText === 'ChangeMode'
            ? userLanguageStrings[appConfig.languageTextConfig.changeToModeText]
            : userLanguageStrings[appConfig.languageTextConfig.changeToModeText](
                  getUserLanguageStringsForMode(serviceTierName || 'Auto', userLanguageStrings) || 'Auto',
              );

    const handleCellState = () => {
        if (!mpDispatch) {
            return;
        }
        if (isStatic) {
            const journeyPlanLegInfo = getOrder(legInfo.legOrder);
            if (cellState === 'WALK' || isSkipped) {
                mpDispatch(
                    createAction<
                        'SWITCH_MODE',
                        { legOrder: number; newMode: MultimodalTravelMode_multimodalTravelMode }
                    >('SWITCH_MODE', { legOrder: journeyPlanLegInfo, newMode: 'Taxi' }),
                );
                if (cellState === 'WALK') {
                    AccessibilityInfo.announceForAccessibility(`Switched to ${serviceTierName}.`);
                }
            } else {
                mpDispatch(createAction('SHOW_RIDE_OPTIONS', { legOrder: journeyPlanLegInfo }));
            }
        } else if (cellState === 'WALK' || isSkipped) {
            mpDispatch(
                createAction<'SWITCH_MODE', { legOrder: number; newMode: MultimodalTravelMode_multimodalTravelMode }>(
                    'SWITCH_MODE',
                    { legOrder: legInfo.order, newMode: 'Taxi' },
                ),
            );
            if (cellState === 'WALK') {
                AccessibilityInfo.announceForAccessibility(`Switched to ${serviceTierName}.`);
            }
        } else {
            mpDispatch(createAction('SHOW_RIDE_OPTIONS', { legOrder: legInfo.order }));
        }
    };

    const transitType =
        !isStatic && legInfo.legExtraInfo.TAG === 'Taxi'
            ? legInfo.legExtraInfo._0.serviceTierName === 'Auto'
                ? transitAuto
                : mtIcCarRideComplete
            : transitWalk;

    const formatPoint = (point: string | undefined) =>
        point ? point.charAt(0).toUpperCase() + point.slice(1).toLowerCase() : '';

    const formattedStartPoint = formatPoint(startPoint);
    const formattedDestinationPoint = formatPoint(destinationPoint);

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(28).stiffness(200)}
            style={tailwind.style('flex-1 px-4 pt-3')}>
            <Animated.View
                layout={LinearTransition.springify().damping(28).stiffness(200)}
                style={tailwind.style('overflow-hidden')}>
                <Animated.View
                    layout={LinearTransition.springify().damping(28).stiffness(200)}
                    style={tailwind.style(
                        'flex-1 border-[1px] rounded-[16px]',
                        cellState === 'AUTO' ? 'bg-white border-[#F1F2F7] ' : 'bg-[#F7F7F7] border-[#D9D9D9]',
                    )}>
                    {cellState === 'AUTO' ? (
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut.duration(300)}
                            layout={LinearTransition.springify().damping(28).stiffness(200)}
                            style={tailwind.style('p-[14px] pt-4 flex-1 w-full')}
                            accessible={true}
                            accessibilityLabel={`Taxi/Auto ride from ${formattedStartPoint} to ${formattedDestinationPoint} for ${distance}. ${isStatic ? '' : `Cost for auto ride is ${memoizedCostValue} rupees.`}`}>
                            {serviceTierName === 'Auto' ? (
                                <Animated.Image
                                    accessible={false}
                                    entering={SlideInLeft.springify().damping(48).stiffness(340)}
                                    exiting={FadeOut.duration(200)}
                                    source={mtIcAutoReviewTransit}
                                    resizeMode={transitType === transitAuto ? 'cover' : 'contain'}
                                    style={[
                                        tailwind.style('absolute bottom-0 w-[87px] h-[99px]'),
                                        { opacity: isSkipped ? 0.4 : 1 },
                                    ]}
                                />
                            ) : !vehicleIconUrl ? (
                                <Animated.View style={[tailwind.style('absolute bottom-0  mb-1 ml-1')]}>
                                    <ContentLoader
                                        style={tailwind.style('flex-1 justify-end items-end ')}
                                        height={55}
                                        width={55}>
                                        <Rect width="90" height="90" />
                                    </ContentLoader>
                                </Animated.View>
                            ) : (
                                <Animated.Image
                                    accessible={false}
                                    entering={SlideInLeft.springify().damping(48).stiffness(340)}
                                    exiting={FadeOut.duration(200)}
                                    source={{ uri: vehicleIconUrl }}
                                    resizeMode={'contain'}
                                    style={[
                                        tailwind.style('absolute bottom-0 w-[80px] h-[79px] mb-1 ml--3'),
                                        { opacity: isSkipped ? 0.4 : 1 },
                                    ]}
                                />
                            )}
                            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                                {cellState === 'AUTO' ? (
                                    <Animated.View
                                        layout={LinearTransition.springify().damping(30).stiffness(200)}
                                        entering={FadeIn}
                                        exiting={FadeOut}
                                        style={tailwind.style('flex-row items-center')}>
                                        {isSkipped ? (
                                            <Animated.View
                                                layout={LinearTransition.springify().damping(30).stiffness(200)}
                                                style={tailwind.style('flex flex-row items-center')}>
                                                <Animated.View
                                                    style={tailwind.style(
                                                        'h-7 w-7 items-center justify-center rounded-[10px]',
                                                        `bg-[${getIconBGFromType('Taxi')}]`,
                                                    )}>
                                                    <Icon color={'#3B3A3C'} icon={<SkipIcon />} size={16} />
                                                </Animated.View>
                                                <Animated.Text
                                                    // layout={LinearTransition.springify().damping(30).stiffness(200)}
                                                    style={tailwind.style(
                                                        'pl-3 text-[14px] leading-[18px] font-areaNormal-extrabold text-[#656565]',
                                                    )}>
                                                    {userLanguageStrings.RideSkipped}
                                                </Animated.Text>
                                            </Animated.View>
                                        ) : (
                                            <Animated.View
                                                style={tailwind.style('flex-row w-full items-center justify-between')}>
                                                <Animated.View
                                                    layout={LinearTransition.springify().damping(30).stiffness(200)}
                                                    style={tailwind.style('flex flex-row items-center')}>
                                                    {fetchAutoPrice ? (
                                                        <Spinner
                                                            size="sm"
                                                            stroke={`bg-[#105BCD]`}
                                                            style={tailwind.style('mr-1')}
                                                        />
                                                    ) : (
                                                        !isSkipped &&
                                                        serviceTierName && (
                                                            <Animated.View
                                                                style={tailwind.style(
                                                                    'h-7 w-7 items-center justify-center rounded-[10px]',
                                                                    `bg-[${getIconBGFromType('Taxi')}]`,
                                                                )}>
                                                                <Icon
                                                                    color={'#3B3A3C'}
                                                                    icon={
                                                                        serviceTierName === 'Auto' ? (
                                                                            <AutoIcon fill={undefined} />
                                                                        ) : serviceTierName
                                                                              ?.toLocaleLowerCase()
                                                                              .includes('bike') ? (
                                                                            <BikeIconJourney />
                                                                        ) : (
                                                                            <CarIcon fill={undefined} />
                                                                        )
                                                                    }
                                                                    size={16}
                                                                />
                                                            </Animated.View>
                                                        )
                                                    )}
                                                    <Animated.Text
                                                        layout={LinearTransition.springify().damping(30).stiffness(200)}
                                                        style={tailwind.style(
                                                            'pl-3 text-[14px] leading-[18px] font-areaNormal-extrabold text-[#656565]',
                                                        )}>
                                                        {serviceTierName}
                                                    </Animated.Text>
                                                    <Animated.Text
                                                        layout={LinearTransition.springify().damping(30).stiffness(200)}
                                                        style={tailwind.style(
                                                            'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#656565]',
                                                        )}>
                                                        {' '}
                                                        | {distance && `${distance}`}
                                                    </Animated.Text>
                                                </Animated.View>

                                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                                    <Icon
                                                        icon={<ClockIcon fill={undefined} />}
                                                        size={16}
                                                        color="#656565"
                                                    />
                                                    <Animated.Text
                                                        style={tailwind.style(
                                                            'text-[13px] leading-[15.6px] tracking-[0.2px] font-areaNormal-extrabold text-[#656565] pl-1',
                                                        )}>
                                                        {walkOrAutoTime}
                                                    </Animated.Text>
                                                </Animated.View>
                                            </Animated.View>
                                        )}
                                    </Animated.View>
                                ) : null}
                                {/* {props.isDataLoading ? (
                                    <Spinner stroke={`border-[#105BCD]`} size="sm" style={tailwind.style('mr-4')} />
                                ) : !isStatic ? (
                                    <Pressable
                                        testID={`399b3f62-f9ea-4f02-96d7-4ee30778a2dbs`}
                                        hitSlop={10}
                                        disabled={fetchAutoPrice}
                                        accessible={true}
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            isSkipped
                                                ? `Switch back to ${serviceTierName || 'Auto'}`
                                                : `Open ride options menu`
                                        }
                                        accessibilityHint={
                                            isSkipped
                                                ? `Double tap to switch back to ${serviceTierName || 'Auto'} mode.`
                                                : 'Double tap to view options for changing vehicle or switching to walk'
                                        }
                                        onPress={handleCellState}>
                                        <Animated.View
                                            style={tailwind.style(
                                                'flex-row items-center',
                                                fetchAutoPrice ? 'opacity-50' : 'opacity-100',
                                            )}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[14px] leading-[18px] font-areaNormal-extrabold',
                                                    `text-[#656565]`,
                                                )}>
                                                {isSkipped
                                                    ? userLanguageStrings.SwitchtoAutoOrCab(serviceTierName || 'Auto')
                                                    : userLanguageStrings.Change}
                                            </Animated.Text>
                                            <Icon
                                                color={`#656565`}
                                                style={tailwind.style('-mb-0.5 ml-0.5')}
                                                icon={<ChevronRight fill={undefined} />}
                                                size={12}
                                            />
                                        </Animated.View>
                                    </Pressable>
                                ) : null} */}
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
                            <Animated.View style={tailwind.style('flex-row justify-between items-end relative')}>
                                <Animated.View style={tailwind.style('pl-[60px] pt-[17px]')}>
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(30).stiffness(200)}
                                        numberOfLines={2}
                                        style={[
                                            tailwind.style(
                                                'text-[14px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C] capitalize',
                                                `max-w-[${CONTAINER_SECTION_WITH_NAMMA_YATRI}px]`,
                                            ),
                                            { opacity: isSkipped ? 0.4 : 1 },
                                        ]}>
                                        {formattedStartPoint}
                                    </Animated.Text>
                                    <Animated.View
                                        style={[
                                            tailwind.style('flex-row items-center pt-2.5'),
                                            { opacity: isSkipped ? 0.4 : 1 },
                                        ]}>
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
                                                'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] pl-1',
                                                `leading-[22px] capitalize`,
                                                `max-w-[${CONTAINER_SECTION_WITH_NAMMA_YATRI}px]`,
                                            )}>
                                            {formattedDestinationPoint}
                                        </Animated.Text>
                                    </Animated.View>
                                </Animated.View>
                                <Animated.View
                                    entering={FadeIn.duration(200)}
                                    style={tailwind.style('flex-1 items-end justify-end pb-0.5')}>
                                    <Animated.View
                                        style={[tailwind.style('items-end'), { opacity: isSkipped ? 0.4 : 1 }]}
                                        accessible={true}
                                        accessibilityLabel={`${isStatic ? '' : `Current fare for ${serviceTierName || 'Auto'} is ${memoizedCostValue} rupees`}`}>
                                        {/* Removed this because we have showed the text in the auto cell */}
                                        {/* {transitType === transitAuto && (
                                            <Pressable
                                                testID={`6ff04cf1-7042-41a9-a536-a2d97a8493dd`}
                                                onPress={() =>
                                                    mpDispatch(createAction('SHOW_AUTO_INFO_POPUP', undefined))
                                                }>
                                                <Animated.View style={tailwind.style('mb-2')}>
                                                    <Icon icon={<InfoAuto fill={undefined} />} size={18} />
                                                </Animated.View>
                                            </Pressable>
                                        )} */}
                                        {!isStatic ? (
                                            <TransitCost
                                                rupeeColor="#3B3A3C"
                                                numberColor="#3B3A3C"
                                                cost={memoizedCostValue}
                                            />
                                        ) : null}
                                    </Animated.View>
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                    ) : null}
                    {cellState === 'WALK' ? (
                        <Animated.View
                            entering={FadeIn.delay(100)}
                            exiting={FadeOut.duration(200)}
                            accessible={true}
                            accessibilityLabel={
                                cellState === 'WALK'
                                    ? `Walk for ${distance} from ${formattedStartPoint} to ${formattedDestinationPoint}`
                                    : `${serviceTierName || 'Auto'} ride for ${distance} from ${formattedStartPoint} to ${formattedDestinationPoint}. ${isStatic ? '' : `Current fare is ${memoizedCostValue} rupees`}`
                            }
                            layout={LinearTransition.springify().damping(28).stiffness(200)}
                            style={tailwind.style('rounded-[22px] p-3')}>
                            <Animated.View style={tailwind.style('flex-row items-center justify-between w-full')}>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    <Animated.View
                                        style={tailwind.style(
                                            'h-7 w-7 items-center justify-center rounded-[10px] bg-[#656565]',
                                        )}>
                                        <Icon color="#FFF" icon={<WalkIcon fill={undefined} />} size={16} />
                                    </Animated.View>
                                    <Animated.View style={tailwind.style('pl-2')}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[14px] font-areaNormal-extrabold text-[#656565]',
                                            )}>
                                            {userLanguageStrings.Walk} {distance && `${distance}`}
                                        </Animated.Text>
                                    </Animated.View>
                                </Animated.View>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    <Icon icon={<ClockIcon fill={undefined} />} size={16} color="#656565" />
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[13px] leading-[15.6px] tracking-[0.2px] font-areaNormal-extrabold text-[#656565] pl-1',
                                        )}>
                                        {walkOrAutoTime}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>

                            <Animated.View style={tailwind.style('pl-9')}>
                                <Animated.View style={tailwind.style('pt-[13px]')}>
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(30).stiffness(200)}
                                        numberOfLines={2}
                                        style={tailwind.style(
                                            'text-[14px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C]',
                                            `max-w-[${CONTAINER_SECTION - 92}px]`,
                                        )}>
                                        {formattedStartPoint}
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
                                            numberOfLines={2}
                                            style={tailwind.style(
                                                'text-[14px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C] pl-1',
                                                `max-w-[${CONTAINER_SECTION - 92}px]`,
                                            )}>
                                            {formattedDestinationPoint}
                                        </Animated.Text>
                                    </Animated.View>
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                    ) : null}
                    {cellState === 'AUTO' ? (
                        <>
                            <Animated.View
                                entering={FadeIn}
                                exiting={FadeOut.duration(300)}
                                layout={LinearTransition.springify().damping(28).stiffness(200)}
                                style={tailwind.style('mt-2.5')}>
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
                            <Animated.View
                                style={tailwind.style('flex-row items-center justify-between pt-2.5 pb-3 px-[14px]')}>
                                <Animated.View
                                    style={tailwind.style('flex-row items-center')}
                                    accessibilityLabel={
                                        legInfo.travelMode === 'Taxi'
                                            ? userLanguageStrings.Paydirectlytothedriver
                                            : `${userLanguageStrings.NammaYatri}`
                                    }>
                                    <>
                                        {appConfig.appType === 'multimodal' ? (
                                            <Icon icon={<NammaYatriIcon />} size={16} />
                                        ) : null}
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] tracking-[0.2px] font-areaNormal-extrabold text-[#656565] pl-1',
                                            )}>
                                            {userLanguageStrings.Paydirectlytothedriver}
                                        </Animated.Text>
                                    </>
                                </Animated.View>
                                {props.isDataLoading ? (
                                    <Spinner stroke={`border-[#105BCD]`} size="sm" style={tailwind.style('')} />
                                ) : !isStatic ? (
                                    <Pressable
                                        testID={`24be1c5e-0c16-4b84-b63b-d5cf921fcd9f`}
                                        hitSlop={10}
                                        disabled={fetchAutoPrice}
                                        accessible={true}
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            isSkipped
                                                ? `Switch back to ${serviceTierName || 'Auto'} button`
                                                : `Open ride options menu, Select to view options for changing vehicle or switching to walk button`
                                        }
                                        accessibilityHint={
                                            isSkipped
                                                ? `Select to switch back to ${serviceTierName || 'Auto'} mode.`
                                                : 'Select to view options for changing vehicle or switching to walk'
                                        }
                                        onPress={handleCellState}>
                                        <Animated.View
                                            style={tailwind.style(
                                                'flex-row items-center',
                                                fetchAutoPrice ? 'opacity-50' : 'opacity-100',
                                            )}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[14px] leading-[18px] font-areaNormal-extrabold',
                                                    `text-[#656565]`,
                                                )}>
                                                {isSkipped
                                                    ? userLanguageStrings.SwitchtoAutoOrCab(
                                                          getUserLanguageStringsForMode(
                                                              serviceTierName || 'Auto',
                                                              userLanguageStrings,
                                                          ) || 'Auto',
                                                      )
                                                    : userLanguageStrings.Change}
                                            </Animated.Text>
                                            <Icon
                                                color={`#656565`}
                                                style={tailwind.style('-mb-0.5 ml-0.5')}
                                                icon={<ChevronRight fill={undefined} />}
                                                size={12}
                                            />
                                        </Animated.View>
                                    </Pressable>
                                ) : null}
                            </Animated.View>
                        </>
                    ) : null}
                    {cellState === 'WALK' ? (
                        <>
                            <Animated.View entering={FadeIn} style={tailwind.style('px-[14px] pt-2.5')}>
                                <Svg height={1}>
                                    <Line
                                        strokeDasharray="5.2, 7"
                                        x1={0}
                                        x2={SCREEN_WIDTH}
                                        y1={1}
                                        y2={1}
                                        stroke="#E6E6E6"
                                        strokeWidth="2"
                                    />
                                </Svg>
                            </Animated.View>
                            <Animated.View
                                style={tailwind.style(
                                    'flex-row items-center justify-between px-[14px] pt-[12px] pb-4',
                                )}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[13px] leading-[18px] tracking-[0.2px] font-areaNormal-extrabold text-[#656565]',
                                    )}>
                                    {userLanguageStrings.ReachQuickerWithYourRide}
                                </Animated.Text>

                                <Pressable
                                    testID={`399b3f62-f9ea-4f02-96d7-4ee30778a2db`}
                                    hitSlop={10}
                                    disabled={fetchAutoPrice}
                                    accessible={true}
                                    accessibilityRole="button"
                                    accessibilityLabel={changeToModeText}
                                    onPress={handleCellState}>
                                    <Animated.View style={tailwind.style('flex-row items-center')}>
                                        {props.isDataLoading ? (
                                            <Spinner
                                                stroke={`border-[#105BCD]`}
                                                size="sm"
                                                style={tailwind.style('mr-4')}
                                            />
                                        ) : null}
                                        {!props.isDataLoading ? (
                                            <>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#005FCB]',
                                                    )}>
                                                    {changeToModeText}
                                                </Animated.Text>
                                                <Icon
                                                    style={tailwind.style('ml-1 mb-0.5')}
                                                    icon={<Plus color="#005FCB" />}
                                                    size={12}
                                                />
                                            </>
                                        ) : null}
                                    </Animated.View>
                                </Pressable>
                            </Animated.View>
                        </>
                    ) : null}
                </Animated.View>
                {!isLastCell ? (
                    <Animated.View style={tailwind.style('pt-4 pl-4')}>
                        <PixelArrow />
                    </Animated.View>
                ) : null}
            </Animated.View>
        </Animated.View>
    );
};
