import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppReadableName } from '@/typescript/state/client/session';
import { ReferralInfoModalUIProps } from './Types';
import { colors } from 'config-types/src/domain/default/themes/colors';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

export const ReferralInfoModal: React.FC<ReferralInfoModalUIProps> = ({
    referralInfoModalRef,
    referralModalRef,
    handleTermsPress,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();
    const appDisplayName = useAppSelector(selectAppReadableName);
    return (
        <Animated.View style={[styles.container, { paddingBottom: bottom }]}>
            <View style={styles.contentContainer}>
                <Typography
                    type="subhead-800"
                    style={styles.title}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.WhatisReferralProgram}
                </Typography>
                <Typography
                    type="body-subtext"
                    style={styles.description}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {'\n' + userLanguageStrings.ReferralProgramContext(appDisplayName)}
                </Typography>
                <TouchableOpacity
                    testID="referral_info_terms_and_conditions"
                    onPress={handleTermsPress}
                    accessibilityRole="link"
                    accessibilityLabel={userLanguageStrings.ReferTAndC}>
                    <Typography
                        type="body-subtext"
                        style={styles.termsText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={true}
                        accessibilityLabel={userLanguageStrings.ReferTAndC}
                        accessibilityRole={undefined}>
                        {'\n'}
                        {userLanguageStrings.ReferTAndC}
                    </Typography>
                </TouchableOpacity>
                <Button
                    type="primary"
                    text={userLanguageStrings.GotIt}
                    style={styles.button}
                    disabled={undefined}
                    isLoading={undefined}
                    testID="referral-info-got-it-button"
                    onPress={() => {
                        referralInfoModalRef.current?.dismiss();
                        referralModalRef.current?.present();
                    }}
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 24,
        marginHorizontal: 4,
    },
    contentContainer: {
        width: '100%',
    },
    title: {
        textAlign: 'left',
        marginHorizontal: 16,
    },
    description: {
        textAlign: 'left',
        marginHorizontal: 16,
    },
    termsText: {
        textAlign: 'left',
        marginHorizontal: 16,
        color: colors.black600,
    },
    button: {
        marginHorizontal: 16,
        marginTop: 20,
        justifyContent: 'center',
    },
});
