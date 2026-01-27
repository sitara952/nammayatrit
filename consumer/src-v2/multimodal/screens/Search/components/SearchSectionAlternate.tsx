import React from 'react';
import { KeyboardGestureArea } from 'react-native-keyboard-controller';
import Animated from 'react-native-reanimated';

import { AutoIcon, BusIcon, MetroIcon, TrainIcon, WalkIcon } from '@/src-v2/multimodal/components/svg/transport';
import { Icon } from '@/typescript/components/Icon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import SearchSectionListItem, { SearchResultItem } from './SearchSectionListItem/Flow';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { TransportationTypes } from '@/src-v2/multimodal/screens/Search/types';
import SearchSectionListItemUI from './SearchSectionListItem/UI';
import { SearchInput } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectActiveInput } from '@/typescript/state/client/session';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';

export const getIconFromType = (type: TransportationTypes, size: number, color: string | undefined) => {
    switch (type) {
        case 'auto':
            return <Icon icon={<AutoIcon />} size={size} color={color} />;
        case 'bus':
            return <Icon icon={<BusIcon />} size={size} color={color} />;
        case 'metro':
            return <Icon icon={<MetroIcon />} size={size} color={color} />;
        case 'train':
            return <Icon icon={<TrainIcon />} size={size} color={color} />;
        case 'walking':
            return <Icon icon={<WalkIcon />} size={size} color={color} />;
        default:
            return null;
    }
};

interface SearchSectionAlternateProps {
    handleOnPress: ((item: location) => void) | undefined;
    handleOnSingleModePress: ((item: SearchResultItem) => void) | undefined;
    dropLocation: string;
    searchResults: SearchResultItem[];
    isLoading: boolean;
    isMultimodal: boolean;
}

const SearchSectionAlternate: React.FC<SearchSectionAlternateProps> = ({
    handleOnPress,
    handleOnSingleModePress,
    searchResults = [],
    isLoading,
    isMultimodal,
}) => {
    const { bottom } = useSafeAreaInsets();
    const activeInput = useAppSelector(selectActiveInput);
    const renderItem = ({ item, index }: { item: SearchResultItem; index: number }) => {
        if (item.searchType === 'open' && activeInput === SearchInput.Destination) {
            return (
                <SearchSectionListItem
                    isHorizontal={false}
                    item={item}
                    index={index}
                    isLastItem={index === searchResults.length - 1}
                    activeInput={activeInput}
                    onPress={handleOnPress}
                    isMultimodal={isMultimodal}
                    onSingleModePress={handleOnSingleModePress}
                    isLoading={isLoading}
                />
            );
        } else {
            return (
                <SearchSectionListItemUI
                    isHorizontal={false}
                    item={item}
                    index={index}
                    activeInput={activeInput}
                    isLastItem={index === searchResults.length - 1}
                    onPress={handleOnPress}
                    isMultimodal={isMultimodal}
                    onSingleModePress={handleOnSingleModePress}
                    isLoading={isLoading}
                />
            );
        }
    };

    const keyExtractor = (item: SearchResultItem, index: number) => item.placeId || `search-item-${index}`;
    return (
        <KeyboardGestureArea style={tailwind.style('flex-1')} interpolator="linear">
            <Animated.View>
                <FlatList
                    accessible={true}
                    accessibilityLabel="Search results list"
                    data={searchResults}
                    renderItem={({ item, index }) => (
                        <View style={tailwind.style('px-[16px]')} key={index}>
                            {renderItem({ item, index })}
                        </View>
                    )}
                    keyExtractor={keyExtractor}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={tailwind.style(`pb-[${bottom + (Platform.OS === 'android' ? 75 : 12)}px]`)}
                    windowSize={5}
                    removeClippedSubviews={true}
                />
            </Animated.View>
        </KeyboardGestureArea>
    );
};

export default React.memo(SearchSectionAlternate);
