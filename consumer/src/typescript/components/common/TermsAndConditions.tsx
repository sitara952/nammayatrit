import colors from '../../designSystem/colorPalette';
import { View, Text, Linking, StyleSheet } from 'react-native';
import sharedStyles from '../../constants/style';
import React from 'react';
import { useAppSelector } from '../../state/hooks.ts';

import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { selectAppConfig } from '@/typescript/state/client/session';

interface TermsAndConditionsProps {
    children?: React.ReactNode; // Define the type for children
    hideTnc?: boolean;
}

function TermsAndConditions({ children, hideTnc }: TermsAndConditionsProps): React.JSX.Element {
    const appConfig = useAppSelector(selectAppConfig);
    const onPressFn = () => {
        Linking.openURL(appConfig.constants.termsAndConditionLink);
    };

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <View style={styles.container}>
            {hideTnc ? null : (
                <View style={styles.tncContainer}>
                    <Pressable
                        testID="tnc_lick_open"
                        onPress={onPressFn}
                        accessibilityRole="link"
                        style={({ pressed }) => ({
                            ...styles.tncText,
                            color: pressed ? 'light-blue' : 'blue',
                        })}
                        accessibilityLabel="By clicking Continue, you agree to our Terms & Conditions">
                        <Text style={{ color: '#5B6777' }}>
                            {userLanguageStrings.ByclickingContinueyouagreetoour + ' '}
                        </Text>
                        <Text style={{ color: '#14171F' }}> T&Cs</Text>
                    </Pressable>
                </View>
            )}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: colors.primitive.gray?.[11],
        marginBottom: 10,
    },
    tncContainer: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },
    tncText: {
        ...sharedStyles.bodyText3,
        fontSize: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TermsAndConditions;
