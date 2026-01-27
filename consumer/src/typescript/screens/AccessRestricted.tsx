import mtIcUnserviceableLocation from '../assets/mt_ic_unserviceable_location.webp';
import React, { useCallback } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Typography from '../designSystem/components/primitives/Typography';
import colors from '../designSystem/colorPalette';
import { useConfigContext } from '../context/ConfigContext';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useRefsContext } from '../context/RefsContext';
import LogoutModal from '../components/LogOut';
import { ImageSourcePropType } from 'react-native';
import { MainNavigationParamList } from '../navigation/globalParamList';
import { Pressable } from '@/src-v2/primitives/Pressable';
import mtIcAccountBlocked from '../assets/mt_ic_account_blocked.webp';

interface RestrictionContent {
    image: ImageSourcePropType;
    title: string;
    description: string;
    accessibilityLabelTitle: string;
    accessibilityLabelDesc: string;
    imageHeight: number;
    imageWidth: number;
}

interface AccessRestrictedProps {
    restrictionType: 'ACCOUNT_BLOCKED' | 'LOCATION_UNSERVICEABLE';
}

const AccessRestricted: React.FC<AccessRestrictedProps> = ({ restrictionType }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const navigation: DrawerNavigationProp<MainNavigationParamList> = useNavigation();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { logoutModalRef } = useRefsContext();

    const restrictionContentMap: Record<'ACCOUNT_BLOCKED' | 'LOCATION_UNSERVICEABLE', RestrictionContent> = {
        ACCOUNT_BLOCKED: {
            image: mtIcAccountBlocked,
            title: userLanguageStrings.AccountBlocked,
            description: userLanguageStrings.AccountBlockedInfo,
            accessibilityLabelTitle: 'Account Blocked',
            accessibilityLabelDesc:
                'Your account has been blocked! You can access ride history and other settings from the menu on the top left.',
            imageHeight: 122,
            imageWidth: 170,
        },
        LOCATION_UNSERVICEABLE: {
            image: mtIcUnserviceableLocation,
            title: userLanguageStrings.Locationunserviceable,
            description: userLanguageStrings.LocationUnserviceableInfo,
            accessibilityLabelTitle: 'Location unserviceable',
            accessibilityLabelDesc:
                'We are not live in your area yet! You can access ride history and other settings from the menu on the top left.',
            imageHeight: 122,
            imageWidth: 93,
        },
    };

    const content = restrictionContentMap[restrictionType];

    const handleReportIssue = useCallback(() => {
        navigation.navigate('ProfileTab', {
            screen: 'helpAndSupportNavigator',
            params: { screen: 'helpAndSupportScreen' },
        });
    }, [navigation]);
    return (
        <>
            <View style={styles.container}>
                <View style={[styles.bottomSheet, { backgroundColor: themeColors.Fill_neutralMin }]}>
                    <View style={[styles.handle, { backgroundColor: colors.recovered.handle }]} />
                    <Image
                        accessible={true}
                        accessibilityLabel="access restricted image"
                        style={[styles.image, { height: content.imageHeight, width: content.imageWidth }]}
                        source={content.image}
                    />
                    <Typography
                        type="subhead-800"
                        style={styles.title}
                        accessible={true}
                        accessibilityLabel={content.accessibilityLabelTitle}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessibilityRole={undefined}>
                        {content.title}
                    </Typography>
                    <Typography
                        accessible={true}
                        accessibilityLabel={content.accessibilityLabelDesc}
                        type="body-subtext"
                        style={[styles.description, { color: colors?.recovered?.neutralHigh }]}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessibilityRole={undefined}>
                        {content.description}
                    </Typography>
                    <Typography
                        accessible={true}
                        accessibilityLabel="Facing problems with the app?"
                        type="sub-body-500"
                        style={[styles.facingProblems, { color: colors?.recovered?.neutralHigh }]}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.FacingProblemsWithTheApp}
                    </Typography>
                    <Pressable
                        accessibilityRole="button"
                        testID="access_restricted_report_issue"
                        accessibilityLabel="Button: Tap here to report an issue"
                        onPress={handleReportIssue}>
                        <Typography
                            accessible={true}
                            accessibilityLabel="Button: Tap here to report an issue"
                            type="sub-body-700"
                            style={{ color: themeColors.Text_info }}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.TapHereToReportAnIssue}
                        </Typography>
                    </Pressable>
                </View>
            </View>
            <PopUpModal
                sheetRef={logoutModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <LogoutModal buttonColor={undefined} navigateBack={undefined} closeModal={undefined} />
            </PopUpModal>
        </>
    );
};

const styles = StyleSheet.create({
    hamburgerStyle: {
        position: 'absolute',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 8,
        paddingBottom: 40,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    image: {
        marginTop: 28,
    },
    title: {
        paddingBottom: 6,
        paddingTop: 16,
    },
    description: {
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    facingProblems: {
        paddingTop: 38,
    },
    handle: {
        width: 28,
        height: 3,
        borderRadius: 2,
        marginTop: 2,
    },
});

export default AccessRestricted;
