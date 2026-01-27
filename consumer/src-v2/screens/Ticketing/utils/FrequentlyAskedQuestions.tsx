import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import ChevronDown from '@/typescript/assets/svg/symbols/ChevronDown';
import ChevronUp from '@/typescript/assets/svg/symbols/ChevronUp';
import { FrequentlyAskedQuestionsProps } from '../EventDetailsScreen/Types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FrequentlyAskedQuestions: React.FC<FrequentlyAskedQuestionsProps> = ({ faqs }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { faqSheetRef } = useRefsContext();
    const toggleFAQ = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };
    const { bottom } = useSafeAreaInsets();
    const bottomPadding = Platform.OS === 'ios' ? 0 : bottom - 13;

    return (
        <View style={{ paddingBottom: bottomPadding - 5 }}>
            <View style={styles.header}>
                <TouchableOpacity
                    testID="a5d4c403-cfd5-484e-a2e7-917d40327026"
                    accessible={true}
                    accessibilityHint="Go Back"
                    accessibilityRole="button"
                    style={{ marginRight: 12 }}
                    onPress={() => {
                        faqSheetRef.current?.close();
                    }}>
                    <ChevronLeftIcon size={48} />
                </TouchableOpacity>
                <Typography
                    type="body-1"
                    accessibilityRole={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    style={styles.title}>
                    {userLanguageStrings.FrequentlyAskedQuestions}
                </Typography>
            </View>

            <View style={styles.content}>
                {faqs.map((faq, index) => (
                    <View key={index} style={styles.faqItem}>
                        <Pressable
                            testID={`question_clicked_${index}`}
                            onPress={() => toggleFAQ(index)}
                            style={styles.questionContainer}
                            accessibilityRole="button"
                            accessibilityLabel={
                                expandedIndex === index ? `Collapse ${faq.question}` : `Expand ${faq.question}`
                            }>
                            <View style={styles.questionTextContainer}>
                                <Typography
                                    type="body-1"
                                    accessibilityRole={undefined}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    style={styles.questionText}>
                                    {faq.question}
                                </Typography>
                            </View>
                            <View style={styles.chevronContainer}>
                                {expandedIndex === index ? <ChevronUp /> : <ChevronDown />}
                            </View>
                        </Pressable>

                        {expandedIndex === index && (
                            <View style={styles.answerContainer}>
                                <Typography
                                    type="body"
                                    accessibilityRole={undefined}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    style={styles.answerText}>
                                    {faq.answer}
                                </Typography>
                            </View>
                        )}
                    </View>
                ))}
            </View>
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
    content: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    faqItem: {
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F2F7',
        paddingVertical: 12,
    },
    questionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    questionTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    questionText: {
        fontSize: 16,
        color: '#14171F',
        lineHeight: 22,
    },
    chevronContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    answerContainer: {
        paddingHorizontal: 16,
        marginTop: 5,
        paddingTop: 0,
    },
    answerText: {
        fontSize: 13,
        color: '#5B6777',
        lineHeight: 22,
    },
});
