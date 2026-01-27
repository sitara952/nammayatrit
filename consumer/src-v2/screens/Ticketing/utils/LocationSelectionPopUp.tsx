import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import CloseIcon from '@/typescript/components/svg/CloseIcon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';

export type LocationOption = {
    id: string;
    name: string;
    enforcedTicketPlaceId: string;
    isSelected: boolean | undefined;
};

export type LocationSelectionModalProps = {
    locations: LocationOption[];
    setShouldShowLocationModal: React.Dispatch<React.SetStateAction<boolean>>;
    onLocationSelect: (subPlaceId: string, enforcedTicketPlaceId: string) => void;
};

export const LocationSelectionPopUp: React.FC<LocationSelectionModalProps> = ({
    locations,
    setShouldShowLocationModal,
    onLocationSelect,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(
        locations.find(loc => loc.isSelected) || null,
    );

    const handleLocationSelect = (location: LocationOption) => {
        setSelectedLocation(location);
    };

    const handleConfirmSelection = () => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation.id, selectedLocation.enforcedTicketPlaceId);
        }
    };

    const RadioButton: React.FC<{ isSelected: boolean }> = ({ isSelected }) => (
        <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
            {isSelected && <View style={styles.radioButtonInner} />}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.title}>
                        {userLanguageStrings.SelectStartPoint}
                    </Typography>
                </View>
                <TouchableOpacity
                    testID={`backpress-clicked`}
                    style={{}}
                    onPress={() => {
                        setShouldShowLocationModal(false);
                        navigation.goBack();
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Close location selection">
                    <CloseIcon color={undefined} height={20} width={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {locations.map((location, index) => (
                    <View key={location.id}>
                        <TouchableOpacity
                            testID={`location-item-${location.id}`}
                            style={styles.locationItem}
                            onPress={() => handleLocationSelect(location)}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={`Select ${location.name} as start point`}>
                            <RadioButton isSelected={selectedLocation?.id === location.id} />
                            <Text style={styles.locationName}>{location.name}</Text>
                        </TouchableOpacity>
                        {index < locations.length - 1 && <View style={styles.divider} />}
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    testID="select-location-button"
                    style={[styles.selectButton, !selectedLocation && styles.selectButtonDisabled]}
                    onPress={handleConfirmSelection}
                    disabled={!selectedLocation}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={
                        selectedLocation ? `Confirm selection of ${selectedLocation.name}` : 'Select a location first'
                    }>
                    <Text style={styles.selectButtonText}>{userLanguageStrings.Select}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8F9FB',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        color: '#14171F',
    },
    content: {
        borderColor: '#E0E3E8',
        borderWidth: 1,
        borderRadius: 18,
        marginTop: 16,
        paddingHorizontal: 14,
        paddingVertical: 24,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#14171F',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#14171F',
    },
    locationName: {
        fontSize: 16,
        color: '#14171F',
        fontWeight: '500',
        flex: 1,
    },
    divider: {
        height: 2,
        backgroundColor: '#F1F2F7',
        marginVertical: 18,
    },
    footer: {
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F2F7',
    },
    selectButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    selectButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
