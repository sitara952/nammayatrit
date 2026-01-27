import { Pressable } from '@/src-v2/primitives/Pressable';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import { getVehicleFromVehicleType } from '@/typescript/utils/bookingUtils';
import { getCurrency } from '@/typescript/utils/getCurrency';
import find from 'lodash/find';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';

type ExpandedDataItem = {
    name: string;
    value: string;
    service: ServiceTierType_serviceTierType;
    isAc: boolean;
    description: string | undefined;
    cost: number | undefined;
    toCost: number | undefined;
    currency: string | undefined;
    vehicleIconUrl: string | undefined;
};

type ListExpandedViewProps = {
    expandedData: ExpandedDataItem[] | undefined;
    selectedExpandedData: string[];
    setSelectedExpandedData: React.Dispatch<React.SetStateAction<string[]>>;
    onTagSelect: (value: string[]) => void;
};

const ItemCostDisplay = ({ item, isSelected }: { item: ExpandedDataItem; isSelected: boolean }) => {
    if (item.cost === undefined || item.cost === null) return null;

    return (
        <Animated.View style={styles.costContainer}>
            {item.currency && (
                <Typography
                    type="subhead-1"
                    style={styles.currencyText}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {getCurrency(item.currency)}
                </Typography>
            )}
            <Typography
                type="subhead-1"
                style={[styles.costText, isSelected ? styles.costTextSelected : styles.costTextUnselected]}
                numberOfLines={1}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {item.toCost && item.cost !== item.toCost ? `${item.cost}-${item.toCost}` : item.cost?.toString()}
            </Typography>
        </Animated.View>
    );
};

const ItemServiceDetails = ({ item, isSelected }: { item: ExpandedDataItem; isSelected: boolean }) => (
    <Animated.View style={styles.serviceContainer}>
        <Typography
            type="subhead-1"
            style={[styles.serviceNameText, isSelected ? styles.costTextSelected : styles.costTextUnselected]}
            numberOfLines={1}
            isAnimate={undefined}
            accessible={undefined}
            accessibilityLabel={undefined}
            accessibilityRole={undefined}>
            {item.name}
        </Typography>
        {item.description && (
            <Typography
                type="body-1"
                style={styles.serviceDescriptionText}
                numberOfLines={2}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {item.description}
            </Typography>
        )}
    </Animated.View>
);

export const ListExpandedView: React.FC<ListExpandedViewProps> = ({
    expandedData,
    selectedExpandedData,
    setSelectedExpandedData,
    onTagSelect,
}) => {
    const handleItemPress = (item: ExpandedDataItem) => {
        if (!item.value) return;

        const updatedData = [item.value];
        setSelectedExpandedData(updatedData);
        const mappedData = updatedData.map(dataItem => {
            const foundItem = find(expandedData, findItem => dataItem === findItem?.value);
            return foundItem?.value ?? dataItem;
        });
        onTagSelect(mappedData);
    };

    return (
        <Animated.View style={styles.listContainer}>
            {expandedData?.map(
                item =>
                    item && (
                        <Pressable
                            key={item.value}
                            testID={`choose_ride_ambulance_item_${item.name?.toLowerCase().replace(/\s+/g, '_')}`}
                            onPress={() => handleItemPress(item)}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityState={{
                                selected: item.value ? selectedExpandedData?.includes(item.value) : false,
                            }}
                            style={[
                                styles.itemBase,
                                selectedExpandedData?.includes(item.value)
                                    ? styles.itemSelected
                                    : styles.itemUnselected,
                            ]}>
                            <Animated.View style={styles.itemContentRow}>
                                <Animated.View style={styles.itemLeftSection}>
                                    <Image
                                        source={
                                            item.vehicleIconUrl
                                                ? { uri: item.vehicleIconUrl }
                                                : getVehicleFromVehicleType(item.service, item.isAc)
                                        }
                                        style={styles.vehicleImage}
                                        resizeMode="contain"
                                        accessible={true}
                                        accessibilityLabel="ambulance vehicle"
                                    />
                                    <ItemServiceDetails
                                        item={item}
                                        isSelected={selectedExpandedData?.includes(item.value)}
                                    />
                                </Animated.View>

                                <Animated.View style={styles.itemRightSection}>
                                    <ItemCostDisplay
                                        item={item}
                                        isSelected={selectedExpandedData?.includes(item.value)}
                                    />
                                </Animated.View>
                            </Animated.View>
                        </Pressable>
                    ),
            )}

            {expandedData && expandedData.length > 1 && (
                <Animated.View style={styles.helperTextContainer}>
                    <Typography
                        type="body-1"
                        style={styles.helperText}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        Select one ambulance type. {selectedExpandedData?.length > 0 ? '1 selected.' : 'None selected.'}
                    </Typography>
                </Animated.View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    costContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencyText: {
        color: '#969696',
        fontWeight: '500',
        fontSize: 11,
    },
    costText: {
        fontSize: 13,
        fontWeight: '600',
    },
    costTextSelected: {
        color: '#1976D2',
    },
    costTextUnselected: {
        color: '#333333',
    },
    serviceContainer: {
        flex: 1,
        minWidth: 0,
        paddingTop: 2,
    },
    serviceNameText: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 20,
    },
    serviceDescriptionText: {
        fontSize: 11,
        color: '#666666',
        lineHeight: 14,
    },
    listContainer: {
        paddingTop: 16,
        paddingHorizontal: 12,
        paddingBottom: 16,
        backgroundColor: '#F5F5F5',
        marginHorizontal: 8,
        borderRadius: 12,
    },
    itemBase: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 6,
        minHeight: 70,
    },
    itemSelected: {
        backgroundColor: '#E3F2FD',
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    itemUnselected: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    itemContentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    itemLeftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        paddingRight: 8,
    },
    vehicleImage: {
        width: 40,
        height: 30,
        flexShrink: 0,
    },
    itemRightSection: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        flexShrink: 0,
    },
    helperTextContainer: {
        marginTop: 4,
        paddingHorizontal: 4,
    },
    helperText: {
        fontSize: 10,
        color: '#888888',
        textAlign: 'center',
        lineHeight: 12,
    },
});
