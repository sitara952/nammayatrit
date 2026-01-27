import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Keyboard } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import mtIcCollectEarningBg from '@/typescript/assets/ny-service/mt_ic_collect_earning_bg.webp';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { CollectReferralEarningUIProps } from './Types.tsx';
import { getStringItem, MMKVKey } from '@/typescript/utils/MMKV';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import { createAction } from '@/typescript/utils/common.ts';

export const CollectReferralEarningUI: React.FC<CollectReferralEarningUIProps> = ({
    upiId,
    stage,
    verifyData,
    handleTextChange,
    customerFirstRide,
    crDispatch,
    referralYouGet,
}) => {
    const input = useRef<TextInput | null>(null);
    const mobileNumber = getStringItem(MMKVKey.MOBILE_NUMBER);
    const upi = `${mobileNumber}@upi`;

    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const scrollViewRef = useRef<ScrollView | null>(null);
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }
        });

        return () => {
            keyboardDidShowListener.remove();
        };
    }, []);

    return (
        <BottomSheetScrollView scrollEnabled ref={scrollViewRef} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Typography
                    type="subhead-1"
                    style={styles.titleContainer}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {customerFirstRide
                        ? userLanguageStrings.YouveEarnedXForTakingYourFirstRide(referralYouGet)
                        : userLanguageStrings.CollectReferralEarnings}
                </Typography>

                <View style={styles.imageContainer}>
                    <Image
                        source={mtIcCollectEarningBg}
                        style={styles.image}
                        resizeMode="contain"
                        accessible={true}
                        accessibilityLabel="collect referral earning image"
                    />
                </View>

                <Typography
                    type="body-subtext"
                    style={styles.description}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.VerifyYourUpiIdToReceiveYourReferralEarnings}
                </Typography>

                <View style={styles.inputContainer}>
                    <BottomSheetTextInput
                        style={[styles.textInput, { borderColor: verifyData.borderColor }]}
                        selectTextOnFocus
                        autoFocus
                        value={upiId}
                        ref={input}
                        placeholder={upi}
                        onChangeText={handleTextChange}
                    />
                    <View style={styles.buttonContainer}>
                        <Button
                            testID="collect_referral_earning_verify_upi"
                            type="primary"
                            size="md"
                            showLoader={false}
                            onPress={() => crDispatch(createAction('VERIFY_VPA_CLICKED', undefined))}
                            disabled={upiId.length === 0}
                            style={[
                                styles.verifyButton,
                                { backgroundColor: verifyData.bgColor },
                                stage === 'isLoading' ? { borderWidth: 1, borderColor: '#E1E3E7' } : {},
                            ]}
                            text={verifyData.text}
                            textStyle={upiId.length === 0 ? { color: '#A3A3A3' } : { color: verifyData.textColor }}
                            prefix={verifyData.icon}
                        />
                    </View>
                </View>

                <Typography
                    type="sub-body-700"
                    style={[styles.statusMessage, { color: verifyData.subTitleTextColor }]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {verifyData.subtitleText}
                </Typography>

                <Button
                    testID="collect_referral_earning_got_it"
                    type="primary"
                    disabled={stage !== 'success'}
                    textColor={themeColors.where_you_going_text}
                    style={[styles.confirmButton, { backgroundColor: themeColors.where_you_going_bg }]}
                    onPress={() => {
                        crDispatch(createAction('GOT_IT_CLICKED', undefined));
                    }}
                    text={userLanguageStrings.CollectEarnings}
                />
            </View>
        </BottomSheetScrollView>
    );
};

// StyleSheet definition
const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        height: 'auto',
    },
    titleContainer: {
        paddingVertical: 10,
    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        height: 250, // h-64 in tailwind
    },
    description: {
        marginVertical: 10,
        textAlign: 'center',
    },
    inputContainer: {
        position: 'relative',
    },
    textInput: {
        width: '100%',
        height: 72, // h-18 in tailwind
        fontSize: 18,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
    },
    buttonContainer: {
        position: 'absolute',
        right: 20,
        bottom: 16,
    },
    verifyButton: {
        borderRadius: 24,
    },
    statusMessage: {
        marginVertical: 8,
        textAlign: 'left',
        fontSize: 12,
        fontWeight: '700',
    },
    confirmButton: {
        marginTop: 8,
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
