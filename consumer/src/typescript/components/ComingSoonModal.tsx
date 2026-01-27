import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Pressable } from '@/src-v2/primitives/Pressable';
import CloseIcon from '@/typescript/components/svg/CloseIcon';
import ComingSoonIcon from '@/typescript/assets/svg/symbols/ComingSoonIcon';

type ComingSoonModalProps = {
    visible: boolean;
    onClose: () => void;
    title: string | undefined;
    message: string | undefined;
};

const ComingSoonModal = ({ visible, onClose, title, message }: ComingSoonModalProps) => {
    return (
        <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
            <Pressable
                testID="coming_soon_modal_overlay"
                style={styles.contentContainer}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close coming soon modal">
                {/* Close Button */}
                <Pressable
                    testID="coming_soon_modal_close_button"
                    style={styles.closeButton}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close modal">
                    <CloseIcon color="#666666" width={24} height={24} />
                </Pressable>

                {/* Clock and Settings Icon */}
                <View style={styles.iconContainer}>
                    <ComingSoonIcon width={82} height={87} />
                </View>

                {/* Coming Soon Text */}
                <Typography
                    type="title"
                    style={styles.title}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {title || 'COMING SOON'}
                </Typography>

                {/* Description */}
                <Typography
                    type="body-1"
                    style={styles.message}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {message || 'This will be available in future\nversions of the application'}
                </Typography>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    closeButton: {
        position: 'absolute',
        top: 48,
        right: 24,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        zIndex: 10,
    },
    iconContainer: {
        marginBottom: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 17,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 20,
    },
});

export default ComingSoonModal;
