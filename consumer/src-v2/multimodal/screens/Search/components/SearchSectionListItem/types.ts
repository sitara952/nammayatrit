import { TransportationTypes } from '@/src-v2/multimodal/screens/Search/types';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { SearchInput } from '@/typescript/state/client/session';

export type SearchResultItem = {
    title: string;
    subtitle: string;
    placeId: string | undefined;
    routeCode: string | undefined;
    stopCode: string | undefined;
    duration: string;
    searchType: 'open' | 'route' | 'station';
    transitModes:
        | {
              mode: TransportationTypes;
              duration: number | undefined;
          }[]
        | undefined;
    location: location | undefined;
};

export interface SearchSectionListItemProps {
    item: SearchResultItem;
    index: number;
    isLastItem: boolean;
    activeInput: SearchInput;
    onPress: ((item: location) => void) | undefined;
    onSingleModePress: ((item: SearchResultItem) => void) | undefined;
    isMultimodal: boolean;
    isLoading?: boolean;
    isHorizontal: boolean;
}
