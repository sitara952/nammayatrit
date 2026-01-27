import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { ReferralPaymentScreenUIProps } from './Types';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

export const ReferralPaymentUI: React.FC<ReferralPaymentScreenUIProps> = ({
    themeColors,
    onDonePress,
    userLanguageStrings,
    payoutVpa,
    referralAmountToCollect,
}) => {
    const styles = createStyles(themeColors);

    return (
        <Animated.View style={styles.container}>
            {/* Image Section */}
            <Animated.View entering={FadeIn.duration(1500)}>
                <View style={styles.imageContainer}>
                    <LottieWithFallback
                        style={styles.lottieAnimation}
                        source={require('@/typescript/assets/ny-service/success_lottie_v2.lottie')}
                        autoPlay
                        loop
                        fallback={undefined}
                    />
                </View>
            </Animated.View>

            {/* Header Text */}
            <Animated.View style={styles.headerTextContainer}>
                <Typography
                    type="body"
                    style={styles.headerText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.UpiIdSubmitted}
                </Typography>
            </Animated.View>

            {/* Description Text */}
            <Animated.View style={styles.descriptionContainer}>
                <Typography
                    type="body"
                    style={styles.descriptionText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.UpiCreditMessage(referralAmountToCollect, payoutVpa, CURRENCY_SYMBOL.value)}
                </Typography>
            </Animated.View>

            {/* Button */}
            <Button
                testID="referral_payment_done_click"
                onPress={onDonePress}
                style={styles.button}
                type="secondary"
                size="lg">
                <Typography
                    type="body"
                    style={styles.buttonText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Done}
                </Typography>
            </Button>
        </Animated.View>
    );
};

// Style creation moved outside component function
const createStyles = (themeColors: ThemeTokens) =>
    StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'column',
            backgroundColor: themeColors.Icon_positive,
            justifyContent: 'center',
        },
        imageContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
        },
        lottieAnimation: {
            height: 160,
            width: 160,
            alignSelf: 'center',
        },
        headerTextContainer: {
            marginTop: 20,
        },
        headerText: {
            fontSize: 18,
            textAlign: 'center',
            color: 'white',
            fontWeight: '900',
        },
        descriptionContainer: {
            marginTop: 20,
            marginHorizontal: 5,
        },
        descriptionText: {
            fontSize: 18,
            textAlign: 'center',
            color: 'white',
            fontWeight: '600',
        },
        button: {
            marginTop: 55,
            marginHorizontal: 20,
            justifyContent: 'center',
            backgroundColor: '#f1f5f9',
        },
        buttonText: {
            textAlign: 'center',
            color: 'black',
            fontWeight: '700',
            fontSize: 16,
        },
    });
