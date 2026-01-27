import React, { useMemo } from 'react';

import SearchSectionListItemUI from './UI';
import { SearchResultItem, SearchSectionListItemProps } from './types';
import { useSearchItemData } from './useSearchItemData';

const SearchSectionListItem: React.FC<SearchSectionListItemProps> = props => {
    const searchKey = useMemo(() => {
        return props.item.placeId + '|' + props.item.title + '|' + props.item.subtitle;
    }, [props.item.placeId, props.item.title, props.item.subtitle]);

    const { itemData, isLoading } = useSearchItemData(props.item, searchKey);

    const enhancedItem = React.useMemo(() => {
        if (!isLoading && itemData) {
            return {
                ...props.item,
                transitModes: itemData.transitModes,
                duration: itemData.duration,
            };
        }
        return props.item;
    }, [props.item, itemData, isLoading]);

    return <SearchSectionListItemUI {...props} item={enhancedItem} isLoading={isLoading} />;
};

export default SearchSectionListItem;
export type { SearchResultItem };
