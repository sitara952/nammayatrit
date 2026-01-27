import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { BookingId } from '../state/client/user';
import { useAppSelector } from '../state/hooks';
import Button from '@/src-v2/primitives/Button';
import Typography from '../designSystem/components/primitives/Typography';
import token from '../designSystem/tokens';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import CustomButton from '../components/common/CustomButton';
import { MultimodalTaxiTrackingProps } from '../navigation/globalParamList';
import { selectRideIdWithBookingId } from '../state/client/booking';
import { useFindAnotherDriver } from '@/src-v2/hooks/useFindAnotherDriver';
import { getImageNameFromUrl, getRandomNumber } from '@/src-v2/utils/common';
import { selectNewFeatureFlags } from '../state/client/session';

type CancelRideProps = {
    bookingId: BookingId | null | undefined;
    onRideConfirmedCancel: (() => void) | undefined;
    setShowCancelRideModal: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
    setImageKey: React.Dispatch<React.SetStateAction<string>> | undefined;
    cancellationFee: number | undefined;
    onClick: () => void;
    isRideOTPFlow: boolean | undefined;
};

const CancelRide = ({
    bookingId = null,
    onRideConfirmedCancel: _onRideConfirmedCancel,
    setShowCancelRideModal,
    multimodalProps,
    setImageKey,
    cancellationFee,
    onClick,
    isRideOTPFlow,
}: CancelRideProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const { bottom } = useSafeAreaInsets();
    const { customerCancellationConfig, enableFindAnotherDriver } = useAppSelector(selectNewFeatureFlags);
    const randomNumber = useMemo(() => getRandomNumber(), []);
    const getNoChargeImage = () => {
        if (randomNumber <= customerCancellationConfig.cancellationStaggerPct) {
            return customerCancellationConfig.noChargeImgA;
        }
        return customerCancellationConfig.noChargeImgB;
    };

    const imageKey = useMemo(() => {
        return getImageNameFromUrl(getNoChargeImage());
    }, [getNoChargeImage]);

    const { findAnotherDriver: findAnotherDriverClick, isLoading } = useFindAnotherDriver({
        bookingId,
        rideId,
        multimodalProps,
        onSuccess: () => {
            setShowCancelRideModal?.(false);
        },
        cancellationFee: cancellationFee,
        imageKey: imageKey,
        onClose: () => setShowCancelRideModal?.(false),
    });

    return (
        <Animated.View
            style={tailwind.style(
                `bg-[${themeColors.Fill_neutralUltraLow}] px-[${token?.spacing?.[20]}] pt-[29px] pb-[${bottom}px] px-[${token?.spacing?.[16]}] rounded-[15px]`,
            )}>
            <Animated.View style={tailwind.style(`pb-${token?.spacing?.[20]}`)}>
                <Animated.View style={tailwind.style('flex-row items-center justify-start')}>
                    <Typography
                        type="sub-body-700"
                        style={{ textAlign: 'left', marginBottom: 8, fontSize: 17, lineHeight: 24 }}
                        numberOfLines={2}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={'Driver is on the way. Still want to cancel?'}
                        accessibilityRole="header">
                        {userLanguageStrings.DriverisonthewayStillwanttocancel}
                    </Typography>
                </Animated.View>

                <Animated.Image
                    source={{ uri: getNoChargeImage() }}
                    style={{ width: '100%', aspectRatio: 16 / 9 }}
                    resizeMode="contain"
                    accessible={true}
                    accessibilityRole="image"
                    accessibilityLabel={'no charge cancellation image'}
                />
            </Animated.View>
            <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[6]}]`)}>
                {!isRideOTPFlow && enableFindAnotherDriver ? (
                    <Button
                        isLoading={isLoading}
                        disabled={isLoading}
                        testID="cancel_ride_anyway"
                        type="primary"
                        text={userLanguageStrings.FindanotherDriver}
                        onPress={findAnotherDriverClick}
                    />
                ) : (
                    <Button
                        testID="go_back_button"
                        type="primary"
                        text={userLanguageStrings.GoBack}
                        onPress={() => setShowCancelRideModal?.(false)}
                    />
                )}
            </Animated.View>
            <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[16]}]`)}>
                <CustomButton
                    bgColor={themeColors.Fill_neutralMin}
                    textColor={themeColors.Icon_neutralHigh}
                    buttonText={userLanguageStrings.CancelRide}
                    onClick={() => {
                        if (setImageKey) {
                            setImageKey('no_charge_' + imageKey);
                        }
                        onClick();
                    }}
                    accessibilityLabel={'Cancel ride button'}
                    paddingHorizontal={0}
                    style={tailwind.style('mt-0')}
                    textStyle={tailwind.style('text-base font-bold')}
                    leftIcon={undefined}
                    testID="cancel_ride_find_another_driver"
                />
            </Animated.View>
        </Animated.View>
    );
};

export default CancelRide;
