import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors as color } from 'config-types/src/domain/default/themes/colors';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { Pressable } from '@/src-v2/primitives/Pressable';

type BusItemProps = {
    busNumber: string;
    timeInMins: string;
    onTrackPress: (busNumber: string) => void;
};

type NextBusesListProps = {
    busList: BusItemProps[];
};

const NextBusesList: React.FC<NextBusesListProps> = ({ busList = [] }) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style(`rounded-[16px]  border border-[${colors.CrossButton_bg}] px-[18px]`)}>
            {busList.map((bus, index) => (
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut.duration(100)}
                    style={tailwind.style(
                        `h-[50px] flex-row items-center justify-between`,
                        index === busList.length - 1 ? 'border-b-0' : 'border-b border-[#F4F4F4]',
                    )}>
                    <Animated.View style={tailwind.style('flex-row items-center')}>
                        <Animated.Text style={tailwind.style('text-[16px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                            {bus.busNumber}
                        </Animated.Text>
                        <Animated.View style={tailwind.style('h-[18px] ml-[15px] mr-[12px] w-[1px] bg-[#D9D9D9]')} />
                        <Animated.Text style={tailwind.style('text-[16px] font-areaNormal-extrabold text-[#09941E]')}>
                            {bus.timeInMins}
                        </Animated.Text>
                    </Animated.View>

                    <Pressable
                        accessibilityLabel="Track bus button"
                        testID={`track-bus-button-${index}`}
                        accessibilityRole="button"
                        onPress={() => bus.onTrackPress(bus.busNumber)}
                        {...handlers}>
                        <Animated.View style={[tailwind.style('flex-row items-center gap-[8px]'), animatedStyle]}>
                            <Animated.Text
                                style={tailwind.style(
                                    `text-[14px] leading-[15px] font-areaNormal-extrabold text-[${color.blue200}]`,
                                )}>
                                {userLanguageStrings.Track}
                            </Animated.Text>
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            ))}
        </Animated.View>
    );
};

export default NextBusesList;
