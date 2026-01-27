import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { formatEta, getEtaColor } from '../utils';

export interface BusStopCalloutCardProps {
    stopName: string;
    primaryEtaMinutes?: number;
    secondaryEtaMinutes?: number;
    onPressPrimary?: () => void;
    onPressSecondary?: () => void;
}

export const BusStopCalloutCard: React.FC<BusStopCalloutCardProps> = React.memo(
    ({ stopName, primaryEtaMinutes, secondaryEtaMinutes }) => {
        return (
            <Animated.View>
                <Animated.View style={styles.containerBelow}>
                    <Animated.View style={styles.tail} />
                    <Animated.View style={styles.card}>
                        <Animated.Text
                            style={[
                                tailwind.style('text-[16px] font-areaNormal-extrabold text-[#3B3A3C] mb-1'),
                                { maxWidth: 160 },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode={'tail'}>
                            {stopName.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}
                        </Animated.Text>

                        <Animated.Text
                            style={tailwind.style('text-[14px] text-[#969696] font-areaNormal-extrabold mb-2')}>
                            Next Bus
                        </Animated.Text>

                        <Animated.View style={tailwind.style('flex-row items-center gap-2')}>
                            {primaryEtaMinutes !== undefined && (
                                <Animated.View
                                    style={[
                                        styles.etaPill,
                                        { backgroundColor: '#FFFFFF' },
                                        { borderColor: getEtaColor(primaryEtaMinutes) },
                                    ]}>
                                    <Animated.Text
                                        style={[
                                            tailwind.style('text-[11px] font-areaNormal-extrabold'),
                                            { color: getEtaColor(primaryEtaMinutes) },
                                        ]}>
                                        {formatEta(primaryEtaMinutes)}
                                    </Animated.Text>
                                </Animated.View>
                            )}

                            {secondaryEtaMinutes !== undefined && (
                                <Animated.View
                                    style={[
                                        styles.etaPill,
                                        { backgroundColor: '#FFFFFF' },
                                        { borderColor: getEtaColor(secondaryEtaMinutes) },
                                    ]}>
                                    <Animated.Text
                                        style={[
                                            tailwind.style('text-[11px] font-areaNormal-extrabold'),
                                            { color: getEtaColor(secondaryEtaMinutes) },
                                        ]}>
                                        {formatEta(secondaryEtaMinutes)}
                                    </Animated.Text>
                                </Animated.View>
                            )}
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        );
    },
);

const styles = StyleSheet.create({
    containerBelow: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 5,
    },
    tail: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 8, // triangle points UP
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FFFFFF',
        marginBottom: -1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minWidth: 140,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    etaPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
});

export default BusStopCalloutCard;
