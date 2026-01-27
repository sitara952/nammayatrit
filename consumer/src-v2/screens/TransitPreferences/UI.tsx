import React from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';
import { BusIcon, MetroIcon, TrainIcon } from '@/src-v2/multimodal/components/svg/transport';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { TransitPreferencesState, BUS_TIERS, SUBWAY_TIERS } from './Types';
import {
    FRFSServiceTierType_fRFSServiceTierType,
    MultimodalTravelMode_multimodalTravelMode,
} from '@/readOnly/api/types/Enums.gen';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import LeftArrow from '@/typescript/assets/svg/direction/LeftArrow';
import { View } from 'react-native';
import TransitOptionComponent from '@/src-v2/multimodal/components/TransitOption';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';

interface TransitPreferencesProps {
    preferences: TransitPreferencesState;
    onToggleMode: (mode: MultimodalTravelMode_multimodalTravelMode) => void;
    onToggleTier: (mode: 'bus' | 'subway', tier: FRFSServiceTierType_fRFSServiceTierType) => void;
    onConfirm: () => void;
    isLoading?: boolean;
    backpress: () => void;
}

const TransitPreferencesUI: React.FC<TransitPreferencesProps> = ({
    preferences,
    onToggleMode,
    onToggleTier,
    onConfirm,
    isLoading = false,
    backpress,
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <HardwareBackpressHandler onHardwareBackPress={backpress}>
            <Animated.View style={[tailwind.style('bg-white h-full'), { paddingTop: top }]}>
                <Animated.View>
                    <Animated.View style={tailwind.style('flex-row px-[24px] pt-[4px]')}>
                        <View style={tailwind.style('flex-row justify-between')}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Go Back button"
                                testID="cfad3da4-6612-43ae-b97c-b729757f97e5"
                                onPress={backpress}>
                                <LeftArrow />
                            </Pressable>
                        </View>
                        <Typography
                            type="subhead-700"
                            style={[
                                tailwind.style('ml-[16px]', 'pt-[4px]', 'bg-transparent', 'text-[20px]'),
                                { color: themeColors.Text_neutralHigh },
                            ]}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Transit Preferences"
                            accessibilityRole={undefined}>
                            {userLanguageStrings.TransitPreferences}
                        </Typography>
                    </Animated.View>

                    <Animated.View style={tailwind.style('px-[24px] pt-[4px]')}>
                        <TransitOptionComponent
                            icon={<BusIcon />}
                            iconBgColor="#FFE898"
                            title={userLanguageStrings.BusTransit}
                            subtitle={userLanguageStrings.Frequentlyavailable}
                            isEnabled={preferences.allowedTransitModes.includes('Bus')}
                            onToggle={() => onToggleMode('Bus')}
                            subOptions={BUS_TIERS.map(tier => ({
                                name: tier.name,
                                isSelected: preferences.busTransitTypes.includes(tier.value),
                                onPress: () => onToggleTier('bus', tier.value),
                                isDisabled: !preferences.allowedTransitModes.includes('Bus'),
                            }))}
                        />

                        <TransitOptionComponent
                            icon={<MetroIcon />}
                            iconBgColor="#CCE6F6"
                            title={userLanguageStrings.MetroTransit}
                            subtitle={userLanguageStrings.LessFrequentlyavailable}
                            isEnabled={preferences.allowedTransitModes.includes('Metro')}
                            onToggle={() => onToggleMode('Metro')}
                            subOptions={[]}
                        />

                        <TransitOptionComponent
                            icon={<TrainIcon />}
                            iconBgColor="#C6E4B7"
                            title={userLanguageStrings.LocalTrain}
                            subtitle={userLanguageStrings.LessFrequentlyavailable}
                            isEnabled={preferences.allowedTransitModes.includes('Subway')}
                            onToggle={() => onToggleMode('Subway')}
                            subOptions={SUBWAY_TIERS.map(tier => ({
                                name: tier.name,
                                isSelected: preferences.subwayTransitTypes.includes(tier.value),
                                onPress: () => onToggleTier('subway', tier.value),
                                isDisabled: !preferences.allowedTransitModes.includes('Subway'),
                            }))}
                        />

                        <TransitOptionComponent
                            icon={<MetroIcon />}
                            iconBgColor="#CCE6F6"
                            title={userLanguageStrings.LastMileConnection}
                            subtitle={userLanguageStrings.Frequentlyavailable}
                            isEnabled={preferences.allowedTransitModes.includes('Taxi')}
                            onToggle={() => onToggleMode('Taxi')}
                            subOptions={[]}
                            showIcon={false}
                        />
                    </Animated.View>
                </Animated.View>
                <Animated.View style={tailwind.style(`absolute bottom-[${bottom}px] left-0 right-0`)}>
                    <Pressable
                        testID="save-preferences-button"
                        accessibilityRole="button"
                        accessibilityLabel="Save preferences"
                        onPress={onConfirm}
                        disabled={isLoading}
                        {...handlers}>
                        <Animated.View
                            style={[
                                tailwind.style(
                                    `bg-[${themeColors.Confirm_button_bg}] py-[20px] rounded-[16px] mx-[24px]`,
                                ),
                                isLoading && tailwind.style('opacity-50'),
                                animatedStyle,
                            ]}>
                            <Typography
                                type="subhead-700"
                                style={[
                                    tailwind.style('bg-transparent', 'text-center', 'text-[16px]'),
                                    { color: themeColors.Confirm_button_text },
                                ]}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel={isLoading ? 'Saving...' : 'Confirm'}
                                accessibilityRole={undefined}>
                                {isLoading ? userLanguageStrings.Saving + '...' : userLanguageStrings.Confirm}
                            </Typography>
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

export default TransitPreferencesUI;
