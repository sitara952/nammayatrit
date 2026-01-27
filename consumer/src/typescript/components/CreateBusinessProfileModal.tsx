import React, { useEffect } from 'react';
import { AccessibilityInfo, View, StyleSheet, Image } from 'react-native';
import Typography from '../designSystem/components/primitives/Typography';
import Button from '../../../src-v2/primitives/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList';
import Tick from './svg/Tick';
import BusinessGetStartedImg from '@/src-v2/assets/ny_ic_business_get_started.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppReadableName } from '@/typescript/state/client/session';

type Props = {
    closeModal: (() => void) | undefined;
    onGetStarted: (() => void) | undefined;
    shouldNavigate: boolean | undefined;
};

const CreateBusinessProfileModal: React.FC<Props> = ({
    closeModal = () => {},
    onGetStarted = () => {},
    shouldNavigate = true,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appName = useAppSelector(selectAppReadableName);
    const { bottom } = useSafeAreaInsets();
    const handleGetStarted = () => {
        closeModal();
        onGetStarted();
        if (shouldNavigate) {
            navigation.navigate('ProfileTab', {
                screen: 'businessProfileScreen',
                params: { isBusinessProfileVerified: false },
            });
        }
    };

    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions('Business profile modal', {
            queue: true,
        });
    }, []);

    return (
        <View style={[styles.container, { paddingBottom: bottom }]}>
            {/* Title */}
            <Typography
                type="title"
                style={styles.title}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.NammaYatriForBusinessIsHere(appName)}
            </Typography>

            {/* Illustration Section */}
            <View style={styles.illustrationContainer}>
                <Image
                    source={BusinessGetStartedImg}
                    resizeMode="contain"
                    style={styles.illustrationImage}
                    accessible={false}
                />
            </View>

            {/* Benefits List */}
            <View style={styles.benefitsContainer}>
                <View style={styles.benefitItem}>
                    <View style={styles.checkmarkContainer}>
                        <Tick fill="#53BB6F" size={20} />
                    </View>
                    <Typography
                        type="subhead-600"
                        style={styles.benefitText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {
                            userLanguageStrings.SeparateRideHistoryAndInvoicesBetweenBusinessVsPersonalToEnsureReconciliationIsEasy
                        }
                    </Typography>
                </View>

                <View style={styles.benefitItem}>
                    <View style={styles.checkmarkContainer}>
                        <Tick fill="#53BB6F" size={20} />
                    </View>
                    <Typography
                        type="subhead-600"
                        style={styles.benefitText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.SaveTimeWithAutomaticReceiptUploadsViaExpenseIntegrations}
                    </Typography>
                </View>

                <View style={styles.benefitItem}>
                    <View style={styles.checkmarkContainer}>
                        <Tick fill="#53BB6F" size={20} />
                    </View>
                    <Typography
                        type="subhead-600"
                        style={styles.benefitText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.EnjoyTravelBenefitsBasedOnExclusivePartnerships}
                    </Typography>
                </View>
            </View>

            {/* Get Started Button */}
            <Button
                testID="business_profile_get_started_button"
                type="primary"
                text={userLanguageStrings.GetStarted}
                onPress={handleGetStarted}
                accessibilityLabel="Get started with business profile"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingTop: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        position: 'relative',
    },
    illustrationContainer: {
        width: '100%',
        height: 200,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustrationImage: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#14171F',
        marginBottom: 12,
        textAlign: 'left',
    },
    benefitsContainer: {
        marginBottom: 32,
        gap: 16,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    checkmarkContainer: {
        marginTop: 2,
    },
    benefitText: {
        fontSize: 15,
        color: '#14171F',
        lineHeight: 22,
        flex: 1,
    },
    getStartedButton: {
        marginTop: 0,
        justifyContent: 'center',
        backgroundColor: '#14171F',
    },
});

export default CreateBusinessProfileModal;
