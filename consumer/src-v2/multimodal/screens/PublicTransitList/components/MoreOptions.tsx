import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';
import { BusIcon, MetroIcon, TrainIcon } from '@/src-v2/multimodal/components/svg/transport';
import TransitOption, { SubOption } from '@/src-v2/multimodal/components/TransitOption';
import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface MoreOptionsProps {
    busEnabled: boolean;
    setBusEnabled: (enabled: boolean) => void;
    metroEnabled: boolean;
    setMetroEnabled: (enabled: boolean) => void;
    trainEnabled: boolean;
    setTrainEnabled: (enabled: boolean) => void;
    lastMileEnabled: boolean;
    setLastMileEnabled: (enabled: boolean) => void;
    busSubOptions: SubOption[];
    metroSubOptions: SubOption[];
    trainSubOptions: SubOption[];
    lastMileSubOptions: SubOption[];
    onConfirmPress: () => void;
}

const MoreOptions: React.FC<MoreOptionsProps> = ({
    busEnabled,
    setBusEnabled,
    metroEnabled,
    setMetroEnabled,
    trainEnabled,
    setTrainEnabled,
    lastMileEnabled,
    setLastMileEnabled,
    busSubOptions,
    metroSubOptions,
    trainSubOptions,
    lastMileSubOptions,
    onConfirmPress,
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const colors = configManager.get('themeColors');

    return (
        <Animated.View>
            <Animated.Text
                style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#969696] pt-[18px] text-center')}>
                {userLanguageStrings.ChooseMode}
            </Animated.Text>

            <Animated.View style={tailwind.style('px-[24px] pt-[4px]')}>
                <TransitOption
                    icon={<BusIcon />}
                    iconBgColor="#FFE898"
                    title={userLanguageStrings.BusTransit}
                    subtitle={userLanguageStrings.Frequentlyavailable}
                    isEnabled={busEnabled}
                    onToggle={setBusEnabled}
                    subOptions={busSubOptions}
                />

                <TransitOption
                    icon={<MetroIcon />}
                    iconBgColor="#CCE6F6"
                    title={userLanguageStrings.MetroTransit}
                    subtitle={userLanguageStrings.LessFrequentlyavailable}
                    isEnabled={metroEnabled}
                    onToggle={setMetroEnabled}
                    subOptions={metroSubOptions}
                />
                <TransitOption
                    icon={<TrainIcon />}
                    iconBgColor="#C6E4B7"
                    title={userLanguageStrings.LocalTrain}
                    subtitle={userLanguageStrings.LessFrequentlyavailable}
                    isEnabled={trainEnabled}
                    onToggle={setTrainEnabled}
                    subOptions={trainSubOptions}
                />
                <TransitOption
                    icon={<MetroIcon />}
                    iconBgColor="#CCE6F6"
                    title={userLanguageStrings.LastMileConnection}
                    subtitle={userLanguageStrings.Frequentlyavailable}
                    isEnabled={lastMileEnabled}
                    onToggle={setLastMileEnabled}
                    subOptions={lastMileSubOptions}
                    showIcon={false}
                />

                <Pressable
                    testID="more-options-confirm-button"
                    onPress={onConfirmPress}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm button"
                    {...handlers}>
                    <Animated.View
                        style={[
                            tailwind.style(`bg-[${colors.Confirm_button_bg}] py-[20px] rounded-[16px]`),
                            animatedStyle,
                        ]}>
                        <Animated.Text
                            style={[
                                tailwind.style(
                                    `text-[16px] font-areaNormal-extrabold text-[${colors.Confirm_button_text}] text-center leading-[19px]`,
                                ),
                            ]}>
                            {userLanguageStrings.Confirm}
                        </Animated.Text>
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
};

export default MoreOptions;
