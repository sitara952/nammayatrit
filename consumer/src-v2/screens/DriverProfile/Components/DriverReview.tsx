import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import FeedbackPill from './FeedbackPill';
import { colors } from 'config-types/src/domain/default/themes/colors';

export type DriverReviewTag = {
    emoji: string;
    label: string;
};

export type DriverReviewCardProps = {
    rating: number;
    reviewer: string;
    date: string;
    review: string;
    tags: DriverReviewTag[];
};

const DriverReviewCard: React.FC<DriverReviewCardProps> = ({ rating, reviewer, date, review, tags }) => {
    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                </View>
                <View style={styles.headerTextCol}>
                    <Text style={styles.reviewer}>{reviewer}</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
            </View>

            <Text style={styles.reviewText}>{review}</Text>

            {tags.length > 0 && (
                <View style={styles.tagsRow}>
                    {tags.map((tag, idx) => (
                        <FeedbackPill key={idx} emoji={tag.emoji} label={tag.label} />
                    ))}
                </View>
            )}
        </View>
    );
};

export default DriverReviewCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 0.9,
        borderColor: '#E6E6E6',
        padding: 18,
        marginVertical: 16,
        marginLeft: 16,
        shadowColor: Platform.OS === 'android' ? '#e4e6eb' : '#000',
        shadowOpacity: 0.03,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
        maxWidth: 310,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingBadge: {
        backgroundColor: '#F5F5F5',
        borderRadius: 50,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ratingText: {
        fontWeight: '600',
        fontSize: 16,
        color: '#444',
    },
    headerTextCol: {
        flexDirection: 'column',
    },
    reviewer: {
        fontWeight: '600',
        fontSize: 15,
        color: colors.gray400,
    },
    date: {
        fontSize: 13,
        color: colors.gray400,
        marginTop: 1,
        minWidth: 100,
    },
    reviewText: {
        fontSize: 15,
        color: '#5B5563',
        marginVertical: 10,
        fontWeight: '500',
        lineHeight: 24,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
        justifyContent: 'flex-start',
    },
});
