import { Action, Resolver } from '@/typescript/utils/common';
import { location } from '@/helpers/utils/Location/LocationTypes.gen.tsx';
import { BottomSheetStage } from '@/typescript/state/client/session';
import { GeolocationResponse } from '@/typescript/utils/location';
import { profileRes } from '@/readOnly/api/types/ProfileRes.gen';
import { cancellationThreshold } from '@/src-v2/systems/configs/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList, MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList';
import { SharedValue } from 'react-native-reanimated';
import { disability } from '@/readOnly/api/types/Disability.gen';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';

export type HomeScreenScreenAction = Action<'DUMMY_ACTION'>;

export type RecentMultimodalTrip = {
    title: string;
    journeyIncludes: {
        mode: MultimodalTravelMode_multimodalTravelMode;
        busInfo: string;
    }[];
    destination: location;
    cost: number | undefined;
};

export type HomeScreenFragmentProps = {
    bottomSheetStage: BottomSheetStage;
    profile: profileRes | null;
    customerCancellationBannerConfig: cancellationThreshold;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    screenReaderEnabled: boolean;
    specialAssistance: disability | null | undefined;
    rcsDispatch: Resolver<HomeScreenScreenAction>;
    hideAccessibility: boolean;
    setHideAccessibility: React.Dispatch<React.SetStateAction<boolean>>;
    locationGranted: boolean;
    checkingForGps: boolean;
    sourceData: Promise<location | null> | undefined;
    progress: SharedValue<number>;
    searchPollingInterval: number;
    isMultimodal: boolean;
    stopSearch: () => void;
    resetSearch: () => void;
    recenterLocation: (zoomLevel?: number, position?: GeolocationResponse) => void;
    setLocationGranted: React.Dispatch<React.SetStateAction<boolean>>;
    navigateToSearch: () => void;
    retryBoostSearchBackPress: () => void;
    isTryBoostedSearchModalOpen: boolean;
    setIsTryBoostedSearchModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    searchId: string | null;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
};
