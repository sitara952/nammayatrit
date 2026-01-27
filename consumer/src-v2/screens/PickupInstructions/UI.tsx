import { View, StyleSheet, FlatList } from 'react-native';
import React from 'react';
import { InstructionCard } from './components/InstructionCard';
import Button from '@/src-v2/primitives/Button';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { PickupInstructionsUIProps } from './Types';
import { Header } from '@/src-v2/primitives/Header';

export const PickupInstructionsUI: React.FC<PickupInstructionsUIProps> = ({
    instructions,
    navigation,
    handleButtonPress,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={styles.container}>
            <Header
                title={userLanguageStrings.WalkingDirectionToPickup}
                onBackPress={() => navigation.goBack()}
                nextViewOnPress={undefined}
                showNextView={undefined}
                nextViewIcon={undefined}
                nextViewText={undefined}
            />
            <View style={styles.contentContainer}>
                <FlatList
                    style={styles.listContainer}
                    contentContainerStyle={styles.listContentContainer}
                    renderItem={item => <InstructionCard image={item.item.image} title={item.item.title} />}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    showsVerticalScrollIndicator={false}
                    data={instructions}
                />
                <Button
                    testID="pickup_view_on_maps"
                    type="primary"
                    text={userLanguageStrings.ViewOnGoogleMaps}
                    style={styles.button}
                    onPress={handleButtonPress}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 32,
        backgroundColor: 'white',
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: 15,
        marginTop: 10,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 12,
        paddingBottom: 30,
    },
    listContentContainer: {
        paddingBottom: 10,
    },
    separator: {
        height: 20,
    },
    button: {
        marginTop: 24,
        justifyContent: 'center',
    },
});
