import BusTopView from '@/src-v2/assets/mt_ic_bus_top_view_rotated.webp';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import React from 'react';
import { Text, View } from 'react-native';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

interface EnableLocationProps {
    onEnableLocation?: () => void;
}

const EnableLocation: React.FC<EnableLocationProps> = ({ onEnableLocation }) => {
    const handleEnableLocation = () => {
        if (onEnableLocation) {
            onEnableLocation();
        }
        // Add your location permission logic here
    };

    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style('px-4')}>
            <View
                style={tailwind`bg-[#FFF0BB] rounded-[26px] mt-7 mb-4 pt-4  px-[25px] items-center w-full max-w-[400px]  h-[186px]`}>
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="bus top view image"
                    source={BusTopView}
                    style={tailwind.style('  h-[31px] w-[79px]  ')}
                />
                <Text
                    style={tailwind`text-[15px] font-areaNormal-extrabold text-center text-[#313131] leading-[24.75px] px-2 pt-[6px]`}>
                    {userLanguageStrings.NeedYourLocationToTrackTheRightCommuteForYouSavesTime}
                </Text>
                <Animated.View style={[animatedStyle, tailwind.style('w-full')]}>
                    <Pressable
                        {...handlers}
                        testID="enable-precise-location"
                        accessibilityRole="button"
                        accessibilityLabel="Enable Precise Location button"
                        style={tailwind`bg-[${colors.view_ticket_bg}] rounded-[14px] py-[15px] px-8 w-full items-center shadow-lg mt-3`}
                        onPress={handleEnableLocation}>
                        <Text
                            style={tailwind`text-[${colors.view_ticket_text}] text-[14px] font-areaNormal-extrabold leading-[14px]`}>
                            {userLanguageStrings.EnablePreciseLocation}
                        </Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

export default EnableLocation;
