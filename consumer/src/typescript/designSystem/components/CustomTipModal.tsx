import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '@/src-v2/primitives/Button';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import Input from '@/typescript/designSystem/components/primitives/Input';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors } from 'config-types/src/domain/default/themes/colors';

const CustomTipModal = ({
    visible,
    onClose,
    onSubmit,
}: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (value: number) => void;
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [value, setValue] = useState('');
    const [debouncedValue, setDebouncedValue] = useState(value);
    const isMounted = React.useRef(true);

    React.useEffect(() => {
        isMounted.current = true;
        if (visible) {
            setValue('');
            setDebouncedValue('');
        }
        return () => {
            isMounted.current = false;
        };
    }, [visible]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (isMounted.current) setDebouncedValue(value);
        }, 500);
        return () => clearTimeout(handler);
    }, [value]);

    const getWarningMessage = useCallback((val: string) => {
        const num = Number(val);
        if (!val || isNaN(num) || num <= 0) return '';
        if (num >= 200 && num < 300)
            return userLanguageStrings.TheTipLooksALittleOnTheHigherSideMaybeGiveItACheckButHeyDriversDoLoveAGoodTip;
        if (num >= 300 && num < 500) return userLanguageStrings.ThatSQuiteAHighTipJustMakingSureItsIntentional;
        if (num >= 500) return userLanguageStrings.ThatTipSeemsABitTooHighPleaseAdjustItToContinue;
        return '';
    }, []);

    const warning = getWarningMessage(debouncedValue);

    return (
        <AnimatedModal
            visible={visible}
            setVisible={v => {
                if (!v) onClose();
            }}
            onClose={onClose}
            showCloseButton={true}>
            <KeyboardAwareScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="always">
                <View style={styles.container}>
                    <Typography
                        type="title"
                        style={styles.title}
                        numberOfLines={1}
                        isAnimate={false}
                        accessible
                        accessibilityLabel="Add a Tip"
                        accessibilityRole={undefined}>
                        {userLanguageStrings.AddATip}
                    </Typography>
                    <Input
                        type="secondary"
                        prefix={
                            <Typography
                                type="title-800-rupee"
                                style={styles.rupee}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible
                                accessibilityLabel="Rupee symbol"
                                accessibilityRole={undefined}>
                                ₹
                            </Typography>
                        }
                        suffix={undefined}
                        placeholder="0"
                        maxLength={3}
                        value={value}
                        onChangeText={text => {
                            const numeric = text.replace(/[^0-9]/g, '');
                            setValue(numeric);
                        }}
                        keyboardType="numeric"
                        containerStyle={styles.inputContainer}
                        style={{ color: '#14171F' }}
                        accessibleLabel="Custom tip input"
                    />

                    {warning ? (
                        <View style={styles.warningContainer}>
                            <Typography
                                type="body-7"
                                style={styles.warningText}
                                numberOfLines={3}
                                isAnimate={false}
                                accessible
                                accessibilityLabel="Tip warning/info"
                                accessibilityRole={undefined}>
                                {warning}
                            </Typography>
                        </View>
                    ) : null}
                    <Typography
                        type="body-7"
                        style={styles.description}
                        numberOfLines={2}
                        isAnimate={false}
                        accessible
                        accessibilityLabel="Tip info"
                        accessibilityRole={undefined}>
                        {userLanguageStrings.TipDescription}
                    </Typography>
                    <Button
                        text={userLanguageStrings.Addtip}
                        onPress={() => {
                            const num = Number(value);
                            if (!isNaN(num) && num > 0) {
                                onSubmit(num);
                            }
                            onClose();
                        }}
                        disabled={!value || Number(value) >= 400 || Number(value) <= 0}
                        testID="custom-tip-submit-btn"
                        type="primary"
                        style={styles.button}
                        textType="callout"
                        textColor="#FFC529"
                    />
                </View>
            </KeyboardAwareScrollView>
        </AnimatedModal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 32,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#23272F',
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    rupee: {
        paddingBottom: 4,
    },
    inputContainer: {
        width: '100%',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E3E8',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    input: {
        fontSize: 18,
        color: '#B2B9C7',
        flex: 1,
        paddingVertical: 0,
        backgroundColor: 'transparent',
    },
    description: {
        color: '#908A96',
        fontSize: 14,
        textAlign: 'left',
        lineHeight: 20,
        marginBottom: 14,
    },
    button: {
        width: '100%',
        backgroundColor: '#111217',
        borderRadius: 12,
        justifyContent: 'center',
    },
    warningContainer: {
        backgroundColor: '#FFF8E1',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        alignSelf: 'stretch',
    },
    warningText: {
        color: colors.neutral800,
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'left',
    },
});

export default CustomTipModal;
