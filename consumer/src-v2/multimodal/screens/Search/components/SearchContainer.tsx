import React, { useCallback, useMemo } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { TransitDataValuesType } from '../types';
import EditTransit, { EditTransitProps } from './EditTransit';
import SearchSectionAlternate from './SearchSectionAlternate';
import { SearchResultItem } from './SearchSectionListItem/types';
export interface SearchContainerProps {
    isMultimodal: boolean;
    dropLocation: string;
    setDropLocation: (location: string) => void;
    searchResults: SearchResultItem[];
    onTransitModeChange?: (mode: string, value: boolean) => void;
    onSearchModalClose?: () => void;
    handleSearchOnPress: ((item: location) => void) | undefined;
    handleSearchOnSingleModePress: ((item: SearchResultItem) => void) | undefined;
    editTransitValues: TransitDataValuesType[];
    onTransitSwitchChange: EditTransitProps['onTransitSwitchChange'];
    onBusRoutePress: EditTransitProps['onBusRoutePress'];
    onEditTransitConfirmPress: EditTransitProps['onEditTransitConfirmPress'];
    showEditTransitBtn: boolean;
    isLoading: boolean;
}

const SearchContainer: React.FC<SearchContainerProps> = ({
    isMultimodal,
    dropLocation,
    searchResults,
    onTransitSwitchChange,
    handleSearchOnPress,
    handleSearchOnSingleModePress,
    editTransitValues,
    onBusRoutePress,
    onEditTransitConfirmPress,
    isLoading,
}) => {
    const [showEditTransit, setShowEditTransit] = React.useState(false);

    const handleCloseEditTransit = useCallback(() => {
        setShowEditTransit(false);
    }, []);

    const handleOnLayout = useCallback(() => {}, []);

    const editTransitComponent = useMemo(() => {
        if (!showEditTransit) return null;

        return (
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                accessible={true}
                accessibilityLabel="Edit transit preferences"
                style={tailwind.style('h-full bg-[#FFFFFF] ')}>
                <EditTransit
                    showBusRoutes
                    showMetroRoutes
                    showTrainRoutes
                    showCombinationalRoute
                    showToggle
                    editTransitValues={editTransitValues}
                    onTransitSwitchChange={onTransitSwitchChange ?? (() => {})}
                    onClose={handleCloseEditTransit}
                    onBusRoutePress={onBusRoutePress}
                    onEditTransitConfirmPress={onEditTransitConfirmPress}
                />
            </Animated.View>
        );
    }, [
        showEditTransit,
        editTransitValues,
        onTransitSwitchChange,
        handleCloseEditTransit,
        onBusRoutePress,
        onEditTransitConfirmPress,
    ]);

    if (showEditTransit) {
        return editTransitComponent;
    }

    return (
        <Animated.View
            accessible={true}
            accessibilityLabel="Search results list"
            entering={FadeIn}
            style={tailwind.style(`h-[${SCREEN_HEIGHT - 220}px] z-50`)}
            onLayout={handleOnLayout}>
            <SearchSectionAlternate
                isMultimodal={isMultimodal}
                handleOnPress={handleSearchOnPress}
                handleOnSingleModePress={handleSearchOnSingleModePress}
                dropLocation={dropLocation}
                searchResults={searchResults}
                isLoading={isLoading}
            />
        </Animated.View>
    );
};

export default React.memo(SearchContainer);
