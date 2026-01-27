import React from 'react';
import colors from '../designSystem/colorPalette';
import ChevronLeftIcon from './common/ChevronLeftIcon.tsx';
import { tailwind } from '../tailwindTheme/tailwind';
import LogOut from './LogOut.tsx';
import { View, Text, StyleSheet, SafeAreaView, ViewProps, Keyboard, Platform } from 'react-native';
import sharedStyles from '../constants/style.tsx';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useConfigContext } from '../context/ConfigContext.tsx';
import { OnboardingNavigationParamList } from '../navigation/globalParamList.tsx';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { PopUpModal } from './PopUpModal.tsx';
import { useRefsContext } from '../context/RefsContext.tsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StepIndicator = {
    currentStep: number;
    totalSteps: number;
};

interface HeaderProps extends ViewProps {
    title: string;
    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    navigation: NativeStackNavigationProp<OnboardingNavigationParamList, any>;
    backEnabled?: boolean;
    isLoggedIn?: boolean;
    stepIndicator?: StepIndicator;
    onLogout?: () => void;
    testID: string;
}

const Header: React.FC<HeaderProps> = ({
    title,
    navigation: { goBack },
    backEnabled = true,
    isLoggedIn = false,
    stepIndicator,
    onLogout,
    accessibilityElementsHidden,
    importantForAccessibility,
    testID,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const flexValue = stepIndicator && (stepIndicator.totalSteps <= 0 ? 1 : 0.9 / stepIndicator.totalSteps);
    const navigation = useNavigation<NativeStackNavigationProp<OnboardingNavigationParamList>>();
    const { logoutModalRef } = useRefsContext();
    const { top } = useSafeAreaInsets();

    return (
        <View
            style={{ ...styles.mainContainer }}
            accessibilityElementsHidden={accessibilityElementsHidden}
            importantForAccessibility={importantForAccessibility}>
            <SafeAreaView style={{ minHeight: 130 }}>
                <View
                    style={[
                        styles.appBarContainer,
                        tailwind.style(Platform.OS === 'android' ? `pt-[${top + 2}px]` : 'pt-20px'),
                    ]}>
                    <View style={styles.backButtonContainer}>
                        {backEnabled && (
                            <TouchableOpacity
                                testID={testID}
                                accessible={true}
                                accessibilityHint="Go Back"
                                accessibilityRole="button"
                                onPress={() => {
                                    Keyboard.dismiss();
                                    stepIndicator?.currentStep == 3 ? logoutModalRef.current?.present() : goBack();
                                }}>
                                <ChevronLeftIcon />
                            </TouchableOpacity>
                        )}
                    </View>
                    {stepIndicator && (
                        <View
                            style={styles.stepContainer}
                            accessibilityElementsHidden={true}
                            importantForAccessibility="no-hide-descendants">
                            {Array.from({ length: stepIndicator.totalSteps }, (_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.stepIndicator,
                                        index < stepIndicator.currentStep ? styles.stepIndicatorActive : null,
                                        { flex: flexValue },
                                    ]}
                                />
                            ))}
                            <Text
                                accessible={true}
                                accessibilityHint={(stepIndicator.currentStep / stepIndicator.totalSteps).toString()}
                                style={{
                                    ...sharedStyles.bodyText,
                                    ...sharedStyles.headerTextColor,
                                    paddingLeft: 8,
                                }}>
                                {stepIndicator.currentStep} / {stepIndicator.totalSteps}
                            </Text>
                        </View>
                    )}
                    {isLoggedIn && (
                        <View style={styles.logoutContainer}>
                            <Text onPress={onLogout} style={styles.logoutButton}>
                                {userLanguageStrings.Logout}
                            </Text>
                        </View>
                    )}
                </View>

                <Text
                    accessible={false}
                    style={[tailwind.style('bg-[#F8F9FB] px-5 pt-3 text-[#14171F] text-xl my-3 font-semibold')]}>
                    {title}
                </Text>
            </SafeAreaView>

            <PopUpModal
                sheetRef={logoutModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <LogOut
                    closeModal={() => {
                        logoutModalRef.current?.dismiss();
                    }}
                    navigateBack={() => {
                        navigation.popTo('GettingStartedCarousel');
                    }}
                    buttonColor={undefined}
                />
            </PopUpModal>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        minHeight: 130,
        backgroundColor: colors.primitive.gray[11],
    },
    appBarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
    },
    backButtonContainer: {
        justifyContent: 'flex-start',
    },
    logoutContainer: {
        justifyContent: 'flex-end',
        paddingLeft: 8,
    },
    headerContainer: {
        flex: 1,
        backgroundColor: `${colors?.recovered?.neutralMax}`,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    logoutButton: {
        color: `${colors?.recovered?.neutralMin}`,
        borderColor: `${colors?.recovered?.neutralMin}`,
        borderWidth: 1,
        borderRadius: 15,
        padding: 5,
        paddingHorizontal: 10,
    },
    stepContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        paddingLeft: 16,
    },
    stepIndicator: {
        height: 2,
        backgroundColor: colors.primitive.gray[14],
        paddingRight: 8,
    },
    stepIndicatorActive: {
        height: 2,
        backgroundColor: sharedStyles.black800.color,
        paddingRight: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '100%',
        backgroundColor: 'white',
        padding: 0,
        borderRadius: 10,
    },
});

export default Header;
