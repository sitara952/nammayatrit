import React from 'react';
import Animated from 'react-native-reanimated';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { CloseButton } from '../StatusPopUpModal/CloseButton';
import Spinner from '../../assets/svg/Spinner';
import { Pressable } from '@/src-v2/primitives/Pressable';
import PrimaryButton from '../StatusPopUpModal/PrimaryButton';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const SearchingForAuto = ({
    destination = 'NA',
    onBoostRidePress = () => {},
    onOtherOptionsPress = () => {},
}: {
    destination: string;
    onBoostRidePress: () => void;
    onOtherOptionsPress: () => void;
}) => {
    const { livJourneyBookAutoModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            <CloseButton
                style="absolute top-[5px] left-[20px]"
                closeButtonStyle="bg-[#E5E5E5]"
                onPress={() => livJourneyBookAutoModalRef.current?.close()}
            />

            <Animated.View style={tailwind.style('items-center justify-center pt-[40px] ')}>
                <Spinner />
            </Animated.View>

            <Animated.Text
                style={tailwind.style(
                    'text-center text-[14px] leading-[24px] text-[#3B3A3C] font-areaNormal-extrabold pt-[33px] px-[44px]',
                )}>
                {userLanguageStrings.SearchingAutoRideNearYouTo(destination)}
            </Animated.Text>
            <PrimaryButton
                text={userLanguageStrings.BoostRide}
                onPress={onBoostRidePress}
                testID="boost-ride-button"
                wrapperStyle="px-[24px] pt-[20px]"
                iconColor="#016ACD"
                style="bg-[#F7F7F7]"
                textStyle="text-[#016ACD]"
            />
            <Pressable
                accessibilityLabel="Other Options button"
                accessibilityRole="button"
                testID="other-options-button"
                onPress={onOtherOptionsPress}
                style={tailwind.style('pt-[24px] mx-auto')}>
                <Animated.Text style={tailwind.style('text-[15px]  text-[#656565] font-areaNormal-extrabold')}>
                    {userLanguageStrings.OtherOptions}
                </Animated.Text>
            </Pressable>
        </>
    );
};

export default SearchingForAuto;
