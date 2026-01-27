import { ChevronDown, ChevronUp } from '@/src-v2/assets/svg/ChevronArrows';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import React, { useState } from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SourceType_sourceType } from '@/readOnly/api/types/Enums.gen';

interface BusItemProps {
    busNumber: string;
    timeInMins: string;
    onSwitchPress: (busNumber: string) => void;
    isLastItem: boolean;
    isFirstItem?: boolean;
    source: SourceType_sourceType;
    serviceTier: string | undefined;
}

const BusItem: React.FC<BusItemProps> = ({ busNumber, timeInMins, onSwitchPress, isLastItem, source }) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            entering={FadeIn.delay(100).springify().damping(30).stiffness(200)}
            exiting={FadeOut.duration(100)}
            style={tailwind.style(
                'h-[50px] mx-[10px] flex-row items-center',
                !isLastItem ? 'border-b border-[#F4F4F4]' : '',
            )}>
            <Animated.View style={tailwind.style('flex-row items-center flex-1')}>
                {source === 'LIVE' && (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut.duration(100)}
                        style={tailwind.style('h-[8px] w-[8px] bg-[#09941E] rounded-full mr-2')}
                    />
                )}
                <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style(
                        'text-[16px] font-areaNormal-extrabold text-[#3B3A3C] min-w-10 max-w-[55px] flex-0.1 ',
                    )}>
                    {busNumber}
                </Animated.Text>
                {/* {!isUndefined(serviceTier) && (
                    <>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[16px] font-areaNormal-extrabold text-[#7e7e7e] min-w-10 capitalize flex-1.3',
                            )}>
                            {' '}
                            {getTransitMetaInfoLabel(serviceTier, userLanguageStrings)}
                        </Animated.Text>
                    </>
                )} */}
                <Animated.View style={tailwind.style('h-[18px] ml-[10px] mr-[12px] w-[1px] bg-[#D9D9D9]')} />
                <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style(
                        `text-[16px] font-areaNormal-extrabold text-[#${source === 'LIVE' ? '09941E' : '7e7e7e'}] flex-0.85`,
                    )}>
                    {timeInMins}
                </Animated.Text>
            </Animated.View>

            <Pressable
                accessibilityLabel={source === 'GTFS' ? 'Switch' : 'Track' + ' button'}
                testID="switch-bus-button"
                onPress={() => onSwitchPress(busNumber)}
                accessibilityRole="button"
                {...handlers}>
                <Animated.View style={[tailwind.style('flex-row items-center gap-[8px]'), animatedStyle]}>
                    <Animated.Text
                        style={tailwind.style('text-[14px] leading-[17px] font-areaNormal-extrabold text-[#016ACD]')}>
                        {source === 'GTFS' ? userLanguageStrings.Switch : userLanguageStrings.Track}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export interface NextBusesListProps {
    nextBusesList: {
        busNumber: string;
        timeInMins: string;
        handleOnSwitch: () => void;
        routeCode: string;
        source: SourceType_sourceType;
        serviceTierName: string | undefined;
    }[];
    durationInMins: number | null;
}
export const NextBusesListSection = ({ nextBusesList, durationInMins }: NextBusesListProps) => {
    const [showAllBuses, setShowAllBuses] = useState(false);
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    // Always show the next 5 buses in the list
    // If want to show more buses, we need to change the wrapper to be BottomSheetScrollView, for Full scroll.
    // If we want just the list to be scrolling, just change the wrapped Animated.View to Animated.ScrollView and set height of 230px
    // Add a fade in/out gradients absolute positioned inside to give a feel that is scrolling section
    const displayedBuses = showAllBuses ? nextBusesList : nextBusesList.slice(0, 2);
    return (
        <Animated.View layout={LinearTransition.springify().damping(30).stiffness(200)} style={tailwind.style(' mx-5')}>
            {durationInMins !== null && (
                <Animated.Text
                    style={tailwind.style(
                        'text-[14px] font-areaNormal-extrabold text-[#7E7E7E] pt-[14px] leading-[24px]',
                    )}>
                    {userLanguageStrings.BusesInNextMins(durationInMins)}
                </Animated.Text>
            )}
            <Animated.View
                layout={LinearTransition.springify().damping(30).stiffness(200)}
                style={tailwind.style(`border border-[${colors.CrossButton_bg}] rounded-[16px] mt-[16px]`)}>
                {displayedBuses.map((bus, index) => (
                    <BusItem
                        key={bus.routeCode}
                        busNumber={bus.busNumber}
                        timeInMins={bus.timeInMins}
                        onSwitchPress={bus.handleOnSwitch}
                        isLastItem={index === displayedBuses.length - 1}
                        isFirstItem={index === 0}
                        source={bus.source}
                        serviceTier={bus.serviceTierName}
                    />
                ))}
            </Animated.View>
            {nextBusesList.length > 2 && (
                <Pressable
                    accessibilityLabel={
                        showAllBuses ? 'View less button' : `Check ${nextBusesList.length - 2} more buses button`
                    }
                    accessibilityRole="button"
                    testID="toggle-buses-button"
                    onPress={() => {
                        setShowAllBuses(!showAllBuses);
                        // liveJourneyUserWillMissBusStatusModalRef.current?.snapToIndex(!showAllBuses ? 1 : 0);
                    }}
                    style={tailwind.style('mt-[26px]')}>
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={tailwind.style('flex-row items-center justify-center gap-[8px]')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#016ACD]',
                            )}>
                            {showAllBuses
                                ? userLanguageStrings.ViewLess
                                : userLanguageStrings.CheckMoreBuses(nextBusesList.length - 2)}
                        </Animated.Text>
                        <Icon icon={showAllBuses ? <ChevronUp /> : <ChevronDown />} color="#016ACD" size={11} />
                    </Animated.View>
                </Pressable>
            )}
        </Animated.View>
    );
};
