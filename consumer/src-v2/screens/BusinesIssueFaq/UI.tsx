import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Header } from '@/src-v2/primitives/Header';
import Button from '@/src-v2/primitives/Button';
import DropdownCard from '@/typescript/screens/rideSummary/DropDownCard';
import { BusinessIssueFaqUIProps } from './types';
import { createAction } from '@/typescript/utils/common';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { BulletPoint } from '@/src-v2/components/BulletPoint';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout';

export const BusinessIssueFaqUI: React.FC<BusinessIssueFaqUIProps> = ({
    faqItems,
    businessIssueFaqDispatch,
    heading,
}) => {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['1']));
    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    const flatListRef = useRef<Animated.FlatList<any>>(null);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const styles = createStyles(themeColors);
    const { setAutoClearTimeout } = useAutoClearTimeout();
    const handleToggleFaq = (itemId: string, index: number) => {
        setExpandedItems(prev => {
            const newSet = new Set([...prev]);
            if (newSet.has(itemId)) {
                // eslint-disable-next-line functional/immutable-data
                newSet.delete(itemId);
            } else {
                // eslint-disable-next-line functional/immutable-data
                newSet.add(itemId);
                setAutoClearTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                        index,
                        animated: true,
                        viewPosition: 0.2,
                    });
                }, 300);
            }
            return newSet;
        });
    };

    return (
        <View style={styles.container}>
            <Header
                title={heading}
                onBackPress={() => {
                    businessIssueFaqDispatch(createAction('HANDLE_BACKPRESS', undefined));
                }}
            />
            <Animated.FlatList
                ref={flatListRef}
                windowSize={10}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                data={faqItems}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.scrollContent}
                renderItem={({ item, index }) => {
                    const isExpanded = expandedItems.has(item.id);

                    return (
                        <DropdownCard
                            testID={`business_issue_faq_${item.id}`}
                            title={item.title}
                            titleStyle={
                                isExpanded
                                    ? { backgroundColor: colors.neutral200 }
                                    : { backgroundColor: colors.neutral100 }
                            }
                            initialState={isExpanded}
                            enableAnimation={true}
                            onToggle={() => handleToggleFaq(item.id, index)}>
                            <View style={styles.expandedContent}>
                                <Typography
                                    type="sub-body-700"
                                    style={styles.faqDescription}
                                    numberOfLines={0}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel={item.description}
                                    accessibilityRole={undefined}>
                                    {item.description}
                                </Typography>

                                {item.bulletPoints.length > 0 && (
                                    <>
                                        <View style={{ height: 16 }} />
                                        <BulletPoint
                                            items={item.bulletPoints}
                                            style={{ marginBottom: 12 }}
                                            textStyle={{ fontSize: 14 }}
                                        />
                                    </>
                                )}

                                {item.nextDescription && (
                                    <>
                                        <View style={{ height: 16 }} />
                                        <Typography
                                            type="sub-body-700"
                                            style={styles.faqDescription}
                                            numberOfLines={0}
                                            isAnimate={false}
                                            accessible={true}
                                            accessibilityLabel={item.nextDescription}
                                            accessibilityRole={undefined}>
                                            {item.nextDescription}
                                        </Typography>
                                    </>
                                )}

                                {item.buttonText && (
                                    <>
                                        <View style={{ height: 16 }} />
                                        <Button
                                            testID={`chat-agent-${item.id}`}
                                            type="primary"
                                            text={item.buttonText}
                                            onPress={item.buttonOnPress}
                                            textStyle={styles.chatButtonText}
                                        />
                                    </>
                                )}
                            </View>
                        </DropdownCard>
                    );
                }}
                onScrollToIndexFailed={info => {
                    setAutoClearTimeout(() => {
                        flatListRef.current?.scrollToOffset({
                            offset: info.averageItemLength * info.index,
                            animated: true,
                        });
                    }, 300);
                }}
            />
        </View>
    );
};

const createStyles = (themeColors: ThemeTokens) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f9f8f9',
            marginBottom: 40,
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 32,
        },
        faqDescription: {
            fontSize: 14,
            lineHeight: 20,
            color: colors.neutral700,
            flexWrap: 'wrap',
            flexShrink: 1,
        },
        chatButtonText: {
            color: themeColors.Button_Primary_Default_Text_Base,
            fontSize: 16,
            fontWeight: '600',
        },
        expandedContent: {
            backgroundColor: colors.neutral100,
            marginTop: 8,
            marginBottom: 16,
        },
    });
