import nyIcAmbulanceConfirmation from '@/typescript/assets/ny-service/ny_ic_ambulance_confirmation.webp';
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { selectAppReadableName } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

type AmbulanceConfirmationModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export const AmbulanceConfirmationModal: React.FC<AmbulanceConfirmationModalProps> = ({
    visible,
    onClose,
    onConfirm,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appName = useAppSelector(selectAppReadableName);
    const { bottom } = useSafeAreaInsets();
    return (
        <AnimatedModal visible={visible} setVisible={onClose} animationDuration={300}>
            <View style={[styles.container, { paddingBottom: bottom }]}>
                <Image
                    source={nyIcAmbulanceConfirmation}
                    style={styles.image}
                    resizeMode="contain"
                    accessible={false}
                />

                <Typography
                    type="callout"
                    style={styles.description}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.WeAreAPlatformConnectingAmbulanceServiceProvidersWithCustomers(appName)}
                </Typography>

                <View style={styles.buttonContainer}>
                    <Button
                        text={userLanguageStrings.AgreeAndBook}
                        style={styles.button}
                        textStyle={styles.buttonText}
                        type="primary"
                        onPress={onConfirm}
                        isLoading={false}
                        disabled={false}
                        testID="ambulance-ride-confirm-button"
                    />
                    <Button
                        text={userLanguageStrings.CancelBooking}
                        style={styles.button}
                        textStyle={styles.buttonText}
                        type="secondary"
                        onPress={onClose}
                        isLoading={false}
                        disabled={false}
                        testID="ambulance-ride-close-button2"
                    />
                </View>
            </View>
        </AnimatedModal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        alignSelf: 'center',
    },
    image: {
        width: '100%',
        height: 260,
        marginBottom: 16,
        borderRadius: 16,
    },
    description: {
        fontSize: 14,
        color: colors.neutral700,
        marginBottom: 16,
        textAlign: 'left',
        lineHeight: 20,
    },
    buttonContainer: {
        marginBottom: 12,
    },
    button: {
        marginTop: 8,
        borderRadius: 16,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 1,
        height: 50,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        justifyContent: 'center',
    },
});

export default AmbulanceConfirmationModal;
