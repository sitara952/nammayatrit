import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image as RNImage, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Header } from '@/src-v2/primitives/Header';
import { SafetyStageItemProps, SafetyUIProps } from './Types';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';

const { width: screenWidth } = Dimensions.get('window');

const SafetyStageItem: React.FC<SafetyStageItemProps> = ({
    title,
    icon,
    isCompleted,
    onPress,
    showSubtitle = false,
    subtitleText = '',
}) => {
    return (
        <View>
            <TouchableOpacity
                accessibilityRole="button"
                testID="safety-stage-item"
                style={[styles.stageItem]}
                onPress={onPress}
                activeOpacity={0.7}>
                <View style={styles.stageContent}>
                    <View style={styles.stageHeader}>
                        <View style={styles.iconContainer}>
                            {typeof icon === 'function' ? (
                                React.createElement(icon, { width: 25, height: 25, fill: '#007AFF', stroke: '#ffffff' })
                            ) : (
                                <RNImage source={icon} style={styles.iconImage} />
                            )}
                        </View>
                        <View style={styles.stageTextContainer}>
                            <Typography
                                type="sub-body-700"
                                style={styles.stageTitle}
                                numberOfLines={2}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {title}
                            </Typography>
                        </View>
                        <View style={styles.chevronContainer}>
                            <Text style={styles.chevron}>›</Text>
                        </View>
                    </View>
                    {isCompleted && (
                        <View style={styles.completedBadge}>
                            <Text style={styles.checkmark}>✓</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
            {showSubtitle && (
                <View style={styles.subtitleContainer}>
                    <Typography
                        type="body-1"
                        style={styles.subtitleText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {subtitleText}
                    </Typography>
                </View>
            )}
        </View>
    );
};

export const SafetyUI: React.FC<SafetyUIProps> = ({
    onNavigateToStage,
    onBack,
    safetyStages,
    completedStagesCount,
    totalStages,
    isLoading,
    error,
    carouselData,
    moreSafetyMeasures,
    userLanguageStrings,
}) => {
    const progress = useSharedValue<number>(0);

    const renderCarouselItem = ({ item }: { item: (typeof carouselData)[0] }) => (
        <View style={styles.carouselItem}>
            <View style={styles.carouselImageContainer}>
                <RNImage source={item.image} style={styles.carouselImage} />
            </View>
            <View style={styles.carouselTextContainer}>
                <Typography
                    type="sub-body-700"
                    style={styles.carouselTitle}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {item.title}
                </Typography>
                <Typography
                    type="subhead-1-rupee"
                    style={styles.carouselSubtitle}
                    numberOfLines={2}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {item.subtitle}
                </Typography>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Typography
                    type="body-1"
                    style={styles.loadingText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    Loading safety settings...
                </Typography>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Typography
                    type="body-1"
                    style={styles.errorText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    Failed to load safety settings
                </Typography>
                <Typography
                    type="body-1"
                    style={styles.errorSubtext}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    Please try again later
                </Typography>
            </View>
        );
    }

    return (
        <HardwareBackpressHandler onHardwareBackPress={onBack}>
            <View style={styles.mainContainer}>
                <Header title={'Safety'} onBackPress={onBack} />
                <ScrollView
                    style={styles.container}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Carousel Section */}
                    <View style={styles.carouselSection}>
                        <Carousel
                            loop
                            width={screenWidth}
                            height={320}
                            autoPlay={true}
                            data={carouselData}
                            scrollAnimationDuration={1000}
                            autoPlayInterval={3000}
                            onProgressChange={progress}
                            renderItem={renderCarouselItem}
                        />
                        <Pagination.Custom
                            progress={progress}
                            data={carouselData}
                            size={8}
                            dotStyle={styles.dotStyle}
                            containerStyle={styles.dotContainer}
                            activeDotStyle={styles.activeDotStyle}
                            customReanimatedStyle={(progress: number, index: number, length: number) => {
                                const adjustedVal =
                                    index === 0 && progress > length - 1
                                        ? Math.abs(progress - length)
                                        : Math.abs(progress - index);
                                const isActive = adjustedVal < 0.5;

                                return {
                                    width: isActive ? 11 : 7,
                                    height: isActive ? 11 : 7,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 50,
                                };
                            }}
                            horizontal
                        />
                    </View>

                    {/* Progress Section */}
                    <View style={styles.progressSection}>
                        <Typography
                            type="body-1"
                            style={styles.progressTitle}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            Safety Setup
                        </Typography>
                        <Typography
                            type="body-1"
                            style={styles.progressText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {completedStagesCount}/{totalStages} Complete
                        </Typography>
                    </View>

                    {/* Safety Stages */}
                    <View style={styles.stagesContainer}>
                        {safetyStages.map(stage => (
                            <SafetyStageItem
                                key={stage.id}
                                title={stage.title}
                                icon={stage.icon}
                                isCompleted={stage.isCompleted}
                                onPress={() => onNavigateToStage(stage.id)}
                                showSubtitle={stage.showSubtitle}
                                subtitleText={stage.subtitleText}
                            />
                        ))}
                    </View>

                    {/* More Safety Measures Section */}
                    <View style={styles.moreSafetySection}>
                        <Typography
                            type="body-1"
                            style={styles.moreSafetyTitle}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.MoreSafetyMeasures}
                        </Typography>
                        <View style={styles.moreSafetyContainer}>
                            {moreSafetyMeasures.map(measure => (
                                <TouchableOpacity
                                    key={measure.id}
                                    testID={`more-safety-measure-${measure.id}`}
                                    style={styles.moreSafetyItem}
                                    onPress={measure.onPress}
                                    accessibilityRole="button"
                                    activeOpacity={0.7}>
                                    <View style={styles.moreSafetyContent}>
                                        <View style={styles.moreSafetyHeader}>
                                            <View style={styles.moreSafetyIconContainer}>
                                                {typeof measure.icon === 'function' ? (
                                                    React.createElement(measure.icon, {
                                                        width: 25,
                                                        height: 25,
                                                        fill: '#007AFF',
                                                        stroke: '#ffffff',
                                                    })
                                                ) : (
                                                    <RNImage source={measure.icon} style={styles.moreSafetyIconImage} />
                                                )}
                                            </View>
                                            <View style={styles.moreSafetyTextContainer}>
                                                <Typography
                                                    type="sub-body-700"
                                                    style={styles.moreSafetyTitleText}
                                                    numberOfLines={1}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {measure.title}
                                                </Typography>
                                            </View>
                                            <View style={styles.moreSafetyChevronContainer}>
                                                <Text style={styles.moreSafetyChevron}>›</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 8,
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000000',
        textAlign: 'center',
    },
    carouselSection: {
        paddingTop: 10,
        marginHorizontal: 0,
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    carouselItem: {
        // flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 12,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        minHeight: 295,
    },
    carouselImageContainer: {
        // width: 120,
        // height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        flex: 0,
    },
    carouselImage: {
        height: 180,
        width: 350,
        borderRadius: 16,
    },
    carouselTextContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 12,
        width: '100%',
    },
    carouselTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 20,
    },
    carouselSubtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'left',
        lineHeight: 18,
    },
    dotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        marginTop: -10,
        marginBottom: 10,
        backgroundColor: '#d5d5d8',
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 20,
    },
    dotStyle: {
        backgroundColor: '#FFFFFF',
        borderRadius: 50,
    },
    activeDotStyle: {
        borderRadius: 50,
    },

    progressSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
    },
    progressText: {
        fontSize: 14,
        color: '#666666',
    },
    stagesContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    stageItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginVertical: 8,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        overflow: 'visible',
    },
    stageItemDisabled: {
        opacity: 1,
    },
    stageContent: {
        position: 'relative',
    },
    stageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        minHeight: 64,
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 24,
    },
    iconImage: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
    stageTextContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 12,
    },
    stageTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        lineHeight: 20,
        flexShrink: 1,
    },
    stageDescription: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
    },
    subtitleContainer: {
        marginTop: -20,
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    subtitleText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    chevronContainer: {
        marginLeft: 8,
    },
    chevron: {
        fontSize: 18,
        color: '#CCCCCC',
        fontWeight: '300',
    },
    completedBadge: {
        position: 'absolute',
        top: 13,
        left: 43,
        width: 15,
        height: 15,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    moreSafetySection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    moreSafetyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 16,
    },
    moreSafetyContainer: {
        gap: 12,
    },
    moreSafetyItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        overflow: 'visible',
    },
    moreSafetyContent: {
        position: 'relative',
    },
    moreSafetyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        minHeight: 64,
    },
    moreSafetyIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    moreSafetyIconImage: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
    },
    moreSafetyTextContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 12,
    },
    moreSafetyTitleText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000000',
        lineHeight: 20,
        marginBottom: 4,
    },
    moreSafetyDescription: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
    },
    moreSafetyChevronContainer: {
        marginLeft: 8,
    },
    moreSafetyChevron: {
        fontSize: 18,
        color: '#CCCCCC',
        fontWeight: '300',
    },
});
