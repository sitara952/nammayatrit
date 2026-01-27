import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';
import mtIcSilverTicketV2 from '../../../../assets/mt_ic_prebooked_diamond_pass.webp';
import mtIcGoldenTicketV2 from '../../../../assets/mt_ic_prebooked_gold_pass.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

export const PreBookedPassCard = ({
    activeFrom,
    isGoldenPass = false,
    handleOnPress,
}: {
    activeFrom: Date;
    isGoldenPass: boolean;
    handleOnPress: () => void;
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManger = useConfigContext();
    const userLanguageStrings = configManger.get('userLanguageStrings');

    return (
        <Pressable
            testID="prebooked_pass_card_button"
            accessibilityRole="button"
            accessibilityLabel="Prebooked Pass Card"
            onPress={handleOnPress}
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style(
                        'h-[68px] rounded-[20px] px-4 flex-row items-center justify-between',
                        `w-[${SCREEN_WIDTH - 40}px] bg-[#313131] mx-5`,
                    ),
                    animatedStyle,
                ]}>
                <Animated.View style={tailwind.style('flex-row items-center')}>
                    {!isGoldenPass && (
                        <Animated.Image
                            resizeMode="contain"
                            style={[tailwind.style('w-[52px] h-[57px] rounded-[8px]')]}
                            source={mtIcSilverTicketV2}
                        />
                    )}
                    {isGoldenPass && (
                        <Animated.Image
                            resizeMode="contain"
                            style={[tailwind.style('w-[52px] h-[57px] rounded-[8px]')]}
                            source={mtIcGoldenTicketV2}
                        />
                    )}
                    <Animated.View style={tailwind.style('ml-3')}>
                        <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-white')}>
                            {userLanguageStrings.UpcomingPass}
                        </Animated.Text>
                        <Animated.Text
                            style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#09941E] pt-1')}>
                            {userLanguageStrings.ActiveFromDate(formatDate(activeFrom) ?? '')}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
                <Animated.View
                    style={tailwind.style('h-[34px] w-[57px] rounded-[10px] bg-[#3B3A3C] items-center justify-center')}>
                    <Animated.Text
                        style={tailwind.style('text-[13px] font-areaNormal-extrabold text-white leading-[20px]')}>
                        {userLanguageStrings.View}
                    </Animated.Text>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};
