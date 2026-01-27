import { Pressable } from '@/src-v2/primitives/Pressable';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';
import { tailwind } from '../../../../../../src/typescript/tailwindTheme/tailwind';
import CrossIcon from '../../../../../assets/svg/CrossIcon';
import { Icon } from '../../../../components/common/Icon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const SafetyIcon = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 16 17" fill="none">
            <Path
                d="M15.5684 2.33398C15.5377 3.31056 15.4464 6.14729 15.3545 8.99414C15.2217 12.8989 12.0054 16 8.08496 16C4.15439 15.9999 0.949156 12.8988 0.816406 8.99414C0.724532 6.14728 0.632203 3.31054 0.601562 2.33398L8.08496 1.5L15.5684 2.33398ZM11.3652 5.4834C9.95298 6.42481 8.89554 7.48219 8.19141 8.30371C7.8509 8.701 7.59181 9.04519 7.41309 9.29688C7.31739 9.18876 7.20216 9.06208 7.06836 8.92383C6.65371 8.4954 6.05507 7.94182 5.3291 7.45801L4.6084 8.53809C5.23375 8.95482 5.76128 9.44126 6.13477 9.82715C6.32046 10.019 6.46581 10.1836 6.56348 10.2988C6.61226 10.3564 6.64898 10.4019 6.67285 10.4316C6.68472 10.4464 6.69388 10.457 6.69922 10.4639C6.70189 10.4673 6.70409 10.4694 6.70508 10.4707V10.4717L6.90039 10.7266H8.03906L8.22754 10.4111V10.4121L8.22949 10.4092C8.2312 10.4064 8.23416 10.4011 8.23828 10.3945C8.24685 10.3808 8.26054 10.359 8.2793 10.3301C8.31718 10.2717 8.37585 10.1835 8.45508 10.0713C8.61372 9.84655 8.8548 9.5252 9.17773 9.14844C9.82485 8.39345 10.7947 7.42358 12.085 6.56348L11.7256 6.02344L11.3652 5.4834Z"
                fill="#F74940"
            />
        </Svg>
    );
};

export const LiveJourneyHeader = () => {
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            style={tailwind.style('flex-row justify-between px-4 bg-transparent', `pt-[${top ? top : 16}px]`)}>
            <Pressable
                accessibilityRole="button"
                testID="exit-button"
                onPress={() => navigation.goBack()}
                accessibilityLabel="Exit button">
                <Animated.View
                    style={tailwind.style('min-h-10 px-3 rounded-[20px] flex-row items-center bg-[#3B3A3C]')}>
                    <Icon icon={<CrossIcon />} size={16} color="#F4F4F4" />
                    <Animated.Text
                        style={tailwind.style('text-base leading-[19px] font-areaNormal-bold text-[#F4F4F4] pl-1.5')}>
                        {userLanguageStrings.Exit}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
            <Animated.View style={tailwind.style('min-h-10 px-3 rounded-[20px] flex-row items-center bg-white')}>
                <Icon icon={<SafetyIcon />} size={16} color="#F4F4F4" />
                <Animated.Text style={tailwind.style('text-base font-areaNormal-bold text-[#313131] pl-1.5')}>
                    {userLanguageStrings.Safety}
                </Animated.Text>
            </Animated.View>
        </Animated.View>
    );
};
