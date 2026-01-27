import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Header } from '@/src-v2/primitives/Header';
import DropdownCard from '@/typescript/screens/rideSummary/DropDownCard';
import { MetroIssueFaqUIProps } from './Types';
import { createAction } from '@/typescript/utils/common';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout';
import { ScrollView } from 'react-native-gesture-handler';
import RenderHTML from 'react-native-render-html';

const contentWidth = Dimensions.get('window').width;

type ParsedBlock = {
    type: string;
    value: string;
    key: string;
};

export const MetroIssueFaqUI: React.FC<MetroIssueFaqUIProps> = ({
    faqMessages,
    metroIssueFaqDispatch,
    heading,
    isLoading,
}) => {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set([]));
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

    const parseFaqContent = (message: string): ParsedBlock[] => {
        const subparts = message.split('{SUBPART}');
        return subparts.map((part, index) => {
            const splitIndex = part.indexOf('!!!');
            if (splitIndex === -1) return { type: '', value: '', key: index.toString() };

            const type = part.substring(0, splitIndex);
            const value = part.substring(splitIndex + 4);
            return { type, value, key: index.toString() };
        });
    };

    const renderBlock = (block: ParsedBlock) => {
        switch (block.type) {
            case '{HEADING}':
                return (
                    <Typography
                        key={block.key}
                        type="sub-body-800"
                        style={styles.faqHeading}
                        numberOfLines={0}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={block.value}
                        accessibilityRole="header">
                        {block.value}
                    </Typography>
                );
            case '{BODY}':
                return <RenderHTML key={block.key} contentWidth={contentWidth} source={{ html: block.value }} />;
            case '{IMAGE}':
                return (
                    <View key={block.key} style={styles.imageContainer}>
                        <Image
                            style={styles.singleImage}
                            source={{ uri: `data:image/png;base64,${block.value}` }}
                            resizeMode={'contain'}
                        />
                    </View>
                );
            case '{IMAGE_GROUP}': {
                const images = block.value.split('{IMAGE}').filter(Boolean);
                return (
                    <ScrollView
                        key={block.key}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageGroupScroll}>
                        <View style={{ flexDirection: 'row' }}>
                            {images.map((imgBase64, index) => (
                                <View key={index} style={styles.groupImageContainer}>
                                    <Image
                                        style={styles.singleImage}
                                        source={{ uri: `data:image/png;base64,${imgBase64}` }}
                                        resizeMode={'contain'}
                                    />
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                );
            }
            default:
                if (block.value) {
                    return <RenderHTML contentWidth={contentWidth} key={block.key} source={{ html: block.value }} />;
                }
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title={heading}
                onBackPress={() => {
                    metroIssueFaqDispatch(createAction('HANDLE_BACKPRESS', undefined));
                }}
            />
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColors.Icon_neutralMidHigh} />
                </View>
            ) : (
                <Animated.FlatList
                    ref={flatListRef}
                    windowSize={10}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    data={faqMessages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.scrollContent}
                    renderItem={({ item, index }) => {
                        const isExpanded = expandedItems.has(item.id);
                        const parsedBlocks = parseFaqContent(item.message);

                        return (
                            <DropdownCard
                                testID={`metro_issue_faq_${item.id}`}
                                title={item.messageTitle || item.label || ''}
                                titleStyle={
                                    isExpanded
                                        ? { backgroundColor: colors.neutral200 }
                                        : { backgroundColor: colors.neutral100 }
                                }
                                initialState={isExpanded}
                                enableAnimation={true}
                                onToggle={() => handleToggleFaq(item.id, index)}>
                                <View style={styles.expandedContent}>{parsedBlocks.map(renderBlock)}</View>
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
            )}
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
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 32,
        },
        faqHeading: {
            color: colors.neutral100,
            marginTop: 12,
            marginBottom: 4,
        },
        faqDescription: {
            fontSize: 14,
            lineHeight: 20,
            color: colors.neutral700,
            flexWrap: 'wrap',
            flexShrink: 1,
            marginBottom: 8,
        },
        imageContainer: {
            height: 160,
            width: 350,
            marginVertical: 8,
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: colors.neutral100,
        },
        singleImage: {
            width: '100%',
            height: '100%',
        },
        imageGroupScroll: {
            marginVertical: 8,
        },
        groupImageContainer: {
            height: 160,
            width: 160,
            marginRight: 8,
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: colors.neutral100,
        },
        actionButton: {
            marginTop: 16,
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
