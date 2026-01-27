import { latLong } from '@/readOnly/api/types/LatLong.gen';
import { BookingId } from '@/typescript/state/client/user';
import { Action, Resolver } from '@/typescript/utils/common';
import { SharedValue } from 'react-native-reanimated';

export type LookingForRidesAction = Action<'BUTTON_CLICKED'>;

export type LookingForRidesUIProps = {
    displayTitle: string | undefined;
    isSearchBoosted: boolean;
    bookingId: BookingId | null;
    progressRef: SharedValue<number>;
    resetSearch: () => void;
    additionalFare: number | undefined;
    setAdditionalFare: React.Dispatch<React.SetStateAction<number | undefined>>;
    selectedExpandedData: string[];
    setSelectedExpandedData: React.Dispatch<React.SetStateAction<string[]>>;
    buttonText: string;
    isDisabled: boolean;
    rcsDispatch: Resolver<LookingForRidesAction>;
    searchCentre: latLong;
    showBoostInfo: boolean;
    setHeight: React.Dispatch<React.SetStateAction<number>>;
    updateInitialSelectedVehicles: React.Dispatch<React.SetStateAction<string[]>> | undefined;
    fareDisplay: string;
};
