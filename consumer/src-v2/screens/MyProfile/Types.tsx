import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { profileRes } from '@/readOnly/api/types/ProfileRes.gen';
import { strings } from 'config-types';
import { Action, Resolver } from '@/typescript/utils/common';
import { RideStatus_rideStatus } from '@/readOnly/api/types/Enums.gen';

export type MyProfileScreenAction =
    | Action<'GO_BACK'>
    | Action<'EDIT', { isDisability: boolean }>
    | Action<'CLOSE_POPUP'>
    | Action<'SHOW_DISABILITY_POPUP'>;

export type MyProfileViewProps = {
    mpDispatch: Resolver<MyProfileScreenAction>;
    onBackPress: () => void;
    disabilityPopUp: React.RefObject<BottomSheetModal | null>;
    userProfile: profileRes | null | undefined;
    name: string | undefined;
    refetch: (() => {}) | undefined;
    top: number;
    setName: React.Dispatch<React.SetStateAction<string>> | undefined;
    email: string | undefined;
    userLanguageStrings: strings;
    showPopup: boolean | undefined;
    mobileNumber: string;
    rideStatus: RideStatus_rideStatus | undefined;
};
