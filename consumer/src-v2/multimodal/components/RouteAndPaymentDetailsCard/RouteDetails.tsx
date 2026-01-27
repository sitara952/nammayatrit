import React from 'react';
import { View, Text } from 'react-native';
import CollapsibleCard from './CollapsibleCard';
import { tailwind } from '../../../tailwind-theme/tailwind';
import { TransportType } from './types';
import { RouteDetailsData } from '@/typescript/state/client/journey';
import { Icon } from '../common/Icon';
import { BusIcon } from '../svg/transport/BusIcon';
import { MetroIcon } from '../svg/transport/MetroIcon';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectRouteDetails } from '@/typescript/state/client/journey';
import { createJourneyId } from '@/typescript/state/client/user';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface RouteDetailsProps {
    type: TransportType;
    journeyId: string | undefined;
}

const stopColors: Record<TransportType, string> = {
    bus: '#FFF7D1',
    metro: '#D1FFE0',
};

const icons: Record<TransportType, React.ReactElement> = {
    bus: <BusIcon />,
    metro: <MetroIcon />,
};

const RouteDetails: React.FC<RouteDetailsProps> = ({ type, journeyId }) => {
    const data: RouteDetailsData | null = useAppSelector(
        state => selectRouteDetails(state, createJourneyId(journeyId ?? '')) ?? null,
    );
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const stopColor = stopColors[type];
    const icon = icons[type];

    if (!data) return null;

    // Layout constants
    const iconSize = 32;
    const stopCircleSize = 24;
    const lineWidth = 2;
    const lineColor = '#EDEDED';

    return (
        <CollapsibleCard title="Route Details">
            <View style={{ flexDirection: 'row', position: 'relative', minHeight: 60 + data.stops.length * 36 }}>
                {/* Timeline Column */}
                <View
                    style={{
                        width: 32,
                        alignItems: 'center',
                        position: 'relative',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        height: '100%',
                    }}>
                    {/* Vertical Line */}
                    <View
                        style={{
                            position: 'absolute',
                            left: 15,
                            top: iconSize / 2 + 4,
                            bottom: iconSize / 2 + 4,
                            width: lineWidth,
                            backgroundColor: lineColor,
                            borderRadius: 1,
                            zIndex: 0,
                        }}
                    />
                    {/* Start icon */}
                    <View
                        style={{
                            width: iconSize,
                            height: iconSize,
                            borderRadius: iconSize / 3,
                            backgroundColor: stopColor,
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1,
                        }}>
                        <Icon icon={icon} size={20} />
                    </View>
                    {/* Spacer to push end icon to the bottom */}
                    <View style={{ flex: 1 }} />
                    {/* End icon */}
                    <View
                        style={{
                            width: iconSize,
                            height: iconSize,
                            borderRadius: iconSize / 3,
                            backgroundColor: stopColor,
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1,
                        }}>
                        <Icon icon={icon} size={20} />
                    </View>
                </View>
                {/* Details Column */}
                <View style={{ marginLeft: 12, flex: 1 }}>
                    {/* Start name and tags */}
                    <View>
                        <Text style={tailwind.style('text-base font-areaNormal-bold text-[#37313E] mb-1')}>
                            {data.start}
                        </Text>
                        <View style={tailwind.style('flex-row items-center mb-2')}>
                            <View style={tailwind.style('bg-[#F1F2F2] rounded px-2 py-0.5 mr-2')}>
                                <Text style={tailwind.style('text-xs font-areaNormal-bold text-[#37313E]')}>
                                    {data.busNumber}
                                </Text>
                            </View>
                            {/* For now we are not getting this from backend, just  we need to uncomment if backend provides it */}
                            {/* <View style={tailwind.style('bg-[#F1F2F2] rounded px-2 py-0.5 mr-2 flex-row items-center')}>
                                <Text style={tailwind.style('text-xs font-areaNormal-bold text-[#37313E]')}>
                                    {data.acType}
                                </Text>
                            </View> */}
                            {data.totalStops > 0 && (
                                <View style={tailwind.style('bg-[#F1F2F2] rounded px-2 py-0.5 flex-row items-center')}>
                                    <Text style={tailwind.style('text-xs font-areaNormal-bold text-[#37313E]')}>
                                        {data.totalStops} {userLanguageStrings.Stops}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    {/* Stops names */}
                    <View style={{ marginTop: 9 }}>
                        {data.stops.map((stop, idx) => (
                            <View key={stop.name} style={tailwind.style('flex-row items-center mb-4')}>
                                <View
                                    style={{
                                        width: stopCircleSize,
                                        height: stopCircleSize,
                                        borderRadius: stopCircleSize / 2,
                                        backgroundColor: stopColor,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 12,
                                    }}>
                                    <Text style={tailwind.style('text-xs font-areaNormal-bold text-[#37313E]')}>
                                        {idx + 1}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        tailwind.style(
                                            'text-[14px] leading-[17px] font-areaNormal-bold text-[#656565]',
                                        ),
                                        { flex: 1, flexWrap: 'wrap' },
                                    ]}>
                                    {stop.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                    {/* End name */}
                    <View style={{ marginTop: 8 }}>
                        <Text style={tailwind.style('text-base font-areaNormal-bold text-[#37313E] pb-1')}>
                            {data.end}
                        </Text>
                    </View>
                </View>
            </View>
        </CollapsibleCard>
    );
};

export default RouteDetails;
