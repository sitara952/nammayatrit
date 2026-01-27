import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { MapContext } from '@/typescript/Maps/MapContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectCurrentRegion } from '@/typescript/state/client/maps';
import AnimatedPickupMarker from '@/typescript/components/AnimatedPickupMarker';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Input from '@/typescript/designSystem/components/primitives/Input';
import useAutocomplete from '@/src-v2/multimodal/screens/Favourites/hooks/useAutocomplete';
import colors from '@/typescript/designSystem/colorPalette';
import { Icon } from '@/typescript/components/Icon';
import { LocationPin } from '@/typescript/components/svg/search/LocationPin';
import CardSearch from '@/typescript/designSystem/components/CardSearch';
import { useLocationPredictions, LocationSearchOptions } from '@/typescript/hooks/useLocationPredictions';
import { GenericFloatingMapButton } from '@/typescript/designSystem/components/GenericFloatingMapButton';
import LeftArrow from '@/typescript/assets/svg/direction/LeftArrow';
import { getPlaceIdByLatLon } from '@/typescript/utils/location';
import { selectCurrentLocationCoords } from '@/typescript/state/client/session';

/**
 * MapLocationSelector Component
 *
 * A reusable component that provides map-based location selection functionality.
 *
 * Features:
 * - Location search with autocomplete
 * - Map-based location selection via drag & drop
 * - Animated marker for visual feedback
 * - Reverse geocoding for map selections
 *
 * Flow:
 * 1. User can search for a location using the search bar
 * 2. User can drag the map to select a location
 * 3. Selected location is displayed in the footer
 * 4. User confirms selection which triggers onLocationSelect
 *
 * Performance Optimizations:
 * - Debounced search to prevent API spam
 * - Memoized components and callbacks
 * - Proper cleanup of map resources
 * - Optimized re-renders with React.memo
 */

interface MapLocationSelectorProps {
    /** Initial coordinates to center the map */
    initialLocation: { lat: number; lon: number };
    /** Callback when user confirms location selection */
    onLocationSelect: (location: location) => void;
    /** Callback when user closes the selector */
    onClose: () => void;
}

const MapLocationSelector: React.FC<MapLocationSelectorProps> = ({ initialLocation, onLocationSelect, onClose }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { mapRef } = useContext(MapContext);
    const [selectedLocation, setSelectedLocation] = useState<location | null>(null);
    const [searchText, setSearchText] = useState('');
    // searchResults come from useLocationPredictions
    const [showSearchResults, setShowSearchResults] = useState(false);

    const mapId = useMemo(() => mapRef.current?.mapId ?? null, [mapRef.current?.mapId]);

    const reduxCurrentRegion = useAppSelector(useCallback(state => selectCurrentRegion(state, mapId), [mapId]));
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const [fetchPredictions, { data: searchResults, locationSearchStatus }] = useLocationPredictions();

    const currentCoords = useMemo(
        () => ({
            lat: initialLocation.lat,
            lng: initialLocation.lon,
        }),
        [initialLocation.lat, initialLocation.lon],
    );

    const searchParams = useMemo(
        () => ({
            lat: initialLocation.lat,
            lng: initialLocation.lon,
            isPickup: false,
            currentCoords,
        }),
        [initialLocation.lat, initialLocation.lon, currentCoords],
    );

    /**
     * Handles search input changes with optimizations:
     * - Minimum 2 characters required for search
     * - Trims whitespace
     * - Prevents unnecessary API calls
     */
    const handleSearch = useCallback(
        async (text: string) => {
            const trimmedText = text.trim();
            if (trimmedText.length < 2) {
                setShowSearchResults(false);
                return;
            }

            // Only search if text is different from current location
            if (selectedLocation?.formattedAddress?.toLowerCase().includes(trimmedText.toLowerCase())) {
                return;
            }

            await fetchPredictions({
                input: trimmedText,
                ...searchParams,
            });
            setShowSearchResults(true);
        },
        [searchParams, fetchPredictions, selectedLocation],
    );

    const { locationByPlaceId } = useAutocomplete('');

    /**
     * Handles map and marker animations with optimizations:
     * - Prevents unnecessary animations for small movements
     * - Maintains consistent zoom level
     * - Manages marker animation state
     * - Prevents auto-location updates during manual selection
     *
     * @param lat - Target latitude
     * @param lon - Target longitude
     * @param isGesture - Whether the animation is triggered by a gesture
     */
    const animateToLocation = useCallback((lat: number, lon: number, isGesture: boolean = false) => {
        if (!mapRef.current) return;

        // Skip animation if movement is too small (within 0.0001 degree ≈ 11 meters)
        const currentRegion = mapRef.current.currentRegion?.current?.region;
        if (
            currentRegion &&
            Math.abs(currentRegion.latitude - lat) < 0.0001 &&
            Math.abs(currentRegion.longitude - lon) < 0.0001
        ) {
            return;
        }

        mapRef.current.animateCamera({
            lat,
            lon,
            zoom: 18.2,
            duration: 500,
        });
        mapRef.current.changeAutoAnimationToCurrentLocation(false);
        mapRef.current.setCenterView(() => <AnimatedPickupMarker isMoved={isGesture} markerRingColor={undefined} />);
    }, []);

    const handleSearchItemSelect = useCallback(
        async (item: location) => {
            try {
                const locationItemByPlaceId = await locationByPlaceId(item);
                if (!locationItemByPlaceId) return;

                setSelectedLocation(locationItemByPlaceId);
                setSearchText(locationItemByPlaceId.formattedAddress || '');

                if (locationItemByPlaceId.lat && locationItemByPlaceId.lng) {
                    animateToLocation(locationItemByPlaceId.lat, locationItemByPlaceId.lng, false);
                }
                setShowSearchResults(false);
            } catch (error) {
                console.error('Error selecting location:', error);
            }
        },
        [locationByPlaceId, animateToLocation],
    );

    const initializeMap = useCallback(() => {
        if (!mapRef.current) return;

        // Set initial marker and camera position
        mapRef.current.animateCamera({
            lat: initialLocation.lat,
            lon: initialLocation.lon,
            zoom: 18.2,
            duration: 500,
        });
        mapRef.current.changeAutoAnimationToCurrentLocation(false);
        mapRef.current.setCenterView(() => <AnimatedPickupMarker isMoved={false} markerRingColor={undefined} />);

        // Set initial location as selected location
        setSelectedLocation({
            lat: initialLocation.lat,
            lng: initialLocation.lon,
            placeId: undefined,
            title: undefined,
            subtitle: undefined,
            formattedAddress: undefined,
            tag: 'AUTOCOMPLETE',
            addressComponents: undefined,
            serviceable: undefined,
            hotSpotInfo: undefined,
            serviceabilityCity: undefined,
            specialLocation: undefined,
            locationType: undefined,
            distanceFromCurrentLocation: undefined,
        });

        // Get initial location details
        getPlaceIdByLatLon(initialLocation.lat, initialLocation.lon, 'destination')
            .then(locationDetails => {
                if (locationDetails.result) {
                    setSelectedLocation(locationDetails.result);
                    setSearchText(locationDetails.result.formattedAddress || '');
                }
            })
            .catch(error => {
                console.error('Error getting initial location:', error);
            });
    }, [initialLocation]);

    useEffect(() => {
        // Initialize map with marker
        initializeMap();

        // Cleanup function
        return () => {
            if (mapRef.current) {
                // Reset map state
                mapRef.current.changeAutoAnimationToCurrentLocation(true);
                mapRef.current.setCenterView(() => <></>);

                // Clear selected location
                setSelectedLocation(null);
                setSearchText('');
            }
        };
    }, []);

    // Update marker position when selected location changes
    const selectedCoords = useMemo(
        () =>
            selectedLocation?.lat && selectedLocation?.lng
                ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
                : null,
        [selectedLocation?.lat, selectedLocation?.lng],
    );

    useEffect(() => {
        if (selectedCoords) {
            animateToLocation(selectedCoords.lat, selectedCoords.lng);
        }
    }, [selectedCoords?.lat, selectedCoords?.lng]);

    // Prevent auto-location updates when map is shown
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.changeAutoAnimationToCurrentLocation(false);
        }
        return () => {
            if (mapRef.current) {
                mapRef.current.changeAutoAnimationToCurrentLocation(true);
            }
        };
    }, []);

    /**
     * Handles map gesture (drag) events with optimizations:
     * - Debounced API calls to prevent spam during continuous gestures
     * - Prevents duplicate API calls for same coordinates
     * - Maintains marker animation state
     */
    const handleMapGesture = useCallback(
        async (latitude: number, longitude: number) => {
            // Skip if coordinates haven't changed significantly (within 0.0001 degree ≈ 11 meters)
            if (
                selectedLocation?.lat &&
                selectedLocation?.lng &&
                Math.abs(selectedLocation.lat - latitude) < 0.0001 &&
                Math.abs(selectedLocation.lng - longitude) < 0.0001
            ) {
                return;
            }

            try {
                const locationDetails = await getPlaceIdByLatLon(latitude, longitude, 'destination');
                if (locationDetails.result) {
                    setSelectedLocation(locationDetails.result);
                    setSearchText(locationDetails.result.formattedAddress || '');
                    animateToLocation(latitude, longitude, true);
                }
            } catch (error) {
                console.error('Error getting location:', error);
            }
        },
        [animateToLocation, selectedLocation],
    );

    const currentRegion = useMemo(
        () => ({
            isGesture: reduxCurrentRegion.isGesture,
            latitude: reduxCurrentRegion.region.latitude,
            longitude: reduxCurrentRegion.region.longitude,
        }),
        [reduxCurrentRegion.isGesture, reduxCurrentRegion.region.latitude, reduxCurrentRegion.region.longitude],
    );

    useEffect(() => {
        if (currentRegion.isGesture) {
            handleMapGesture(currentRegion.latitude, currentRegion.longitude);
        }
    }, [currentRegion.isGesture, currentRegion.latitude, currentRegion.longitude]);

    const handleConfirm = useCallback(() => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation);
        }
    }, [selectedLocation, onLocationSelect]);

    const renderSearchResults = useMemo(() => {
        if (!showSearchResults) return null;

        if (locationSearchStatus === LocationSearchOptions.LOADING) {
            return (
                <View style={styles.searchResults}>
                    <Text style={styles.messageText}>{userLanguageStrings.Search}</Text>
                </View>
            );
        }

        if (locationSearchStatus === LocationSearchOptions.LOCATIONS_NOT_FOUND) {
            return (
                <View style={styles.searchResults}>
                    <Text style={styles.messageText}>{userLanguageStrings.NoLocationsFound}</Text>
                </View>
            );
        }

        return (
            <>
                <FlatList
                    data={searchResults}
                    keyboardShouldPersistTaps="handled"
                    style={styles.searchResults}
                    keyExtractor={(item, index) => item?.placeId ?? '' + index}
                    renderItem={({ item, index }) => (
                        <CardSearch
                            isFavouritesSearch={item.tag === 'PUBLIC_TRANSPORT_RECENTS'}
                            style={tailwind.style(index === 0 ? 'pt-[8px]' : '')}
                            prefix={
                                <Icon color={colors?.recovered?.neutralUltraHigh} icon={<LocationPin />} size={20} />
                            }
                            title={item.title || ''}
                            description={item.subtitle || ''}
                            onPress={() => handleSearchItemSelect(item)}
                            showTime={undefined}
                            isAnimate={undefined}
                            suffix={undefined}
                            location={item.formattedAddress || ''}
                            badge={undefined}
                            isLoading={undefined}
                            styles={undefined}
                            searchTerm={searchText}
                            testID={`search-result-${index}`}
                            currentLocation={currentLocationCoords}
                            sourceLocation={null}
                            activeInput={undefined}
                        />
                    )}
                />
                <GenericFloatingMapButton handleOnPress={() => setShowSearchResults(false)} />
            </>
        );
    }, [
        showSearchResults,
        locationSearchStatus,
        searchResults,
        userLanguageStrings,
        searchText,
        handleSearchItemSelect,
    ]);

    const handleTextChange = useCallback(
        (text: string) => {
            setSearchText(text);
            handleSearch(text);
        },
        [handleSearch],
    );

    const renderHeader = useMemo(
        () => (
            <View style={styles.header}>
                <TouchableOpacity
                    testID="back-button:map-location-selector"
                    accessibilityRole="button"
                    style={styles.backButton}
                    onPress={onClose}>
                    <LeftArrow fill={colors?.recovered?.neutralUltraHigh} />
                </TouchableOpacity>
                <Text style={styles.title}>{userLanguageStrings.Select}</Text>
            </View>
        ),
        [onClose, userLanguageStrings.Select],
    );

    const renderSearchInput = useMemo(
        () => (
            <View style={styles.searchContainer}>
                <Input
                    type="secondary"
                    placeholder={userLanguageStrings.SearchaLocation}
                    value={searchText}
                    onChangeText={handleTextChange}
                    containerStyle={styles.searchInput}
                    prefix={<Icon color={colors?.recovered?.neutralUltraHigh} icon={<LocationPin />} size={20} />}
                    suffix={undefined}
                    accessibleLabel={undefined}
                    // selectTextOnFocus={true}
                    autoCorrect={false}
                    // autoFocus
                    selectTextOnFocus
                />
            </View>
        ),
        [searchText, userLanguageStrings.SearchaLocation, handleTextChange],
    );

    const renderFooter = useMemo(() => {
        if (!selectedLocation || showSearchResults) return null;

        return (
            <View style={styles.footer}>
                <View style={styles.locationInfo}>
                    <Text style={styles.locationTitle}>{selectedLocation.title}</Text>
                    <Text style={styles.locationSubtitle}>{selectedLocation.subtitle}</Text>
                </View>
                <Button
                    type="primary"
                    text={userLanguageStrings.Confirm}
                    onPress={handleConfirm}
                    testID="confirm-map-location"
                />
            </View>
        );
    }, [selectedLocation, showSearchResults, userLanguageStrings.Confirm, handleConfirm]);

    return (
        <View style={[styles.container]}>
            {renderHeader}
            {renderSearchInput}
            {renderSearchResults}
            {renderFooter}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        pointerEvents: 'box-none',
        position: 'absolute',
        top: Platform.OS === 'ios' ? 58 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        height: Platform.OS === 'ios' ? 88 : 64,
        paddingTop: 30,
    },
    backButton: {
        padding: 10,
        marginRight: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    searchInput: {
        marginBottom: 0,
    },
    searchResults: {
        backgroundColor: 'white',
        maxHeight: '50%',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
    },
    locationInfo: {
        marginBottom: 16,
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    locationSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    messageText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        padding: 16,
    },
});

const arePropsEqual = (prevProps: MapLocationSelectorProps, nextProps: MapLocationSelectorProps): boolean => {
    return (
        prevProps.initialLocation.lat === nextProps.initialLocation.lat &&
        prevProps.initialLocation.lon === nextProps.initialLocation.lon &&
        prevProps.onLocationSelect === nextProps.onLocationSelect &&
        prevProps.onClose === nextProps.onClose
    );
};

export default React.memo(MapLocationSelector, arePropsEqual);
