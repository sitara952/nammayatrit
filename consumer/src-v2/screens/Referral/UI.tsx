import mtIcReferralBackgroundImage from '@/typescript/assets/ny-service/mt_ic_referral_coins.webp';
import nyIcReferralProfileIcon from '@/resources/assets/png/referral/ny_ic_referral_profile_icon.webp';
import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { View, Image, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { QRIcon } from '@/typescript/assets/svg/symbols/QRIcon.tsx';
import { ScrollView } from 'react-native-gesture-handler';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import { PopUpModal } from '@/typescript/components/PopUpModal.tsx';
import { Header } from '@/src-v2/primitives/Header.tsx';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import { createAction } from '@/typescript/utils/common.ts';
import Button from '@/src-v2/primitives/Button.tsx';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { CodeAndShareButtonViewProps, ReferralScreenUIProps } from './Types';
import { DotWithBorder } from '@/typescript/components/svg/DotWithBorder';
import { QRViewModalFlow } from './components/QRViewModal/Flow';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

const CodeAndShareButtonView: React.FC<CodeAndShareButtonViewProps> = ({
    userProfile,
    themeColors,
    userLanguageStrings,
    rfDispatch,
}) => {
    const themedStyles = getThemedStyles(themeColors);

    return (
        <View style={themedStyles.codeShareContainer}>
            <View
                style={styles.codeTextContainer}
                accessibilityLabel={`Your invite code is ${userProfile?.customerReferralCode ?? 'not available'}`}>
                <Typography
                    type="body-subtext"
                    style={themedStyles.codeText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userProfile?.customerReferralCode ?? '-'}
                </Typography>
                <Typography
                    type="body-subtext"
                    style={styles.inviteCodeLabel}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.YourReferralCode}
                </Typography>
            </View>
            <Animated.View style={styles.buttonContainer}>
                <Button
                    testID="referral_share_code"
                    type="secondary"
                    style={themedStyles.actionButton}
                    onPress={() => {
                        rfDispatch(createAction('SHARE_CLICKED', undefined));
                    }}>
                    <Typography
                        style={themedStyles.buttonText}
                        type="subhead"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Share}
                    </Typography>
                </Button>
                <Button
                    testID="referral_show_qr"
                    type="secondary"
                    style={themedStyles.actionButton}
                    onPress={() => {
                        rfDispatch(createAction('QR_ICON_CLICKED', undefined));
                    }}
                    accessibilityLabel="Scan QR to download Anna">
                    <QRIcon />
                </Button>
            </Animated.View>
        </View>
    );
};

export const ReferralScreenUI: React.FC<ReferralScreenUIProps> = ({
    userProfile,
    referralAppliedFromStore,
    referralModalRef,
    qrViewModalRef,
    getBodyHeaderData,
    referralPayoutConfigV2,
    rfDispatch,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appConfig = useAppSelector(selectAppConfig);
    const themedStyles = getThemedStyles(themeColors);
    const coverImage = referralPayoutConfigV2.coverImage;

    const bodyHeaderData = getBodyHeaderData();

    return (
        <Animated.View style={themedStyles.container}>
            <Header
                title={userProfile?.isPayoutEnabled ? userLanguageStrings.ReferAndEarn : userLanguageStrings.Invite}
                onBackPress={() => {
                    hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                    rfDispatch(createAction('HEADER_BACK_PRESS', undefined));
                }}
                nextViewOnPress={() => {
                    referralModalRef?.current?.present();
                }}
                showNextView={!referralAppliedFromStore && !userProfile?.hasTakenValidRide}
                nextViewIcon={
                    <Image
                        accessible={true}
                        accessibilityLabel="referral profile icon image"
                        source={nyIcReferralProfileIcon}
                        style={{ width: 16, height: 16, margin: 'auto' }}
                    />
                }
                nextViewText={userLanguageStrings.EnterCode}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={themedStyles.headerSection}>
                    {bodyHeaderData.type !== undefined && userProfile?.isPayoutEnabled && (
                        <View style={themedStyles.earningsHeaderContainer}>
                            <Animated.View>
                                <Typography
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    type="title-800"
                                    style={themedStyles.earningsTitle}
                                    accessibilityRole={undefined}>
                                    {bodyHeaderData.title}
                                </Typography>
                                {bodyHeaderData.type === 'Pending Earnings' && (
                                    <Typography
                                        numberOfLines={1}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        type="sub-body-700"
                                        style={themedStyles.earningsSubtitle}
                                        accessibilityRole={undefined}>
                                        {bodyHeaderData.subTitle}
                                    </Typography>
                                )}
                            </Animated.View>
                            <View style={{ position: 'relative' }}>
                                <Button
                                    testID="referral_collect_earnings"
                                    type="primary"
                                    text={bodyHeaderData.btnText}
                                    showLoader={false}
                                    textStyle={[styles.collectButtonText, { color: bodyHeaderData.btnColor }]}
                                    style={[
                                        themedStyles.collectButton,
                                        {
                                            borderColor: bodyHeaderData.btnBorderColor,
                                            backgroundColor:
                                                bodyHeaderData.type === 'Pending Earnings'
                                                    ? themeColors.Fill_neutralMin
                                                    : defaultColors.yellow700,
                                        },
                                    ]}
                                    onPress={() => {
                                        bodyHeaderData.btnAction();
                                    }}
                                />
                                {bodyHeaderData.type === 'Pending Earnings' && (
                                    <Animated.View style={styles.dotContainer}>
                                        <DotWithBorder />
                                    </Animated.View>
                                )}
                            </View>
                        </View>
                    )}

                    <Animated.Image
                        accessible={false}
                        source={
                            coverImage && appConfig.appType !== 'multimodal'
                                ? { uri: coverImage }
                                : mtIcReferralBackgroundImage
                        }
                        style={styles.referralImage}
                        resizeMode="contain"
                    />

                    <Typography
                        type="body-subtext"
                        style={themedStyles.inviteEarnText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userProfile?.isPayoutEnabled
                            ? userLanguageStrings.ReferAndEarnAmount(
                                  referralPayoutConfigV2.youGet,
                                  CURRENCY_SYMBOL.value,
                              )
                            : userLanguageStrings.InviteyourfriendsAndFamily}
                    </Typography>

                    <CodeAndShareButtonView
                        userProfile={userProfile}
                        themeColors={themeColors}
                        userLanguageStrings={userLanguageStrings}
                        rfDispatch={rfDispatch}
                    />
                </View>
                {userProfile?.isPayoutEnabled && (
                    <View style={themedStyles.infoContainer}>
                        <View style={styles.infoTextContainer}>
                            <Typography
                                type="title-800-rupee"
                                style={themedStyles.infoTitle}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {referralPayoutConfigV2.theyGet > 0
                                    ? userLanguageStrings.YouGetTheyGet(
                                          referralPayoutConfigV2.youGet,
                                          referralPayoutConfigV2.theyGet,
                                          CURRENCY_SYMBOL.value,
                                      )
                                    : `You Get ${CURRENCY_SYMBOL.value}${referralPayoutConfigV2.youGet}`}
                            </Typography>
                            <Typography
                                type="body-subtext"
                                style={themedStyles.infoDescription}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.ReferralCodeUsageInfo}
                            </Typography>
                        </View>
                        <View style={styles.faqContainer}>
                            <Pressable
                                accessibilityRole="button"
                                testID="referral_faq_text_press"
                                accessibilityLabel="Have Questions button"
                                onPress={() => {
                                    rfDispatch(createAction('FAQ_TEXT_PRESS', undefined));
                                }}>
                                <Typography
                                    type="body-6"
                                    style={themedStyles.faqText}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.HaveQuestions}
                                </Typography>
                            </Pressable>
                        </View>
                    </View>
                )}
            </ScrollView>

            <PopUpModal
                sheetRef={qrViewModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <QRViewModalFlow />
            </PopUpModal>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // Main container styles
    container: {
        flex: 1,
    },

    // Code and Share Button View styles
    codeShareContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 24,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 12,
    },
    codeTextContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    codeText: {
        textAlign: 'left',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    inviteCodeLabel: {
        textAlign: 'left',
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButton: {
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 24,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 18,
    },

    // Header styles
    headerSection: {
        paddingBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Earnings header styles
    earningsHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
    },
    earningsTitle: {
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: '800',
    },
    earningsSubtitle: {
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
    },
    collectButton: {
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 24,
        fontSize: 16,
        paddingHorizontal: 20,
    },
    collectButtonText: {
        fontSize: 16,
        fontWeight: '800',
    },
    dotContainer: {
        position: 'absolute',
        top: -0,
        right: -0,
    },

    // Image styles
    referralImage: {
        height: 280,
        width: '100%',
        resizeMode: 'contain',
    },

    // Typography styles
    inviteEarnText: {
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 30,
        lineHeight: 40,
        textAlign: 'center',
    },

    // Info section styles
    infoContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 24,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 12,
    },
    infoTextContainer: {
        flexDirection: 'column',
        padding: 12,
    },
    infoTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
    },
    infoDescription: {
        marginBottom: 12,
    },
    faqContainer: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 12,
    },
});

const getThemedStyles = (themeColors: ThemeTokens) => {
    return {
        container: {
            ...styles.container,
            backgroundColor: themeColors.Fill_neutralUltraLow,
        },
        codeShareContainer: {
            ...styles.codeShareContainer,
            backgroundColor: themeColors.Referral_Code_Share_Container_Color,
        },
        codeText: {
            ...styles.codeText,
            color: defaultColors.gray200,
        },
        actionButton: {
            ...styles.actionButton,
            backgroundColor: themeColors.Fill_neutralMin,
        },
        buttonText: {
            ...styles.buttonText,
            color: defaultColors.gray200,
            paddingTop: 2,
        },
        earningsHeaderContainer: {
            ...styles.earningsHeaderContainer,
            backgroundColor: defaultColors.yellow050,
        },
        earningsTitle: {
            ...styles.earningsTitle,
            color: defaultColors.gray200,
        },
        earningsSubtitle: {
            ...styles.earningsSubtitle,
            color: defaultColors.gray300,
        },
        collectButton: {
            ...styles.collectButton,
            borderColor: defaultColors.yellow700,
            backgroundColor: defaultColors.yellow700,
        },
        inviteEarnText: {
            ...styles.inviteEarnText,
            color: defaultColors.gray200,
        },
        infoContainer: {
            ...styles.infoContainer,
            backgroundColor: themeColors.Fill_neutralMin,
        },
        infoTitle: {
            ...styles.infoTitle,
            color: defaultColors.black900,
        },
        infoDescription: {
            ...styles.infoDescription,
            color: defaultColors.gray300,
        },
        faqText: {
            color: defaultColors.black600,
        },
        headerSection: {
            ...styles.headerSection,
            backgroundColor: themeColors.Referral_Header_Color,
        },
    };
};
