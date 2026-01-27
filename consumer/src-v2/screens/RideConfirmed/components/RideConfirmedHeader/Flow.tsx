import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRideHeaderTitleText } from '../../../../../src/typescript/hooks/useDynamicIsland';
import {
    selectAppConfig,
    selectLiveSharingEmergencyContacts,
    updateLiveSharingEmergencyContact,
} from '../../../../../src/typescript/state/client/session';
import { RideConfirmedHeaderCardUI } from './UI';
import { RideConfirmedHeaderCardProps } from './Types';
import { TransformedContact } from '../../../../../src/typescript/designSystem/components/LiveTrackingModal';
import { useConfigContext } from '../../../../../src/typescript/context/ConfigContext';
import { useRefsContext } from '../../../../../src/typescript/context/RefsContext';
import { useAppSelector } from '../../../../../src/typescript/state/hooks';
import { selectEmergencyContacts } from '../../../../../src/typescript/state/client/user';
import { useShareRidePostMutation } from '../../../../../src/api/integrations/rtk/ShareRidePost';
import { RideStatus } from '../../../../../src/typescript/hooks/types';
import { selectRideIdWithBookingId } from '../../../../../src/typescript/state/client/booking';

export const RideConfirmedHeaderCard = ({
    bookingId,
    startOtp,
    endOtp,
    nextStop,
    setIsBottomSheetChatOpen,
}: RideConfirmedHeaderCardProps) => {
    const { stage, titleText, etaMinutes: etaMinutesForHeaderText } = useRideHeaderTitleText(bookingId);

    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [driverArrived, setDriverArrived] = useState(false);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const dispatch = useDispatch();
    const emergencyContacts: TransformedContact[] = useSelector(selectLiveSharingEmergencyContacts) ?? [];
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const { genericSearchModalRef, rideConfirmedBottomsheetModalRef, rideConfirmedChatBottomsheetRef } =
        useRefsContext();

    const defaultEmergencyNumbers = useAppSelector(selectEmergencyContacts);
    const appConfig = useAppSelector(selectAppConfig);

    const [shareRidePost] = useShareRidePostMutation();

    const handleShare = async (index: number) => {
        if (emergencyContacts[index]) {
            // Update local state to mark contact as shared
            dispatch(updateLiveSharingEmergencyContact({ index, isRideShared: true }));

            // Call API to send notification to the contact
            try {
                await shareRidePost({
                    body: { emergencyContactNumbers: [emergencyContacts[index].mobileNumber] },
                }).unwrap();
                // Ride successfully shared with contact
            } catch (error) {
                console.error('Error sharing ride with contact:', error);
            }
        }
    };

    const onEditOrAddStopClicked = () => {
        genericSearchModalRef?.current?.present();
    };

    const rentalsTitleText = nextStop ? userLanguageStrings.enrouteToStop + nextStop : userLanguageStrings.stopNotAdded;

    useEffect(() => {
        if (
            stage === RideStatus.CAB_HAS_ARRIVED ||
            stage === RideStatus.CAB_IS_WAITING_FOR_YOU ||
            stage === RideStatus.WAITING_CHARGES_APPLY_NOW ||
            stage === RideStatus.CAB_IS_LEAVING_SOON
        ) {
            setDriverArrived(true);
        }
    }, [stage]);

    return (
        <RideConfirmedHeaderCardUI
            stage={stage}
            titleText={titleText}
            etaMinutesForHeaderText={etaMinutesForHeaderText}
            isAccordionOpen={isAccordionOpen}
            setIsAccordionOpen={setIsAccordionOpen}
            emergencyContacts={emergencyContacts}
            handleShare={handleShare}
            startOtp={startOtp}
            endOtp={endOtp}
            nextStop={nextStop}
            userLanguageStrings={userLanguageStrings}
            rentalsTitleText={rentalsTitleText}
            onEditOrAddStopClicked={onEditOrAddStopClicked}
            rideConfirmedBottomsheetModalRef={rideConfirmedBottomsheetModalRef}
            rideConfirmedChatBottomsheetRef={rideConfirmedChatBottomsheetRef}
            setIsBottomSheetChatOpen={setIsBottomSheetChatOpen}
            defaultEmergencyNumbers={defaultEmergencyNumbers}
            dispatch={dispatch}
            rideId={rideId}
            bookingId={bookingId}
            driverArrived={driverArrived}
            rideOtpText={appConfig.textConfig.rideOtpText}
        />
    );
};
