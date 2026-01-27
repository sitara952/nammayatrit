import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { RideCancelModalUIProps } from './Types';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useGetRemoteConfigTexts } from '@/src-v2/hooks/useGetRemoteConfigTexts';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { getImageNameFromUrl, getRandomNumber } from '@/src-v2/utils/common';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

export const RideCancelModalUI: React.FC<RideCancelModalUIProps> = ({
    onClose,
    onConfirmCancel,
    onFindAnotherDriver,
    cancellationFee,
    isLoading,
    vehicleVariant,
    setImageKey,
}) => {
    const { bottom } = useSafeAreaInsets();
    const { getCancellationTexts } = useGetRemoteConfigTexts();
    const { findAnotherDriverText } = getCancellationTexts;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { customerCancellationConfig, enableFindAnotherDriver } = useAppSelector(selectNewFeatureFlags);
    const randomNumber = useMemo(() => getRandomNumber(), []);

    const getCancellationImage = useCallback(() => {
        if (randomNumber <= customerCancellationConfig.cancellationStaggerPct) {
            return customerCancellationConfig.img_a;
        }

        switch (vehicleVariant) {
            case 'AUTO_PLUS':
            case 'AUTO_RICKSHAW':
            case 'E_RICKSHAW':
            case 'EV_AUTO_RICKSHAW':
                return customerCancellationConfig.img_auto;
            case 'BIKE':
            case 'DELIVERY_BIKE':
            case 'BIKE_PLUS':
                return customerCancellationConfig.img_bike;
            default:
                return customerCancellationConfig.img_cab;
        }
    }, [customerCancellationConfig, vehicleVariant, randomNumber]);

    const imageKey = useMemo(() => {
        return getImageNameFromUrl(getCancellationImage());
    }, [getCancellationImage]);

    const onConfirmCancelHandler = useCallback(() => {
        onConfirmCancel();
        if (setImageKey) {
            setImageKey('chargeable_' + imageKey);
        }
    }, [onConfirmCancel, imageKey, setImageKey]);

    const imageUrl = useMemo(() => {
        return getCancellationImage();
    }, [getCancellationImage]);

    return (
        <Animated.View>
            <Pressable
                testID="modal-backdrop"
                style={styles.backdropPressable}
                onPress={onClose}
                accessible={false}
                accessibilityRole="button"
            />

            <Animated.View style={[styles.modalContainer, { paddingBottom: bottom }]}>
                <Typography
                    type="sub-body-700"
                    style={styles.title}
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel={'Driver is on the way. Still want to cancel?'}
                    accessibilityRole="header">
                    {userLanguageStrings.DriverisonthewayStillwanttocancel}
                </Typography>

                <Animated.Image source={{ uri: imageUrl }} style={styles.cancelRideImage} resizeMode="contain" />

                <Typography
                    type="body-7"
                    style={styles.description}
                    numberOfLines={3}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel={userLanguageStrings.DriverStartedJourneyCancellationFeeText(
                        cancellationFee.toString(),
                        CURRENCY_SYMBOL.value,
                    )}
                    accessibilityRole="text">
                    {userLanguageStrings.Cancellingnowwilladdafeetoyournextride(
                        cancellationFee.toString(),
                        CURRENCY_SYMBOL.value,
                    )}
                </Typography>

                <View style={styles.buttonsContainer}>
                    {enableFindAnotherDriver ? (
                        <Button
                            testID="find-another-driver-button"
                            size="lg"
                            type="primary"
                            text={findAnotherDriverText}
                            textStyle={tailwind.style('text-[15px]')}
                            onPress={onFindAnotherDriver}
                            isLoading={isLoading}
                            disabled={isLoading}
                            accessible={true}
                            accessibilityLabel={findAnotherDriverText}
                            accessibilityHint="Tap to find another driver"
                        />
                    ) : (
                        <Button
                            testID="go-back-button"
                            size="lg"
                            type="primary"
                            text={userLanguageStrings.GoBack}
                            textStyle={tailwind.style('text-[15px]')}
                            onPress={onClose}
                            accessible={true}
                            accessibilityLabel={userLanguageStrings.GoBack}
                            accessibilityHint="Tap to go back and dismiss this popup"
                        />
                    )}

                    <Pressable
                        testID="cancel-ride-button"
                        onPress={onConfirmCancelHandler}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={userLanguageStrings.CancelRideWithCharges(
                            cancellationFee.toString(),
                            CURRENCY_SYMBOL.value,
                        )}
                        accessibilityHint="Tap to cancel your ride">
                        <Typography
                            type="body-1"
                            style={styles.cancelButtonText}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible={false}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.CancelRideWithCharges(
                                cancellationFee.toString(),
                                CURRENCY_SYMBOL.value,
                            )}
                        </Typography>
                    </Pressable>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdropPressable: {
        flex: 1,
    },
    modalContainer: {
        backgroundColor: colors.neutral100,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    title: {
        textAlign: 'left',
        marginBottom: 8,
        fontSize: 17,
        lineHeight: 24,
    },
    description: {
        textAlign: 'left',
        color: colors.neutral800,
        marginBottom: 32,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '600',
    },
    buttonsContainer: {
        gap: 12,
    },
    cancelButtonText: {
        paddingBottom: 16,
        paddingTop: 8,
        color: colors.neutral800,
        fontSize: 14,
        alignSelf: 'center',
    },
    cancelRideImage: {
        width: '100%',
        aspectRatio: 16 / 9,
        marginBottom: 8,
    },
});

export default RideCancelModalUI;
