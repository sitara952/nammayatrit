import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    interpolate,
    SharedValue,
} from 'react-native-reanimated';
import paymentSuccessIcon from '@/typescript/assets/ticketing/ys_payment_success_icon.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const LoadingDot: React.FC<{ animation: SharedValue<number>; index: number }> = React.memo(({ animation, index }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolate(animation.value, [0, 1], [0, 1]);

        return {
            backgroundColor: backgroundColor === 1 ? '#14171F' : '#7B8997',
        };
    });

    return <Animated.View key={index} style={[styles.dot, animatedStyle]} />;
});

const LoadingDots: React.FC<{ dotAnimations: SharedValue<number>[] }> = React.memo(({ dotAnimations }) => (
    <View style={styles.loadingContainer}>
        {dotAnimations.map((animation, index) => (
            <LoadingDot key={index} animation={animation} index={index} />
        ))}
    </View>
));

const PaymentSuccessView: React.FC = () => {
    const dotAnimations = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)];
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    useEffect(() => {
        dotAnimations.forEach((animation, index) => {
            const delay = index * 300;
            setTimeout(() => {
                animation.value = withRepeat(
                    withSequence(withTiming(1, { duration: 600 }), withTiming(0, { duration: 600 })),
                    -1,
                    true,
                );
            }, delay);
        });
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={styles.contentContainer}>
                <Image
                    accessible={true}
                    accessibilityLabel="payment success icon"
                    source={paymentSuccessIcon}
                    style={styles.iconContainer}
                />

                <Animated.Text style={styles.successTitle}>{userLanguageStrings.PaymentSuccessful}</Animated.Text>

                <Animated.Text style={styles.successMessage}>
                    {userLanguageStrings.PleaseWaitWhileWeGenerateYourTicket}
                </Animated.Text>

                <Animated.View>
                    <LoadingDots dotAnimations={dotAnimations} />
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
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 25,
    },
    iconContainer: {
        marginBottom: 24,
        width: 65,
        height: 65,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#14171F',
        textAlign: 'center',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 17,
        fontWeight: '400',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 35,
        lineHeight: 22,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    activeDot: {
        backgroundColor: '#374151',
    },
    inactiveDot: {
        backgroundColor: '#D1D5DB',
    },
});

export default React.memo(PaymentSuccessView);
