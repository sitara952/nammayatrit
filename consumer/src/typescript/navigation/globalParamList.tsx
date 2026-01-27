import { BookingDetailCardProps } from '@/src-v2/screens/MyRides/UI.tsx';
import { passAPIEntity } from '@/readOnly/api/types/PassAPIEntity.gen';
import { PickLocFromMapProps } from '../components/common/PickLocFromMap';
import { BookingId, JourneyId } from '../state/client/user';
import { EditDestinationProps } from '../screens/editLocation/EditDestination';
import { EditPickupProps } from '../screens/editLocation/EditPickup';
import { followers } from '@/readOnly/api/types/Followers.gen';
import { estimateFares } from '@/api/apiTypes/SearchResults.gen';
import { UpdateProfileNavProps } from '../screens/onboarding/UpdateProfile';
import { EndInfoScreenProps } from '@/typescript/screens/EndInfoScreen.tsx';
import { PickupInstructionsProps } from '@/src-v2/utils/types';
import { RideId } from '@/typescript/state/client/booking.ts';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import { ticketPlace } from '@/readOnly/api/types/TicketPlace.gen';
import { ticketBookingReq } from '@/readOnly/api/types/TicketBookingReq.gen';
import { ChooseCategoriesProps } from '@/src-v2/screens/Ticketing/ChooseCategories/Types';
import { ReviewBookingProps } from '@/src-v2/screens/Ticketing/ReviewBooking/Types';
import { TagType } from '@/src-v2/multimodal/screens/Favourites/Types';
import { RideDetailCardProps } from '@/src-v2/screens/MyBookingDetails/Types';
import { SingleModeTicketBookingRouteProps } from '@/src-v2/multimodal/screens/SingleModeTicketBooking/Types';
import { TransportationTypes } from '@/src-v2/multimodal/screens/SingleModeSearch/Types';
import { MetroSubwayBookingRouteProps } from '@/src-v2/multimodal/screens/MetroSubwayBooking/Types';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { BusTrackingRouteProps } from '@/src-v2/multimodal/screens/BusTrackingScreen/Types';
import { JourneyDetailsProps } from '@/src-v2/multimodal/screens/JourneyInfoScreen';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { SafetyStageId } from '../screens/safety/Types';
import { EventTicketingScreenProps } from '@/src-v2/screens/Ticketing/PaymentStatusScreen/Types';
import { ticketPlaceResp } from '@/readOnly/api/types/TicketPlaceResp.gen';
import { NavigatorScreenParams } from '@react-navigation/native';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { BusOtpActivateFlowProps } from '@/src-v2/multimodal/screens/BusOtpFlow/Types';
import { cumulativeOfferResp } from '@/readOnly/api/types/CumulativeOfferResp.gen';
import { IssueScreenProps } from '@/src-v2/screens/ActiveTickets/Types';
import { issueCategoryRes } from '@/readOnly/api/types/IssueCategoryRes.gen';

export type MultimodalTaxiTrackingProps = {
    journeyId: JourneyId;
    isLastMile: boolean;
    currentLegOrder: string;
    previousLegOrderTravelMode: MultimodalTravelMode_multimodalTravelMode | undefined;
    previousLegOrderTravelModeStatusConfirmed: boolean | undefined;
};

export type TicketsStackParamList = {
    homeScreen: undefined;
    ticketHistory: undefined;
    showTicketScreen: { journey: journeyInfoResp; fromCancelledJourney: boolean };
};

export type BusOtpFlowParams = {
    state: 'Activate' | 'Booking' | 'Pass';
    params: BusOtpActivateFlowProps | undefined;
    displaySearchBar: boolean;
    activePassId: string | undefined;
    locationData:
        | {
              currentLat: number | undefined;
              currentLon: number | undefined;
          }
        | undefined;
};

export type RootNavigationParamList = {
    onboardingNavigation: NavigatorScreenParams<OnboardingNavigationParamList>;
    mainNavigation: NavigatorScreenParams<MainNavigationParamList>;
};

export type OnboardingNavigationParamList = {
    GettingStartedCarousel: undefined;
    LoginScreen: undefined;
    OTPVerification: { email: string; phoneNumber: string; authId: string };
    UpdateProfile: UpdateProfileNavProps;
    EnterMobileNumber: undefined;
};

export type MainNavigationParamList = {
    main: undefined;
    mainTabNavigation: NavigatorScreenParams<MainTabParamList>;
    HomeTab: NavigatorScreenParams<HomeTabParamList>;
    ServicesTab: NavigatorScreenParams<ServicesTabParamList>;
    TicketsTab: NavigatorScreenParams<TicketsTabParamList>;
    ProfileTab: NavigatorScreenParams<ProfileTabParamList>;
    PassesTab: NavigatorScreenParams<PassesTabParamList>;
    LiveTab: NavigatorScreenParams<LiveTabParamList>;
    taxiRideTracking: { bookingId: BookingId | null; multimodalProps: MultimodalTaxiTrackingProps | undefined };
    followRide: { defaultFollower: followers | null; shouldOpenChat: boolean | undefined };
    EndInfoScreen: EndInfoScreenProps;
    driverProfile: {
        rideId: RideId | null;
        vehicleServiceType: ServiceTierType_serviceTierType | undefined;
        driverId: string | null;
    };
    webView: { url: string | null | undefined; goBack: (() => void) | undefined };
    safetyTools: { bookingId: BookingId | null; isRideEnded: boolean | undefined }; // To check
    multimodalPaymentStatus: {
        processResultStatus: string;
        paymentOrderId: string | undefined;
    };
    editPickup: EditPickupProps;
    editDestination: EditDestinationProps;
    locateOnMap: PickLocFromMapProps;
    busTracking: BusTrackingRouteProps;
    safetyCard: { bookingId: BookingId | null; hideSideDrawer: boolean | undefined };
    Ticketing: undefined;
    EventDetails: { place: ticketPlace | ticketPlaceResp | undefined };
    ChooseCategories: ChooseCategoriesProps;
    ReviewBooking: ReviewBookingProps;
    PaymentView: { apiData: ticketBookingReq; placeId: string; useOldPayload: boolean };
    YatriSathiPaymentStatusScreen: EventTicketingScreenProps;
    MyTicketScreen: undefined;
    addFavourite:
        | {
              intendedTag: TagType | undefined;
              editLocation: string | undefined;
              location: location | undefined;
          }
        | undefined;
    help: { viewParam: string };
    deliveryScreen: undefined;
    ambulanceScreen: undefined;
    continueBooking: undefined;
    tripDetail: { viewParam: string };
    reportIssue: { viewParam: string | undefined };
};

export type MainTabParamList = {
    homeTab_homeScreen:
        | { originTab: 'services' | 'live' | 'tickets' | 'profile' | undefined }
        | {
              multimodalProps: MultimodalTaxiTrackingProps | undefined;
              journeyDetailsProps: JourneyDetailsProps | undefined;
          }
        | undefined;
    serviceTab_homeScreen: undefined;
    profileTab_homeScreen: undefined;
    ticketsTab_homeScreen: undefined;
    passesTab_homeScreen: undefined;
    liveTab_homeScreen:
        | {
              journeyId: JourneyId | null;
              multimodalProps: MultimodalTaxiTrackingProps | undefined;
          }
        | undefined;
};

export type HomeTabParamList = {
    favouritesScreen: undefined;
    journeyOptions: undefined;
    multimodalTransitCheckout: undefined;
    baseHybridFlow: { viewParam: string | undefined; sharedPrefValues: {} };
    reviewAndFeedback: { bookingId: string; multimodalProps: MultimodalTaxiTrackingProps | undefined };
    busOtpFlow: BusOtpFlowParams;
    busOTPViaTicketBookingFlow: { otp: string; routeCode: string | undefined; resetKey: string | undefined };
    busOTPWithPass: {
        otp: string;
        eligiblePassIds: string[];
        detectedRoute: string | null;
    };
};

export type ServicesTabParamList = {
    singleModeBookingNavigator: NavigatorScreenParams<SingleModeBookingParamList> | undefined;
    extendedBookingNavigator: NavigatorScreenParams<ExtendedBookingParamList>;
};

export type PassesTabParamList = {
    takePhoto: {
        selectedPass: passAPIEntity | undefined;
        date: { startDate: Date; endDate: Date } | undefined;
        offer: cumulativeOfferResp | undefined;
        uploadMode: boolean | undefined;
        purchasedPassId: string | undefined;
    };
    passHistory: undefined;
};

export type LiveTabParamList = {
    taxiRideTracking: { bookingId: BookingId | null; multimodalProps: MultimodalTaxiTrackingProps | undefined };
    DetailsNoAnim: { bookingId: BookingId | null; multimodalProps: MultimodalTaxiTrackingProps | undefined };
    pickupInstructions: PickupInstructionsProps;
    multiTransitFeedback: { journeyId: JourneyId | null; multimodalProps: MultimodalTaxiTrackingProps | undefined };
    journeyPlanScreen: { journeyId: JourneyId };
    liveJourneyDetail: { journeyId: JourneyId | null; multimodalProps: MultimodalTaxiTrackingProps | undefined };
};

export type TicketsTabParamList = {
    ticketHistory:
        | {
              isHelpAndSupportScreen: boolean | undefined;
              issueCategory: issueCategoryRes;
          }
        | undefined;
    showTicketScreen: { journey: journeyInfoResp; fromCancelledJourney: boolean };
};

export type ProfileTabParamList = {
    transitPreferencesScreen: undefined;
    aboutScreen: undefined;
    appLanguageNavigation: undefined;
    chooseTheme: undefined;
    manageFavourites: undefined;
    mockCityScreen: undefined;
    mockJourneyScreen: undefined;
    paymentManagement: undefined;
    nearbyBusTracking: undefined;
    businessProfileScreen: { isBusinessProfileVerified: boolean | undefined };
    myProfile: { refetchProfile: boolean | false; showPopup: boolean | undefined; bookingId: BookingId | null };
    updateMyProfile: { bookingId: BookingId | null };
    myRidesNavigator: NavigatorScreenParams<MyRidesParamList>;
    helpAndSupportNavigator: NavigatorScreenParams<HelpAndSupportParamList> | undefined;
    referralNavigator: NavigatorScreenParams<ReferralParamList> | undefined;
    safetyScreen: { safetyStageId: SafetyStageId | undefined } | undefined;
};

export type SingleModeBookingParamList = {
    singleModeSearch: {
        bookingType: TransportationTypes;
        sourceStop: (transportStation & { distance: number }) | undefined;
        fallbackView: boolean | undefined;
        otp: string | undefined;
    };
    singleModeTicketBooking: SingleModeTicketBookingRouteProps;
    metroSubwayBooking: MetroSubwayBookingRouteProps;
    busRouteDetails: {
        route: string;
        vehicleType: TransportationTypes;
    };
    journeyDetails: JourneyDetailsProps;
};

type ExtendedBookingParamList = {
    preBookRideSummary: undefined;
    scheduleRideSummary: { bookingId: string; fareBreakups: estimateFares[] | undefined };
    rentalsScreen: undefined;
};

export type MyRidesParamList = {
    myRidesScreen: {
        isHelpAndSupportScreen: boolean | undefined;
        issueCategory: issueCategoryRes | undefined;
    };
    myRideDetails: RideDetailCardProps;
    invoiceScreen: BookingDetailCardProps | undefined;
};

export type HelpAndSupportParamList = {
    helpAndSupportScreen: undefined;
    kaptureWebViewScreen: {
        url: string | null | undefined;
        goBack: (() => void) | undefined;
        ticketId: string | undefined;
    };
    activeTicketsScreen: { activeTickets: IssueScreenProps[] | undefined };
    recentChatsScreen: { closedTicketIds: IssueScreenProps[] | undefined };
    recentChatDetailScreen: { rideId: string | undefined; ticketId: string | undefined };
    metroIssueFaqScreen: { SelectedOption: string };
    businessIssueFaqScreen: { SelectedOption: string };
    reportIssueChatScreen: {
        category: { issueCategoryId: string; label: string; category: string } | undefined;
        rideId: string | undefined;
        issueReportId: string | undefined;
        ticketId: string | undefined;
        driverNumber: string | undefined;
    };
};

export type ReferralParamList = {
    referralScreen: undefined;
    referralPayment: { fromReviewFeedback: boolean | undefined };
    referralFaq: undefined;
    referralEarningsScreen: undefined;
};
