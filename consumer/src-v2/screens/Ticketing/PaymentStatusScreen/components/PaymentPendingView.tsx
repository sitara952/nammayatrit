import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Animated from 'react-native-reanimated';
import paymentPendingIcon from '@/typescript/assets/ticketing/ys_payment_pending_icon.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface PaymentPendingViewProps {
    onRefreshStatus?: () => void;
    onGoHome?: () => void;
}

const PaymentPendingView: React.FC<PaymentPendingViewProps> = ({ onRefreshStatus = () => {}, onGoHome = () => {} }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={styles.container}>
            <Animated.View style={styles.contentContainer}>
                <Image
                    accessible={true}
                    accessibilityLabel="payment pending icon"
                    source={paymentPendingIcon}
                    style={styles.iconContainer}
                />

                <Animated.Text style={styles.pendingTitle}>{userLanguageStrings.YourBookingIsPending}</Animated.Text>

                <Animated.Text style={styles.pendingMessage}>
                    {userLanguageStrings.YourPaymentIsGettingProcessed}
                </Animated.Text>

                <Animated.View style={styles.buttonContainer}>
                    <TouchableOpacity
                        testID="Refresh_Status"
                        style={styles.primaryButton}
                        onPress={onRefreshStatus}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Refresh payment status">
                        <Text style={styles.primaryButtonText}>{userLanguageStrings.RefreshStatus}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        testID="Go_Home"
                        style={styles.secondaryButton}
                        onPress={onGoHome}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Go back to home screen">
                        <Text style={styles.secondaryButtonText}>{userLanguageStrings.GoHome}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        width: '100%',
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    iconContainer: {
        marginBottom: 24,
        width: 65,
        height: 65,
    },
    pendingTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#14171F',
        textAlign: 'center',
        marginBottom: 12,
    },
    pendingMessage: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        marginHorizontal: 22,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#F59E0B',
        fontSize: 17,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: 17,
        fontWeight: '600',
    },
});

export default PaymentPendingView;
