import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import statusLoader from '@/../src/typescript/assets/ny-service/mt_dot_loader_v2.lottie';
import trainLoader from '@/../src/typescript/assets/ny-service/mt_train_loader.lottie';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import LeftArrow from '@/typescript/assets/svg/direction/LeftArrow';

interface PaymentProcessingComponentProps {
    cancelPaymentModalRef: React.RefObject<BottomSheetModal | null>;
    amount?: number;
    domainType?: string;
}

export const PaymentProcessing: React.FC<PaymentProcessingComponentProps> = ({
    cancelPaymentModalRef,
    domainType,
    amount,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const statusTranslateY = useSharedValue(100);
    const statusScale = useSharedValue(0.6);
    const statusLoaderStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: statusTranslateY.value }, { scale: statusScale.value }],
            opacity: interpolate(statusScale.value, [0.6, 1], [0, 1]),
        };
    });
    const easing = Easing.bezier(0.22, 1, 0.36, 1);
    const TextY = useSharedValue(80);
    const TextOpacity = useSharedValue(0);
    const TextScale = useSharedValue(0.96);
    const { top } = useSafeAreaInsets();

    useEffect(() => {
        TextY.value = withDelay(300, withTiming(0, { duration: 1400, easing }));
        TextOpacity.value = withDelay(300, withTiming(1, { duration: 1000, easing }));
        TextScale.value = withDelay(300, withTiming(1, { duration: 1000, easing }));
        statusTranslateY.value = withTiming(0, { duration: 700 });
        statusScale.value = withTiming(1, { duration: 700 });
    }, []);

    const TextStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: TextY.value }, { scale: TextScale.value }],
        opacity: TextOpacity.value,
    }));

    const handleBackPress = () => {
        cancelPaymentModalRef.current?.present();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, tailwind.style(`pt-[${top}px]`)]}>
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="map_location_back_press"
                    style={[styles.backButton]}
                    onPress={handleBackPress}>
                    <LeftArrow fill="#F4F4F4" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Payment Details</Text>
                    <Text style={styles.headerSubtitle}>
                        {domainType === 'FRFSPassPurchase' ? 'Bus Pass Amount' : 'Ticket Amount'} ₹{amount}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                {/* Central loading indicator */}
                <Animated.View style={[statusLoaderStyle, styles.loaderWrapper]}>
                    <LottieWithFallback
                        fallback={undefined}
                        source={statusLoader}
                        autoPlay
                        loop
                        style={styles.statusLoader}
                    />
                </Animated.View>

                {/* Text content */}
                <Animated.View style={[styles.textContainer, TextStyle]}>
                    <Text style={styles.title}>{userLanguageStrings.PaymentProcessing}</Text>
                    <Text style={styles.subtitle}>
                        {userLanguageStrings.ThepaymentforTicketsisgettingprocessed(
                            domainType === 'FRFSPassPurchase' ? 'Bus Pass' : 'Ticket',
                        )}
                    </Text>
                </Animated.View>
            </View>

            {/* Bottom curved train track */}
            <View style={styles.trainWrapper} pointerEvents="none">
                <LottieWithFallback
                    fallback={undefined}
                    source={trainLoader}
                    autoPlay
                    loop
                    style={styles.trainLoader}
                />
            </View>

            {/* Bottom note */}
            <Animated.View style={[styles.noteContainer, TextStyle]}>
                <Text style={styles.noteText}>
                    {userLanguageStrings.Note}:{' '}
                    {userLanguageStrings.DoNotHitBackButtonOrCloseThisScreenUntilTheTransactionIsComplete}
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2A2A2A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        marginTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    backIcon: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 80,
        // paddingBottom: 200,
    },
    loaderWrapper: {
        marginBottom: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusLoader: {
        width: 220,
        height: 220,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
        paddingTop: 200,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'areaNormal-extrabold',
    },
    subtitle: {
        fontSize: 14,
        color: '#E5E5E5',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
        fontFamily: 'areaNormal-extrabold',
    },
    trainWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trainLoader: {
        width: 1829,
        height: 1000,
    },
    noteContainer: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        alignItems: 'center',
    },
    noteText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 16,
        fontFamily: 'areaNormal-regular',
    },
});
