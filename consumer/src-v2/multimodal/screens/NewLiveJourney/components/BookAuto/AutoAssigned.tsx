import React from 'react';
import Animated from 'react-native-reanimated';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { CloseButton } from '../StatusPopUpModal/CloseButton';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { Star } from '../../assets/svg/Star';
import { MultipleUsers } from '../../assets/svg/MultipleUsers';
import autoFront from '../../../../../assets/3D-assets/live-journey/auto-front.webp';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import PrimaryButton from '../StatusPopUpModal/PrimaryButton';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const AutoAssigned = ({
    onNextActionPress = () => {},
    onOtherOptionsPress = () => {},
    isDriverArrived = false,
    otpValue = 'NA',
    destination = 'NA',
    driverName = 'NA',
    autoName = 'NA',
    rating = 'NA',
    passengerCount = 'NA',
    vehicleNumber = 'NA',
}: {
    onNextActionPress: () => void;
    onOtherOptionsPress: () => void;
    isDriverArrived: boolean;
    otpValue: string;
    destination: string;
    driverName: string;
    autoName: string;
    rating: string;
    passengerCount: string;
    vehicleNumber: string;
}) => {
    const { livJourneyBookAutoModalRef } = useRefsContext();
    const { animatedStyle: otherOptionsAnimatedStyle, handlers: otherOptionsHandlers } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View>
            <CloseButton
                style="absolute top-[5px] left-[20px]"
                closeButtonStyle="bg-[#E5E5E5]"
                onPress={() => livJourneyBookAutoModalRef.current?.close()}
            />
            <Animated.Text
                style={tailwind.style(
                    'text-[14px] leading-[24px] text-[#3B3A3C] text-center font-areaNormal-extrabold pt-[22px] px-[44px]',
                )}>
                {isDriverArrived ? (
                    <Animated.Text style={tailwind.style('text-[#0C772B] ')}>
                        {userLanguageStrings.DriverArrived}!
                    </Animated.Text>
                ) : (
                    `${userLanguageStrings.AutoAssigned}!`
                )}
                {'\n'}To {destination}
            </Animated.Text>

            <Animated.View style={tailwind.style('border border-[#F3F3F3] rounded-4 mx-[24px] mt-[20px] p-[18px]')}>
                <Animated.Text
                    style={tailwind.style(
                        'text-[15px] text-underline text-[#004FB6] underline font-areaNormal-extrabold',
                    )}>
                    {driverName}
                </Animated.Text>
                <Animated.Text style={tailwind.style('text-[14px] text-[#656269] font-areaNormal-bold pt-[12px]')}>
                    {autoName}
                </Animated.Text>
                <Animated.View style={tailwind.style('pt-[12px] flex-row items-center gap-[8px]')}>
                    <Animated.View style={tailwind.style('flex-row items-center gap-[6px]')}>
                        <Icon icon={<Star fill={colors.rating_star} />} size={10} />
                        <Animated.Text style={tailwind.style('text-[13px] text-[#656269] font-areaNormal-bold')}>
                            {rating}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View style={tailwind.style('bg-[#78747C] h-[14px] w-[1px] opacity-20')} />
                    <Animated.View style={tailwind.style('flex-row items-center gap-[6px]')}>
                        <Icon icon={<MultipleUsers fill={colors.rating_star} />} size={14} />
                        <Animated.Text style={tailwind.style('text-[13px] text-[#656269] font-areaNormal-bold')}>
                            {passengerCount}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>

                <Animated.View style={tailwind.style('absolute bottom-[0px] right-[10px]')}>
                    <Animated.Image
                        accessible={false}
                        source={autoFront}
                        style={tailwind.style('w-[109px] h-[80px]')}
                    />
                    <Animated.View
                        style={tailwind.style(
                            'h-[26px] w-[113px] bg-[#FFCE4B] rounded-[6px] border-[2px] border-[#454545] flex-row items-center justify-center absolute bottom-[10px] right-[0px] px-[7x]',
                        )}>
                        <Animated.Text
                            style={[tailwind.style('text-[13px] text-[#454545]'), { fontFamily: 'FE-Font' }]}>
                            {vehicleNumber}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            </Animated.View>

            <PrimaryButton
                text={!isDriverArrived ? userLanguageStrings.TripDetails : `OTP ${otpValue}`}
                onPress={onNextActionPress}
                testID="next-action-button"
                wrapperStyle={'px-[24px] pt-[20px]'}
                iconColor={colors.Confirm_button_text}
            />
            <Pressable
                accessibilityLabel="Other Options button"
                testID="other-options-button"
                onPress={onOtherOptionsPress}
                accessibilityRole="button"
                style={tailwind.style('pt-[24px] mx-auto')}
                {...otherOptionsHandlers}>
                <Animated.View style={otherOptionsAnimatedStyle}>
                    <Animated.Text style={tailwind.style('text-[15px]  text-[#656565] font-areaNormal-extrabold')}>
                        {userLanguageStrings.OtherOptions}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export default AutoAssigned;
