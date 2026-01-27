import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '../../../../../../src/typescript/tailwindTheme/tailwind';
import {
    getColor,
    getIcon,
    getIsJourneyStatusHeading,
    getTransitDesc,
    getTransitHeading,
} from '../../utils/getIternaryUtils';
import { Transit, TransitType } from './types';
import Shimmer from '../../../Search/components/SearchSectionListItem/Shimmer';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { checkTaxiLeg } from '@/typescript/utils/common';

// Helper function to determine icon color based on transit type and state
const getIconColor = (transitType: string | undefined, transitState: string | undefined): string | undefined => {
    if (checkTaxiLeg(transitType)) {
        return transitState === 'RIDESKIPPED' ? '#BBBBBB' : undefined;
    }
    if (transitType === 'WALK') {
        return '#fff';
    }
    return undefined;
};

// TimelineCard component representing a single leg of the journey
export const TimelineCard = ({
    transits, // Transit details for this leg of the journey
    isFirstLeg, // Indicates if this is the first leg of the journey
    isLastLeg, // Indicates if this is the last leg of the journey
    currentIndex, // The index of this leg in the overall journey
    currentStatus, // Current status of the journey (e.g., LIVE, OFFTRACK, NOTMOVING)
    switchToWalk,
    onCall,
    onBoost,
    // onMarkLegComplete,
    onRetryBooking,
    // onMarkComplete,
    // onPressOtherOptions,
    onViewTimetable,
    onCheckIn,
    isLoading,
    onSafety,
    isJourneyStatus = false,
    onUpdateTransit,
}: {
    transits: TransitType | undefined; // Transit object containing details for this leg
    isFirstLeg: boolean; // Flag for the first leg
    isLastLeg: boolean; // Flag for the last leg
    isCurrentLeg: boolean; // Flag for the current leg
    currentIndex: number; // Index of the current leg in the journey
    currentStatus: 'LIVE' | 'OFFTRACK' | 'NOTMOVING'; // Status of the journey
    switchToWalk: (() => void) | undefined;
    onCall: (() => void) | undefined;
    onBoost: (() => void) | undefined;

    onRetryBooking: (() => Promise<void>) | undefined;
    onMarkComplete: (() => void) | undefined;
    onViewTimetable: (() => void) | undefined;
    onPressOtherOptions: (() => void) | undefined;
    onCheckIn: () => void;
    isLoading: boolean;
    onSafety: (() => void) | undefined;
    isJourneyStatus: boolean;
    onUpdateTransit: ((type: Transit) => void) | undefined;
}) => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const liveStatusTrackColor = isJourneyStatus ? 'bg-[#E9E9E9]' : `bg-[${colors.journey_tracking_line}]`;
    const { completeJourneyModalRef } = useRefsContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={tailwind.style('relative')}>
            {/* Transparent overlay for onUpdateTransit functionality */}
            {onUpdateTransit && transits?.isShowUpdate && (
                <Pressable
                    style={tailwind.style('absolute inset-0 z-10')}
                    onPress={() => onUpdateTransit(transits?.type || 'WALK')}
                    accessibilityRole="button"
                    accessibilityLabel="Update journey status button"
                    testID="timeline-card-update-press"
                />
            )}

            {/* Card content without Pressable wrapper */}
            <Animated.View layout={LinearTransition.springify().damping(28).stiffness(240)}>
                {/* Step 1 */}
                <Animated.View style={tailwind.style(`flex-row items-start ${isFirstLeg ? 'pt-6' : ''} relative`)}>
                    <Animated.View
                        style={tailwind.style('items-center w-8')}
                        layout={LinearTransition}
                        entering={FadeIn}
                        exiting={FadeOut}>
                        {!isFirstLeg && (
                            <>
                                <Animated.View
                                    layout={LinearTransition}
                                    entering={FadeIn}
                                    exiting={FadeOut}
                                    style={tailwind.style(
                                        `w-2.5 h-7 bg-[#1D7BD3] ${
                                            currentStatus === 'LIVE' ? liveStatusTrackColor : 'bg-[#E9E9E9]'
                                        } -z-3 relative`,
                                    )}
                                />
                            </>
                        )}

                        {!isLoading ? (
                            <Animated.View
                                layout={LinearTransition.springify().damping(28).stiffness(240)}
                                entering={FadeIn}
                                exiting={FadeOut}
                                style={[
                                    tailwind.style(
                                        `bg-[${getColor(
                                            transits?.type || 'WALK',
                                            transits?.state,
                                        )}] rounded-[13px] w-[40px] h-[40px] items-center justify-center  relative`,
                                    ),
                                    { elevation: 0, zIndex: -10000 },
                                ]}>
                                {getIcon(
                                    transits?.type || 'WALK',
                                    checkTaxiLeg(transits?.type) ? 20 : 24,
                                    getIconColor(transits?.type, transits?.state),
                                    transits?.state,
                                    transits?.transitMode,
                                )}
                            </Animated.View>
                        ) : (
                            <Shimmer width={40} height={40} borderRadius={13} />
                        )}
                        {!isLastLeg && (
                            <>
                                <Animated.View
                                    layout={LinearTransition}
                                    entering={FadeIn}
                                    exiting={FadeOut}
                                    style={tailwind.style(
                                        `w-2.5 ${
                                            isJourneyStatus
                                                ? transits?.isJourneyComplete
                                                    ? 'h-14'
                                                    : 'h-9'
                                                : currentStatus !== 'LIVE'
                                                  ? currentIndex === 0
                                                      ? 'h-12' //24
                                                      : 'h-8'
                                                  : currentIndex === 0
                                                    ? 'h-12'
                                                    : 'h-13 '
                                        } ${currentStatus === 'LIVE' ? liveStatusTrackColor : 'bg-[#E9E9E9]'} -z-[200] relative`,
                                    )}
                                />
                            </>
                        )}
                    </Animated.View>
                    <Animated.View
                        style={tailwind.style(
                            `flex-1 ml-5 ${isJourneyStatus ? (currentIndex >= 1 ? 'border-t border-[#F4F4F4]' : '') : currentIndex === 1 ? 'border-t border-[#F4F4F4]' : ''}`,
                        )}>
                        {!isLoading ? (
                            !isJourneyStatus ? (
                                <Text
                                    numberOfLines={2}
                                    style={tailwind.style(
                                        `pr-4 font-areaNormal-extrabold leading-[22px] text-[15px]  ${
                                            !isFirstLeg ? 'pt-6.5`' : ''
                                        } ${currentIndex === 0 ? 'text-[#3B3A3C]' : 'text-[#7E7E7E]'}`,
                                    )}
                                    accessibilityLabel={getTransitHeading(
                                        transits?.type || 'WALK',
                                        transits?.exitGate,
                                        transits?.state,
                                        transits?.distance || 0,
                                        transits?.place,
                                        transits?.vehicleDetail || '',
                                        transits?.NextLeg,
                                        transits?.transitMode,
                                        userLanguageStrings,
                                    )}>
                                    {getTransitHeading(
                                        transits?.type || 'WALK',
                                        transits?.exitGate,
                                        transits?.state,
                                        transits?.distance || 0,
                                        transits?.place,
                                        transits?.vehicleDetail || '',
                                        transits?.NextLeg,
                                        transits?.transitMode,
                                        userLanguageStrings,
                                    )}
                                </Text>
                            ) : (
                                getIsJourneyStatusHeading(
                                    transits?.type,
                                    transits?.distance || 0,
                                    transits?.toLocation,
                                    transits?.fromLocation,
                                    transits?.isJourneyComplete || false,
                                    transits?.vehicleDetail || 'NA',
                                    transits?.exitGate || 'NA',
                                    isFirstLeg,
                                    transits?.isShowUpdate,
                                    userLanguageStrings,
                                )
                            )
                        ) : (
                            <Shimmer
                                width={'100%'}
                                height={22}
                                borderRadius={7}
                                wrapperStyle={`mr-4 ${!isFirstLeg ? 'mt-6.5`' : ''}`}
                            />
                        )}
                        {currentStatus === 'LIVE' ? (
                            <>
                                {!isLoading ? (
                                    !isJourneyStatus ? (
                                        <Animated.View
                                            layout={LinearTransition}
                                            entering={FadeIn}
                                            exiting={FadeOut}
                                            style={tailwind.style(
                                                `text-[14px] w-full  text-[#969696] mt-1 font-areaNormal-extrabold  ${
                                                    isLastLeg ? 'pb-5' : ''
                                                }`,
                                            )}>
                                            {getTransitDesc(
                                                transits?.type || 'WALK',
                                                transits?.time,
                                                transits?.state,
                                                transits?.NoOfStops,
                                                switchToWalk,
                                                onCall,
                                                onBoost,
                                                onRetryBooking,
                                                onViewTimetable,
                                                onCheckIn,
                                                transits?.NextLeg,
                                                onSafety,
                                                transits?.scheduledArrivalTime,
                                                completeJourneyModalRef,
                                                userLanguageStrings,
                                            )}
                                        </Animated.View>
                                    ) : null
                                ) : (
                                    <Shimmer
                                        width={'100%'}
                                        height={14}
                                        borderRadius={7}
                                        wrapperStyle={`mt-1 ${isLastLeg ? 'mb-5' : ''}`}
                                    />
                                )}
                            </>
                        ) : currentIndex === 0 && !isLoading ? (
                            <>
                                {/* <Pressable
                                onPress={() => {
                                    if (transits?.type === 'NOTMOVING') {
                                        // onMuteJourney();
                                    } else {
                                        onMarkComplete && onMarkComplete();
                                    }
                                }}
                                style={tailwind.style(
                                    'bg-[#F4F4F4] h-[40px] rounded-[14px] flex items-center justify-center mt-4',
                                )}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] leading-[14px] font-areaNormal-extrabold text-[#016ACD]',
                                    )}>
                                    {transits?.type === 'NOTMOVING' ? 'Mute Journey' : 'Mark as Complete'}
                                </Animated.Text>
                            </Pressable> */}

                                {/* <Pressable
                                onPress={onPressOtherOptions}
                                style={tailwind.style(' rounded-[14px] flex items-center justify-center mt-5 ')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] leading-[14px] font-areaNormal-extrabold text-[#656565]',
                                    )}>
                                    Other Options
                                </Animated.Text>
                            </Pressable> */}
                            </>
                        ) : (
                            <Animated.View style={tailwind.style('pb-6')}></Animated.View>
                        )}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </View>
    );
};
