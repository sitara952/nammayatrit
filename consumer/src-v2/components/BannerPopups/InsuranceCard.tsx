import React from 'react';
import { Text, StyleSheet, Image, Platform, NativeModules } from 'react-native';
import Animated from 'react-native-reanimated';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import shieldImage from '@/typescript/assets/ny_ic_shield.webp';
import downloadIcon from '@/typescript/assets/ny_ic_download_icon.webp';
import { isNull } from 'lodash';
import { insuranceAPIEntity } from '@/readOnly/api/types/InsuranceAPIEntity.gen';
import RNFS from 'react-native-fs';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setToastProps } from '@/typescript/state/client/session';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { getFilePath } from '@/src-v2/utils/common';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

type InsuranceCardProps = {
    rideAssigned: boolean;
    policyGenerated: boolean;
    policyDetails: insuranceAPIEntity | null;
    insuredAmount: string;
};

const InsuranceCard = (props: InsuranceCardProps) => {
    const { rideInsuranceBottomSheetModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const dispatch = useAppDispatch();
    const themeColors = configManager.get('themeColors');
    const { bottom } = useSafeAreaInsets();

    const handleDownloadPolicy = async () => {
        if (!props.policyDetails?.certificateUrl) return;
        if (Platform.OS === 'ios') {
            await NativeModules['RNHTMLtoPDF'].downloadPdfFromUrl(props.policyDetails.certificateUrl);
            dispatch(
                setToastProps({
                    message: userLanguageStrings.InsuranceDownloadSuccessfully,
                    backgroundColor: `${colors.green900}`,
                    autoDismissAfter: 2000,
                    buttons: [],
                    visible: true,
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    logo: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
        } else {
            const date = new Date();
            const fileName = `Insurance_Policy_${date.getTime()}.pdf`;

            const filePath = getFilePath() + '/' + fileName;
            try {
                await RNFS.downloadFile({
                    fromUrl: props.policyDetails.certificateUrl,
                    toFile: filePath || '',
                    background: true,
                }).promise;
                await NativeModules['RNHTMLtoPDF'].sendNotification({
                    file: filePath,
                    title: userLanguageStrings.InsuranceDownload,
                    description: userLanguageStrings.InsuranceHasBeenDownloadSuccessfully,
                });
            } catch (error) {
                console.error('Download Policy Details failed: ', error);
                dispatch(
                    setToastProps({
                        message: userLanguageStrings.DownloadFailedPleaseTryAgain,
                        backgroundColor: `${themeColors.Fill_negativeHigh}`,
                        autoDismissAfter: 2000,
                        buttons: [],
                        visible: true,
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: undefined,
                        logo: undefined,
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
            }
        }
    };

    return (
        <Animated.View style={[styles.container, { paddingBottom: bottom - 15 }]}>
            <Image source={shieldImage} style={styles.image} resizeMode="contain" />
            <Typography
                type="subhead-800"
                style={styles.title}
                accessible={true}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessibilityRole={undefined}
                accessibilityLabel={undefined}>
                {isNull(props.policyDetails)
                    ? userLanguageStrings.ThisRideComesWithFreeInsurance
                    : userLanguageStrings.YouCoveredThisRideIsInsuredForFree}
            </Typography>
            <Typography
                style={styles.subtitle}
                type="subhead-800"
                accessible={true}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessibilityRole={undefined}
                accessibilityLabel={undefined}>
                {props.rideAssigned
                    ? props.policyGenerated
                        ? isNull(props.policyDetails) || !props.policyDetails.policyNumber
                            ? userLanguageStrings.GeneratingYourPolicyPleaseTryAgain
                            : userLanguageStrings.PolicyNumber +
                              ' - ' +
                              props.policyDetails.policyNumber +
                              '\n' +
                              userLanguageStrings.SumInsured +
                              ' - ' +
                              props.insuredAmount
                        : userLanguageStrings.YouPolicyGetsGeneratesOnceTheRideStarts
                    : userLanguageStrings.EnjoyInsuranceCoverageofBikeAndCab}
            </Typography>
            {!isNull(props.policyDetails) && props.policyDetails.policyNumber && (
                <TouchableOpacity
                    style={{ flexDirection: 'row', marginTop: 30 }}
                    testID="download_insurance"
                    accessibilityRole={undefined}
                    onPress={handleDownloadPolicy}>
                    <Image
                        source={downloadIcon}
                        style={{ width: 18, height: 18, marginRight: 5 }}
                        resizeMode="contain"
                    />
                    <Text style={styles.downloadButton}>{userLanguageStrings.DownloadPolicy}</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={styles.button}
                testID="insurance_card_got_it"
                accessibilityRole={undefined}
                onPress={() => {
                    rideInsuranceBottomSheetModalRef.current?.close();
                }}>
                <Text style={styles.buttonText}>{userLanguageStrings.GotIt + '!'}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1680F7',
        padding: 24,
        alignItems: 'center',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    image: {
        width: 350,
        height: 200,
        marginVertical: 15,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 25,
        marginBottom: 15,
        marginTop: 5,
    },
    subtitle: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '600',
    },
    downloadButton: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignSelf: 'stretch',
        marginTop: 38,
    },
    buttonText: {
        color: '#1680F7',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default React.memo(InsuranceCard);
