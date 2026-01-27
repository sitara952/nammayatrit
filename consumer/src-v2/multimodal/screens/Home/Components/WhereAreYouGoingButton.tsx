import ArrowRight from '@/typescript/assets/svg/symbols/ArrowRight';
import { Icon } from '@/typescript/components/Icon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import LinearGradient from 'react-native-linear-gradient';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useCallback } from 'react';

export const WhereAreYouGoingButton = ({ onPress }: { onPress: () => void }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const onPressHandler = useCallback(() => {
        onPress();
    }, [onPress]);
    return (
        <Pressable
            testID={`plan_journey_button`}
            onPress={onPressHandler}
            style={({ pressed }) => [
                tailwind.style(
                    'px-4 py-[16px] border border-[#F1F2F2] rounded-[22px] mt-2 flex-row items-center justify-between bg-[#CA102F] ',
                    `w-full overflow-hidden`,
                    pressed && 'bg-gray-50',
                ),
            ]}
            accessibilityLabel="Plan your journey, Where are you going? button"
            accessibilityRole="button">
            <LinearGradient
                colors={['#E21AE3', '#EF062B', '#EF062B', '#EF062B', '#FC2308', '#F7483F', '#FF5A11']}
                style={tailwind.style('absolute inset-0')}
                start={{ x: 0, y: 2 }}
                end={{ x: 1, y: 2 }}
                useAngle={true}
                angle={10}
                angleCenter={{ x: 0.5, y: 0.5 }}
            />
            <Animated.View>
                <Animated.View style={tailwind.style('flex-row items-center gap-1')}>
                    <Icon
                        accessible={false}
                        icon={<ArrowRight fill={undefined} bold={undefined} />}
                        size={16}
                        color="#FDC8C6"
                    />
                    <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-bold text-white')}>
                        {userLanguageStrings.Planyourjourney}
                    </Animated.Text>
                </Animated.View>
                <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style('text-base font-areaNormal-extrabold  text-white pt-3 leading-[22px]')}>
                    {userLanguageStrings.Whereareyougoing_QuestionMark}
                </Animated.Text>
            </Animated.View>
            <Animated.View accessible={false} style={tailwind.style('flex-row items-center gap-2')}>
                {/* <Icon icon={<VoiceIcon />} size={18} color={'#ffffff'} /> */}
            </Animated.View>
        </Pressable>
    );
};
