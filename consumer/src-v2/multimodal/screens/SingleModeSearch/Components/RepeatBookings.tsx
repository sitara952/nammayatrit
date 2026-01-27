import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { TransitArrowRight } from '@/src-v2/multimodal/components/svg/Arrows';
import RedArrow from '@/src-v2/multimodal/components/svg/RedArrow';
import { Icon } from '@/typescript/components/Icon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { RepeatBookingListItem } from '../Types';
import BusList from './BusList';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { getIconBGFromType } from '@/src-v2/multimodal/components/PublicTransportCard/PublicTransportCardUtils';
import { MetroIcon } from '@/src-v2/multimodal/components/svg/transport';
import { EventSuffix } from '@/typescript/utils/loggerEnums';
import { logPrefixSuffixEvent } from '@/typescript/utils/logger';

interface RepeatBookingsProps {
    bookingsList: RepeatBookingListItem[] | undefined;
    vehicleType: VehicleCategory_vehicleCategory;
    onRoutePress: (routeCode: string, sourceStopCode: string, destStopCode: string) => void;
    onBookingPress: (routeCode: string, sourceStopCode: string, destStopCode: string) => void;
    isLoading: boolean;
    scrollDirection: 'horizontal' | 'vertical';
    enableContentScroll: boolean;
    source: transportStation | undefined;
    isFallback: boolean;
}

const RepeatBookings = ({
    bookingsList,
    onRoutePress,
    onBookingPress,
    isLoading,
    vehicleType,
    scrollDirection,
    enableContentScroll,
    source,
    isFallback,
}: RepeatBookingsProps) => {
    const uniqueRoutes = useMemo(() => {
        return (
            bookingsList
                ?.map(item => ({
                    routeCode: item.routeCode,
                    routeNumber: item.routeShortName || '',
                    handleOnPress: () => onRoutePress(item.routeCode, item.fromStopCode, item.toStopCode),
                }))
                .filter(item => item.routeNumber !== '')
                .filter((item, index, self) => index === self.findIndex(t => t.routeNumber === item.routeNumber)) || []
        );
    }, [bookingsList]);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const headingText = isFallback
        ? 'Suggested Destinations'
        : vehicleType === 'METRO'
          ? `Bookings from ${source?.name} Metro Station`
          : userLanguageStrings.Repeatbookings;
    return (
        <Animated.View style={tailwind.style('pt-[14px] pb-45')}>
            <Animated.View style={tailwind.style('')}>
                {bookingsList && bookingsList.length > 0 ? (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[#838185] text-[14px] leading-[20px] font-areaNormal-extrabold pb-[14px] px-4 pl-5',
                        )}>
                        {headingText}
                    </Animated.Text>
                ) : null}
                {vehicleType === 'BUS' ? <BusList isLoading={isLoading} busList={uniqueRoutes} /> : null}
            </Animated.View>
            <ScrollView
                scrollEnabled={enableContentScroll}
                showsVerticalScrollIndicator={false}
                horizontal={scrollDirection === 'horizontal'}
                showsHorizontalScrollIndicator={false}
                style={tailwind.style('')}
                contentContainerStyle={tailwind.style('px-4 pt-0 gap-x-3 pb-2 gap-y-[14px]')}>
                {isLoading || !bookingsList
                    ? // Display shimmer placeholders when loading
                      [0, 1, 2, 3].map(index => <ShimmerBookingCard key={`shimmer-${index}`} />)
                    : // Display actual content when not loading
                      bookingsList
                          ?.filter(item => item.fromStopName && item.toStopName)
                          .map((item, index) => (
                              <RepeatBookingCard
                                  key={`${item.routeCode}-${index}`}
                                  stationText={item.fromStopName ?? ''}
                                  busStopText={item.toStopName ?? ''}
                                  price={item.price}
                                  mode={vehicleType}
                                  isFallback={isFallback}
                                  onPress={() => {
                                      logPrefixSuffixEvent(
                                          vehicleType,
                                          EventSuffix.REPEAT_BOOKING,
                                          item.fromStopName + '_' + item.toStopName + '_' + item.price,
                                      );
                                      onBookingPress(item.routeCode, item.fromStopCode, item.toStopCode);
                                  }}
                              />
                          ))}
            </ScrollView>
        </Animated.View>
    );
};

// Shimmer loading effect component for RepeatBookingCard without animation
const ShimmerBookingCard = () => {
    return (
        <View
            style={tailwind.style(
                'bg-white py-4 px-3 rounded-[18px] mt-2 border border-[#F0F1F4] flex-row justify-between items-center',
            )}>
            <View>
                <View style={tailwind.style('h-4 w-36 bg-gray-200 rounded opacity-40')} />
                <View style={tailwind.style('pl-2 flex-row items-center pt-[9px]')}>
                    <View style={tailwind.style('h-4 w-28 bg-gray-200 rounded ml-6 opacity-40')} />
                </View>
            </View>
            <View style={tailwind.style('flex-row items-end')}>
                <View style={tailwind.style('h-8 w-16 bg-gray-200 rounded opacity-40')} />
            </View>
        </View>
    );
};

export default RepeatBookings;

interface RepeatBookingCardProps {
    stationText: string;
    busStopText: string;
    price: number;
    onPress: () => void;
    mode: VehicleCategory_vehicleCategory;
    isFallback: boolean;
}

const RepeatBookingCard = ({ stationText, busStopText, price, onPress, mode, isFallback }: RepeatBookingCardProps) => {
    const [busStopLineCount, setBusStopLineCount] = useState<number>(0);
    const stopName =
        mode === 'METRO' && busStopText.includes(' Metro') ? busStopText.replace(' Metro', '') : busStopText;
    return mode === 'METRO' ? (
        <Pressable
            testID={`3504291b-0a52-482b-b5d1-78f82887c52a`}
            onPress={onPress}
            style={({ pressed }: { pressed: boolean }) => [
                tailwind.style(
                    'bg-white rounded-[18px] border border-[#F0F1F4] flex-row justify-between items-center p-[18px]',
                    pressed ? 'bg-[#f8f8f8]' : '',
                ),
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${stationText} to ${busStopText} at fare ${price} rupees button`}>
            <Animated.View style={tailwind.style(isFallback ? 'w-[188px] h-[40px]' : 'w-[210px] h-[40px]')}>
                <Animated.View style={tailwind.style('flex-row items-center h-full')}>
                    <Animated.View
                        style={tailwind.style(
                            `mr-3 w-[25.94px] h-[24.9px] justify-center items-center rounded-2 p-1 bg-[${getIconBGFromType('metro')}]`,
                        )}>
                        <MetroIcon fill="#1F2D3D" />
                    </Animated.View>
                    <Animated.View style={tailwind.style('flex-1 mr-6')}>
                        <Animated.Text
                            numberOfLines={2}
                            onTextLayout={e => setBusStopLineCount(e.nativeEvent.lines.length)}
                            style={tailwind.style(
                                'text-[14px] leading-[19px] tracking-[0.2px] font-areaNormal-extrabold text-[#3B3A3C]',
                            )}>
                            {stopName}
                        </Animated.Text>
                        {busStopLineCount === 1 ? (
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] leading-[19px] tracking-[0.2px] font-areaNormal-extrabold text-[#3B3A3C]',
                                )}>
                                Metro Station
                            </Animated.Text>
                        ) : null}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
            {!isFallback ? (
                <Animated.View style={tailwind.style('flex-row items-center')}>
                    {price && price > 0 ? (
                        <Animated.Text
                            style={tailwind.style(
                                'text-[16px] leading-[20px] tracking-[0.2px] font-areaNormal-extrabold text-[#3B3A3C]',
                            )}>
                            ₹ {price}
                        </Animated.Text>
                    ) : (
                        <Icon icon={<RedArrow />} color="#0667EF" />
                    )}
                </Animated.View>
            ) : null}
        </Pressable>
    ) : (
        <Pressable
            testID={`3504291b-0a52-482b-b5d1-78f82887c52b`}
            onPress={onPress}
            style={({ pressed }: { pressed: boolean }) => [
                tailwind.style(
                    'bg-white rounded-[18px] border border-[#F0F1F4] flex-row justify-between items-center p-[18px]',
                    pressed ? 'bg-[#f8f8f8]' : '',
                ),
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${stationText} to ${busStopText} at fare ${price} rupees button`}>
            <Animated.View>
                <Animated.View style={tailwind.style(`w-[${SCREEN_WIDTH - 150}px]`)}>
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style('text-[14px] leading-[17px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                        {stationText}
                    </Animated.Text>
                </Animated.View>
                <Animated.View style={tailwind.style('flex-row items-center mt-[18px]', `w-[${SCREEN_WIDTH - 150}px]`)}>
                    <Icon icon={<TransitArrowRight />} size={12} color="#838185" />
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'text-[14px] leading-[17px] font-areaNormal-extrabold pl-1 text-[#3B3A3C]',
                        )}>
                        {busStopText}
                    </Animated.Text>
                </Animated.View>
            </Animated.View>
            <Animated.View style={tailwind.style('flex-row items-center')}>
                <Icon icon={<RedArrow />} color="#0667EF" />
            </Animated.View>
        </Pressable>
    );
};
