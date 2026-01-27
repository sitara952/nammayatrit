import { Action, Resolver } from '@/typescript/utils/common';
import { strings } from 'config-types';
import { profileRes } from '@/readOnly/api/types/ProfileRes.gen';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { MutableRefObject } from 'react';
import { RideStatus_rideStatus } from '@/readOnly/api/types/Enums.gen';
import { disabilityArray } from '@/readOnly/api/types/DisabilityArray.gen';
import { disability } from '@/readOnly/api/types/Disability.gen';

export type UpdateMyProfileScreenActions = Action<'GO_BACK'> | Action<'CONTINUE_CLICKED'>;

export type UpdateMyProfileScreenProps = {
    email: string;
    gender: string;
    name: string;
    userLanguageStrings: strings;
    userProfile: profileRes | null;
    setName: React.Dispatch<React.SetStateAction<string>>;
    upDispatch: Resolver<UpdateMyProfileScreenActions>;
    setGender: React.Dispatch<React.SetStateAction<string>>;
    setSelectedDisability: React.Dispatch<React.SetStateAction<number>>;
    disabilityScreenBottomSheetModalRef: React.RefObject<BottomSheetModalMethods | null>;
    disabilityData: disabilityArray;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    selectedDisability: number;
    selectedDisabilityStr: MutableRefObject<disability>;
    handleSubmit: () => Promise<void>;
    hideAssesibility: boolean;
    setHideAssesibility: React.Dispatch<React.SetStateAction<boolean>>;
    mobileNumber: string;
    rideStatus: RideStatus_rideStatus | undefined;
    emailError: string;
};
