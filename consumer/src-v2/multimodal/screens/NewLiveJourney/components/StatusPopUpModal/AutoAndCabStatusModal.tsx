import React, { useCallback } from 'react';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { PopUpModalConfig } from './PopUpModalConfig';
import { CloseButton } from './CloseButton';
import autoSideViewPng from '@/src-v2/assets/3D-assets/live-journey/auto-side-view.webp';
import PrimaryButton from './PrimaryButton';
import { Icon } from '../../../../components/common/Icon';
import { Star } from '../../assets/svg/Star';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import DoubleChevronRight from '@/src-v2/assets/svg/DoubleChevronRight';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors as color } from 'config-types/src/domain/default/themes/colors';

type BaseAutoAndCabStatusModalProps = {
    mode: 'auto' | 'cab' | 'bike';
    onClosePress: () => void;
    vehicleIconUrl: string | undefined;
};

type DriverVehicleStateProps = BaseAutoAndCabStatusModalProps & {
    status: 'driver-assigned' | 'driver-arrived';
    otpValue: string | undefined;
    vehicleNumber: string | undefined;
    onTripDetailsPress: () => void;
};

type RideCompleteProps = BaseAutoAndCabStatusModalProps & {
    status: 'ride-complete';
    onRateThisRidePress: () => void;
    onGoToNextTransitPress: () => void;
    fare: number | undefined;
};

export type AutoAndCabStatusModalProps = DriverVehicleStateProps | RideCompleteProps;

const AutoAndCabStatusModal = (props: AutoAndCabStatusModalProps) => {
    const { bottom } = useSafeAreaInsets();
    const { liveJourneyBookAutoOrCabStatusModalRef } = useRefsContext();
    const { status, onClosePress, vehicleIconUrl } = props;

    const popupUI = useCallback(() => {
        switch (status) {
            case 'driver-assigned':
            case 'driver-arrived':
                return <DriverVehicleStatePopupUI {...props} />;
            case 'ride-complete':
                return <RideCompletePopupUI {...props} />;
        }
    }, [props]);

    return (
        <PopUpModalConfig
            sheetRef={liveJourneyBookAutoOrCabStatusModalRef}
            isScrollable={false}
            onClosePress={onClosePress}>
            <BottomSheetView style={tailwind.style(`pb-[${(bottom || 16) + 16}px]`)}>
                <CloseButton
                    style="absolute top-[20px] right-[20px]"
                    closeButtonStyle="bg-[#E5E5E5]"
                    onPress={onClosePress}
                />
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="auto side view image"
                    source={vehicleIconUrl ? { uri: vehicleIconUrl } : autoSideViewPng}
                    style={tailwind.style('w-[243px] h-[213px] mt-[54px] mx-auto')}
                />
                {popupUI()}
            </BottomSheetView>
        </PopUpModalConfig>
    );
};

const RideCompletePopupUI = (props: RideCompleteProps) => {
    const { fare, onRateThisRidePress, onGoToNextTransitPress } = props;
    const { animatedStyle: nextTransitButtonAnimatedStyle, handlers: nextTransitButtonHandlers } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            <Animated.Text
                style={tailwind.style('text-[18px] text-[#313131] font-areaNormal-extrabold text-center pt-[18px]')}>
                {userLanguageStrings.RideComplete}
            </Animated.Text>
            {fare && (
                <Animated.Text
                    style={tailwind.style('text-[32px] font-areaNormal-bold text-[#313131] text-center pt-[10px]')}>
                    <Animated.Text style={tailwind.style('text-[15px] font-inter-bold ')}> ₹{' '}</Animated.Text>
                    {fare}
                </Animated.Text>
            )}
            <Animated.Text
                style={tailwind.style('text-[14px] text-[#3B3A3C] font-areaNormal-extrabold text-center pt-[12px]')}>
                {userLanguageStrings.PayDirectlyToTheDriver}.
            </Animated.Text>
            <PrimaryButton
                prefix={
                    <Icon icon={<Star fill={colors.view_ticket_text} />} size={13} color={colors.view_ticket_text} />
                }
                testID="rate-this-ride-button"
                text={userLanguageStrings.RateThisRide}
                onPress={onRateThisRidePress}
                wrapperStyle="px-[24px] mt-[40px]"
                iconColor={`[${colors.view_ticket_text}]`}
                textStyle={`text-[${colors.view_ticket_text}]`}
                style={`bg-[${colors.view_ticket_bg}]`}
                suffix={<></>}
            />
            <Pressable
                accessibilityLabel={'Go to next transit button'}
                testID="next-transit-button"
                onPress={onGoToNextTransitPress}
                accessibilityRole="button"
                style={tailwind.style('pt-[20px] mx-auto')}
                {...nextTransitButtonHandlers}>
                <Animated.View
                    style={[tailwind.style('flex-row items-center gap-[8px]'), nextTransitButtonAnimatedStyle]}>
                    <Animated.Text
                        style={tailwind.style('text-[15px] leading-[17px] text-[#016ACD] font-areaNormal-extrabold')}>
                        {userLanguageStrings.GoToNextTransit}
                    </Animated.Text>
                    <Icon icon={<DoubleChevronRight fill={color.blue200} />} size={15} color={color.blue200} />
                </Animated.View>
            </Pressable>
        </>
    );
};

const DriverVehicleStatePopupUI = (props: DriverVehicleStateProps) => {
    const { mode, status, otpValue, vehicleNumber, onTripDetailsPress } = props;
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            <Animated.Text
                style={tailwind.style('text-[18px] text-[#313131] font-areaNormal-extrabold text-center pt-[27px]')}>
                {status === 'driver-assigned'
                    ? `${userLanguageStrings.DriverAssigned}!`
                    : `${userLanguageStrings.DriverArrived}!`}
            </Animated.Text>
            <Animated.Text
                style={tailwind.style(
                    'text-[14px] text-[#3B3A3C] font-areaNormal-extrabold text-center w-[281px] mx-auto leading-[25 px] pt-[9px]',
                )}>
                {status === 'driver-assigned'
                    ? userLanguageStrings.AutoCabAssigned(mode, otpValue)
                    : userLanguageStrings.AutoCabArrived(mode, vehicleNumber, otpValue)}
            </Animated.Text>

            <PrimaryButton
                testID="trip-details-button"
                text={userLanguageStrings.TripDetails}
                onPress={onTripDetailsPress}
                wrapperStyle="px-[24px] mt-[28px]"
                iconColor={`[${colors.view_ticket_text}]`}
                textStyle={`text-[${colors.view_ticket_text}]`}
                style={`bg-[${colors.view_ticket_bg}]`}
            />
        </>
    );
};

export default AutoAndCabStatusModal;
