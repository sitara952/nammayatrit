import { useMemo, useState, useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { AnimatedModal } from '../../../../../../src/typescript/components/common/AnimatedModal';
import { TouchableOpacity } from '../../../../../../src-v2/primitives/TouchableOpacity';
import { BusSelectorList } from '../../../NewLiveJourney/components/BusSelectorList';
import { removeWordBuses } from '../../../JourneyInfoScreen/DirectBooking/components/BusTransitCard';
import Animated from 'react-native-reanimated';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import {
    DestinationPickerWithSections,
    StationSection,
} from '../../../MetroSubwayBooking/components/DestinationPickerWithSections';

export interface RouteSelectionModalProps {
    /** Whether the modal should be visible */
    isVisible: boolean;

    /** Array of route options to display */
    routes: Array<{
        code: string;
        shortName: string;
        longName: string;
        reverseRoute: string | undefined;
    }>;

    /** Currently selected route index */
    selectedRouteIndex: number;

    /** Callback when user selects a route */
    onRouteSelect: (routeIndex: number) => void;

    /** List of destination stops to choose from */
    destinationStops: StationSection[];

    /** Currently selected destination stop */
    selectedDestination: transportStation | null;

    /** Callback when user selects a destination */
    onDestinationSelect: (stop: transportStation) => void;

    /** Callback when modal is dismissed */
    onDismiss: () => void;

    originalSelectedSource: transportStation | null;
    destinationPickerRef: React.RefObject<View | null> | undefined;
    routeStartStation?: string;
}

/**
 * Simple animated modal component for selecting between multiple bus routes
 * Shows routes with direction indicators (↑, ↓) similar to the design
 */
export const RouteSelectionModal: React.FC<RouteSelectionModalProps> = ({
    isVisible,
    routes,
    selectedRouteIndex,
    onRouteSelect,
    destinationStops,
    selectedDestination,
    onDestinationSelect,
    originalSelectedSource,
    destinationPickerRef,
    onDismiss,
    routeStartStation,
}) => {
    const [modalVisible, setModalVisible] = useState(isVisible);

    const [destinationSelected, setDestinationSelected] = useState<transportStation | null>(selectedDestination);

    // Check if button should be disabled
    const isDisabled = destinationSelected === null;

    // Sync local state with prop
    useEffect(() => {
        console.info('RouteSelectionModal: isVisible changed to', isVisible, 'routes count:', routes.length);
        setModalVisible(isVisible);
    }, [isVisible, routes.length]);

    // Transform routes into display format with direction indicators
    const routeItems = useMemo(() => {
        return routes.map((route, index) => {
            // Determine direction indicator based on route characteristics
            const getDirectionIndicator = (route: RouteSelectionModalProps['routes'][0], index: number) => {
                // If this route has a reverse route, it's likely the "forward" direction
                if (route.reverseRoute) {
                    return '↓'; // Down arrow for primary direction
                }

                // Check if this route is a reverse of another route in the list
                const isReverse = routes.some(r => r.reverseRoute === route.code);
                if (isReverse) {
                    return '↑'; // Up arrow for reverse direction
                }

                // For routes without clear direction, alternate indicators
                return index % 2 === 0 ? '↓' : '↑';
            };

            const direction = getDirectionIndicator(route, index);
            return {
                ...route,
                displayName: `${route.shortName} ${direction}`,
                index,
            };
        });
    }, [routes]);

    const handleRoutePress = (index: number) => {
        onRouteSelect(index);
    };

    const handleConfirm = () => {
        if (destinationSelected) {
            onDestinationSelect(destinationSelected);
        }
        setModalVisible(false);
        setDestinationSelected(null);
        onDismiss();
    };

    const handleClose = () => {
        setModalVisible(false);
        onDismiss();
    };

    if (routes.length <= 1) {
        console.info('RouteSelectionModal: Not rendering, routes.length =', routes.length);
        return null;
    }

    console.info('RouteSelectionModal: Rendering with modalVisible =', modalVisible, 'routes =', routes);

    return (
        <AnimatedModal
            visible={modalVisible}
            setVisible={setModalVisible}
            onClose={handleClose}
            animationDuration={300}
            allowCloseOnBackdropPress={true}
            contentStyle={{
                backgroundColor: 'white',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 20,
                paddingBottom: 40,
                maxHeight: Platform.OS === 'android' ? '100%' : '93%',
                marginTop: 'auto',
            }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <View
                    style={{
                        width: 50,
                        height: 5,
                        backgroundColor: '#E0E0E0',
                        borderRadius: 4,
                        marginBottom: 16,
                    }}
                />

                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#3B3A3C',
                        textAlign: 'center',
                    }}>
                    Choose your destination stop and route
                </Text>
            </View>

            {/* Destination Stop Picker */}
            <View style={{ marginBottom: 24, borderRadius: 24, overflow: 'hidden' }}>
                <DestinationPickerWithSections
                    stationSections={destinationStops}
                    selectedStation={destinationSelected ?? null}
                    onSelectStation={setDestinationSelected}
                    onClose={() => {}}
                    sourceStation={originalSelectedSource ?? null}
                    isRouteToggleEnabled={true}
                    handleRouteToggle={() => {}}
                    routeStartStation={routeStartStation}
                    accessibilityRef={destinationPickerRef}
                    showSearchBar={false}
                    title="Destination Stop"
                    otherContentHeight={Platform.OS === 'android' ? 400 : 0}
                />
            </View>

            <Animated.View style={{ marginBottom: 16 }}>
                <BusSelectorList
                    busList={
                        routeItems && routeItems.length > 0
                            ? routeItems.map((route, idx) => ({
                                  busNumber: route.displayName,
                                  serviceTierName: removeWordBuses(route?.shortName),
                                  index: idx,
                                  onChangeBusPress: () => {
                                      setDestinationSelected(null);
                                      handleRoutePress(idx);
                                  },
                              }))
                            : []
                    }
                    selectedIndex={selectedRouteIndex ?? 0}
                    selectedBusNumber={null}
                />
            </Animated.View>

            {/* Confirm Button */}
            <TouchableOpacity
                testID="confirm-route-button"
                onPress={isDisabled ? undefined : handleConfirm}
                accessibilityRole="button"
                accessibilityLabel={
                    isDisabled ? 'Confirm button disabled - please select a destination' : 'Confirm selected route'
                }
                accessibilityState={{ disabled: isDisabled }}
                style={{
                    backgroundColor: isDisabled ? '#BFBFBF' : '#016ACD',
                    borderRadius: 16,
                    paddingVertical: 16,
                    alignItems: 'center',
                    opacity: isDisabled ? 0.6 : 1,
                }}>
                <Text
                    style={{
                        color: '#FFFFFF',
                        fontSize: 18,
                        fontWeight: 'bold',
                        fontFamily: 'AreaNormal-Extrabold',
                    }}>
                    Confirm Stop
                </Text>
            </TouchableOpacity>
        </AnimatedModal>
    );
};
