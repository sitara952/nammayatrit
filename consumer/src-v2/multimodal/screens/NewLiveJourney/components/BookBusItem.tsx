import DoubleChevronRight from '@/src-v2/assets/svg/DoubleChevronRight';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import React from 'react';
import { ScrollView, TapGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { getIconFromType } from '../utils/getTransitIconUtils';
import { isUndefined } from 'lodash';
import { SourceType_sourceType } from '@/readOnly/api/types/Enums.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectAppConfig } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
interface ArrivalTime {
    time: string;
    isLate: boolean;
}

interface BookBusItemProps {
    arrivalTimes: ArrivalTime[];
    busNumber: string;
    busType: string | undefined;
    onBookBus: () => void;
    isSelected?: boolean;
    onPress?: () => void;
    allowSwitch: boolean;
    source: SourceType_sourceType;
}

const BookBusItem: React.FC<BookBusItemProps> = ({
    arrivalTimes = [],
    busNumber = 'NA',
    busType,
    onBookBus = () => {},
    isSelected = false,
    onPress,
    allowSwitch,
    source,
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appSystemConfig = useAppSelector(selectAppConfig);
    const containerContent = (
        <Animated.View
            style={tailwind.style(
                'py-[14px] px-[16px] rounded-[20px] bg-white',
                isSelected && 'border-2 border-[#016ACD]',
            )}>
            <Animated.View
                style={tailwind.style(
                    'flex-row items-center justify-between gap-[8px]',
                    !appSystemConfig?.uiConfig.hideNextAvailableBusesInfo ? 'pb-[12px] border-b border-[#F4F4F4]' : '',
                )}>
                <Animated.View style={tailwind.style('flex-row items-center gap-[8px]')}>
                    <Animated.View
                        style={tailwind.style(
                            'bg-[#FFE58D] w-[24px] h-[24px] rounded-[8px] flex items-center justify-center',
                        )}>
                        <Animated.View>{getIconFromType('Bus', 14, '#470F2D', false)}</Animated.View>
                    </Animated.View>
                    <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                        {busNumber}
                    </Animated.Text>
                    <Animated.View style={tailwind.style('w-[2px] h-[22px] bg-[#F4F4F4] rounded-[8px]')} />
                    {!isUndefined(busType) && (
                        <Animated.Text
                            style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#7E7E7E] capitalize')}>
                            {busType?.replace(/_/g, ' ').toUpperCase()}
                        </Animated.Text>
                    )}
                </Animated.View>
                {allowSwitch && (
                    <Pressable
                        testID="book-bus-button"
                        onPress={onBookBus}
                        accessibilityLabel="Book button"
                        accessibilityRole="button"
                        {...handlers}>
                        <Animated.View style={[tailwind.style('flex-row items-center gap-[4px]'), animatedStyle]}>
                            <Animated.Text
                                style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#016ACD]')}>
                                {userLanguageStrings.Book}
                            </Animated.Text>
                            <Icon icon={<DoubleChevronRight fill="#016ACD" />} size={14} color="#016ACD" />
                        </Animated.View>
                    </Pressable>
                )}
            </Animated.View>

            {!appSystemConfig?.uiConfig.hideNextAvailableBusesInfo && (
                <Animated.View style={tailwind.style('pt-[12px] flex-row items-center')}>
                    <Animated.Text style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#7E7E7E]')}>
                        {source === 'GTFS' ? userLanguageStrings.Scheduled_in : userLanguageStrings.ArrivesIn}
                    </Animated.Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={tailwind.style('flex-1')}
                        contentContainerStyle={tailwind.style('flex-row gap-[8px] pl-[8px]')}>
                        {arrivalTimes.map((arrival, index) => (
                            <Animated.View
                                key={index}
                                style={tailwind.style(
                                    'h-[25px] flex-row items-center rounded-[8px] border border-[#ECEDEF] px-[8px]',
                                )}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[13px] font-areaNormal-extrabold',
                                        arrival.isLate ? 'text-[#FF7301]' : 'text-[#097B42]',
                                    )}>
                                    {arrival.time}
                                </Animated.Text>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </Animated.View>
            )}
        </Animated.View>
    );

    return onPress ? <TapGestureHandler onActivated={onPress}>{containerContent}</TapGestureHandler> : containerContent;
};

export default BookBusItem;
