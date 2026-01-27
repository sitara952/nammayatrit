import { View, FlatList } from 'react-native';
import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { RouteCard } from '../Types';
import { Icon } from '../../../components/common/Icon';
import {
    getIconBGFromType,
    getIconFromType,
    getIconSecondaryBGFromType,
} from '../../JourneyInfoScreen/components/TransitIconWrapper';
import { Direction } from '../../../components/svg/Direction';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

interface RoutesAroundYouProps {
    routeList: RouteCard[] | undefined;
    mode: MultimodalTravelMode_multimodalTravelMode;
    onPress: (routeCode: string) => void;
    isLoading?: boolean;
}

const RoutesAroundYou: React.FC<RoutesAroundYouProps> = ({ routeList, mode, onPress, isLoading = false }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const renderItems = () => {
        if (isLoading || !routeList) {
            return [0, 1, 2].map(index => <ShimmerRouteCard key={`shimmer-route-${index}`} />);
        }

        if (routeList.length === 0) {
            return (
                <Animated.Text style={tailwind.style('text-[#838185] font-areaNormal-bold leading-[20px]')}>
                    {userLanguageStrings.Noroutesfoundaroundyou}
                    {'\n'}
                    {userLanguageStrings.Pleasesearchforroutesusingthesearchbar}
                </Animated.Text>
            );
        }

        return null;
    };

    const renderItem = ({ item, index }: { item: RouteCard; index: number }) => {
        return (
            <RouteCardItem
                key={`route-${index}`}
                routeSrc={item.routeText.split(' To ')[0] || 'Departure'}
                routeDest={item.routeText.split(' To ')[1] || 'Destination'}
                routeData={item.routeCode}
                routeMetadata={item.busesText || 'Check schedule'}
                onPress={() => onPress(item.routeCode)}
                mode={mode}
            />
        );
    };

    return (
        <Animated.View style={tailwind.style('pt-6')}>
            <Animated.Text style={tailwind.style('text-[#838185] font-areaNormal-extrabold leading-[20px] px-4')}>
                {userLanguageStrings.Routesaroundyou}
            </Animated.Text>

            {isLoading || !routeList || routeList.length === 0 ? (
                <Animated.View style={tailwind.style('pt-2 flex-row px-4 gap-x-3')}>{renderItems()}</Animated.View>
            ) : (
                <FlatList
                    data={routeList}
                    renderItem={renderItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={tailwind.style('px-4 gap-x-3')}
                    style={tailwind.style('pt-2')}
                />
            )}
        </Animated.View>
    );
};

export default RoutesAroundYou;

interface RouteCardProps {
    routeSrc: string;
    routeDest: string;
    routeData: string;
    routeMetadata: string;
    mode: MultimodalTravelMode_multimodalTravelMode;
    onPress: () => void;
}

const RouteCardItem: React.FC<RouteCardProps> = ({ routeSrc, routeDest, routeData, routeMetadata, mode, onPress }) => {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${routeSrc} to ${routeDest} button`}
            testID={`1eb478e3-179f-40f1-bc8e-36d0f88fd6d1`}
            onPress={onPress}>
            <Animated.View
                style={tailwind.style('bg-[#FFFFFF] border border-[#F1F2F2] rounded-[18px] min-h-23 px-4 w-[285px]')}>
                <Animated.View style={tailwind.style('flex-row items-center gap-2 pt-[18px]')}>
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'flex-1 text-[14px] tracking-[0.2px] text-[#656565] font-areaNormal-extrabold leading-[20px] capitalize',
                        )}>
                        {routeSrc}
                    </Animated.Text>
                    <Animated.View
                        style={tailwind.style('h-5 w-5 justify-center items-center bg-[#E6E6E6] rounded-[6px]')}>
                        <Icon icon={<Direction fill={undefined} />} color="#656565" size={14} />
                    </Animated.View>
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'flex-1 text-[14px] tracking-[0.2px] text-[#656565] font-areaNormal-extrabold leading-[20px] capitalize',
                        )}>
                        {routeDest}
                    </Animated.Text>
                </Animated.View>
                <Animated.View style={tailwind.style('flex-row items-center justify-start pt-3')}>
                    <Animated.View
                        style={tailwind.style(
                            'h-6 flex-row items-center justify-center gap-1 px-1.5 rounded-lg',
                            `bg-[${getIconBGFromType(mode)}]`,
                        )}>
                        {getIconFromType(mode, 14, getIconSecondaryBGFromType(mode)) && (
                            <Icon icon={getIconFromType(mode, 14, getIconSecondaryBGFromType(mode)) || <></>} />
                        )}
                        <Animated.Text
                            style={tailwind.style(
                                'text-[14px] font-areaNormal-extrabold leading-[17px] text-[#656565] tracking-[0.2px]',
                            )}>
                            {routeData}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View style={tailwind.style('pl-2.5')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[14px] font-areaNormal-extrabold leading-[17px] text-[#969696] tracking-[0.2px]',
                            )}>
                            {routeMetadata}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

// Shimmer loading card for routes
const ShimmerRouteCard = () => {
    return (
        <View
            style={tailwind.style(
                'mr-2 bg-[#FFFFFF] border border-[#F0F1F4] rounded-[18px] py-6 px-4 w-[313px] flex-row items-center gap-[10px]',
            )}>
            <View
                style={tailwind.style('w-[32px] h-[32px] bg-[#ECECEC] rounded-[50px] flex items-center justify-center')}
            />
            <View>
                <View style={tailwind.style('h-4 w-36 bg-gray-200 rounded opacity-40')} />
                <View style={tailwind.style('h-3 w-28 bg-gray-200 rounded opacity-40 mt-2')} />
            </View>
        </View>
    );
};

// * Example Usage *
//         <RoutesAroundYou
//           routeList={routesList}
//           mode="Bus"
//           onPress={handleRoutePress}
//           isLoading={isLoading}
//         />
//
//         {/* Empty state example */}
//         <RoutesAroundYou
//           routeList={[]}
//           mode="Metro"
//           onPress={handleRoutePress}
//           isLoading={false}
//         />
//
//         {/* Loading state example */}
//         <RoutesAroundYou
//           routeList={undefined}
//           mode="Subway"
//           onPress={handleRoutePress}
//           isLoading={true}
//         />
//       </View>
