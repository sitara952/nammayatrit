import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { StopInfo } from '@/typescript/state/client/ride';
import { Action, Resolver } from '@/typescript/utils/common';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RideChecksType } from '@/typescript/screens/SafetyModal';
import { personDefaultEmergencyNumberAPIEntity as emergencyContactNumber } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen.tsx';
import { location } from '@/helpers/utils/Location/LocationTypes.gen.tsx';
import { getDriverLocResp } from '@/readOnly/api/types/GetDriverLocResp.gen.tsx';
import { MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList';

export type RideConfirmedScreenAction =
    | Action<'HAMBURGER_TOGGLED'>
    | Action<'EDIT_PICKUP_CLICKED'>
    | Action<'EDIT_DESTINATION_CLICKED', { driverLocation: getDriverLocResp | undefined }>
    | Action<'ON_RIDE_CANCELLED'>
    | Action<'ON_REALLOCATION'>
    | Action<'ON_SAFETY_MODAL_CLOSED', { rideCheckType: RideChecksType }>
    | Action<'BTMSHEET_ON_CHANGE', { index: number; postion: number }>
    | Action<'CHAT_CLICKED'>
    | Action<'CALL_CLICKED'>
    | Action<'POST_RIDE_BOOKING_DETAILS_CLICKED'>
    | Action<'POST_RIDE_SOS_CLICKED'>
    | Action<'BTMSHEET_BACKDROP_CLICKED'>
    | Action<'CLOSE_BTMSHEET'>
    | Action<'PRESENT_BTMSHEET'>
    | Action<'SEARCH_CARD_CLICKED', { location: location }>
    | Action<'LOCATE_ON_MAP_CLICK'>
    | Action<'SAFETY_BTN_CLICKED'>
    | Action<'MULTIMODAL_EXIT_CLICKED'>
    | Action<'TICKET_BUTTON_CLICKED'>
    | Action<'PICKUP_DIRECTIONS_BTN_CLICKED'>;

export type RideConfirmedFragmentProps = {
    bookingDetails: bookingAPIEntity | null;
    rideDetails: rideAPIEntity | null;
    stopInfo: StopInfo | null;
    otpCode: string | null;
    currentChatSessionId: string | null;
    isChatClicked: boolean;
    multiChatRef: React.RefObject<BottomSheetModal | null>;
    isPresented: React.MutableRefObject<boolean>;
    isDriver: boolean;
    setIsDriver: React.Dispatch<React.SetStateAction<boolean>>;
    isChatOpen: boolean;
    setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    contactWithPriorityZero: emergencyContactNumber | undefined;
    source: FormatedLocation | null;
    stops: Array<FormatedLocation>;
    destination: FormatedLocation | undefined;
    rcsDispatch: Resolver<RideConfirmedScreenAction>;
    showBottomSheet: boolean;
    onRideConfirmedCancel: () => void;
    personId: string | undefined;
    isBottomSheetChatOpen: boolean;
    setIsBottomSheetChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setShowChatBar: React.Dispatch<React.SetStateAction<boolean>>;
    showChatBar: boolean;
    shouldEnableAutoSendMessage: boolean;
    messageCountLogic: () => number;
    onEditPickupClick: () => void;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
};
