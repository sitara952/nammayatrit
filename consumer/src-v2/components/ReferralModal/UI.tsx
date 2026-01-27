import React, { useEffect, useRef } from 'react';
import { View, Image, Keyboard } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import colors from '@/typescript/designSystem/colorPalette';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';
import { StyleSheet } from 'react-native';
import Button from '../../primitives/Button.tsx';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ReferralInputProps, ReferralModalUIProps } from './types';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import { createAction } from '@/typescript/utils/common.ts';
import { useRefsContext } from '@/typescript/context/RefsContext.tsx';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserProfile } from '@/typescript/state/client/user';
import { InfoIcon } from '@/typescript/assets/svg/symbols/InfoIcon.tsx';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets.ts';
import { selectReferralPayoutConfigV2 } from '@/typescript/state/client/session.ts';

const ReferralInput: React.FC<ReferralInputProps> = ({
    headerText,
    setReferralCode,
    utmReferralCode,
    userLanguageStrings,
    validReferralCode,
    applyReferralError,
    rmDispatch,
}) => {
    const dropLocationTextInputRef = useRef(null);
    const { referralInfoModalRef } = useRefsContext();
    const userProfile = useAppSelector(selectUserProfile);
    const styles = createStyles(useConfigContext().get('themeColors'));

    return (
        <View style={styles.referralInputContainer}>
            {headerText != null ? (
                <View style={styles.headerContainer}>
                    <Typography
                        type="subhead"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {headerText}
                    </Typography>
                    {userProfile?.isPayoutEnabled && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="referral_info_modal_button"
                            onPress={() => {
                                referralInfoModalRef.current?.present();
                            }}
                            style={styles.infoButton}>
                            <InfoIcon fill={defaultColors.black600} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : null}
            <View style={styles.textInputContainer}>
                <BottomSheetTextInput
                    ref={dropLocationTextInputRef}
                    autoFocus
                    style={styles.textInput}
                    onChangeText={setReferralCode}
                    selectTextOnFocus
                    maxLength={9}
                    defaultValue={utmReferralCode ?? ''}
                />
            </View>
            {applyReferralError || !validReferralCode ? (
                <Typography
                    type="body-subtext"
                    style={styles.errorText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.invalidCode}
                </Typography>
            ) : null}
            <Button
                testID="referral_modal_apply_referral"
                type="primary"
                style={styles.applyButton}
                text={userLanguageStrings.Apply}
                onPress={() => {
                    rmDispatch(createAction('APPLY_REFERRAL_CLICKED', undefined));
                }}
            />
        </View>
    );
};

const HeaderView: React.FC = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const styles = createStyles(configManager.get('themeColors'));
    return (
        <View style={styles.headerViewContainer}>
            <View style={styles.headerViewColumn}>
                <Typography
                    type="subhead"
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.haveReferral}
                </Typography>
            </View>
        </View>
    );
};

export const ReferralModalUI: React.FC<ReferralModalUIProps> = ({
    utmReferralCode,
    setReferralCode,
    validReferralCode,
    applyReferralError,
    rmDispatch,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const scrollViewRef = useRef<ScrollView | null>(null);
    const { bottom } = useSafeAreaInsets();
    const styles = createStyles(configManager.get('themeColors'));
    const referralPayoutConfigV2 = useAppSelector(selectReferralPayoutConfigV2);
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
            <View style={[styles.container, { paddingBottom: bottom }]}>
                <HeaderView />
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: referralPayoutConfigV2.modalImage }}
                        style={styles.image}
                        accessible={true}
                        accessibilityLabel="apply referral image"
                    />
                </View>

                <ReferralInput
                    headerText={userLanguageStrings.EnterReferralCode}
                    setReferralCode={setReferralCode}
                    utmReferralCode={utmReferralCode}
                    userLanguageStrings={userLanguageStrings}
                    validReferralCode={validReferralCode}
                    applyReferralError={applyReferralError}
                    rmDispatch={rmDispatch}
                />
            </View>
        </BottomSheetScrollView>
    );
};

const createStyles = (themeColors: ThemeTokens) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.primitive.gray[11],
            paddingTop: 20,
            borderTopEndRadius: 24,
            borderTopStartRadius: 24,
            paddingHorizontal: 16,
            height: '100%',
        },
        imageContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        image: {
            marginHorizontal: 20,
            paddingHorizontal: 16,
            width: '100%',
            height: 256,
            marginVertical: 8,
            borderRadius: 12.5,
        },

        // ReferralInput styles
        referralInputContainer: {
            flexDirection: 'column',
        },
        headerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        infoButton: {
            marginLeft: 8,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        textInputContainer: {
            borderRadius: 12,
            marginVertical: 8,
            borderWidth: 1,
            borderColor: '#A3A3A3',
            paddingVertical: 4,
        },
        textInput: {
            alignSelf: 'stretch',
            textAlign: 'center',
            paddingVertical: 8,
        },
        errorText: {
            color: themeColors.Text_negativeHigh,
            fontSize: 14,
        },
        applyButton: {
            marginTop: 8,
            justifyContent: 'center',
        },

        // HeaderView styles
        headerViewContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
        },
        headerViewColumn: {
            flexDirection: 'column',
        },
    });
