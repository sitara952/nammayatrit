import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

export const WaitTimerModal = ({ onClose }: { onClose: () => void }) => {
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={[styles.container, { marginBottom: 20 + bottom }]}>
            <Typography
                type="subhead-800"
                style={styles.title}
                numberOfLines={1}
                isAnimate={false}
                accessible={true}
                accessibilityLabel="Wait Timer Title"
                accessibilityRole={undefined}>
                {userLanguageStrings.waitTimerTitle}
            </Typography>
            <Typography
                type="body-7"
                style={styles.description}
                numberOfLines={3}
                isAnimate={false}
                accessible={true}
                accessibilityLabel="Wait Timer Description"
                accessibilityRole={undefined}>
                {userLanguageStrings.waitTimerDescription}
            </Typography>
            <Typography
                type="body-7"
                style={styles.description}
                numberOfLines={3}
                isAnimate={false}
                accessible={true}
                accessibilityLabel="Wait Timer Charges"
                accessibilityRole={undefined}>
                {userLanguageStrings.waitTimerCharge(1.5, CURRENCY_SYMBOL.value)}
            </Typography>
            <Button
                testID="wait-timer-modal-got-it"
                type="primary"
                text={userLanguageStrings.Gotit}
                textStyle={{ width: '100%', textAlign: 'center' }}
                onPress={onClose}
                style={styles.button}
                textType="callout-1"
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        marginHorizontal: 16,
    },
    title: {
        marginBottom: 16,
        fontSize: 16,
        fontWeight: 700,
    },
    description: {
        lineHeight: 20,
        textAlign: 'left',
        marginBottom: 16,
        color: '#5F5F5F',
        fontSize: 14,
    },
    rupee: {
        fontSize: 14,
        fontWeight: 600,
    },
    button: {
        width: '100%',
        borderRadius: 16,
        fontWeight: 900,
    },
});
