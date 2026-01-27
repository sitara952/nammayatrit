import React from 'react';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Header } from '@/src-v2/primitives/Header';
import { ReferralFAQScreenProps } from './Types';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';

export const ReferralFAQUI: React.FC<ReferralFAQScreenProps> = ({
    onBackPress,
    userLanguageStrings,
    themeColors,
    referralPayoutConfigV2,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const dynamicStyles = createDynamicStyles(themeColors);

    const handleTermsPress = () => {
        navigation.navigate('webView', {
            url: referralPayoutConfigV2.termsLink,
            goBack: undefined,
        });
    };

    return (
        <Animated.View style={dynamicStyles.backgroundView}>
            <Header title={userLanguageStrings.FAQs} onBackPress={onBackPress} style={styles.headerStyle} />
            <View style={styles.container}>
                {userLanguageStrings.ReferralFAQItems.map((item, index) => (
                    <View key={index} style={styles.faqItem}>
                        <Typography
                            style={dynamicStyles.faqText}
                            type="body"
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {`${index + 1}. ${item}`}
                        </Typography>
                        {index === 2 && (
                            <View style={styles.termsContainer}>
                                <TouchableOpacity
                                    testID={`handle_terms_press_${index}`}
                                    onPress={handleTermsPress}
                                    accessibilityRole="link"
                                    accessibilityLabel={'Read Terms and conditions button'}>
                                    <Typography
                                        style={dynamicStyles.termsText}
                                        type="subhead"
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={true}
                                        accessibilityLabel={userLanguageStrings.ReadTermsAndConditions}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.ReadTermsAndConditions}
                                    </Typography>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        padding: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 24,
    },
    faqItem: {
        marginBottom: 16,
    },
    termsContainer: {
        marginTop: 20,
        alignItems: 'center',
        marginBottom: 0,
    },
    headerStyle: {
        marginBottom: 20,
    },
});

const createDynamicStyles = (themeColors: ThemeTokens) =>
    StyleSheet.create({
        backgroundView: {
            flex: 1,
            backgroundColor: themeColors.Fill_neutralLow,
        },
        faqText: {
            color: colors.gray150,
            fontWeight: 'bold',
        },
        termsText: {
            color: colors.black600,
        },
    });
