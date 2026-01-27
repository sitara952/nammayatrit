import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated, { FadeIn, FadeOut, LinearTransition, SlideInLeft } from 'react-native-reanimated';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import mtIcBusTransitReview from '../../../../../assets/3D-assets/review-transits/mt_ic_bus_transit_review.webp';
import { ChevronRight } from '@/src-v2/multimodal/components/svg/ChevronRight';
import Svg, { Line } from 'react-native-svg';
import { tailwind } from '../../../../../tailwind-theme/tailwind';
import { Icon } from '../../../../components/common/Icon';
import { TransitArrowRight } from '../../../../components/svg/Arrows';
import { PixelArrow } from '../../../../components/svg/PixelArrow';
import { BusIcon } from '../../../../components/svg/transport/BusIcon';
import BusList from '../../../SingleModeSearch/Components/BusList';
import { TransitCost } from '../TransitCost';
import { getIconBGFromType, getIconSecondaryBGFromType } from '../TransitIconWrapper';
import { Spinner } from '../../../../components/common/Spinner/UI';

import { formatDistanceWithUnit, formatTimeFromSeconds } from '@/src-v2/utils/common';
import { BusTransitCellViewState } from './Types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Text } from 'react-native';
import { createAction } from '@/typescript/utils/common';
import { MemoizedNewTimeTableUI } from '@/src-v2/multimodal/screens/NewTimeTable/UI';
import ClockIcon from '@/src-v2/multimodal/components/svg/ClockIcon';
import { logEvent, EventName } from '@/typescript/utils/logger';

const CONTAINER_SECTION = SCREEN_WIDTH - 20 - 32 - 32 - 34;

export const BusTransitCell: React.FC<BusTransitCellViewState> = ({
    isLastCell,
    originStop,
    destinationStop,
    providerName: _providerName,
    routeName,
    selectedServiceTier,
    alternateShortNames,
    upcomingBusInfo,
    distance,
    onClassChange,
    ticketState,
    btDispatch,
    isDataLoading,
    isStatic,
    timeTableProps,
    transitTime,
    bookingAllowed,
    showPassText,
    totalTicketCount,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const tenHoursInSeconds = 10 * 60 * 60;

    const busTransitCellRef = useRef<View>(null);
    const accessibilityManager = useAccessibilityFocus({
        mainContentRef: busTransitCellRef,
        focusDelay: 100,
        accessibilityDelay: 50,
        maxStackSize: 20,
    });

    // Restore focus when data loading state changes
    useEffect(() => {
        if (!isDataLoading && busTransitCellRef.current) {
            accessibilityManager.restoreFocus();
        }
    }, [isDataLoading]);

    return (
        <>
            <Animated.View
                ref={busTransitCellRef}
                layout={LinearTransition.springify().damping(28).stiffness(200)}
                style={tailwind.style('flex-1 px-4 pt-3')}>
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
                                accessibilityLabel="bus transit review"
                                entering={SlideInLeft.springify().damping(48).stiffness(340)}
                                exiting={FadeOut.duration(200)}
                                source={mtIcBusTransitReview}
                                style={tailwind.style('absolute bottom-0 w-[87px] h-[99px] z-10')}
                            />

                            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    <Animated.View
                                        style={tailwind.style(
                                            'h-7 w-7 items-center justify-center rounded-[10px]',
                                            `bg-[${getIconBGFromType('Bus')}]`,
                                        )}>
                                        <Icon
                                            color={getIconSecondaryBGFromType('Bus')}
                                            icon={<BusIcon fill={undefined} />}
                                            size={16}
                                        />
                                    </Animated.View>
                                    <Animated.View
                                        layout={LinearTransition.springify().damping(28).stiffness(200)}
                                        style={tailwind.style('flex-row items-center pl-3')}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#656565]',
                                            )}>
                                            {userLanguageStrings.bus} {routeName}
                                        </Animated.Text>
                                    </Animated.View>
                                    {selectedServiceTier?.serviceTierName && (
                                        <Animated.Text
                                            layout={LinearTransition.springify().damping(28).stiffness(200)}
                                            style={tailwind.style(
                                                'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#656565] pl-1',
                                            )}>
                                            | {selectedServiceTier?.serviceTierName}
                                        </Animated.Text>
                                    )}
                                </Animated.View>
                                {!isStatic && ticketState === 'review' ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        testID={`1d770eb6-b3ef-44e7-8513-d82b130c0d38`}
                                        onPress={onClassChange}
                                        accessibilityLabel={`Change button`}
                                        style={tailwind.style('flex-row items-center')}>
                                        {isDataLoading ? (
                                            <Spinner
                                                stroke={`border-[#105BCD]`}
                                                size="sm"
                                                style={tailwind.style('mr-4')}
                                            />
                                        ) : (
                                            <Animated.View style={tailwind.style('flex-row items-center')}>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[14px] font-areaNormal-extrabold text-[#656565]',
                                                    )}>
                                                    {userLanguageStrings.Change}
                                                </Animated.Text>
                                                <Icon
                                                    color="#656565"
                                                    style={tailwind.style('-mb-0.5 ml-0.5')}
                                                    icon={<ChevronRight />}
                                                    size={12}
                                                />
                                            </Animated.View>
                                        )}
                                    </Pressable>
                                ) : null}
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
                            <Animated.View style={tailwind.style('flex-row justify-between items-end relative')}>
                                <Animated.View style={tailwind.style('pl-[60px] pt-[17px]')}>
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(30).stiffness(200)}
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            'text-[14px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C] capitalize',
                                            `max-w-[${CONTAINER_SECTION - 72}px]`,
                                        )}>
                                        {originStop?.name}
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
                                                'text-[14px] leading-[22px] font-areaNormal-extrabold text-[#3B3A3C] pl-1 capitalize',
                                                `max-w-[${CONTAINER_SECTION - 90}px]`,
                                            )}>
                                            {destinationStop?.name}
                                        </Animated.Text>
                                    </Animated.View>
                                </Animated.View>
                                {!isStatic && selectedServiceTier && (
                                    <Animated.View
                                        entering={FadeIn.duration(200)}
                                        style={tailwind.style('flex-1 items-end justify-end pb-0.5')}
                                        accessible={true}
                                        accessibilityLabel={
                                            selectedServiceTier &&
                                            'fare' in selectedServiceTier &&
                                            selectedServiceTier.fare?.amount
                                                ? bookingAllowed === false
                                                    ? `Original fare for bus ${routeName} is ${selectedServiceTier.fare.amount} rupees, but pass is applied`
                                                    : `Fare for bus ${routeName} is ${selectedServiceTier.fare.amount} rupees`
                                                : undefined
                                        }>
                                        {!bookingAllowed && showPassText ? (
                                            <Animated.View style={tailwind.style('items-end')}>
                                                <Animated.View style={tailwind.style('flex-row items-end')}>
                                                    <Animated.Text
                                                        style={[
                                                            tailwind.style(
                                                                'text-[15px] leading-[15px] max-h-[14px] font-inter-regular text-[#7B8997]',
                                                            ),
                                                            { textDecorationLine: 'line-through' },
                                                        ]}>
                                                        ₹{' '}
                                                    </Animated.Text>
                                                    <Animated.Text
                                                        style={[
                                                            tailwind.style(
                                                                'text-[24px] max-h-[25px] leading-[28px] font-areaNormal-bold text-[#7B8997]',
                                                            ),
                                                            { textDecorationLine: 'line-through' },
                                                        ]}>
                                                        {selectedServiceTier && 'fare' in selectedServiceTier
                                                            ? selectedServiceTier.fare?.amount * totalTicketCount
                                                            : '0'}
                                                    </Animated.Text>
                                                </Animated.View>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[11px] leading-[12px] font-areaNormal-extrabold text-[#097B42] mt-1',
                                                    )}>
                                                    {userLanguageStrings.PassApplied}
                                                </Animated.Text>
                                            </Animated.View>
                                        ) : (
                                            <TransitCost
                                                rupeeColor="#3B3A3C"
                                                numberColor="#3B3A3C"
                                                cost={
                                                    selectedServiceTier && 'fare' in selectedServiceTier
                                                        ? selectedServiceTier.fare?.amount * totalTicketCount
                                                        : undefined
                                                }
                                            />
                                        )}
                                    </Animated.View>
                                )}
                            </Animated.View>

                            {/* <Animated.View
                            layout={LinearTransition.springify().damping(28).stiffness(300)}
                            style={tailwind.style(' bg-white rounded-2xl')}>

                            {collapsed ? (
                                <Animated.View
                                    entering={FadeIn.delay(100)}
                                    style={tailwind.style('pt-3 flex flex-row')}>
                                    {avaialbleServiceTiers.map((busClass, index) => {
                                        return (
                                            <ClassOption
                                                key={index}
                                                item={busClass}
                                                index={index}
                                                isSelected={busClass.serviceTierType === selectedClass?.serviceTierType}
                                                handlePressCallback={handleOnPress}
                                            />
                                        );
                                    })}
                                </Animated.View>
                            ) : null}

                        </Animated.View> */}
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
                            <Animated.View style={tailwind.style('flex pt-2.5 pb-3 px-[14px]')}>
                                <Animated.View style={tailwind.style('flex-row items-center pb-2')}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[12px] leading-[15px] tracking-[0.2px] font-areaNormal-extrabold text-[#656565] pr-1.5',
                                        )}>
                                        {userLanguageStrings.TicketisValidin}
                                    </Animated.Text>
                                    <BusList
                                        busList={alternateShortNames.map((item: string) => {
                                            return {
                                                routeCode: item,
                                                routeNumber: item,
                                                handleOnPress: () => {},
                                            };
                                        })}
                                        isFilled={true}
                                        isLoading={false}
                                        showIcon={false}
                                        isTicket={true}
                                    />
                                </Animated.View>
                                {/* @TODO -- change after API Data */}
                                {/* <Animated.Text
                                style={tailwind.style(
                                    'text-[12px] tracking-[0.2px] font-areaNormal-extrabold text-[#097B42]',
                                )}>
                                Available every 10 mins
                            </Animated.Text> */}
                                <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                                    {!isStatic &&
                                    upcomingBusInfo &&
                                    ticketState === 'review' &&
                                    upcomingBusInfo?.arrivalTimeInSeconds <= tenHoursInSeconds ? (
                                        <>
                                            <Animated.View
                                                layout={LinearTransition.springify().damping(24).stiffness(240)}
                                                entering={FadeIn}
                                                style={tailwind.style('max-w-[230px]')}
                                                accessible={true}
                                                accessibilityLabel={`Arrival button`}>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[13px] font-areaNormal-extrabold text-[#656565] capitalize',
                                                    )}>
                                                    <Animated.Text style={tailwind.style('text-[#097B42]')}>
                                                        {userLanguageStrings.Arrivesin}{' '}
                                                        {formatTimeFromSeconds(
                                                            upcomingBusInfo?.arrivalTimeInSeconds,
                                                            true,
                                                            userLanguageStrings,
                                                        )}
                                                    </Animated.Text>{' '}
                                                    to {originStop?.name}{' '}
                                                    {distance
                                                        ? `(${formatDistanceWithUnit(
                                                              distance > 1000 ? distance / 1000 : distance,
                                                              distance > 1000 ? 'Kilometer' : 'Meter',
                                                              userLanguageStrings,
                                                          )})`
                                                        : ''}
                                                </Animated.Text>
                                            </Animated.View>
                                        </>
                                    ) : (
                                        <Animated.View style={tailwind.style('flex-1')} />
                                    )}
                                    {btDispatch ? (
                                        <Pressable
                                            testID="bus-transit-cell-track-bus-button"
                                            style={tailwind.style(' bg-transparent')}
                                            onPress={() => {
                                                logEvent(EventName.NY_BUS_TRACK_BUS);
                                                btDispatch(createAction('LIVE_OR_GTFS_CLICK', undefined));
                                            }}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Track Bus button`}>
                                            <Text
                                                style={tailwind.style(
                                                    'text-[#016ACD] text-[13px] font-areaNormal-extrabold self-center underline',
                                                )}>
                                                {userLanguageStrings.TrackBus}
                                            </Text>
                                        </Pressable>
                                    ) : null}
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                    {!isLastCell ? (
                        <Animated.View style={tailwind.style('pt-4 pl-4')}>
                            <PixelArrow />
                        </Animated.View>
                    ) : null}
                </Animated.View>
            </Animated.View>
            {timeTableProps && (
                <MemoizedNewTimeTableUI
                    times={timeTableProps.times}
                    source={timeTableProps.source}
                    sheetRef={timeTableProps.sheetRef}
                    mode={timeTableProps.mode}
                    towardsStation={timeTableProps.towardsStation}
                    allTowardsStation={timeTableProps.allTowardsStation}
                    onDismiss={undefined}
                />
            )}
        </>
    );
};
