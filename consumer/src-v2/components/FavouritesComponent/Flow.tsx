import React, { FC } from 'react';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import FavouritesComponentUI from './UI';
import { FavouritesListPropsType } from './types';
import { assignTag, transformSavedList } from './utils';
import { useSavedLocations } from '@/typescript/hooks/useSavedLocations';

const FavouritesComponentFlow: FC<FavouritesListPropsType> = ({
    onFavouriteItemPress,
    showTitle,
    favTagsStyle,
    initialLeftPadding,
    gap,
    isMultiModal,
}) => {
    const { savedLocations: savedLocList } = useSavedLocations();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');

    const transformedFavouriteDataList = React.useMemo(() => {
        return savedLocList ? transformSavedList(savedLocList.map(item => assignTag(item, userLanguageStrings))) : [];
    }, [savedLocList, userLanguageStrings]);

    if (transformedFavouriteDataList.length === 0) return null;

    return (
        <FavouritesComponentUI
            transformedFavouriteDataList={transformedFavouriteDataList}
            userLanguageStrings={userLanguageStrings}
            themeColors={themeColors}
            favTagsStyle={favTagsStyle}
            showTitle={showTitle}
            savedLocList={savedLocList}
            onFavouriteItemPress={onFavouriteItemPress}
            initialLeftPadding={initialLeftPadding}
            gap={gap}
            isMultiModal={isMultiModal}
        />
    );
};

export default FavouritesComponentFlow;
