import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface FeedbackPillProps {
    emoji: string;
    label: string;
    style?: ViewStyle;
}

const FeedbackPill: React.FC<FeedbackPillProps> = ({ emoji, label, style }) => {
    return (
        <View style={[styles.pill, style]}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    pill: {
        padding: 5,
        margin: 5,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F1F1',
        paddingHorizontal: 14,
        paddingVertical: 7,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 1,
        elevation: 1,
    },
    emoji: {
        fontSize: 10,
        marginRight: 5,
    },
    label: {
        fontSize: 11,
        color: '#222',
        fontWeight: '500',
    },
});

export default FeedbackPill;
