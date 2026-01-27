import {
    Record,
    String,
    Boolean,
    Number,
    Array as RtArray,
    Static,
    Union,
    Literal,
    Dictionary,
    Optional,
    Runtype,
} from 'runtypes';

function StrictPartialRecord(schema: { [key: string]: Runtype }) {
    //eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    const optionalSchema: any = {};
    const keys = Object.keys(schema);

    for (const key of keys) {
        const field = schema[key];

        // Detect record by presence of `fields`
        if (field) {
            const reflect = field.reflect;
            const isRecord =
                reflect &&
                typeof reflect === 'object' &&
                'fields' in reflect &&
                reflect.fields &&
                typeof reflect.fields === 'object';
            // eslint-disable-next-line functional/immutable-data
            optionalSchema[key] = isRecord ? Optional(StrictPartialRecord(reflect.fields)) : Optional(field);
        }
    }

    return Record(optionalSchema).withConstraint(obj => {
        const unknownKeys = Object.keys(obj).filter(k => !keys.includes(k));
        if (unknownKeys.length > 0) {
            return `Unknown keys: ${unknownKeys.join(', ')}`;
        }
        return true;
    });
}

const City = String;
const AppName = String;

const TrackingMode = Union(Literal('Normal'), Literal('Moderate'), Literal('Extreme'));

const ToolCenterFlags = Record({
    googleNavigation: Boolean,
    walkDirection: Boolean,
    shareToFriends: Boolean,
    safetyTools: Boolean,
});

const FeatureFlags = Record({
    rideToolCenter: Record({
        duringPickup: ToolCenterFlags,
        duringRide: ToolCenterFlags,
    }),
    rideStartContactTrustedContacts: Boolean,
    editDestination: Boolean,
    postRideStartFragment: Boolean,
    endRideShowFareSplit: Boolean,
    favouriteDriver: Boolean,
    showDriverDetailsInFeedback: Boolean,
    showNeedHelpInFeedback: Boolean,
    showACRidePopup: Boolean,
    showDriverProfile: Boolean,
    myRidesDetails: Optional(
        Record({
            showHelpAndSupport: Boolean,
            showRideDetails: Boolean,
            showEstimate: Boolean,
        }),
    ),
    feedbackPills: Record({
        driverRelated: Boolean,
        safetyRelated: Boolean,
        fareRelated: Boolean,
    }),
});

const DestinationPayload = Record({
    lat: Number,
    lon: Number,
    name: String,
    address: Optional(String),
});

const CarouselOnClickActions = Union(
    Record({ actionName: Literal('shareApp') }),
    Record({ actionName: Literal('openLink'), actionData: String }),
    Record({ actionName: Literal('navigateTo'), actionData: String }),
    Record({ actionName: Literal('navigateToStage'), actionData: String }),
    Record({ actionName: Literal('destination'), actionData: DestinationPayload }),
    Record({ actionName: Literal('redbus'), actionData: String }),
);

const CarouselOnClickActionsV2 = Union(
    Record({ actionName: Literal('shareApp') }),
    Record({ actionName: Literal('openLink'), actionData: String }),
    Record({ actionName: Literal('navigateToScreen'), actionData: Dictionary(String) }),
    Record({ actionName: Literal('navigateToStage'), actionData: String }),
    Record({ actionName: Literal('destination'), actionData: DestinationPayload }),
    Record({ actionName: Literal('redbus'), actionData: String }),
);

const CarouselItems = Record({
    imageUrl: String,
    onClick: Optional(CarouselOnClickActions),
    onClickV2: Optional(CarouselOnClickActionsV2),
});

const CarouselBannerConfig = Record({
    carouselItems: RtArray(CarouselItems),
    maxHeight: Number,
});

const SystemConfigs = Record({
    loggerConfig: Record({
        chunkSize: Number,
        timeGranularityInMilliSec: Number,
        chunksLimit: Number,
        flushToDiskAfter: Number,
        prodLogSeverityLevel: String,
        logFilePrefix: String,
        loggerStateKey: String,
    }),
});

const DynamicAssets = Record({
    startTypingIlus: String,
    locationNotFound: String,
});

const LanguageObj = Record({
    name: String,
    translatedName: String,
});

const FamousDestProps = Record({
    name: String,
    subTitle: Optional(String),
    description: String,
    category: String,
    imageUrl: String,
    lat: Optional(Number),
    lon: Optional(Number),
    dynamic_action: Optional(
        Record({
            tag: String,
            contents: Record({
                url: String,
            }),
        }),
    ),
    address: Optional(String),
});

const EnabledServicesV2 = Record({
    serviceTag: String,
    allowGrow: Boolean,
});

const ServiceTagConfig = Record({
    type: Union(Literal('text'), Literal('lottie'), Literal('image')), // 'text' | 'lottie' | 'image'
    text: Optional(String),
    bgColor: Optional(String),
    textColor: Optional(String),
    url: Optional(String),
});

const CustomerCancellationConfig = Record({
    enableCancellationCharges: Boolean,
    cancellationStaggerPct: Number,
    noChargeImgA: String,
    noChargeImgB: String,
    img_a: String,
    img_auto: String,
    img_cab: String,
    img_bike: String,
});

const NewFeatureFlags = Record({
    version: String,
    enableLocationUnserviceable: Boolean,
    toggleQRtoOtpFlow: Boolean,
    preSelectedSmartTip: Boolean,
    enableGreeting: Boolean,
    slowNetworkToastThreshHold: Number,
    pickupThresholdForReallocation: Number,
    feedbackPendingExpiryTimeInMs: Number,
    editTipOrVehicleButtonDisableThreshold: Number,
    boostedSearchModalOpenTime: Number,
    enableAddStop: Boolean,
    enablePetRide: Boolean,
    enableDriverFavourite: Boolean,
    enableMultimodal: Boolean,
    enableHyperUPI: Boolean,
    customerCancellationConfig: CustomerCancellationConfig,
    enableSourceStopsSlicing: Boolean,
    estimateCardsPositionConfig: Record({
        nammaTransitPosition: Number,
        bookAnyPosition: Number,
        ambulanceServicePosition: Number,
    }),
    showBetaTag: Boolean,
    enablePickupInstructions: Boolean,
    enablePickupInstructionsNewPill: Boolean,
    pickupInstructionsMaxEditCount: Number,
    pickupInstructionsCharLimit: Number,
    audioRecordingTimeLimit: Number,
    appUpdateMethod: Union(Literal('force_update'), Literal('ignore_update'), Literal('flexible_update')),
    estimatesTipEnabled: Boolean,
    lookingForRidesTipEnabled: Boolean,
    shouldShowDefaultTips: Boolean,
    enableTrueCaller: Boolean,
    enableWhatsappOTPLogin: Boolean,
    transitOptions: Record({
        showMoreRoutes: Boolean,
        showPublicTransitPreferences: Boolean,
    }),
    showPublicTransportAboveEstimates: Boolean,
    showSeparateNammaTransit: Boolean,
    multimodalTicketConfig: Record({
        dynamicRefresh: Boolean,
        refreshTime: Number,
    }),
    toleranceForGroupingTimeSegments: Number,
    bufferMinutesForCurrentSegment: Number,
    showNammaTransitOnTop: Boolean,
    identifyBusPollingTime: Number,
    singleModeBusSearchBarAnimationDuration: Number,
    passEnabled: Boolean,
    autoActivatePass: Boolean,
    enableCancellationCharges: Boolean,
    showTrainDetailInMyRides: Boolean,
    enableDriverPickupETA: Boolean,
    maxDriverPickupETA: Number,
    busPassDefaultActiveTabToday: Record({
        enable: Boolean,
        busPassDefaultActiveTabToday: Boolean,
    }),
    showNearbyBusInOtpFlow: Boolean,
    enableFindAnotherDriver: Boolean,
});

const Theme = String;

const SupportNumberObj = Record({
    enableSafetyCall: Boolean,
    safetyNumber: String,
    supportNumber: String,
});

const HourlyRentalsData = {
    title: String,
    image: String,
    description: String,
    duration: Number,
    fare: Number,
};

const MiniumLocationCell = Record({
    lat: Number,
    lon: Number,
    title: String,
    fullAddress: String,
});

const IntercityRecommendations = Record({
    image: String,
    title: String,
    description: String,
    buttonImage: String,
    rideData: MiniumLocationCell,
    fare: Number,
});

const EventsCell = Record({
    title: String,
    subtitle: String,
    subtitle2: String,
    image: String,
    buttonImage: String,
    buttonTitle: String,
    buttonBg: String,
    buttonTextColor: String,
    rideData: MiniumLocationCell,
});

const NearbyEvents = Record({
    topTitle: String,
    eventsCell: RtArray(EventsCell),
    bottomImageUrl: String,
    topLottieUrl: String,
    backgroundColor: String,
});

const CancellationThreshold = Record({
    showBanner: String,
    percentage: Number,
});

const CancellationBannerTexts = Record({
    title: Record({
        en: String,
        hi: String,
        kn: String,
        ta: String,
        te: String,
        bn: String,
        ml: String,
        od: String,
        nl: String,
        de: String,
        fr: String,
        fi: String,
        sv: String,
        gu: String,
    }),
    description: Record({
        en: String,
        hi: String,
        kn: String,
        ta: String,
        te: String,
        bn: String,
        ml: String,
        od: String,
        nl: String,
        de: String,
        fr: String,
        fi: String,
        sv: String,
        gu: String,
    }),
});

const NearbyDrivers = Record({
    autoCategorySplitPercent: Number,
    closeRangeDriversPercent: Number,
    vehicleLimit: Number,
    refreshInterval: Number,
    radius: Number,
    enabled: Boolean,
    androidEnabled: Boolean,
});

const BannerCityRuleType = Union(
    Record({ type: Literal('include'), cities: RtArray(City) }),
    Record({ type: Literal('exclude'), cities: RtArray(City) }),
);
const DynamicCancellationTranslationKey = Union(Literal('DRIVER_DEMANDED_EXTRA'));

const CancellationReasonConfig = Record({
    code: String,
    icon: String,
    translationKey: DynamicCancellationTranslationKey,
    visibility: BannerCityRuleType,
});

const DynamicCancellationReasonsConfig = Record({
    reasons: RtArray(CancellationReasonConfig),
});

const BannerPopups = Record({
    acPreferenceBannerConfig: BannerCityRuleType,
    tollIncludedBannerConfig: BannerCityRuleType,
    tollNotIncludedBannerConfig: BannerCityRuleType,
    nonAcBannerConfig: BannerCityRuleType,
    sorryActionBannerConfig: BannerCityRuleType,
    thankyouRideBannerConfig: BannerCityRuleType,
    tollAndParkingBannerConfig: BannerCityRuleType,
    parkingBannerConfig: BannerCityRuleType,
    vehicleCleanlinessBannerConfig: BannerCityRuleType,
    driverDemandExtraBannerConfig: BannerCityRuleType,
});

const RotatingTexts = Record({
    duration: Number,
    texts: Record({
        en: String,
        kn: String,
        hi: String,
        ta: String,
        te: String,
        bn: String,
        ml: String,
        od: String,
    }),
    zoomLevel: Number,
});

const useSliderOrPill = Record({
    sliderOnEstimates: Boolean,
    sliderOnSearch: Boolean,
});

const PledgeConfig = Record({
    showPledge: Boolean,
    pledgeText: Record({
        en: String,
        kn: String,
        hi: String,
        ta: String,
        te: String,
        bn: String,
        ml: String,
        od: String,
    }),
});

const ReferralPayoutConfigV2 = Record({
    enable: Boolean,
    youGet: Number,
    theyGet: Number,
    coverImage: String,
    modalImage: String,
    termsLink: String,
});

const DriverRatingRule = Record({
    rating: Number,
    minRideCount: Number,
});

const DriverHighlightConfig = Record({
    enabled: Boolean,
    ratingRules: RtArray(DriverRatingRule),
    lowCancellationRate: Record({
        maxRate: Number,
        minRideCount: Number,
    }),
    nearbyThresholdMeters: Number,
    experiencedDriverThreshold: Number,
});

const TabScreensConfig = Record({
    tabs: RtArray(String),
});

const EnabledServicesV2Conf = Record({
    serviceTag: String,
    allowGrow: Boolean,
    category: String,
    serviceImageUrl: Optional(String),
    tag: Optional(ServiceTagConfig),
    onPressAction: Optional(String),
});

const enabledServicesV3 = Record({
    services: RtArray(EnabledServicesV2Conf),
    mainServiceTag: String,
});

const boatingPlaceConfig = Record({
    boatingPlaceId: String,
});

const LottieConfigs = Record({
    homeScreenLottieUrl: Record({
        lottieUrl: String,
        androidBottomOffset: Number,
        iosBottomOffset: Number,
        customWidth: Optional(Number),
        customHeight: Optional(Number),
        zoomPercent: Optional(Number),
    }),
});

const KaptureConfig = Record({
    kaptureUrl: Record({
        onClick: Record({
            actionName: String,
            actionData: Record({
                appRelated: Record({ url: String }),
                rideRelated: Record({ url: String }),
            }),
        }),
    }),
});

const AppBasedOnboarding = Union(Literal('NAMMA_TRANSIT'), Literal('MULTIMODAL'), Literal('NO_MULTIMODAL'));

const PersonalMailServicesNames = RtArray(String);

const BusinessProfileConfig = Record({
    pollingTime: Number,
    maxPollTimeout: Number,
    showNewTag: Boolean,
    enableBusinessProfile: Boolean,
    businessEstimatedOrder: RtArray(String),
});

const MoviePromotionalConfig = Record({
    images: Record({
        detailBanner: String,
        redeemBanner: String,
        promotionBanner: String,
    }),
    enabled: Boolean,
    detailBannerUrl: String,
    getAppUrl: String,
});

const CityBaseAdImageConfig = Record({
    enabled: Boolean,
    images: Record({
        rideConfirmed: String,
        reviewFeedback: String,
    }),
    redirectUrl: Optional(String),
});

const skipAndStartJourneyConfig = Record({
    text: RtArray(
        Record({
            text: String,
            iconUrl: String,
        }),
    ),
    illustration_url: String,
    information_button_url: String,
});

const ProfileTabOption = RtArray(
    Union(
        Literal('favourites'),
        Literal('transitPreference'),
        Literal('businessProfile'),
        Literal('paymentManagement'),
        Literal('share'),
        Literal('myRides'),
        Literal('helpAndSupport'),
        Literal('safety'),
        Literal('referAndInvite'),
        Literal('about'),
        Literal('language'),
        Literal('logout'),
    ),
);

const LanguageOption = RtArray(
    Union(
        Literal('ENGLISH'),
        Literal('HINDI'),
        Literal('KANNADA'),
        Literal('TAMIL'),
        Literal('MALAYALAM'),
        Literal('BENGALI'),
        Literal('FRENCH'),
        Literal('TELUGU'),
        Literal('ODIA'),
        Literal('DUTCH'),
        Literal('GERMAN'),
        Literal('FINNISH'),
        Literal('SWEDISH'),
        Literal('GUJARATI'),
    ),
);

const HelpAndSupportTopic = RtArray(
    Union(
        Literal('appRelated'),
        Literal('rideRelated'),
        Literal('metroRelated'),
        Literal('businessProfileRelated'),
        Literal('aboutApp'),
        Literal('appRegistration'),
        Literal('appFeature'),
        Literal('ticketBooking'),
        Literal('busPass'),
        Literal('journeyRelated'),
        Literal('paymentRelated'),
        Literal('qrCodeValidation'),
        Literal('security'),
        Literal('deleteAccount'),
    ),
);

const MerchantAndClientConfigs = Record({
    sdkMid: String,
    mobilityMid: String,
    clientId: String,
});

const TicketText = Record({
    headerTitle: String,
    regionalTitle: Optional(String),
});

const FareDetail = Record({
    title: String,
    key: String,
    amountText: String,
    extraDetail: String,
    extraOrder: Optional(Number),
});

const ConstantConfig = StrictPartialRecord({
    termsAndConditionLink: String,
    privacyPolicyLink: String,
    refundPolicyLink: Optional(String),
    openDataDashboardLink: Optional(String),
    websiteLink: String,
});

const MerchantDataConfig = StrictPartialRecord({
    merchantAndClientConfig: MerchantAndClientConfigs,
    firstRideCompletedEvents: StrictPartialRecord({
        firstRideComplete: RtArray(String),
        firstCabRideComplete: Optional(String),
        firstAutoRideComplete: Optional(String),
        firstBikeRideComplete: Optional(String),
    }),
    paymentSource: String,
    paymentGatewayReferenceId: String,
    initialCoordinate: StrictPartialRecord({
        latitude: Number,
        longitude: Number,
    }),
});

const TextConfig = StrictPartialRecord({
    appReadableName: String,
    appId: String,
    publicTransitText: String,
    currencySymbol: String,
    rideOtpText: String,
    callPoliceText: String,
});

const LanguageTextConfig = Record({
    changeToModeText: String,
});

const FlowConfig = StrictPartialRecord({
    multimodalTrackWithoutBooking: Boolean,
    enableMapSnapshot: Boolean,
    busTicketActivationFlow: Boolean,
    enableLiveTracking: Boolean,
    showFirstNearestStopInServiceTab: Boolean,
    enableTicketActivationFlowPartially: Boolean,
    shareReferralLink: Boolean,
    ticketCancelFlowConfig: StrictPartialRecord({
        metroCancelEnable: Boolean,
        busCancelEnable: Boolean,
        subwayCancelEnable: Boolean,
    }),
    showAutoTripStartedLottie: Boolean,
    skipProfileOnboarding: Boolean,
    businessProfileConfig: BusinessProfileConfig,
    nearByBusConfig: Record({
        showNearbyBus: Boolean,
        maxNearbyBuses: Number,
        nearbyBusPollingInterval: Number,
        nearbyBusCircleRadius: Number,
    }),
    enable_ride_hailing: Boolean,
});

const UIConfig = StrictPartialRecord({
    thankYouMsgRideEnd: Boolean,
    enableLegacyIntercityCheck: Boolean,
    showOtpBusButton: Boolean,
    showMapFallback: Boolean,
    passTabEnabled: Boolean,
    extraFareDetail: RtArray(FareDetail),
    includeAutoFareInTransitFare: Boolean,
    showTicketLabelInTransitInfoCard: Boolean,
    hideAddressShimmer: Boolean,
    hideMaskedAnimatingIcon: Boolean,
    hideVehicleNextArrivalAndValidityDetails: Boolean,
    hideNextAvailableBusesInfo: Boolean,
    hideRepeatBookings: Boolean,
    showOtpCardAndSaintImage: Boolean,
    otpKeypadCharacters: String,
    shareRideCardConfig: StrictPartialRecord({
        shareRideGoldIconUri: String,
        shareLinks: StrictPartialRecord({
            android: String,
            ios: String,
        }),
    }),
});

const AssetConfig = StrictPartialRecord({
    maskedIconUri: String,
    screenShotGuardImageUri: Optional(String),
    fallbackQrImageUri: Optional(String),
    appLogoUri: String,
    driverDefaultProfileUri: String,
    rentalPolicyImageUri: String,
    callPoliceLogoUri: Optional(String),
    journeyStartTicketImageUri: String,
    redBusBannerUri: String,
});

const ScreenConfig = StrictPartialRecord({
    gettingStartedCarouselScreenConfig: StrictPartialRecord({
        gettingStartedCarousalConfig: RtArray(
            Record({
                image: Record({ uri: String }),
                title: String,
                description: String,
            }),
        ),
        showCenteredGetStartedButton: Boolean,
    }),
    eventScreenConfig: StrictPartialRecord({
        showAllTicketButton: Boolean,
        transparentBgLogo: String,
    }),
    ticketScreenConfig: StrictPartialRecord({
        busTicketText: TicketText,
        metroTicketText: TicketText,
        subwayTicketText: TicketText,
        comboTicket: TicketText,
        footerRegionalText: Optional(String),
        busQrPosition: Union(Literal('top'), Literal('bottom')),
        showTicketHeader: Boolean,
    }),
    reviewAndFeedbackScreenConfig: StrictPartialRecord({
        showRideEndThankYouScreen: Boolean,
        feedbackScreenconst: Union(Literal('share-type'), Literal('default')),
        rideCompleteBgUri: String,
        showLogoAtThankYouScreen: Boolean,
    }),
    singleModeSearchScreenConfig: StrictPartialRecord({
        showEditPencil: Boolean,
        showInputGroupDirection: Boolean,
    }),
    profileTab: StrictPartialRecord({
        primaryOptions: ProfileTabOption,
        secondaryOptions: ProfileTabOption,
        tertiaryOptions: ProfileTabOption,
        languageIconType: LanguageOption,
    }),
    helpAndSupport: StrictPartialRecord({
        helpAndSupportTopicList: HelpAndSupportTopic,
    }),
});

const AppSystemConfigs = StrictPartialRecord({
    appType: Union(Literal('ride-hailing'), Literal('multimodal')),
    constants: ConstantConfig,
    merchantData: MerchantDataConfig,
    textConfig: TextConfig,
    languageTextConfig: LanguageTextConfig,
    flowConfig: FlowConfig,
    uiConfig: UIConfig,
    assets: AssetConfig,
    screenConfig: ScreenConfig,
});

const ConfigsSchema = Record({
    tracking_mode: Dictionary(TrackingMode, City),
    feature_flags: Dictionary(FeatureFlags, TrackingMode),
    carousel_banner_config: Dictionary(CarouselBannerConfig, City),
    system_configs: Dictionary(SystemConfigs, City),
    dynamic_assets: Dictionary(DynamicAssets, Theme),
    enabled_services: Dictionary(RtArray(String), City),
    allowed_languages: Dictionary(RtArray(LanguageObj), City),
    explore_section: Dictionary(RtArray(FamousDestProps), City),
    support_number: Dictionary(SupportNumberObj, City),
    enabled_services_v2: Dictionary(RtArray(EnabledServicesV2), City),
    new_feature_flags: Dictionary(NewFeatureFlags, City),
    customer_cancellation_banner_threshold: Dictionary(CancellationThreshold, City),
    cancellation_banner_texts: Dictionary(CancellationBannerTexts, City),
    clarity_config: Dictionary(Boolean, City),
    contact_support: Dictionary(Boolean, AppName),
    hourly_rental: Dictionary(RtArray(Record(HourlyRentalsData)), City),
    intercity_recommendations: Dictionary(RtArray(IntercityRecommendations), City),
    nearby_events: Dictionary(NearbyEvents, City),
    nearby_drivers: NearbyDrivers,
    homescreen_modules: Dictionary(RtArray(String), City),
    rotating_text: Dictionary(RtArray(RotatingTexts), City),
    boosted_rotating_text: Dictionary(RtArray(RotatingTexts), City),
    use_slider_or_pill: Dictionary(useSliderOrPill, City),
    pledge_config: Dictionary(PledgeConfig, City),
    banner_popups_config: BannerPopups,
    filter_autocomplete: Dictionary(Boolean, City),
    referral_payout_config_v2: Dictionary(ReferralPayoutConfigV2, City),
    driver_highlight_config: Dictionary(DriverHighlightConfig, City),
    dynamic_cancellation_reasons: DynamicCancellationReasonsConfig,
    tab_screens_config: Dictionary(TabScreensConfig, City),
    enabled_services_v3: Dictionary(enabledServicesV3, City),
    oy_boating_placeId: Dictionary(boatingPlaceConfig, City),
    city_lottie_config: Dictionary(LottieConfigs, City),
    kapture_config: Dictionary(KaptureConfig, City),
    skip_and_start_journey: Dictionary(skipAndStartJourneyConfig, City),
    app_based_onboarding: Dictionary(AppBasedOnboarding, AppName),
    personal_mail_services_names: Dictionary(PersonalMailServicesNames, City),
    movie_promotional_config: Dictionary(MoviePromotionalConfig, City),
    city_base_ad_image: Dictionary(CityBaseAdImageConfig, City),
    app_system_config: Dictionary(AppSystemConfigs, City),
});

export type ConfigS = Static<typeof ConfigsSchema>;
export { ConfigsSchema, DynamicCancellationTranslationKey };
