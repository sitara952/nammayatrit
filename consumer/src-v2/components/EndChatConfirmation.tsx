import React from 'react';
import { View, StyleSheet } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '../primitives/Button';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type EndChatConfirmationProps = {
    onEndChat: () => void;
    onContinueChat: () => void;
};

const EndChatConfirmation: React.FC<EndChatConfirmationProps> = ({ onEndChat, onContinueChat }) => {
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={styles.container}>
            <Typography
                type="title"
                style={styles.title}
                numberOfLines={2}
                isAnimate={false}
                accessible
                accessibilityLabel="End chat confirmation"
                accessibilityRole={undefined}>
                {userLanguageStrings.EndChatConfirmationTitle}
            </Typography>
            <Button
                testID="end-chat-btn"
                type="primary"
                size="lg"
                style={styles.button}
                accessibilityLabel="End Chat"
                text={userLanguageStrings.EndChat}
                onPress={onEndChat}
            />
            <Button
                testID="continue-chat-btn"
                type="link"
                size="lg"
                style={[styles.button, { marginBottom: bottom }]}
                accessibilityLabel="Continue Chat"
                text={userLanguageStrings.ContinueChat}
                onPress={onContinueChat}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#23272F',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 28,
        width: '100%',
        alignSelf: 'center',
    },
    button: {
        width: '100%',
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EndChatConfirmation;
