import { Theme, language, City, appName, EventData, HourlyRentalsData, IntercityData, strings } from 'config-types';
import { shortLanguage } from 'config-types/dist/domain/factors/language';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import { ActionIdentifier, ActionPayloadMap } from '@/typescript/homeActions/types';
import { EventName } from '@/typescript/utils/logger';
import { fareDetail } from '@/typescript/utils/fareEntityHelper';
import { PaymentSources } from '@/typescript/state/client/user';

export type DeepStrictPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepStrictPartial<T[K]> : T[K];
};

export type OnlyKeys<T, K extends keyof T> = K;

export type AppConfigCityType = DeepStrictPartial<AppConfigType>;

export type AppConfigSystemType = DeepStrictPartial<Record<City, AppConfigCityType>> & { default: AppConfigCityType };

export type TrackingMode = 'Normal' | 'Moderate' | 'Extreme';

export type HomescreenModules =
    | 'NAMMA_SERVICES'
    | 'BANNERS'
    | 'HOURLY_RENTALS'
    | 'INTERCITY_RECOMMENDATIONS'
    | 'NEARBY_EVENTS'
    | 'EXPLORE';

export type ServiceTag =
    | 'INTERCITY'
    | 'INSTANT'
    | 'RENTAL'
    | 'BUS'
    | 'BUS_OTP'
    | 'INTERCITY_BUS'
    | 'AMBULANCE_SERVICE'
    | 'TICKETING'
    | 'HYBRID_TICKETING'
    | 'BOATING'
    | 'SCHEDULE'
    | 'BIKE_TAXI'
    | 'METRO'
    | 'DELIVERY'
    | 'METRO_V2'
    | 'SUBWAY'
    | 'BUS_V2'
    | 'NONE'
    | 'NAMMATRANSIT'
    | 'DURGA_PUJO'
    | 'BUS_HYBRID';

export type CityConfigKeys =
    | 'tracking_mode'
    | 'system_configs'
    | 'allowed_languages'
    | 'carousel_banner_config'
    | 'enabled_services'
    | 'explore_section'
    | 'support_number'
    | 'enabled_services_v2'
    | 'clarity_config'
    | 'hourly_rental'
    | 'intercity_recommendations'
    | 'nearby_events'
    | 'new_feature_flags'
    | 'oy_boating_placeId'
    | 'homescreen_modules'
    | 'rotating_text'
    | 'boosted_rotating_text'
    | 'use_slider_or_pill'
    | 'customer_cancellation_banner_threshold'
    | 'cancellation_banner_texts'
    | 'pledge_config'
    | 'filter_autocomplete'
    | 'referral_payout_config_v2'
    | 'tab_screens_config'
    | 'enabled_services_v3'
    | 'city_lottie_config'
    | 'movie_promotional_config'
    | 'city_base_ad_image'
    | 'skip_and_start_journey'
    | 'personal_mail_services_names';

export type TrackingModeConfigKeys = 'feature_flags';

export type AppNameConfigKeys = 'contact_support' | 'app_based_onboarding';

export type ConfigKeyByContext = {
    city: CityConfigKeys;
    theme: Theme;
    tracking_mode: TrackingModeConfigKeys;
    app: AppNameConfigKeys;
};

export enum DynamicCancellationTranslationKey {
    DRIVER_DEMANDED_EXTRA = 'DRIVER_DEMANDED_EXTRA',
    DRIVER_DENIED_DUTY = 'DRIVER_DENIED_DUTY',
}
export interface SubscriptionConfig {
    max_dues_limit: number;
    low_dues_warning_limit: number;
    high_dues_warning_limit: number;
}

export type ToolCenterFlags = {
    googleNavigation: boolean;
    walkDirection: boolean;
    shareToFriends: boolean;
    safetyTools: boolean;
};

export type FeatureFlags = {
    rideToolCenter: {
        duringPickup: ToolCenterFlags;
        duringRide: ToolCenterFlags;
    };
    rideStartContactTrustedContacts: boolean;
    editDestination: boolean;
    postRideStartFragment: boolean;
    endRideShowFareSplit: boolean;
    favouriteDriver: boolean;
    showDriverDetailsInFeedback: boolean;
    showNeedHelpInFeedback: boolean;
    showACRidePopup: boolean;
    showDriverProfile: boolean;
    myRidesDetails: {
        showHelpAndSupport: boolean;
        showRideDetails: boolean;
        showEstimate: boolean;
    };
    feedbackPills: {
        driverRelated: boolean;
        safetyRelated: boolean;
        fareRelated: boolean;
    };
    onRideBottomSheet: {
        viewMapButton: boolean;
        hamburgerMenu: boolean;
    };
};

type OnClickAction<a extends string, T = undefined> = {
    actionName: a;
    actionData: T | undefined;
};

/**
 * App actions that use the centralized action system
 * Uses the full payload from ActionPayloadMap for type safety
 * All properties are optional to avoid requiring undefined values
 */
type HomeAction<T extends ActionIdentifier> = {
    actionName: T;
} & Partial<ActionPayloadMap[T]>;

/**
 * Type-safe action config that ensures actionData matches the actionName
 * This uses a mapped type to create a union of all possible action configs
 *
 * The way this works:
 * 1. For each action K in ActionIdentifier
 * 2. Create an object with actionName: K and actionData from that action's payload
 * 3. The [ActionIdentifier] at the end creates a union of all these objects
 *
 * This ensures TypeScript knows that if actionName is 'navigateToScreen',
 * then actionData must be NavigationConfig | undefined
 */
export type ActionConfig = {
    [K in ActionIdentifier]: {
        actionName: K;
    } & (ActionPayloadMap[K] extends { actionData: infer D } ? { actionData: D } : { actionData: undefined });
}[ActionIdentifier];

export type DestinationPayload = {
    lat: number;
    lon: number;
    name: string;
    address: string | undefined;
};

export type ModalConfig = {
    title: string;
    buttonText: string;
    modalRef: React.RefObject<BottomSheetModal | null>;
    onButtonPress: () => void;
    imageUrl: string | undefined;
    videoUrl: string | undefined;
};

// Remote config friendly representation of actions that may be sent from the server
// Use this for validating remote JSON; client will map it to a function at runtime.
export type RemoteOnButtonPress = { type: 'openUrl'; url: string };

export type AnnaModalPayload = {
    title: string | undefined;
    buttonText: string | undefined;
    modalRef: string | React.RefObject<BottomSheetModal | null>;
    onButtonPress: (() => void) | RemoteOnButtonPress | string | undefined;
    imageUrl: string | undefined;
    videoUrl: string | undefined;
};

export type CarouselOnClickActions = //OLD - for backward compatibility with past code with NO navigateToScreen action.

        | OnClickAction<'openModal', ModalConfig>
        | OnClickAction<'openAnnaModal', AnnaModalPayload>
        | HomeAction<Exclude<ActionIdentifier, 'navigateToScreen'>>;

export type CarouselOnClickActionsV2 =
    | OnClickAction<'openModal', ModalConfig>
    | OnClickAction<'openAnnaModal', AnnaModalPayload>
    // All Home actions, along with new navigateToScreen action, Don't use/accept 'navigateTo' action in onClickV2 again like in onClick.
    | HomeAction<Exclude<ActionIdentifier, 'navigateTo'>>
    | OnClickAction<'navigateToHybridFlow', string>;

export type VideoBottomSheetActions = HomeAction<ActionIdentifier>;

export type CarouselItems = {
    imageUrl: string;
    onClick: CarouselOnClickActions | undefined;
    onClickV2: CarouselOnClickActionsV2 | undefined;
};

export type CarouselBannerConfig = {
    carouselItems: CarouselItems[];
    maxHeight: number;
};

export type ShowScreenConfig = {
    showScreens: boolean;
};

export type SystemConfigs = {
    loggerConfig: {
        chunkSize: number;
        timeGranularityInMilliSec: number;
        chunksLimit: number;
        flushToDiskAfter: number;
        prodLogSeverityLevel: string;
        logFilePrefix: string;
        loggerStateKey: string;
    };
};

export type DynamicAssets = {
    startTypingIlus: string;
    locationNotFound: string;
};

export type LanguageObj = {
    name: language;
    translatedName: string;
};

export type LogProcessorConfig = {
    // Maximum size of a single log file in bytes
    maxFileSize: number;
    // Maximum total size of all logs in bytes
    maxTotalSize: number;
    // Directory where logs are stored
    logDirectory: string;
    // API endpoint for log uploads
    apiEndpoint: string;
    // How often to upload logs in milliseconds
    uploadInterval: number;
    // Static string for log suffix
    logSuffix: string;
    // Maximum logs to store in memory before writing to disk
    maxMemoryLogs: number;
    // Maximum number of retry attempts for failed uploads
    maxRetryAttempts: number;
    // Log level for filtering logs
    level: string;
    // Whether to use gzip compression for logs
    useGzip: boolean | undefined;
    // Whether the log processor is enabled
    enabled: boolean;
};

export type FamousDestProps = {
    name: string;
    subTitle: string | undefined;
    description: string;
    category: string;
    imageUrl: string;
    lat: number | undefined;
    lon: number | undefined;
    dynamic_action: {
        tag: string | undefined;
        contents: {
            url: string;
        };
    };
    address: string | undefined;
};

export type SupportNumberObj = {
    enableSafetyCall: boolean;
    safetyNumber: string;
    supportNumber: string;
};

export type enabledServicesV2 = {
    serviceTag: ServiceTag;
    allowGrow: boolean;
};

export type PopupFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'always' | 'disabled';

export type MediaConfig = {
    type: 'video' | 'image' | 'lottie';
    url: string; // Video URL or Image URL or Lottie JSON URL
    fallbackImageUrl: string | undefined; // For video fallback
    // Video-specific options (ignored for images)
    autoPlay: boolean | undefined;
    shouldLoop: boolean | undefined;
    muted: boolean | undefined;
    videoPlayerConfig:
        | {
              enableNetworkOptimizations: boolean | undefined;
              bufferingDelay: number | undefined;
              networkOptimizationConfig:
                  | {
                        minBufferMs: number | undefined;
                        maxBufferMs: number | undefined;
                        bufferForPlaybackMs: number | undefined;
                        bufferForPlaybackAfterRebufferMs: number | undefined;
                    }
                  | undefined;
          }
        | undefined;
    lottieConfig:
        | {
              loop: boolean;
              autoPlay: boolean;
          }
        | undefined;
};

export type VideoBottomSheetConfig = {
    id: string;
    enabled: boolean;
    showOnLaunch: boolean;
    frequency: PopupFrequency;
    showDelayMs: number | undefined; // Delay in ms before showing popup on launch
    media: MediaConfig; // Supports both video and image
    title: string | undefined; // Optional title
    buttonText: string | undefined; // Optional button text
    resizeMode: ('cover' | 'contain' | 'stretch') | undefined;
    icons:
        | {
              // Optional icons section
              leftIcon:
                  | {
                        component: string | undefined;
                        backgroundColor: string;
                        iconColor: string;
                    }
                  | undefined;
              rightIcon:
                  | {
                        component: string | undefined;
                        backgroundColor: string;
                        iconColor: string;
                    }
                  | undefined;
              showPlusSign: boolean | undefined;
          }
        | undefined;
    onButtonPress: VideoBottomSheetActions | undefined; // Actions supported in video bottom sheet
};

export type BoatingPlace = {
    boatingPlaceId: string | null;
};

export type CustomerCancellationConfig = {
    enableCancellationCharges: boolean;
    cancellationStaggerPct: number;
    noChargeImgA: string;
    noChargeImgB: string;
    img_a: string;
    img_auto: string;
    img_cab: string;
    img_bike: string;
};

export type newFeatureFlags = {
    version: string;
    enableLocationUnserviceable: boolean;
    toggleQRtoOtpFlow: boolean;
    preSelectedSmartTip: boolean;
    enableGreeting: boolean;
    slowNetworkToastThreshHold: number;
    appUpdateMethod: 'force_update' | 'ignore_update' | 'flexible_update';
    estimatesTipEnabled: boolean;
    lookingForRidesTipEnabled: boolean;
    pickupThresholdForReallocation: number;
    shouldShowDefaultTips: boolean;
    feedbackPendingExpiryTimeInMs: number;
    editTipOrVehicleButtonDisableThreshold: number;
    boostedSearchModalOpenTime: number;
    enableTrueCaller: boolean;
    enablePetRide: boolean;
    showInsurancePolicy: boolean;
    enableWhatsappOTPLogin: boolean;
    enableDriverFavourite: boolean;
    enableMultimodal: boolean;
    enableHyperUPI: boolean;
    customerCancellationConfig: CustomerCancellationConfig;
    enableSourceStopsSlicing: boolean;
    transitOptions: {
        showMoreRoutes: boolean;
        showPublicTransitPreferences: boolean;
    };
    showPublicTransportAboveEstimates: boolean;
    showSeparateNammaTransit: boolean;
    estimateCardsPositionConfig: {
        nammaTransitPosition: number;
        bookAnyPosition: number;
        ambulanceServicePosition: number;
    };
    multimodalTicketConfig: {
        dynamicRefresh: boolean;
        refreshTime: number;
    };
    showBetaTag: boolean;
    enableAddStop: boolean;
    enablePickupInstructions: boolean;
    enablePickupInstructionsNewPill: boolean;
    pickupInstructionsMaxEditCount: number;
    enableKaptureHelpSupport: boolean;
    pickupInstructionsCharLimit: number;
    audioRecordingTimeLimit: number;
    toleranceForGroupingTimeSegments: number;
    bufferMinutesForCurrentSegment: number;
    showNammaTransitOnTop: boolean;
    appLaunchPopupConfig: VideoBottomSheetConfig; // For app launch popup
    nammaTransitServicePopupConfig: VideoBottomSheetConfig; // For Namma Transit service button
    multimodalTrackWithoutBooking: boolean;
    enableUserRateCard: boolean;
    skipUpdateProfileOnboarding: boolean;
    identifyBusPollingTime: number;
    attractionTicketingNotes: string[];
    singleModeBusSearchBarAnimationDuration: number;
    passEnabled: boolean;
    autoActivatePass: boolean;
    enableCancellationCharges: boolean;
    showTrainDetailInMyRides: boolean;
    showOfferTextForBookBtn: boolean;
    enableDriverPickupETA: boolean;
    maxDriverPickupETA: number;
    defaultPassStartDate: 'today' | '15_day' | 'default';
    showNearbyBusInOtpFlow: boolean;
    enableFindAnotherDriver: boolean;
    skipFirstLegSingleMode: boolean;
    farAwayDistanceThresholdKm: number;
};

export type cancellationThreshold = {
    showBanner: boolean;
    percentage: number;
};

export type cancellationBannerTexts = {
    title: Record<shortLanguage, string>;
    description: Record<shortLanguage, string>;
};

export type NearbyDriversConfig = {
    autoCategorySplitPercent: number;
    closeRangeDriversPercent: number;
    vehicleLimit: number;
    refreshInterval: number;
    radius: number;
    enabled: boolean;
    androidEnabled: boolean;
};

export type BannerCityRuleType = { type: 'include'; cities: City[] } | { type: 'exclude'; cities: City[] };

export type CancellationReasonConfig = {
    code: string;
    icon: string;
    translationKey: DynamicCancellationTranslationKey;
    visibility: BannerCityRuleType;
};

export type DynamicCancellationReasonsConfig = {
    reasons: CancellationReasonConfig[];
};

export type BannerPopupsConfig = {
    acPreferenceBannerConfig: BannerCityRuleType;
    tollIncludedBannerConfig: BannerCityRuleType;
    tollNotIncludedBannerConfig: BannerCityRuleType;
    nonAcBannerConfig: BannerCityRuleType;
    sorryActionBannerConfig: BannerCityRuleType;
    thankyouRideBannerConfig: BannerCityRuleType;
    tollAndParkingBannerConfig: BannerCityRuleType;
    parkingBannerConfig: BannerCityRuleType;
    driverDemandExtraBannerConfig: BannerCityRuleType;
    vehicleCleanlinessBannerConfig: BannerCityRuleType;
    bannerTicketCreationConfig: Record<string, BannerCityRuleType>;
};

export type rotatingTexts = {
    duration: number;
    texts: Record<shortLanguage, string>;
    zoomLevel: number;
};

export type useSliderOrPill = {
    sliderOnEstimates: boolean;
    sliderOnSearch: boolean;
};

export type pledgeConfig = {
    showPledge: boolean;
    pledgeText: Record<shortLanguage, string>;
};

export type ReferralPayoutConfigV2 = {
    enable: boolean;
    youGet: number;
    theyGet: number;
    coverImage: string;
    modalImage: string;
    termsLink: string;
};

export type DriverRatingRule = {
    rating: number;
    minRideCount: number;
};

export type DriverHighlightConfig = {
    enabled: boolean;
    ratingRules: DriverRatingRule[];
    lowCancellationRate: {
        maxRate: number;
        minRideCount: number;
    };
    nearbyThresholdMeters: number;
    experiencedDriverThreshold: number;
};

export type TabScreensConfig = {
    tabs: string[];
};

export type enabledMainCategory = 'PUBLIC' | 'PRIVATE';

export type ServiceTagConfig = {
    type: 'text' | 'lottie' | 'image';
    // For text type only
    text: string | undefined;
    bgColor: string | undefined;
    textColor: string | undefined;
    // For lottie/image type only
    url: string | undefined;
};

export type enabledServicesV3Conf = {
    serviceTag: ServiceTag;
    allowGrow: boolean;
    category: enabledMainCategory;
    serviceImageUrl: string | undefined;
    tag: ServiceTagConfig | undefined;
    onClick: ActionConfig | undefined;
};

export type enabledServicesV3 = {
    services: enabledServicesV3Conf[];
    mainServiceTag: ServiceTag;
};

export type LottieConfig = {
    lottieUrl: string;
    androidBottomOffset: number;
    iosBottomOffset: number;
    customWidth: number | undefined; // Custom width in pixels
    customHeight: number | undefined; // Custom height in pixels
    zoomPercent: number | undefined; // Percentage (e.g., 100 = 100%, 50 = 50%)
};

export type LottieConfigs = {
    homeScreenLottieUrl: LottieConfig;
};
export type kaptureUrlType = {
    appRelated: {
        url: string;
    };
    rideRelated: {
        url: string;
    };
};
export type kaptureConfig = {
    kaptureUrl: {
        onClick: {
            actionName: string;
            actionData: kaptureUrlType;
        };
    };
};

export type AppBasedOnboarding = 'NAMMA_TRANSIT' | 'MULTIMODAL' | 'NO_MULTIMODAL';

export type BusinessProfileConfig = {
    pollingTime: number;
    maxPollTimeout: number;
    showNewTag: boolean;
    enableBusinessProfile: boolean;
    businessEstimatedOrder: ServiceTierType_serviceTierType[];
};

export type PersonalMailServicesNames = string[];

export type CityBaseAdImageConfig = {
    enabled: boolean;
    images: {
        rideConfirmed: string; // Image for ride confirmed screen
        reviewFeedback: string; // Image for review and feedback screens
    };
    redirectUrl: string | undefined;
};
export type MoviePromotionalConfig = {
    images: {
        detailBanner: string;
        redeemBanner: string;
        promotionBanner: string;
    };
    enabled: boolean;
    detailBannerUrl: string;
    getAppUrl: string;
};
export type skipAndStartJourneyConfig = {
    text: {
        text: string;
        iconUrl: string;
    }[];
    illustration_url: string;
    information_button_url: string;
};

export type profileTabOption =
    | 'favourites'
    | 'transitPreference'
    | 'businessProfile'
    | 'paymentManagement'
    | 'share'
    | 'myRides'
    | 'helpAndSupport'
    | 'safety'
    | 'referAndInvite'
    | 'about'
    | 'language'
    | 'logout';

export type helpAndSupportTopic =
    | 'appRelated'
    | 'rideRelated'
    | 'metroRelated'
    | 'businessProfileRelated'
    | 'aboutApp'
    | 'appRegistration'
    | 'appFeature'
    | 'ticketBooking'
    | 'busPass'
    | 'journeyRelated'
    | 'paymentRelated'
    | 'qrCodeValidation'
    | 'security'
    | 'deleteAccount';

type merchantAndClientConfigs = {
    sdkMid: string;
    mobilityMid: string;
    clientId: string;
};

type ticketText = {
    headerTitle: string;
    regionalTitle: string | undefined;
};

type ConstantConfig = {
    termsAndConditionLink: string;
    privacyPolicyLink: string;
    refundPolicyLink: string | undefined;
    openDataDashboardLink: string | undefined;
    websiteLink: string;
    touristBusPdfLink: string | undefined;
};

type MerchantDataConfig = {
    merchantAndClientConfig: merchantAndClientConfigs;
    firstRideCompletedEvents: {
        firstRideComplete: [EventName, EventName, EventName];
        firstCabRideComplete: EventName | undefined;
        firstAutoRideComplete: EventName | undefined;
        firstBikeRideComplete: EventName | undefined;
    };
    paymentSource: PaymentSources;
    paymentGatewayReferenceId: string;
    initialCoordinate: {
        latitude: number;
        longitude: number;
    };
};

type TextConfig = {
    appReadableName: string;
    appId: string;
    publicTransitText: string;
    currencySymbol: string;
    rideOtpText: string;
    callPoliceText: string;
};

type LanguageTextConfig = {
    changeToModeText: OnlyKeys<strings, 'SwitchtoAutoOrCab' | 'ChangeMode'>;
};

type FlowConfig = {
    multimodalTrackWithoutBooking: boolean;
    enableMapSnapshot: boolean;
    busTicketActivationFlow: boolean;
    enableLiveTracking: boolean;
    showFirstNearestStopInServiceTab: boolean;
    enableTicketActivationFlowPartially: boolean;
    shareReferralLink: boolean;
    ticketCancelFlowConfig: {
        metroCancelEnable: boolean;
        busCancelEnable: boolean;
        subwayCancelEnable: boolean;
    };
    showAutoTripStartedLottie: boolean;
    skipProfileOnboarding: boolean;
    metroBookingEnable: boolean;
    enableFemaleRotatingText: boolean;
    businessProfileConfig: BusinessProfileConfig;
    nearByBusConfig: {
        showNearbyBus: boolean;
        maxNearbyBuses: number;
        nearbyBusPollingInterval: number;
        nearbyBusCircleRadius: number;
    };
    enable_ride_hailing: boolean;
};

type UIConfig = {
    thankYouMsgRideEnd: boolean;
    enableLegacyIntercityCheck: boolean;
    showOtpBusButton: boolean;
    showNamasteCallout: boolean;
    showMapFallback: boolean;
    homeScreenSnapPoints: string[];
    homeScreenMapPaddingBottom: number;
    passTabEnabled: boolean;
    extraFareDetail: fareDetail[];
    includeAutoFareInTransitFare: boolean;
    showTicketLabelInTransitInfoCard: boolean;
    hideAddressShimmer: boolean;
    hideMaskedAnimatingIcon: boolean;
    hideVehicleNextArrivalAndValidityDetails: boolean;
    hideNextAvailableBusesInfo: boolean;
    hideRepeatBookings: boolean;
    showOtpCardAndSaintImage: boolean;
    otpKeypadCharacters: string;
    shareRideCardConfig: {
        shareRideGoldIconUri: string;
        shareLinks: {
            android: string;
            ios: string;
        };
    };
    useNameOnlyOnboarding: boolean;
    busOtpTicketModalType: string;
    showSafetyBannerOnCarousel: boolean;
    hideNoTicketRequiredForChildrenBelow5Text: boolean;
    showDistanceFromCurrentLocationInSearchResults: boolean;
    slowInternetConfig: {
        slowNetworkToastThreshHold: number;
        showSlowInternetSnackbar: boolean;
    };
    currentLocationMarkerColor: string;
    rateCardConfig: {
        rateCardTitle: 'normal' | 'inclusion';
        rateCardVisibleKeys: string[];
    };
};

type AssetConfig = {
    maskedIconUri: string;
    screenShotGuardImageUri: string | undefined;
    fallbackQrImageUri: string | undefined;
    appLogoUri: string;
    driverDefaultProfileUri: string;
    rentalPolicyImageUri: string;
    callPoliceLogoUri: string | undefined;
    journeyStartTicketImageUri: string;
    fallbackJourneyImageUri: string;
    activatedTicketLayoutLogo: string | undefined;
    redBusBannerUri: string;
    appLogoB64: string;
};

type ScreenConfig = {
    gettingStartedCarouselScreenConfig: {
        gettingStartedCarousalConfig: {
            image: { uri: string };
            title: string;
            description: string;
        }[];
        showCenteredGetStartedButton: boolean;
    };
    eventScreenConfig: {
        showAllTicketButton: boolean;
        transparentBgLogo: string;
    };
    ticketScreenConfig: {
        busTicketText: ticketText;
        metroTicketText: ticketText;
        subwayTicketText: ticketText;
        comboTicket: ticketText;
        footerRegionalText: string | undefined;
        busQrPosition: 'top' | 'bottom';
        showTicketHeader: boolean;
    };
    reviewAndFeedbackScreenConfig: {
        showRideEndThankYouScreen: boolean;
        feedbackScreenType: 'share-type' | 'default';
        rideCompleteBgUri: string;
        showLogoAtThankYouScreen: boolean;
    };
    singleModeSearchScreenConfig: {
        showEditPencil: boolean;
        showInputGroupDirection: boolean;
    };
    profileTab: {
        primaryOptions: profileTabOption[];
        secondaryOptions: profileTabOption[];
        tertiaryOptions: profileTabOption[];
        languageIconType: language;
    };
    helpAndSupport: {
        MTCSupportNumber: string;
        helpAndSupportTopicList: helpAndSupportTopic[];
    };
};

export type AppConfigType = {
    appType: 'ride-hailing' | 'multimodal';
    constants: ConstantConfig;
    merchantData: MerchantDataConfig;
    textConfig: TextConfig;
    languageTextConfig: LanguageTextConfig;
    flowConfig: FlowConfig;
    uiConfig: UIConfig;
    assets: AssetConfig;
    screenConfig: ScreenConfig;
};

export interface Configs {
    tracking_mode: Record<City, TrackingMode>;
    feature_flags: Record<TrackingMode, FeatureFlags>;
    carousel_banner_config: Record<City, CarouselBannerConfig>;
    system_configs: Record<City, SystemConfigs>;
    enabled_services: Record<City, string[]>;
    allowed_languages: Record<City, LanguageObj[]>;
    explore_section: Record<City, FamousDestProps[]>;
    support_number: Record<City, SupportNumberObj>;
    enabled_services_v2: Record<City, enabledServicesV2[]>;
    new_feature_flags: Record<City, newFeatureFlags>;
    oy_boating_placeId: Record<City, BoatingPlace>;
    customer_cancellation_banner_threshold: Record<City, cancellationThreshold>;
    cancellation_banner_texts: Record<City, cancellationBannerTexts>;
    clarity_config: Record<City, boolean>;
    contact_support: Record<appName, boolean>;
    hourly_rental: Record<City, HourlyRentalsData[]>;
    intercity_recommendations: Record<City, IntercityData[]>;
    nearby_events: Record<City, EventData>;
    nearby_drivers: NearbyDriversConfig;
    homescreen_modules: Record<City, HomescreenModules[]>;
    rotating_text: Record<City, rotatingTexts[]>;
    boosted_rotating_text: Record<City, rotatingTexts[]>;
    use_slider_or_pill: Record<City, useSliderOrPill>;
    pledge_config: Record<City, pledgeConfig>;
    banner_popups_config: BannerPopupsConfig;
    filter_autocomplete: Record<City, boolean>;
    referral_payout_config_v2: Record<City, ReferralPayoutConfigV2>;
    driver_highlight_config: Record<City, DriverHighlightConfig>;
    dynamic_cancellation_reasons: DynamicCancellationReasonsConfig;
    tab_screens_config: Record<City, TabScreensConfig>;
    enabled_services_v3: Record<City, enabledServicesV3>;
    city_lottie_config: Record<City, LottieConfigs>;
    kapture_config: Record<City, kaptureConfig>;
    skip_and_start_journey: Record<City, skipAndStartJourneyConfig>;
    app_based_onboarding: Record<appName, AppBasedOnboarding>;
    personal_mail_services_names: Record<City, string[]>;
    movie_promotional_config: Record<City, MoviePromotionalConfig>;
    city_base_ad_image: Record<City, CityBaseAdImageConfig>;
    app_system_config: Record<appName, AppConfigSystemType>;
}
