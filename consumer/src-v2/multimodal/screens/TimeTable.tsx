import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface TimeTableItem {
    id: number;
    time: string;
}

interface TimeTableContainerProps {
    times: TimeTableItem[];
    firstTime: string;
    lastTime: string;
    maxContainerHeight: number;
    backgroundColor: string;
}

export const TimeTableContainer: React.FC<TimeTableContainerProps> = ({
    times,
    firstTime,
    lastTime,
    maxContainerHeight,
    backgroundColor,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const renderTimetableItem = ({ item, index }: { item: TimeTableItem; index: number }) => {
        return (
            <View
                style={tailwind.style(
                    'flex-row justify-between items-center min-h-[62px] border-b border-[#E6E6E6]',
                    index === times.length - 1 ? 'border-b-0' : '',
                )}>
                <Text
                    style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#313131]')}
                    accessibilityLabel={`Scheduled bus time at ${item.time}.`}>
                    {item.time}
                </Text>
                <Animated.View>
                    <Badge time={undefined} />
                </Animated.View>
            </View>
        );
    };
    return (
        <View
            style={tailwind.style(
                'mx-5 bg-[#F4F4F4] mt-4 overflow-hidden rounded-[20px]',
                `max-h-[${maxContainerHeight}px] `,
            )}>
            <Animated.View style={tailwind.style('bg-[#E6E6E6] rounded-t-[20px]')}>
                <Text
                    style={tailwind.style(
                        'text-[12px] font-areaNormal-extrabold text-[#3B3A3C] w-full h-11 pt-4 pl-5',
                    )}>
                    {userLanguageStrings.ScheduledFromTill(firstTime, lastTime)}
                </Text>
            </Animated.View>

            {/* Timetable Container */}
            <FlatList
                data={times}
                renderItem={renderTimetableItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={tailwind.style('px-5')}
                style={tailwind.style(`bg-[${backgroundColor}]`)}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const Badge = ({ time }: { time: string | undefined }) => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return time ? (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            accessibilityLabel={`Bus comes every ${time} minutes`}
            style={tailwind.style(
                `bg-[#F4F4F4] rounded-[10px] border-[1px] border-[${colors.CrossButton_bg}] px-3 min-h-[30px] justify-center items-center`,
            )}>
            <Text
                style={tailwind.style(
                    'text-[12px] font-areaNormal-extrabold text-[#097B42]',
                )}>{`${userLanguageStrings.Every} ${time} ${userLanguageStrings.Min}`}</Text>
        </Animated.View>
    ) : null;
};

const VehicleTimeTable: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { top } = useSafeAreaInsets();
    const handleOnPress = () => {
        navigation.goBack();
    };

    // const renderHeader = () => (
    //     <View
    //         style={tailwind.style('pt-4 px-6 flex-row items-center justify-between relative')}
    //         accessibilityLabel={`Timetable for bus ${busId}, arriving at ${busStopName} Bus Station`}>
    //         <View style={tailwind.style('flex-col gap-1.5')}>
    //             <Text
    //                 style={tailwind.style('text-[22px] font-areaNormal-extrabold text-[#313131]')}
    //                 accessibilityLabel={`Bus number ${busId}`}>
    //                 {busId}
    //             </Text>
    //             <Text
    //                 numberOfLines={1}
    //                 style={tailwind.style(
    //                     'text-[12px] font-areaNormal-extrabold text-[#7E7E7E]',
    //                     `max-w-[${SCREEN_WIDTH - 90}px]`,
    //                 )}
    //                 accessibilityLabel={`Arriving at ${busStopName} Bus Station`}>
    //                 Arriving at {busStopName} Bus Station
    //             </Text>
    //         </View>
    //         <Pressable
    //             testID={'close-time-table'}
    //             accessibilityRole="button"
    //             accessibilityLabel="Close timetable screen"
    //             style={tailwind.style('w-9 h-9 rounded-full bg-[#E6E6E6] justify-center items-center')}
    //             onPress={handleOnPress}>
    //             <CrossIcon />
    //         </Pressable>
    //     </View>
    // );

    // // Get first and last time for the schedule text
    // const firstTime = times[0]?.time || '';
    // const lastTime = times[times.length - 1]?.time || '';
    // const MAX_CONTAINER_HEIGHT = SCREEN_HEIGHT - top - bottom - 68 - (Platform.OS === 'android' ? 70 : 20);
    return (
        <HardwareBackpressHandler
            onHardwareBackPress={() => {
                handleOnPress();
            }}>
            <Animated.View style={tailwind.style('flex-1 bg-[#F4F4F4]', `pt-[${top}px]`)}></Animated.View>
        </HardwareBackpressHandler>
    );
};

export default VehicleTimeTable;
