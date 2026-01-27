import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { View } from 'react-native';

import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Animated from 'react-native-reanimated';
import { useCallback } from 'react';
import { BookingDetailLocationCardStopInfo } from './BookingDetailsLocationCardStopInfo';
import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { convertTimestamp } from '../../MyRides/UI';
import InputGroupDirection from '@/typescript/assets/svg/direction/InputGroupDirection';
import { stopInformation } from '@/readOnly/api/types/StopInformation.gen';

type BookingDetailLocationCardProps = {
    source: locationAPIEntity | undefined;
    stops: locationAPIEntity[];
    rideStartTime: string | undefined;
    rideEndTime: string | undefined;
    showTitle: boolean | undefined;
    stopsInfo: stopInformation[] | undefined;
};
export const BookingDetailLocationCard: React.FC<BookingDetailLocationCardProps> = ({
    stops,
    source,
    rideEndTime,
    rideStartTime,
    showTitle = true,
    stopsInfo,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { date, time: startTime } = convertTimestamp(rideStartTime);
    const { time: endTime } = convertTimestamp(rideEndTime);
    const sourceName = source?.area || '';
    const destination = stops.at(stops.length - 1);
    const destinationName = destination?.area || '';
    const themeColors = configManager.get('themeColors');

    const newRideEndTime = useCallback(
        (index: number) => {
            if (index !== stops.length - 1) {
                const sortedStops = [...(stopsInfo || [])].sort((a, b) => a.stopOrder - b.stopOrder);
                return sortedStops[index]?.waitingTimeStart;
            }
            return rideEndTime;
        },
        [stops.length, stopsInfo, rideEndTime],
    );
    return (
        <Animated.View
            style={tailwind.style('flex-col gap-5')}
            accessible={true}
            accessibilityLabel={`Booking Locations. Journey on ${date}, which started at ${startTime} and completed at ${endTime} from ${sourceName.toLowerCase()} to ${destinationName.toLowerCase()}.`}>
            {showTitle && (
                <Typography
                    type="body-7"
                    style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={undefined}
                    accessibilityRole={undefined}
                    accessibilityLabel={undefined}>
                    {userLanguageStrings.BookingLocations}
                </Typography>
            )}
            <View style={tailwind.style('flex-row gap-2')}>
                <InputGroupDirection numStops={stops.length - 1} heightMap={[90, 153, 233, 300]} isMultimodal={false} />
                <View style={tailwind.style('flex-col gap-6')}>
                    <BookingDetailLocationCardStopInfo stop={source} stopTime={rideStartTime} />
                    {stops.map((stop, index) => (
                        <BookingDetailLocationCardStopInfo key={index} stop={stop} stopTime={newRideEndTime(index)} />
                    ))}
                </View>
            </View>
        </Animated.View>
    );
};
