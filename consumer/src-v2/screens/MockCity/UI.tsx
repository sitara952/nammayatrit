import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Switch, NativeModules, Platform, Alert } from 'react-native';
import { CityData, MOCK_CITIES } from './Types';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Button from '@/src-v2/primitives/Button';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { usePublicTransportData } from '@/src-v2/multimodal/hooks/usePublicTransportData';
import { createMMKV } from '@/utils/mmkvUtils';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import MapProvider from '@/typescript/Maps/MapProvider';
import MapLocationSelector from './components/MapLocationSelector';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { MMKVKey, setStringItem, getStringItem } from '@/typescript/utils/MMKV';
import { handleCopyToClipBoard } from '@/src-v2/utils/common';

export const MOCK_CITY_KEY = 'mock_city';
const storage = createMMKV();

const MockCityScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [shouldNavigate, setShouldNavigate] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [localCugEnabled, setLocalCugEnabled] = useState<boolean>(() => {
        const stored = getStringItem(MMKVKey.LOCAL_CUG_ENABLED);
        return stored === 'true';
    });

    // Only initialize the hook with enabled=false to prevent automatic API calls
    const { refreshData, isLoading } = usePublicTransportData(true);
    const selectedMockCityData = storage.getString(MOCK_CITY_KEY);
    const selectedLocationData = storage.getString(`${MOCK_CITY_KEY}_location`);

    const [tempSelectedCity, setTempSelectedCity] = useState<CityData | null>(() => {
        if (!selectedMockCityData) return null;

        const city = MOCK_CITIES.find(city => city.name === selectedMockCityData);
        if (!city) return null;

        if (selectedLocationData) {
            const location = safeJsonParse(selectedLocationData, undefined, 'selectedLocation');
            return location ? { ...city, selectedLocation: location } : city;
        }

        return city;
    });

    useEffect(() => {
        if (shouldNavigate && !isLoading) {
            navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
            setShouldNavigate(false);
        }
    }, [isLoading, shouldNavigate, navigation]);

    const handleCitySelect = (city: (typeof MOCK_CITIES)[number]) => {
        const newCity = { ...city, selectedLocation: undefined };
        setTempSelectedCity(newCity);
    };

    const handleConfirmSelection = () => {
        if (tempSelectedCity) {
            // Store city name
            storage.set(MOCK_CITY_KEY, tempSelectedCity.name);
            storage.delete(`${MOCK_CITY_KEY}_location`);
            refreshData().then(() => {
                setShouldNavigate(true);
            });
        }
    };

    const handleClearMockCity = () => {
        storage.delete(MOCK_CITY_KEY);
        storage.delete(`${MOCK_CITY_KEY}_location`);
        setTempSelectedCity(null);
        refreshData().then(() => {
            setShouldNavigate(true);
        });
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleLocalCugToggle = (value: boolean) => {
        setLocalCugEnabled(value);
        setStringItem(MMKVKey.LOCAL_CUG_ENABLED, value.toString());

        // Also write to SharedPreferences for native access
        if (Platform.OS === 'android') {
            try {
                const { MainAppUtils } = NativeModules;
                MainAppUtils.updateSharedPreferences({ LOCAL_CUG_ENABLED: value });
            } catch (error) {
                console.warn('Failed to update SharedPreferences:', error);
            }
        }
    };

    const handleLocationSelect = (location: location) => {
        if (!tempSelectedCity || !location.lat || !location.lng) return;

        // Store city name and location data
        storage.set(MOCK_CITY_KEY, tempSelectedCity.name);
        storage.set(
            `${MOCK_CITY_KEY}_location`,
            JSON.stringify({
                lat: location.lat,
                lon: location.lng,
                address: location.formattedAddress ?? '',
            }),
        );

        // Update selected city with new location
        setTempSelectedCity({
            ...tempSelectedCity,
            selectedLocation: {
                lat: location.lat,
                lon: location.lng,
                address: location.formattedAddress ?? '',
            },
        });

        refreshData().then(() => {
            setShouldNavigate(true);
        });

        setShowMap(false);
    };

    const handleGetAppSignatures = async () => {
        try {
            const { AppInfoModule } = NativeModules;
            if (AppInfoModule && AppInfoModule.getAppSignatures) {
                const signatures: string[] = await AppInfoModule.getAppSignatures();
                const joinedSignatureString = signatures.join('\n') ?? '';
                handleCopyToClipBoard(joinedSignatureString);
                Alert.alert(
                    'App Signatures Copied',
                    `Found ${signatures.length} signature(s) and copied to clipboard:\n${joinedSignatureString}`,
                    [{ text: 'OK' }],
                );
            } else {
                Alert.alert('Error', 'AppInfoModule not available');
            }
        } catch (error) {
            Alert.alert('Error', `Failed to get app signatures: ${error}`);
        }
    };

    return (
        <HardwareBackpressHandler>
            <View style={[tailwind.style('flex-1 bg-white'), { paddingTop: insets.top }]}>
                {showMap && tempSelectedCity && (
                    <MapProvider
                        initialCoordinate={{
                            latitude: tempSelectedCity.selectedLocation?.lat ?? tempSelectedCity.coordinates.lat,
                            longitude: tempSelectedCity.selectedLocation?.lon ?? tempSelectedCity.coordinates.lon,
                        }}
                        mapId="MockCityMap"
                        fitToMapElementFlag={true}>
                        <MapLocationSelector
                            initialLocation={{
                                lat: tempSelectedCity.selectedLocation?.lat ?? tempSelectedCity.coordinates.lat,
                                lon: tempSelectedCity.selectedLocation?.lon ?? tempSelectedCity.coordinates.lon,
                            }}
                            onLocationSelect={handleLocationSelect}
                            onClose={() => setShowMap(false)}
                        />
                    </MapProvider>
                )}
                {!showMap && isLoading && (
                    <View style={tailwind.style('flex-1 items-center justify-center')}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                        <Text style={tailwind.style('text-sm text-gray-500 mt-2')}>Loading transport data...</Text>
                    </View>
                )}
                {!showMap && !isLoading && (
                    <>
                        <View style={tailwind.style('flex-row items-center justify-between p-4')}>
                            <Button
                                accessibilityRole="imagebutton"
                                size="md"
                                type="secondary"
                                text="Back"
                                onPress={handleBackPress}
                                testID={'back-button:mock-city'}
                            />
                            <Text style={tailwind.style('text-lg font-semibold')} onLongPress={handleGetAppSignatures}>
                                Select Mock City
                            </Text>
                            <View style={tailwind.style('flex-row items-center gap-2')}>
                                <Text style={tailwind.style('text-sm text-gray-600')}>CUG</Text>
                                <Switch
                                    trackColor={{ false: '#F0F1F4', true: '#016ACD' }}
                                    thumbColor={'#FFFFFF'}
                                    onValueChange={handleLocalCugToggle}
                                    value={localCugEnabled}
                                    testID="local-cug-toggle"
                                />
                            </View>
                        </View>

                        <View style={tailwind.style('p-4')}>
                            {MOCK_CITIES.map(city => (
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    key={city.name}
                                    testID={`select mock city - ${city.name}`}
                                    style={[
                                        styles.cityItem,
                                        tempSelectedCity?.name === city.name ? styles.selectedCity : null,
                                    ]}
                                    onPress={() => handleCitySelect(city)}>
                                    <Text
                                        style={[
                                            tailwind.style('text-base'),
                                            tempSelectedCity?.name === city.name && styles.selectedText,
                                        ]}>
                                        {city.name}
                                        {tempSelectedCity?.name === city.name && tempSelectedCity.selectedLocation ? (
                                            <Text style={tailwind.style('text-sm text-gray-500')}>
                                                {'\n' + tempSelectedCity.selectedLocation.address}
                                            </Text>
                                        ) : null}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            {tempSelectedCity && (
                                <>
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        style={[styles.cityItem, styles.mapButton]}
                                        onPress={() => setShowMap(true)}
                                        testID="locate-on-map">
                                        <Text style={tailwind.style('text-base text-blue-700')}>Locate on Map</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        style={[styles.cityItem, styles.ConfirmButton, tailwind.style('bg-red-500')]}
                                        onPress={handleConfirmSelection}
                                        testID="confirm-city-selection">
                                        <Text style={tailwind.style('text-base text-white')}>Confirm Selection</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                            {selectedMockCityData && (
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    style={[styles.cityItem, styles.clearButton]}
                                    onPress={handleClearMockCity}
                                    testID="mock-city-clear">
                                    <Text style={tailwind.style('text-base text-red-500')}>Clear Mock Location</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}
            </View>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    cityItem: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#F3F4F6',
    },
    selectedCity: {
        backgroundColor: '#4F46E5',
    },
    selectedText: {
        color: '#FFFFFF',
    },
    clearButton: {
        marginTop: 16,
        backgroundColor: '#FEE2E2',
    },
    ConfirmButton: {
        marginTop: 16,
    },
    mapButton: {
        marginTop: 16,
        backgroundColor: '#EBF5FD',
    },
});

export default MockCityScreen;
