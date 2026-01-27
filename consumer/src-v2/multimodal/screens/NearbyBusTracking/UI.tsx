import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { NearbyBusTrackingUIProps } from './Types';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';

export const NearbyBusTrackingUI: React.FC<NearbyBusTrackingUIProps> = ({ onBack }) => {
    const { top } = useSafeAreaInsets();

    return (
        <>
            <View style={[styles.header, { paddingTop: top }]}>
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="nearby_bus_back_button"
                    style={styles.backButton}
                    onPress={onBack}>
                    <ChevronLeftIcon />
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        color: '#1A1A1A',
    },
    infoPanel: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    infoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        color: '#1A1A1A',
    },
    radiusText: {
        color: '#666',
        textAlign: 'center',
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    instructionText: {
        textAlign: 'center',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    legendText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
    },
});
