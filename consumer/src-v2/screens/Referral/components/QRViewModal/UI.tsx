import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { QRViewModalUIProps } from './Types';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import QRCode from 'react-native-qrcode-svg';
import { createAction, generateReferralLink } from '@/typescript/utils/common';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';

const { width } = Dimensions.get('window');

export const QRViewModalUI: React.FC<QRViewModalUIProps> = ({
    appName,
    cityName,
    iconURL,
    customerReferralCode,
    qrDispatch,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const dynamicStyles = createDynamicStyles(themeColors);

    const qrCodeSize = Math.min(width * 0.9, 360);

    return (
        <Animated.View style={styles.container}>
            <Animated.View style={styles.headerContainer}>
                <Typography
                    type="subhead-800"
                    style={dynamicStyles.headerText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Download + ' ' + appName}
                </Typography>
                <Typography
                    type="subhead-2"
                    style={dynamicStyles.subHeaderText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.ScanQrCodeToDownloadTheAppAndApplyYourInviteCodeAutomatically}
                </Typography>
            </Animated.View>
            <Animated.View>
                <QRCode
                    value={generateReferralLink(`${cityName}`, 'share', 'referral', 'refer', customerReferralCode)}
                    size={qrCodeSize}
                    logo={iconURL}
                    logoSize={50}
                    logoMargin={1}
                    logoBackgroundColor={'white'}
                    logoBorderRadius={16}
                />
            </Animated.View>
            <Animated.View style={styles.buttonContainer}>
                <Button
                    testID="qr_modal_back_press"
                    style={styles.button}
                    textStyle={dynamicStyles.buttonText}
                    type="secondary"
                    onPress={() => {
                        qrDispatch(createAction('GO_BACK_CLICKED', undefined));
                    }}
                    text={userLanguageStrings.GoBack}
                />
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 'auto',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginVertical: 20,
    },
    headerContainer: {
        marginBottom: 20,
        marginRight: 10,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
        marginBottom: 24,
    },
    button: {
        justifyContent: 'center',
    },
});

const createDynamicStyles = (themeColors: ThemeTokens) =>
    StyleSheet.create({
        headerText: {
            marginBottom: 8,
            color: themeColors.Text_neutralMax,
            fontSize: 16,
        },
        subHeaderText: {
            color: defaultColors.gray300,
            fontSize: 14,
        },
        buttonText: {
            textAlign: 'center',
            color: themeColors.Text_neutralMax,
        },
    });
