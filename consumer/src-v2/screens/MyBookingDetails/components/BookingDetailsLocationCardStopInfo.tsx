import { convertTimestamp } from '../../MyRides/UI';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { View } from 'react-native';

import { formatLocation } from '../utils';
import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
export type BookingDetailLocationCardStopInfoProps = {
    stop: locationAPIEntity | undefined;
    stopTime: string | undefined;
};

export const BookingDetailLocationCardStopInfo: React.FC<BookingDetailLocationCardStopInfoProps> = ({
    stop,
    stopTime,
}) => {
    const { date, time } = convertTimestamp(stopTime);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    return (
        <View style={tailwind.style('flex-col gap-1')}>
            {time && date && (
                <Typography
                    type="body-7"
                    style={{ color: themeColors.Text_neutralMax, fontSize: 12 }}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={undefined}
                    accessibilityRole={undefined}
                    accessibilityLabel={undefined}>
                    {time} • {date}
                </Typography>
            )}
            <View style={tailwind.style('w-11.2/12')}>
                <Typography
                    type="body-7"
                    style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                    numberOfLines={3}
                    isAnimate={false}
                    accessible={undefined}
                    accessibilityRole={undefined}
                    accessibilityLabel={undefined}>
                    {stop ? formatLocation(stop) : '...'}
                </Typography>
            </View>
        </View>
    );
};
