import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { getIconFromType } from '../../JourneyInfoScreen/components/TransitIconWrapper';
import Shimmer from '../../Search/components/SearchSectionListItem/Shimmer';

export interface BusItem {
    routeCode: string;
    routeNumber: string;
    handleOnPress: (routeCode: string) => void;
}

interface BusListProps {
    busList: BusItem[];
    showIcon?: boolean;
    isLoading: boolean | undefined;
    isTicket?: boolean;
    isFilled?: boolean;
    isLiveJourney?: boolean;
    flatlistContainerStyle?: StyleProp<ViewStyle>;
}

const BusList: React.FC<BusListProps> = ({
    busList,
    isLoading = false,
    showIcon = true,
    isTicket = false,
    isFilled = false,
    isLiveJourney = false,
    flatlistContainerStyle = {},
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    if (isLoading) {
        return (
            <FlatList
                accessible={true}
                accessibilityLabel="Loading bus routes"
                data={[1, 2, 3]}
                renderItem={() => <ShimmerBusItem />}
                keyExtractor={(_, index) => `shimmer-bus-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    tailwind.style(`${isTicket ? 'px-1 py-[6px] gap-[6px]' : 'px-4 py-4 gap-2.5'}`),
                    flatlistContainerStyle,
                ]}
            />
        );
    }

    if (!busList || busList.length === 0) {
        return (
            <Animated.View accessible={true} accessibilityLabel="No buses found" style={tailwind.style('px-4 py-4')}>
                <Animated.Text style={tailwind.style('text-[#838185] font-areaNormal-bold leading-[20px]')}>
                    {userLanguageStrings.NobusesfoundPleasetryanothersearch}
                </Animated.Text>
            </Animated.View>
        );
    }

    const renderItem = ({ item, index }: { item: BusItem; index: number }) => {
        // Handle the potential null return from getIconFromType safely
        const busIcon = getIconFromType('Bus', 14, '#7E7E7E');

        return (
            <Pressable
                key={`bus-${index}`}
                onPress={() => item.handleOnPress(item.routeCode)}
                testID="c43b1986-39d4-4729-86fc-d6d01f9cca23"
                style={tailwind.style('items-center justify-center')}
                accessibilityRole="button"
                accessible={true}
                accessibilityLabel={`Bus route ${item.routeNumber} button`}>
                <Animated.View
                    style={tailwind.style(
                        'flex-row border border-[#F1F2F2] items-center justify-center px-2 rounded-lg gap-1.5',
                        isFilled ? 'bg-[#F7F7F7] border-[#F7F7F7]' : 'bg-white',
                        isTicket ? 'h-[26px]' : 'h-8 ',
                    )}>
                    {showIcon && busIcon && <Icon icon={busIcon} />}
                    <Animated.Text
                        style={tailwind.style(
                            ` font-areaNormal-extrabold leading-[17px] text-[#656565] tracking-[0.2px]`,
                            isFilled || isLiveJourney ? 'text-[#3B3A3C]' : 'text-[#656565]',
                            isTicket ? 'text-[11px]' : 'text-[14px]',
                        )}>
                        {item.routeNumber}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        );
    };

    return (
        <FlatList
            accessibilityLabel={`Available bus routes${isTicket ? ' for your ticket' : ''}`}
            accessibilityRole="list"
            data={busList}
            renderItem={renderItem}
            keyExtractor={(_, index) => `bus-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
                tailwind.style(`${isTicket ? 'px-1 py-[6px] gap-[6px]' : 'px-4 py-4 gap-2.5'}`),
                flatlistContainerStyle,
            ]}
        />
    );
};

// Shimmer placeholder for loading state
const ShimmerBusItem = () => {
    return (
        <Animated.View
            accessible={true}
            accessibilityLabel="Loading bus route"
            style={tailwind.style('h-8 min-w-[60px]')}>
            <Shimmer width={'100%'} height={'100%'} borderRadius={8} />
        </Animated.View>
    );
};

export default BusList;
