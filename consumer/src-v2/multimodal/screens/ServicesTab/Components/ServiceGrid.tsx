import React from 'react';
import { StyleSheet, View, FlatList, ListRenderItemInfo } from 'react-native';
import { ServiceTile } from './ServiceTile';
import { ServiceGridProps, ServiceTile as ServiceTileType } from '../Types';

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services }) => {
    // Render 2 items per row
    const renderItem = ({ item }: ListRenderItemInfo<ServiceTileType>) => (
        <View style={styles.tileContainer}>
            <ServiceTile service={item} />
        </View>
    );

    return (
        <FlatList
            data={services}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
        />
    );
};

const styles = StyleSheet.create({
    grid: {
        padding: 8,
    },
    tileContainer: {
        flex: 1,
        maxWidth: '50%',
    },
});
