import React, { useCallback } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import Animated from 'react-native-reanimated';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';

interface HelpAndSupportModalProps {
    onClose: (() => void) | undefined;
    onNavigateToSupport: () => void;
}

export const HelpAndSupportModal: React.FC<HelpAndSupportModalProps> = ({ onClose, onNavigateToSupport }) => {
    const configManager = useConfigContext();
    const { bottom } = useSafeAreaInsets();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appConfig = useAppSelector(selectAppConfig);
    const supportNumberRaw = appConfig?.screenConfig?.helpAndSupport?.MTCSupportNumber;
    const supportNumber = supportNumberRaw ? supportNumberRaw : undefined;

    const handleCallSupport = () => {
        if (!supportNumber) {
            console.warn('MTC support number not configured');
            return;
        }

        try {
            Linking.openURL(`tel:${supportNumber}`);
        } catch (error) {
            console.error('Error opening phone dialer:', error);
        }
    };

    const handleHelpAndSupportPress = useCallback(() => {
        onClose?.();
        onNavigateToSupport();
    }, [onClose, onNavigateToSupport]);

    return (
        <>
            <Animated.View style={styles.modalContent}>
                <Typography
                    style={tailwind.style(' font-areaNormal-bold my-2 mb-4')}
                    type={'title-2'}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={'Call Support'}
                    accessibilityRole={'text'}>
                    {userLanguageStrings.GetSupport || 'Get Support'}
                </Typography>
                <Typography
                    style={styles.modalDescription}
                    type={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    If you face any difficulties, please contact MTC support.
                </Typography>
                <View style={[styles.modalButtons, tailwind.style(`mb-[${bottom - 40}px]`)]}>
                    <Button
                        testID={'pass_help_and_support'}
                        onPress={handleHelpAndSupportPress}
                        type={'secondary'}
                        text={userLanguageStrings.HelpandSupport || 'Help & Support'}
                        textColor={'#000000'}
                    />
                    {supportNumber && (
                        <Button
                            testID={'pass_call_support'}
                            onPress={handleCallSupport}
                            type={'primary'}
                            text={userLanguageStrings.Call || 'Call'}
                            textColor={'#ffffff'}
                            bgColor="#313131"
                            size="lg"
                            textStyle={tailwind.style('text-white font-areaNormal-bold text-[16px]')}
                            style={tailwind.style('h-14 flex items-center justify-center rounded-2xl')}
                        />
                    )}
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 40,
        borderRadius: 58,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        color: '#1F2937',
        textAlign: 'left',
        marginBottom: 16,
        lineHeight: 24,
    },
    modalDescription: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'AreaNormal-Bold',
        textAlign: 'left',
        lineHeight: 25,
        marginBottom: 16,
        letterSpacing: 0.25,
    },
    modalButtons: {
        gap: 12,
    },
});
