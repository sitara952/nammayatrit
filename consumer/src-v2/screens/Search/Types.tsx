import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { EditTransitProps } from '@/src-v2/multimodal/screens/Search/components/EditTransit';
import { TransitDataValuesType } from '@/src-v2/multimodal/screens/Search/types';
import { LocationSearchOptions } from '@/typescript/hooks/useLocationPredictions';
import { SearchInput } from '@/typescript/state/client/session';
import { Action, Resolver } from '@/typescript/utils/common';

export type SearchModalScreenAction = Action<'HANDLE_BACKPRESS'>;

export type SearchModalViewProps = {
    isServiceable: boolean | undefined;
    locationSearchStatus: LocationSearchOptions;
    activeInput: SearchInput;
    startLocationFromTextInput: string;
    source: location | null;
    stopLocationsTextInput: string;
    searchData: location[];
    rcsDispatch: Resolver<SearchModalScreenAction>;
    handleCardPress: (item: location) => Promise<void>;
    isMultimodal: boolean;
    showEditTransitBtn: boolean;
    editTransitValues: TransitDataValuesType[];
    onTransitSwitchChange: EditTransitProps['onTransitSwitchChange'];
    onBusRoutePress: EditTransitProps['onBusRoutePress'];
    onEditTransitConfirmPress: EditTransitProps['onEditTransitConfirmPress'];
    searchFloatingMapButton: () => void;
};
