import React from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useGetRemoteConfigTexts } from '@/src-v2/hooks/useGetRemoteConfigTexts';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const CancellationInfoModal: React.FC<Props> = ({ visible, onClose }) => {
    const { getCancellationTexts } = useGetRemoteConfigTexts();
    const { chooseRideCancellationFeeInfoText } = getCancellationTexts;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Modal visible={visible} transparent statusBarTranslucent animationType="fade" onRequestClose={onClose}>
            <View style={StyleSheet.absoluteFill}>
                {Platform.OS === 'ios' ? (
                    <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={3} />
                ) : (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.65)' }]} />
                )}
            </View>
            <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(160)} style={styles.center}>
                <Animated.View>
                    <View style={styles.card}>
                        <Typography
                            type="body-1"
                            style={tailwind.style('text-[#454C55] text-[14px] px-1')}
                            numberOfLines={3}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={chooseRideCancellationFeeInfoText}
                            accessibilityRole="text">
                            {chooseRideCancellationFeeInfoText}
                        </Typography>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            testID="got-it-button"
                            onPress={onClose}
                            accessibilityRole="button"
                            accessibilityLabel={userLanguageStrings.GotIt}>
                            <Typography
                                type="body-1"
                                style={tailwind.style('text-[#004FB6] text-[14px] px-1')}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={false}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.GotIt}
                            </Typography>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 26,
    },
    card: {
        minHeight: 144,
        backgroundColor: '#F8F8F8',
        borderRadius: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 32,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    divider: {
        height: 1,
        alignSelf: 'stretch',
        backgroundColor: '#E0E3E8',
    },
});

export default CancellationInfoModal;
