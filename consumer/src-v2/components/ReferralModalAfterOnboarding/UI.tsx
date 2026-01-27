import mtIcReferralCoins from '@/typescript/assets/ny-service/mt_ic_referral_coins.webp';
import Animated from 'react-native-reanimated';
import { Image, View, StyleSheet } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectReferralYouGet, setBottomSheetStage } from '@/typescript/state/client/session';
import { BottomSheetStage } from '@/typescript/state/client/session';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

export const ReferralModalAfterOnboarding = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { referralModalAfterOnboardingRef } = useRefsContext();
    const dispatch = useAppDispatch();
    const referralYouGet = useAppSelector(selectReferralYouGet);

    return (
        <Animated.View style={styles.container}>
            <View style={styles.contentContainer}>
                <Typography
                    type="subhead-800"
                    style={styles.headerText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.GetXReferralBenefit(referralYouGet, CURRENCY_SYMBOL.value)}
                </Typography>

                {/* Image Section with Coins and Avatars */}
                <View style={styles.imageSection}>
                    <View style={styles.imageWrapper}>
                        <Image
                            resizeMode="contain"
                            source={mtIcReferralCoins}
                            style={styles.coinImage}
                            accessible={true}
                            accessibilityLabel="referral coins image"
                        />
                    </View>
                </View>
            </View>

            <Button
                testID="referral_modal_take_a_ride"
                type="primary"
                textStyle={styles.buttonText}
                style={styles.button}
                onPress={() => {
                    referralModalAfterOnboardingRef.current?.dismiss();
                    dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'refModalAfterOnboarding' }));
                }}
                text={userLanguageStrings.TakeARideNow}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 24,
    },
    contentContainer: {
        width: '100%',
    },
    headerText: {
        textAlign: 'left',
        marginHorizontal: 16,
    },
    imageSection: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageWrapper: {
        alignItems: 'center',
    },
    coinImage: {
        height: 360,
        width: 360,
    },
    buttonText: {
        textAlign: 'center',
    },
    button: {
        marginBottom: 32,
        marginHorizontal: 16,
        marginTop: 20,
        justifyContent: 'center',
    },
});
