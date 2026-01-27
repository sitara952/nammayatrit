import { BookingId } from '@/typescript/state/client/user';
import { RideStatus } from '@/typescript/hooks/types.ts';
import { TransformedContact } from '../../../../../src/typescript/designSystem/components/LiveTrackingModal';
import { strings } from 'config-types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RideId } from '@/typescript/state/client/booking';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';
import { AppDispatch } from '@/typescript/state/store';

export type RideConfirmedHeaderCardProps = {
    startOtp: string;
    bookingId: BookingId | null;
    endOtp: string | undefined;
    nextStop: string | undefined;
    setIsBottomSheetChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type RideConfirmedHeaderCardUIProps = {
    rideOtpText: string;
    stage: RideStatus;
    titleText: string;
    etaMinutesForHeaderText: number | undefined;
    isAccordionOpen: boolean;
    setIsAccordionOpen: (value: boolean) => void;
    emergencyContacts: TransformedContact[];
    handleShare: (index: number) => void;
    startOtp: string;
    endOtp: string | undefined;
    nextStop: string | undefined;
    userLanguageStrings: strings;
    rentalsTitleText: string;
    onEditOrAddStopClicked: () => void;
    rideConfirmedBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    rideConfirmedChatBottomsheetRef: React.RefObject<BottomSheetModal | null>;
    setIsBottomSheetChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    defaultEmergencyNumbers: personDefaultEmergencyNumberAPIEntity[];
    dispatch: AppDispatch;
    rideId: RideId | null;
    bookingId: BookingId | null;
    driverArrived: boolean;
};

export const isStageInGroup = (stage: RideStatus, group: RideStatus[]) => group.includes(stage);

export const isStageNotInGroup = (stage: RideStatus, group: RideStatus[]) => !group.includes(stage);

export type AddOrEditStopButtonProps = {
    stopAddedOrNot: string | undefined;
    onAddOrEditButtonPress: () => void;
};
