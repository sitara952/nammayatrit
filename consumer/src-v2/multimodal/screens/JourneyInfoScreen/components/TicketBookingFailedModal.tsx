import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Button from '@/src-v2/primitives/Button';
import TicketBookingFailed from '@/typescript/components/svg/TicketBookingFailed';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface TicketBookingFailedModalProps {
    goToHome: (() => void) | undefined;
}

export const TicketBookingFailedModal: React.FC<TicketBookingFailedModalProps> = ({ goToHome }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            <Animated.View style={styles.modalContent}>
                <TicketBookingFailed />
                <Typography
                    style={styles.modalTitle}
                    type={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.TicketBookingFailed}
                </Typography>
                <Typography
                    style={styles.modalDescription}
                    type={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.SorryYourBookingIsFailed}
                </Typography>
                <View style={styles.modalButtons}>
                    <Button
                        testID={'journey_info_confirm'}
                        onPress={goToHome}
                        type={'primary'}
                        text={userLanguageStrings.Close}
                        textColor={'#ffffff'}
                    />
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
        borderRadius: 50,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'AreaNormal-Extrabold',
        color: '#1F2937',
        textAlign: 'left',
        marginBottom: 16,
        lineHeight: 24,
    },
    modalDescription: {
        fontSize: 15,
        color: '#6B7280',
        fontFamily: 'AreaNormal-Bold',
        textAlign: 'left',
        lineHeight: 25,
        marginBottom: 32,
        letterSpacing: 0.25,
    },
    modalButtons: {
        gap: 12,
    },
});
