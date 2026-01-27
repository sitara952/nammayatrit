import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useRef } from 'react';
import { TextInput } from 'react-native';
import { TextInput as TextInputGesture } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';
import PagerView from 'react-native-pager-view';

interface RefsContextType {
    tipsBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    changeVehicleBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    tripDetailsBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    ticketBookingSheetRef: React.RefObject<BottomSheetModal | null>;
    tryBoostedSearchModalRef: React.RefObject<BottomSheetModal | null>;
    retryBoostedSearchModalRef: React.RefObject<BottomSheetModal | null>;
    disabilityScreenBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    callDriverBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    termsAndConditionSheetRef: React.RefObject<BottomSheetModal | null>;
    faqSheetRef: React.RefObject<BottomSheetModal | null>;
    cancelRideBottomsheetRideConfirmedModalRef: React.RefObject<BottomSheetModal | null>;
    cancellationReasonBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    errorStateBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    startLocationTextInputRef: React.RefObject<TextInput | null>;
    stopLocationsTextInputRef: React.RefObject<Array<TextInput>>;
    newBookingFlowSheetRef: React.RefObject<BottomSheet | null>;
    chatBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    multiChatRef: React.RefObject<BottomSheetModal | null>;
    rideConfirmedBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    rideConfirmedChatBottomsheetRef: React.RefObject<BottomSheetModal | null>;
    rideSafetyModalRef: React.RefObject<BottomSheetModal | null>;
    reviewModalRef: React.RefObject<BottomSheet | null>;
    genericSearchModalRef: React.RefObject<BottomSheetModal | null>;
    followRideModalRef: React.RefObject<BottomSheetModal | null>;
    locationPermissionModalRef: React.RefObject<BottomSheetModal | null>;
    dateTimePickerBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    rideSummaryScreenCancelButtonRef: React.RefObject<BottomSheetModal | null>;
    scheduledCardModalRef: React.RefObject<BottomSheetModal | null>;
    nammaTransitVideoBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    overlappingRideExistModalRef: React.RefObject<BottomSheetModal | null>;
    rentalPolicyModalRef: React.RefObject<BottomSheetModal | null>;
    bookingDetailsFeedbackRef: React.RefObject<BottomSheetModal | null>;
    journeyDetailsFeedbackRef: React.RefObject<BottomSheetModal | null>;
    subAutoDetailsFeedbackRef: React.RefObject<BottomSheetModal | null>;
    redbusWebviewRef: React.RefObject<BottomSheetModal | null>;
    redbusStateWebviewRef: React.RefObject<WebView | null>;
    kaptureWebViewRef: React.RefObject<WebView | null>;
    turnOffSpecialAssistanceBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    rateCardRef: React.RefObject<BottomSheetModal | null>;
    logoutModalRef: React.RefObject<BottomSheetModal | null>;
    specialPickUpInfoBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    rideInsuranceBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    datePickerRef: React.RefObject<BottomSheetModal | null>;
    chatFooterTextRef: React.RefObject<TextInputGesture | null>;
    bottomSheetTopBannerRef: React.MutableRefObject<boolean>;
    disabilityPopUp: React.RefObject<BottomSheetModal | null>;
    collectReferralEarningModalRef: React.RefObject<BottomSheetModal | null>;
    qrViewModalRef: React.RefObject<BottomSheetModal | null>;
    referralModalAfterOnboardingRef: React.RefObject<BottomSheetModal | null>;
    tripDetailsRef: React.RefObject<BottomSheetModal | null>;
    tripDetailsRefFollowRide: React.RefObject<BottomSheetModal | null>;
    liveSharingRef: React.RefObject<BottomSheetModal | null>;
    multipleSharedRidesRef: React.RefObject<BottomSheetModal | null>;
    referralInfoModalRef: React.RefObject<BottomSheetModal | null>;
    referralModalRef: React.RefObject<BottomSheetModal | null>;
    viewAllServicesRef: React.RefObject<BottomSheetModal | null>;
    specialAssistanceBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    trustedContactsBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    bookBusTicketPagerViewRef: React.RefObject<PagerView | null>;
    multiTransitFeedbackBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    multimodalRideModalRef: React.RefObject<BottomSheetModal | null>;
    journeyOptionsModalRef: React.RefObject<BottomSheetModal | null>;
    rideOptionsModalRef: React.RefObject<BottomSheetModal | null>;
    rideOptionConfirmationModalRef: React.RefObject<BottomSheetModal | null>;
    rideOptionModalRef: React.RefObject<BottomSheetModal | null>;
    cancelPaymentModalRef: React.RefObject<BottomSheetModal | null>;
    homeBottomSheetRef: React.RefObject<BottomSheetModal | null>;
    multimodalJourneyInfoSheetRef: React.RefObject<BottomSheetModal | null>;
    ticketUIRef: React.RefObject<BottomSheetModal | null>;
    cancelJourneyBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    stopsListModalRef: React.RefObject<BottomSheetModal | null>;
    journeyInfoModalRef: React.RefObject<BottomSheetModal | null>;
    smartTicketModalRef: React.RefObject<BottomSheetModal | null>;
    autoInfoModalRef: React.RefObject<BottomSheetModal | null>;
    vehicleOptionsModalRef: React.RefObject<BottomSheetModal | null>;
    multimodalModesFilterRef: React.RefObject<BottomSheetModal | null>;
    multimodalOtherFiltersRef: React.RefObject<BottomSheetModal | null>;
    multimodalWarningModalRef: React.RefObject<BottomSheetModal | null>;
    addFavouriteModalRef: React.RefObject<BottomSheetModal | null>;
    developerSettingsModalRef: React.RefObject<BottomSheetModal | null>;
    ticketSelectorModalRef: React.RefObject<BottomSheetModal | null>;
    deviceChangeModalRef: React.RefObject<BottomSheetModal | null>;
    subwayPopUpModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyBusStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyMetroStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneySuburbanStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyStartJourneyStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyUserWillMissBusStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyUserWillMissSuburbanModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyUserWillMissMetroModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyOptionsModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyBoardedWrongBusTypeModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyTransitCheckInModalRef: React.RefObject<BottomSheetModal | null>;
    livJourneyBookAutoModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyBookAutoOrCabStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyListBottomSheetRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyListDetailBottomSheetRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyUpdateTransitBottomSheetRef: React.RefObject<BottomSheetModal | null>;
    timeTableBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyMetroConfirmLocationBottomSheetRef: React.RefObject<BottomSheetModal | null>;
    switchToAutoConfirmationModalRef: React.RefObject<BottomSheetModal | null>;
    directBusBookingTimeTableRef: React.RefObject<BottomSheetModal | null>;
    completeJourneyModalRef: React.RefObject<BottomSheetModal | null>;
    betaDetailRef: React.RefObject<BottomSheetModal | null>;
    viaPointsModalRef: React.RefObject<BottomSheetModal | null>;
    cancelTicketConfirmationRef: React.RefObject<BottomSheetModal | null>;
    addContactManuallyRef: React.RefObject<BottomSheetModal | null>;
    manageContactsRef: React.RefObject<BottomSheetModal | null>;
    deleteContactConfirmationRef: React.RefObject<BottomSheetModal | null>;
    ticketDetailsPopupRef: React.RefObject<BottomSheetModal | null>;
    metroOptionsModalRef: React.RefObject<BottomSheetModal | null>;
    metroStationChangeModalRef: React.RefObject<BottomSheetModal | null>;
    singleModeBusSourceChangePopUpModalRef: React.RefObject<BottomSheetModal | null>;
    serviceUnavailableModalRef: React.RefObject<BottomSheetModal | null>;
    busRouteSelectionModalRef: React.RefObject<BottomSheetModal | null>;
    busOtpModalRef: React.RefObject<BottomSheetModal | null>;
    otpModalRef: React.RefObject<BottomSheetModal | null>;
    metroSwitchRouteModalRef: React.RefObject<BottomSheetModal | null>;
    busRouteInputModalRef: React.RefObject<BottomSheet | null>;
    carouselModalRef: React.RefObject<BottomSheetModal | null>;
    annaModalRef: React.RefObject<BottomSheetModal | null>;
    buyBussPassOptionsSheetRef: React.RefObject<BottomSheetModal | null>;
    passVerificationFailedModalRef: React.RefObject<BottomSheetModal | null>;
    busOtpSearchBottomSheetRef: React.RefObject<BottomSheetModal | null>;
    touristBusPassBottomSheetRef: React.RefObject<BottomSheetModal | null>;
    helpAndSupportModalRef: React.RefObject<BottomSheetModal | null>;
    busPassActivationModalRef: React.RefObject<BottomSheetModal | null>;
}

const RefsContext = React.createContext<RefsContextType | undefined>(undefined);

const useRefsContext = (): RefsContextType => {
    const context = React.useContext(RefsContext);
    if (!context) {
        throw new Error(
            'useRefsContext: `RefsContext` is undefined. Seems you forgot to wrap component within the RefsProvider',
        );
    }

    return context;
};

const RefsProvider: React.FC<Partial<RefsContextType & { children: React.ReactNode }>> = props => {
    const tipsBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const changeVehicleBottomsheetModalRef = useRef<BottomSheetModal | null>(null);
    const tripDetailsBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const ticketBookingSheetRef = useRef<BottomSheetModal | null>(null);
    const tryBoostedSearchModalRef = useRef<BottomSheetModal | null>(null);
    const retryBoostedSearchModalRef = useRef<BottomSheetModal | null>(null);
    const disabilityScreenBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const turnOffSpecialAssistanceBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const cancelRideBottomsheetRideConfirmedModalRef = useRef<BottomSheetModal | null>(null);
    const callDriverBottomsheetModalRef = useRef<BottomSheetModal | null>(null);
    const termsAndConditionSheetRef = useRef<BottomSheetModal | null>(null);
    const faqSheetRef = useRef<BottomSheetModal | null>(null);
    const cancellationReasonBottomsheetModalRef = useRef<BottomSheetModal | null>(null);
    const errorStateBottomsheetModalRef = useRef<BottomSheetModal | null>(null);
    const startLocationTextInputRef = useRef<TextInput | null>(null);
    const stopLocationsTextInputRef = useRef<Array<TextInput>>([]);
    const newBookingFlowSheetRef = useRef<BottomSheet | null>(null);
    const chatBottomsheetModalRef = useRef<BottomSheetModal | null>(null);
    const multiChatRef = useRef<BottomSheetModal | null>(null);
    const rideConfirmedBottomsheetModalRef = useRef<BottomSheetModal | null>(null);
    const rideConfirmedChatBottomsheetRef = useRef<BottomSheetModal | null>(null);
    const rideSafetyModalRef = useRef<BottomSheetModal | null>(null);
    const followRideModalRef = useRef<BottomSheetModal | null>(null);
    const locationPermissionModalRef = useRef<BottomSheetModal | null>(null);
    const dateTimePickerBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const rideSummaryScreenCancelButtonRef = useRef<BottomSheetModal | null>(null);
    const scheduledCardModalRef = useRef<BottomSheetModal | null>(null);
    const nammaTransitVideoBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const redbusWebviewRef = useRef<BottomSheetModal | null>(null);
    const redbusStateWebviewRef = useRef<WebView | null>(null);
    const kaptureWebViewRef = useRef<WebView | null>(null);
    const rentalPolicyModalRef = useRef<BottomSheetModal | null>(null);
    const reviewModalRef = useRef<BottomSheet | null>(null);
    const overlappingRideExistModalRef = useRef<BottomSheetModal | null>(null);
    const genericSearchModalRef = useRef<BottomSheetModal | null>(null);
    const bookingDetailsFeedbackRef = useRef<BottomSheetModal | null>(null);
    const journeyDetailsFeedbackRef = useRef<BottomSheetModal | null>(null);
    const subAutoDetailsFeedbackRef = useRef<BottomSheetModal | null>(null);
    const rateCardRef = useRef<BottomSheetModal | null>(null);
    const logoutModalRef = useRef<BottomSheetModal | null>(null);
    const specialPickUpInfoBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const rideInsuranceBottomSheetModalRef = useRef<BottomSheetModal>(null);
    const datePickerRef = useRef<BottomSheetModal | null>(null);
    const bottomSheetTopBannerRef = useRef<boolean>(false);
    const chatFooterTextRef = useRef<TextInputGesture | null>(null);
    const disabilityPopUp = useRef<BottomSheetModal | null>(null);
    const collectReferralEarningModalRef = useRef<BottomSheetModal | null>(null);
    const qrViewModalRef = useRef<BottomSheetModal | null>(null);
    const referralModalAfterOnboardingRef = useRef<BottomSheetModal | null>(null);
    const tripDetailsRef = useRef<BottomSheetModal | null>(null);
    const tripDetailsRefFollowRide = useRef<BottomSheetModal | null>(null);
    const liveSharingRef = useRef<BottomSheetModal | null>(null);
    const multipleSharedRidesRef = useRef<BottomSheetModal | null>(null);
    const referralInfoModalRef = useRef<BottomSheetModal | null>(null);
    const referralModalRef = useRef<BottomSheetModal | null>(null);
    const viewAllServicesRef = useRef<BottomSheetModal | null>(null);
    const trustedContactsBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const specialAssistanceBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const bookBusTicketPagerViewRef = useRef<PagerView | null>(null);
    const multiTransitFeedbackBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const multimodalRideModalRef = useRef<BottomSheetModal | null>(null);
    const cancelJourneyBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const homeBottomSheetRef = useRef<BottomSheetModal | null>(null);
    const multimodalJourneyInfoSheetRef = useRef<BottomSheetModal | null>(null);
    const journeyOptionsModalRef = useRef<BottomSheetModal | null>(null);
    const rideOptionsModalRef = useRef<BottomSheetModal | null>(null);
    const rideOptionConfirmationModalRef = useRef<BottomSheetModal | null>(null);
    const ticketUIRef = useRef<BottomSheetModal | null>(null);
    const stopsListModalRef = useRef<BottomSheetModal | null>(null);
    const autoInfoModalRef = useRef<BottomSheetModal | null>(null);
    const addFavouriteModalRef = useRef<BottomSheetModal | null>(null);
    const rideOptionModalRef = useRef<BottomSheetModal | null>(null);
    const cancelPaymentModalRef = useRef<BottomSheetModal | null>(null);
    const journeyInfoModalRef = useRef<BottomSheetModal | null>(null);
    const vehicleOptionsModalRef = useRef<BottomSheetModal | null>(null);
    const multimodalModesFilterRef = useRef<BottomSheetModal | null>(null);
    const multimodalOtherFiltersRef = useRef<BottomSheetModal | null>(null);
    const multimodalWarningModalRef = useRef<BottomSheetModal | null>(null);
    const developerSettingsModalRef = useRef<BottomSheetModal | null>(null);
    const ticketSelectorModalRef = useRef<BottomSheetModal | null>(null);
    const deviceChangeModalRef = useRef<BottomSheetModal | null>(null);
    const subwayPopUpModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyBusStatusModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyMetroStatusModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneySuburbanStatusModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyStartJourneyStatusModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyUserWillMissBusStatusModalRef = useRef<BottomSheetModal | null>(null);
    const carouselModalRef = useRef<BottomSheetModal | null>(null);
    const annaModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyUserWillMissSuburbanModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyUserWillMissMetroModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyOptionsModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyBoardedWrongBusTypeModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyTransitCheckInModalRef = useRef<BottomSheetModal | null>(null);
    const livJourneyBookAutoModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyBookAutoOrCabStatusModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyListBottomSheetRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyListDetailBottomSheetRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyUpdateTransitBottomSheetRef = useRef<BottomSheetModal | null>(null);
    const timeTableBottomSheetModalRef = useRef<BottomSheetModal | null>(null);
    const liveJourneyMetroConfirmLocationBottomSheetRef = useRef<BottomSheetModal | null>(null);
    const switchToAutoConfirmationModalRef = useRef<BottomSheetModal | null>(null);
    const directBusBookingTimeTableRef = useRef<BottomSheetModal | null>(null);
    const completeJourneyModalRef = useRef<BottomSheetModal | null>(null);
    const betaDetailRef = useRef<BottomSheetModal | null>(null);
    const viaPointsModalRef = useRef<BottomSheetModal | null>(null);
    const cancelTicketConfirmationRef = useRef<BottomSheetModal | null>(null);
    const addContactManuallyRef = useRef<BottomSheetModal | null>(null);
    const manageContactsRef = useRef<BottomSheetModal | null>(null);
    const deleteContactConfirmationRef = useRef<BottomSheetModal | null>(null);
    const ticketDetailsPopupRef = useRef<BottomSheetModal | null>(null);
    const metroOptionsModalRef = useRef<BottomSheetModal | null>(null);
    const metroStationChangeModalRef = useRef<BottomSheetModal | null>(null);
    const singleModeBusSourceChangePopUpModalRef = useRef<BottomSheetModal | null>(null);
    const serviceUnavailableModalRef = useRef<BottomSheetModal | null>(null);
    const busRouteSelectionModalRef = useRef<BottomSheetModal | null>(null);
    const smartTicketModalRef = useRef<BottomSheetModal | null>(null);
    const busRouteInputModalRef = useRef<BottomSheet | null>(null);
    const busOtpModalRef = useRef<BottomSheetModal | null>(null);
    const otpModalRef = useRef<BottomSheetModal | null>(null);
    const metroSwitchRouteModalRef = useRef<BottomSheetModal | null>(null);
    const buyBussPassOptionsSheetRef = useRef<BottomSheetModal | null>(null);
    const passVerificationFailedModalRef = useRef<BottomSheetModal | null>(null);
    const busOtpSearchBottomSheetRef = useRef<BottomSheetModal | null>(null);
    const touristBusPassBottomSheetRef = useRef<BottomSheetModal | null>(null);
    const helpAndSupportModalRef = useRef<BottomSheetModal | null>(null);
    const busPassActivationModalRef = useRef<BottomSheetModal | null>(null);
    const { children } = props;

    const contextRefValues = {
        tipsBottomSheetModalRef,
        changeVehicleBottomsheetModalRef,
        tripDetailsBottomSheetModalRef,
        ticketBookingSheetRef,
        tryBoostedSearchModalRef,
        retryBoostedSearchModalRef,
        cancelRideBottomsheetRideConfirmedModalRef,
        disabilityScreenBottomSheetModalRef,
        turnOffSpecialAssistanceBottomSheetModalRef,
        errorStateBottomsheetModalRef,
        startLocationTextInputRef,
        cancellationReasonBottomsheetModalRef,
        stopLocationsTextInputRef,
        newBookingFlowSheetRef,
        chatBottomsheetModalRef,
        multiChatRef,
        callDriverBottomsheetModalRef,
        termsAndConditionSheetRef,
        faqSheetRef,
        rideConfirmedBottomsheetModalRef,
        rideConfirmedChatBottomsheetRef,
        rideSafetyModalRef,
        reviewModalRef,
        genericSearchModalRef,
        followRideModalRef,
        locationPermissionModalRef,
        dateTimePickerBottomSheetModalRef,
        rideSummaryScreenCancelButtonRef,
        scheduledCardModalRef,
        nammaTransitVideoBottomSheetModalRef,
        redbusWebviewRef,
        redbusStateWebviewRef,
        kaptureWebViewRef,
        overlappingRideExistModalRef,
        rentalPolicyModalRef,
        bookingDetailsFeedbackRef,
        journeyDetailsFeedbackRef,
        subAutoDetailsFeedbackRef,
        rateCardRef,
        logoutModalRef,
        bottomSheetTopBannerRef,
        chatFooterTextRef,
        specialPickUpInfoBottomSheetModalRef,
        rideInsuranceBottomSheetModalRef,
        datePickerRef,
        disabilityPopUp,
        collectReferralEarningModalRef,
        qrViewModalRef,
        referralModalAfterOnboardingRef,
        tripDetailsRef,
        tripDetailsRefFollowRide,
        liveSharingRef,
        multipleSharedRidesRef,
        referralInfoModalRef,
        referralModalRef,
        viewAllServicesRef,
        specialAssistanceBottomSheetModalRef,
        trustedContactsBottomSheetModalRef,
        bookBusTicketPagerViewRef,
        multiTransitFeedbackBottomSheetModalRef,
        multimodalRideModalRef,
        rideOptionModalRef,
        cancelPaymentModalRef,
        homeBottomSheetRef,
        multimodalJourneyInfoSheetRef,
        ticketUIRef,
        cancelJourneyBottomSheetModalRef,
        journeyOptionsModalRef,
        rideOptionsModalRef,
        rideOptionConfirmationModalRef,
        stopsListModalRef,
        journeyInfoModalRef,
        autoInfoModalRef,
        addFavouriteModalRef,
        vehicleOptionsModalRef,
        multimodalModesFilterRef,
        multimodalOtherFiltersRef,
        multimodalWarningModalRef,
        developerSettingsModalRef,
        ticketSelectorModalRef,
        deviceChangeModalRef,
        subwayPopUpModalRef,
        liveJourneyBusStatusModalRef,
        liveJourneyMetroStatusModalRef,
        liveJourneySuburbanStatusModalRef,
        liveJourneyStartJourneyStatusModalRef,
        liveJourneyUserWillMissBusStatusModalRef,
        carouselModalRef,
        annaModalRef,
        liveJourneyUserWillMissSuburbanModalRef,
        liveJourneyUserWillMissMetroModalRef,
        liveJourneyOptionsModalRef,
        liveJourneyBoardedWrongBusTypeModalRef,
        liveJourneyTransitCheckInModalRef,
        livJourneyBookAutoModalRef,
        liveJourneyBookAutoOrCabStatusModalRef,
        liveJourneyListBottomSheetRef,
        liveJourneyListDetailBottomSheetRef,
        liveJourneyUpdateTransitBottomSheetRef,
        timeTableBottomSheetModalRef,
        liveJourneyMetroConfirmLocationBottomSheetRef,
        switchToAutoConfirmationModalRef,
        directBusBookingTimeTableRef,
        completeJourneyModalRef,
        betaDetailRef,
        cancelTicketConfirmationRef,
        viaPointsModalRef,
        addContactManuallyRef,
        manageContactsRef,
        deleteContactConfirmationRef,
        ticketDetailsPopupRef,
        metroOptionsModalRef,
        metroStationChangeModalRef,
        singleModeBusSourceChangePopUpModalRef,
        serviceUnavailableModalRef,
        busRouteSelectionModalRef,
        smartTicketModalRef,
        busOtpModalRef,
        busRouteInputModalRef,
        otpModalRef,
        metroSwitchRouteModalRef,
        buyBussPassOptionsSheetRef,
        passVerificationFailedModalRef,
        busOtpSearchBottomSheetRef,
        touristBusPassBottomSheetRef,
        helpAndSupportModalRef,
        busPassActivationModalRef,
    };

    return <RefsContext.Provider value={contextRefValues}>{children}</RefsContext.Provider>;
};

export { RefsProvider, useRefsContext };
