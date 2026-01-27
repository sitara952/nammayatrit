import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Alert, Dimensions, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withSpring, FadeIn, SlideInRight } from 'react-native-reanimated';
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    SCREEN_WIDTH,
    BottomSheetScrollView,
    BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { JourneySimulations, MockJourneyLocation, TransportMode, JourneyStatus, MockLocationType } from './types';
import { colors, mockRoutes, transportModeConfigs, getModeColors } from './repository';
import {
    setSelectedMode,
    setSelectedRoute,
    setSelectedStation,
    resetJourneyState,
} from '@/typescript/state/client/journeySimulation.ts';
import {
    selectSelectedMode,
    selectSelectedRoute,
    selectSelectedStation,
    selectCurrentStationName,
} from '@/typescript/state/client/journeySimulation.ts';
import { TransitArrowRight } from '@/src-v2/multimodal/components/svg/Arrows';
import { Icon } from '@/typescript/components/Icon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { height: screenHeight } = Dimensions.get('window');

const JourneySimulation: React.FC = () => {
    const dispatch = useAppDispatch();
    const selectedMode: TransportMode | null = useAppSelector(selectSelectedMode);
    const selectedRoute = useAppSelector(selectSelectedRoute);
    const selectedStation = useAppSelector(selectSelectedStation);
    const currentStationName = useAppSelector(selectCurrentStationName);

    const routeBottomSheetRef = useRef<BottomSheetModal>(null);

    const filteredRoutes = useMemo(() => mockRoutes.filter(route => route.mode === selectedMode), [selectedMode]);

    const routeOpacity = useSharedValue(0);

    const currentModeConfig = selectedMode ? transportModeConfigs[selectedMode] : null;
    const currentModeColors = selectedMode ? getModeColors(selectedMode) : null;

    const bottomSheetSnapPoints = ['42%', '90%'];

    const currentStage = useMemo(() => {
        if (!selectedMode) return 'home';
        if (!selectedRoute) return 'route-selection';
        return 'journey-view';
    }, [selectedMode, selectedRoute]);

    const availableHeight = screenHeight * (currentStage === 'route-selection' ? 0.66 : 0.52);

    console.info('currentStage', selectedMode);

    const handleModeSelection = useCallback(
        (mode: TransportMode, routeCount: number) => {
            if (routeCount === 0) {
                Alert.alert(
                    'No Routes Available',
                    `There are no routes available for ${transportModeConfigs[mode].name}.`,
                );
                return;
            }
            dispatch(setSelectedMode(mode));
        },
        [dispatch],
    );

    const handleRouteSelect = useCallback(() => {
        routeBottomSheetRef.current?.present();
    }, []);

    const handleRouteSelection = useCallback(
        (route: JourneySimulations) => {
            dispatch(setSelectedRoute(route));
            routeBottomSheetRef.current?.dismiss();
            routeOpacity.value = withSpring(1);
        },
        [dispatch],
    );

    const handleStationPress = useCallback(
        (station: MockJourneyLocation, stationIndex: number) => {
            if (!selectedRoute) return;
            dispatch(setSelectedStation({ station, stationIndex }));
        },
        [selectedRoute, dispatch],
    );

    const handleClearData = useCallback(() => {
        Alert.alert(
            'Clear Journey Data',
            'Are you sure you want to clear all journey data? This will reset everything.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => dispatch(resetJourneyState()),
                },
            ],
        );
    }, [dispatch]);

    const getStatusColor = (status: JourneyStatus) => {
        switch (status) {
            case JourneyStatus.COMPLETED:
                return colors.completed;
            case JourneyStatus.CURRENT:
                return colors.current;
            case JourneyStatus.UPCOMING:
                return colors.upcoming;
            default:
                return colors.upcoming;
        }
    };

    const getStatusIcon = (status: JourneyStatus) => {
        switch (status) {
            case JourneyStatus.COMPLETED:
                return '✓';
            case JourneyStatus.CURRENT:
                return '●';
            case JourneyStatus.UPCOMING:
                return '○';
            default:
                return '○';
        }
    };

    const getLocationIcon = (type: MockLocationType) => {
        switch (type) {
            case MockLocationType.STATION:
                return '🚉';
            case MockLocationType.TRACK:
                return '🛤️';
            case MockLocationType.OTHER:
                return '📍';
            default:
                return '📍';
        }
    };

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
        ),
        [],
    );

    const renderHomeModeCard = (mode: TransportMode, index: number) => {
        const config = transportModeConfigs[mode];
        const modeColors = getModeColors(mode);
        const routeCount = mockRoutes.filter(route => route.mode === mode).length;

        return (
            <Animated.View key={mode} entering={SlideInRight.delay(index * 200)} style={styles.homeModeCardContainer}>
                <TouchableOpacity
                    testID="journey-simulation-mode-selection"
                    accessibilityRole="button"
                    style={[
                        styles.homeModeCard,
                        {
                            backgroundColor: modeColors.background,
                            borderColor: modeColors.accent,
                        },
                    ]}
                    onPress={() => handleModeSelection(mode, routeCount)}
                    activeOpacity={0.8}>
                    <View style={tailwind.style('flex-row justify-between items-center')}>
                        <View style={[styles.homeModeCardGradient, { backgroundColor: modeColors.background }]}>
                            <View style={styles.homeModeCardHeader}>
                                <View style={[styles.homeModeCardIconWrapper, { backgroundColor: modeColors.primary }]}>
                                    <Text style={styles.homeModeCardIcon}>{config.icon}</Text>
                                </View>
                            </View>

                            <View>
                                <Text style={[styles.homeModeCardTitle, { color: modeColors.primary }]}>
                                    {config.name}
                                </Text>
                                <Text style={styles.homeModeCardRoutes}>{routeCount} routes available</Text>
                            </View>
                        </View>
                        <View style={styles.homeModeCardAction}>
                            <View style={[styles.actionArrow, { backgroundColor: modeColors.primary }]}>
                                <Text style={styles.actionArrowText}>→</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderStationItem = ({ item, index }: { item: MockJourneyLocation; index: number }) => {
        const isSelected = selectedStation?.name === item.name;
        const statusColor = getStatusColor(item.status || JourneyStatus.UPCOMING);
        const isLast = index === (selectedRoute?.locations.length || 0) - 1;

        return (
            <Animated.View entering={SlideInRight.delay(index * 100)}>
                <View style={styles.stationRow}>
                    <View style={styles.stationConnector}>
                        <View style={[styles.stationStatusIcon, { backgroundColor: statusColor }]}>
                            <Text
                                style={[
                                    styles.stationStatusIconText,
                                    { color: item.status === JourneyStatus.UPCOMING ? '#64748b' : '#ffffff' },
                                ]}>
                                {getStatusIcon(item.status || JourneyStatus.UPCOMING)}
                            </Text>
                        </View>
                        {!isLast && <View style={[styles.connectorLine, { backgroundColor: statusColor }]} />}
                    </View>

                    <Pressable
                        accessibilityLabel={item.name + ' button'}
                        testID={`3504291b-0a52-482b-b5d1-78f82887cfdd`}
                        accessibilityRole="button"
                        style={[
                            styles.stationCard,
                            isSelected && {
                                borderColor: '#3b82f6',
                                backgroundColor: '#eff6ff',
                                shadowColor: '#3b82f6',
                            },
                        ]}
                        onPress={() => handleStationPress(item, index)}>
                        {Platform.OS === 'ios' && (
                            <View style={[styles.stationStatusBar, { backgroundColor: statusColor }]} />
                        )}

                        <View style={styles.stationContent}>
                            <View style={styles.stationMainInfo}>
                                <View style={styles.locationIcon}>
                                    <Text style={styles.locationIconText}>{getLocationIcon(item.type)}</Text>
                                </View>

                                <View style={styles.stationDetails}>
                                    <Text style={styles.stationName}>{item.name}</Text>
                                    <Text style={styles.stationTypeLabel}>
                                        {item.type.toLowerCase().replace('_', ' ')} • {item.status?.toLowerCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </View>
            </Animated.View>
        );
    };

    const renderRouteItem = ({
        item,
        index,
        showIcon,
    }: {
        item: JourneySimulations;
        index: number;
        showIcon: boolean;
    }) => {
        const config = transportModeConfigs[item.mode];
        const modeColors = getModeColors(item.mode);
        const isLast = index === filteredRoutes.length - 1;

        return (
            <TouchableOpacity
                testID="journey-simulation-route-selection"
                accessibilityRole="button"
                style={[styles.routeOption, isLast && { marginBottom: 0 }]}
                onPress={() => handleRouteSelection(item)}
                activeOpacity={0.7}>
                <View style={styles.routeOptionContent}>
                    {showIcon && (
                        <View style={[styles.routeIconWrapper, { backgroundColor: modeColors.background }]}>
                            <Text style={styles.routeOptionIcon}>{config.icon}</Text>
                        </View>
                    )}

                    <View style={styles.routeOptionDetails}>
                        <Text style={styles.routeName}>{item.source.name}</Text>
                        <View style={tailwind.style('flex-row items-center')}>
                            <Icon icon={<TransitArrowRight />} size={12} style={tailwind.style('mr-2')} />
                            <Text style={styles.routeName} numberOfLines={1}>
                                {item.destination.name}
                            </Text>
                        </View>
                        <Text style={styles.routeMeta}>
                            {item.estimatedTime} • {item.locations.length} stops
                        </Text>
                    </View>

                    <View style={styles.routeOptionArrow}>
                        <Text style={styles.arrowIcon}>→</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const handleOnBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return (
        <HardwareBackpressHandler onHardwareBackPress={handleOnBackPress}>
            <SafeAreaView style={styles.container}>
                {currentStage !== 'home' && (
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {currentStage === 'route-selection' ? 'Select a route' : 'Journey Simulation'}
                        </Text>
                        <TouchableOpacity
                            testID="journey-simulation-clear-btn"
                            accessibilityRole="button"
                            onPress={handleClearData}
                            activeOpacity={0.7}
                            style={styles.clearButton}>
                            <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {currentStage === 'home' && (
                    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                        <Animated.View entering={FadeIn} style={styles.homeSection}>
                            <Text style={styles.homeTitle}>Choose Your Transport</Text>
                            <Text style={styles.homeSubtitle}>Select your preferred mode of transportation</Text>

                            <View style={styles.homeModeCards}>
                                {Object.values(TransportMode).map((mode, index) => renderHomeModeCard(mode, index))}
                            </View>
                        </Animated.View>
                    </ScrollView>
                )}

                {currentStage === 'route-selection' && currentModeColors && currentModeConfig && (
                    <View style={styles.routeSelectionContainer}>
                        <Animated.View entering={SlideInRight.delay(200)} style={styles.routeSelectionSection}>
                            <View style={styles.routeSelectionHeader}>
                                <View
                                    style={[
                                        styles.routeSelectionIconWrapper,
                                        { backgroundColor: currentModeColors.background },
                                    ]}>
                                    <Text style={styles.routeSelectionIcon}>{currentModeConfig.icon}</Text>
                                </View>
                                <View style={styles.routeSelectionTextContainer}>
                                    <Text style={styles.routeSelectionTitle}>{`${currentModeConfig.name} Routes`}</Text>
                                    <Text style={styles.routeSelectionSubtitle}>
                                        {filteredRoutes.length} routes available
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.routeListContainer, { maxHeight: availableHeight }]}>
                                <FlatList
                                    data={filteredRoutes}
                                    renderItem={({ item, index }) => renderRouteItem({ item, index, showIcon: false })}
                                    keyExtractor={item => item.id}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        </Animated.View>
                    </View>
                )}

                {currentStage === 'journey-view' && selectedRoute && (
                    <View style={styles.journeyViewContainer}>
                        <Animated.View style={[styles.combinedInfoCard]} entering={FadeIn.delay(300)}>
                            <Pressable
                                accessibilityLabel="Select Route button"
                                testID={`3504456b-0a52-482b-b5d1-78f82887c52a`}
                                accessibilityRole="button"
                                onPress={handleRouteSelect}>
                                <Animated.View
                                    style={tailwind.style(
                                        'p-4 rounded-[20px] flex-row justify-between items-center bg-white border border-[#F1F2F2]',
                                    )}>
                                    <View style={tailwind.style('flex-grow')}>
                                        <Text
                                            style={tailwind.style(
                                                'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] capitalize max-w-4/5',
                                            )}
                                            numberOfLines={1}>
                                            {selectedRoute.source.name}
                                        </Text>
                                        <View style={tailwind.style('flex-row items-center')}>
                                            <Icon
                                                icon={<TransitArrowRight />}
                                                size={16}
                                                style={tailwind.style('mt-5 mr-2')}
                                            />
                                            <Text
                                                style={tailwind.style(
                                                    'text-[14px] text-[#3B3A3C] pt-[18px] font-areaNormal-extrabold capitalize max-w-4/5',
                                                )}
                                                numberOfLines={1}>
                                                {selectedRoute.destination.name}
                                            </Text>
                                        </View>
                                    </View>
                                    <Animated.View style={tailwind.style('items-end')}>
                                        <View style={tailwind.style('flex-row items-center pt-[36px]')}>
                                            <Text
                                                style={tailwind.style(
                                                    'text-[12px] tracking-[0.2px] text-[#969696] font-areaNormal-bold',
                                                )}>
                                                {selectedRoute.estimatedTime}
                                            </Text>
                                        </View>
                                    </Animated.View>
                                </Animated.View>
                            </Pressable>

                            {
                                <View
                                    style={[
                                        styles.currentLocationRow,
                                        { backgroundColor: currentStationName ? '#f0fdf4' : '#f1f5f9' },
                                    ]}>
                                    <View
                                        style={[
                                            styles.currentLocationIndicator,
                                            { backgroundColor: currentStationName ? '#059669' : '#969696' },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.currentLocationText,
                                            { color: currentStationName ? '#059669' : '#969696' },
                                        ]}>
                                        {currentStationName ? currentStationName : 'No station selected'}
                                    </Text>
                                </View>
                            }
                        </Animated.View>

                        <Animated.Text entering={FadeIn.delay(400)} style={styles.sectionLabel}>
                            Stations
                        </Animated.Text>

                        {selectedRoute.locations.length > 0 && (
                            <Animated.View
                                style={[styles.stationsCard, { maxHeight: availableHeight }]}
                                entering={FadeIn.delay(400)}>
                                <FlatList
                                    data={selectedRoute.locations}
                                    renderItem={renderStationItem}
                                    keyExtractor={(item, index) => `${item.name}-${index}`}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.stationsListContent}
                                />
                            </Animated.View>
                        )}
                    </View>
                )}

                <BottomSheetModal
                    ref={routeBottomSheetRef}
                    snapPoints={bottomSheetSnapPoints}
                    enablePanDownToClose={false}
                    enableDynamicSizing={false}
                    backgroundStyle={styles.bottomSheetBackground}
                    handleIndicatorStyle={styles.bottomSheetIndicator}
                    backdropComponent={renderBackdrop}>
                    <BottomSheetScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.bottomSheetHeader}>
                            <Text style={styles.bottomSheetTitle}>Select {currentModeConfig?.name} Route</Text>
                            <Text style={styles.bottomSheetSubtitle}>{filteredRoutes.length} routes available</Text>
                        </View>

                        <FlatList
                            data={filteredRoutes}
                            renderItem={({ item, index }) => renderRouteItem({ item, index, showIcon: true })}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.bottomSheetRoutesList}
                        />
                    </BottomSheetScrollView>
                </BottomSheetModal>
            </SafeAreaView>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.background,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 12 : 42,
        paddingBottom: 24,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#0f172a',
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#fee2e2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    clearButtonText: {
        fontSize: 14,
        color: '#dc2626',
        fontWeight: '500',
    },
    scrollContainer: {
        flex: 1,
    },
    homeSection: {
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    homeTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 8,
    },
    homeSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 40,
    },
    homeModeCards: {
        gap: 24,
    },
    homeModeCardContainer: {
        marginBottom: 0,
    },
    homeModeCard: {
        borderRadius: 24,
        borderWidth: 2,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        ...(Platform.OS === 'ios' && { elevation: 10 }),
    },
    homeModeCardGradient: {
        padding: 24,
    },
    homeModeCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    homeModeCardIconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    homeModeCardIcon: {
        fontSize: 36,
    },
    routeCountBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    routeCountText: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: '700',
    },
    homeModeCardTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    homeModeCardDescription: {
        fontSize: 15,
        color: '#64748b',
        lineHeight: 22,
        marginBottom: 8,
    },
    homeModeCardRoutes: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '500',
    },
    homeModeCardAction: {
        alignItems: 'flex-end',
        marginRight: 16,
    },
    actionArrow: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionArrowText: {
        fontSize: 20,
        color: '#ffffff',
        fontWeight: '600',
    },
    routeSelectionContainer: {
        flex: 1,
    },
    routeSelectionSection: {
        flex: 1,
        paddingHorizontal: 24,
    },
    routeSelectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        ...(Platform.OS === 'ios' && { elevation: 4 }),
        marginBottom: 20,
    },
    routeSelectionIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    routeSelectionIcon: {
        fontSize: 28,
    },
    routeSelectionTextContainer: {
        flex: 1,
    },
    routeSelectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    routeSelectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    routeListContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        padding: 16,
        ...(Platform.OS === 'ios' && { elevation: 4 }),
        overflow: 'hidden',
    },
    journeyViewContainer: {
        flex: 1,
    },
    combinedInfoCard: {
        marginHorizontal: 24,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        ...(Platform.OS === 'ios' && { elevation: 4 }),
    },
    stationsCard: {
        marginHorizontal: 24,
        paddingTop: 24,
        marginBottom: 24,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        ...(Platform.OS === 'ios' && { elevation: 4 }),
        overflow: 'hidden',
    },
    sectionLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginHorizontal: 24,
        marginVertical: 16,
    },
    stationsListContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    currentLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 12,
    },
    currentLocationIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
        marginRight: 8,
    },
    currentLocationText: {
        fontSize: 14,
        color: '#059669',
        fontWeight: '500',
    },
    stationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stationConnector: {
        alignItems: 'center',
        marginRight: 16,
        width: 32,
    },
    stationStatusIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    stationStatusIconText: {
        fontSize: 14,
        fontWeight: '600',
    },
    connectorLine: {
        width: 3,
        height: 52,
        marginVertical: 8,
        borderRadius: 1.5,
    },
    stationCard: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        ...(Platform.OS === 'ios' && { elevation: 4 }),
        width: Platform.OS === 'ios' ? SCREEN_WIDTH * 0.62 : SCREEN_WIDTH * 0.65,
        overflow: 'hidden',
    },
    stationStatusBar: {
        height: 4,
        width: '100%',
        overflow: 'hidden',
    },
    stationContent: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stationMainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        backgroundColor: '#e2e8f0',
    },
    locationIconText: {
        fontSize: 14,
        color: '#ffffff',
    },
    stationDetails: {
        flex: 1,
    },
    stationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    stationTypeLabel: {
        fontSize: 12,
        color: '#64748b',
        textTransform: 'capitalize',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    bottomSheetBackground: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        ...(Platform.OS === 'ios' && { elevation: 12 }),
    },
    bottomSheetIndicator: {
        backgroundColor: '#cbd5e1',
        width: 48,
        height: 4,
        borderRadius: 2,
    },
    bottomSheetContent: {
        flex: 1,
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    bottomSheetHeader: {
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: 20,
    },
    bottomSheetTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    bottomSheetSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    bottomSheetRoutesList: {
        paddingBottom: 20,
    },
    routeOption: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    routeOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    routeIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    routeOptionIcon: {
        fontSize: 24,
    },
    routeOptionDetails: {
        flex: 1,
    },
    routeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    routeMeta: {
        fontSize: 13,
        color: '#64748b',
    },
    routeOptionArrow: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowIcon: {
        fontSize: 14,
        color: '#64748b',
    },
});

export { JourneySimulation };
