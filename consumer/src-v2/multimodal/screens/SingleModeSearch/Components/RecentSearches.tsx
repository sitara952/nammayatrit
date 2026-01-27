import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import SearchSectionListItemUI from '../../Search/components/SearchSectionListItem/UI';
import { SearchInput } from '@/typescript/state/client/session';
import { SearchResultItem } from '../../Search/components/SearchSectionListItem/types';
import { KeyboardGestureArea } from 'react-native-keyboard-controller';
import { useWindowDimensions } from 'react-native';

interface RecentSearchesProps {
    recentsList: SearchResultItem[] | undefined;
    onRecentSearchPress?: (item: SearchResultItem) => void;
    isLoading: boolean;
}

const RecentSearches = ({ recentsList, onRecentSearchPress }: RecentSearchesProps) => {
    const { height: screenHeight } = useWindowDimensions();

    if (!recentsList || recentsList.length === 0) return null;

    // Calculate dynamic height: screen height - top safe area - bottom safe area - header offset (180px)
    const dynamicHeight = screenHeight - 220;

    return (
        <KeyboardGestureArea style={tailwind.style(`h-[${dynamicHeight}px]`)} interpolator="linear">
            <ScrollView
                horizontal={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tailwind.style('px-4 pt-4')}>
                {recentsList.map((item, index) => {
                    return (
                        <SearchSectionListItemUI
                            isHorizontal={false}
                            item={item}
                            index={index}
                            activeInput={SearchInput.Destination}
                            isLastItem={false}
                            onPress={undefined}
                            isMultimodal={true}
                            onSingleModePress={onRecentSearchPress}
                            isLoading={false}
                        />
                    );
                })}
            </ScrollView>
        </KeyboardGestureArea>
    );
};

export default RecentSearches;
