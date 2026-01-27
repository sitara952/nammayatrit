import React, { useState } from 'react';
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    useAnimatedStyle,
    withTiming,
    useSharedValue,
} from 'react-native-reanimated';
import { FlatList } from 'react-native-gesture-handler';
import { ListRenderItem } from 'react-native';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import ChevronDown from '@/typescript/assets/svg/symbols/ChevronDown';
import { Pressable } from '@/src-v2/primitives/Pressable';
import TicketIcon from '../assets/svg/TicketIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface BusRoute {
    busNumber: string;
    serviceTierName: string | undefined;
    routeCode: string;
    isActive: boolean;
}

interface TicketValidInProps {
    validRoutes: BusRoute[];
    isExpandable?: boolean;
    onRoutePress?: (routeIndex: number) => void;
}

const TicketValidIn: React.FC<TicketValidInProps> = ({ validRoutes, isExpandable = true, onRoutePress }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [isExpanded, setIsExpanded] = useState(false);
    const rotation = useSharedValue(0);

    const rotateStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    const handlePress = () => {
        rotation.value = withTiming(isExpanded ? 0 : 180);
        setIsExpanded(!isExpanded);
    };

    const renderBusRoute: ListRenderItem<BusRoute> = ({ item, index }) => (
        <Pressable
            onPress={() => onRoutePress?.(index)}
            accessibilityRole="button"
            accessibilityLabel={`Switch to bus route ${item.busNumber} button`}
            testID={`bus-route-${item.routeCode}`}>
            <Animated.View
                layout={LinearTransition}
                style={tailwind.style(
                    'h-[31px] rounded-[10px] bg-white border border-[#F1F2F2] px-[9px] items-center flex-row gap-[6px] mx-1',
                )}>
                <Animated.Text style={tailwind.style('text-[#3B3A3C] text-[13px] font-areaNormal-extrabold ')}>
                    {item.busNumber}
                    {/*{' '}
                    {item.serviceTierName
                        ? `- ${getTicketValidInLabel(item.serviceTierName, userLanguageStrings)}`
                        : ''} */}
                </Animated.Text>
                {item.isActive ? (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut.duration(100)}
                        style={tailwind.style('h-[8px] w-[8px] bg-[#09941E] rounded-full')}
                    />
                ) : null}
            </Animated.View>
        </Pressable>
    );

    const expandableContent = (
        <Animated.View style={tailwind.style('w-full py-[13px]')} layout={LinearTransition}>
            <Pressable
                accessibilityRole="button"
                testID="ticket-valid-in-button"
                onPress={handlePress}
                accessibilityLabel="Ticket is also valid in button">
                <Animated.View style={tailwind.style('flex-row items-center justify-center gap-[6px]')}>
                    <Animated.Text
                        style={tailwind.style('text-[#656565] text-[13px] font-areaNormal-extrabold text-center')}>
                        {userLanguageStrings.TicketIsAlsoValidIn}
                    </Animated.Text>
                    <Animated.View
                        style={[
                            tailwind.style(
                                'flex-row items-center justify-center h-[17px] w-[17px] bg-[#ECEDEF] rounded-full',
                            ),
                            rotateStyle,
                        ]}>
                        <Icon icon={<ChevronDown height={12} width={12} color="#656565" />} color="#656565" />
                    </Animated.View>
                </Animated.View>
            </Pressable>

            {isExpanded ? (
                <FlatList
                    data={validRoutes}
                    renderItem={renderBusRoute}
                    keyExtractor={item => item.routeCode}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={tailwind.style('py-[15px] px-[24px]')}
                />
            ) : null}
        </Animated.View>
    );

    const nonExpandableContent = (
        <Animated.View style={tailwind.style('flex-row items-center gap-[16px]')}>
            <Animated.View style={tailwind.style('flex-row items-center gap-[9px]')}>
                <Icon icon={<TicketIcon fill="#969696" />} size={24} />
                <Animated.Text
                    style={tailwind.style(
                        'text-[#969696] text-[13px] font-areaNormal-extrabold w-[84px] leading-[17px]',
                    )}>
                    {userLanguageStrings.TicketIsAlsoValidIn}
                </Animated.Text>
            </Animated.View>
            <FlatList
                data={validRoutes}
                renderItem={renderBusRoute}
                keyExtractor={(item, index) => `${item.routeCode}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tailwind.style(' pr-[24px]')}
            />
        </Animated.View>
    );

    return isExpandable ? expandableContent : nonExpandableContent;
};

export default TicketValidIn;
