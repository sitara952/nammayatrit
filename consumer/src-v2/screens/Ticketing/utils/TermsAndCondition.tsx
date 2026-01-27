import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { TermsAndConditionProps } from '../EventDetailsScreen/Types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TermsAndCondition: React.FC<TermsAndConditionProps> = ({ terms }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();
    const bottomPadding = Platform.OS === 'ios' ? 0 : bottom - 13;
    return (
        <View style={{ paddingBottom: bottomPadding - 5 }}>
            <View style={styles.header}>
                <Typography
                    type="body-1"
                    accessibilityRole={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    style={styles.title}>
                    {userLanguageStrings.TermsandConditions}
                </Typography>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {terms.map((term, index) => (
                    <View key={index} style={styles.termItem}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.termText}>{term}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 22,
    },
    title: {
        fontSize: 18,
        color: '#14171F',
        flex: 1,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#5B6777',
        fontWeight: '600',
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        maxHeight: 400,
    },
    termItem: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    bulletPoint: {
        fontSize: 19,
        color: '#5B6777',
        marginRight: 8,
        fontWeight: '500',
    },
    termText: {
        fontSize: 15,
        color: '#5B6777',
        lineHeight: 22,
        flex: 1,
        fontWeight: '400',
    },
});
