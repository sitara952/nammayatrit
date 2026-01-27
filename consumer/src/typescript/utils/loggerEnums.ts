/**
 * Logger Enums - Centralized event names, screen routes, and logging interfaces
 * Extracted from logger.ts for better organization and maintainability
 */

/**
 * Type-safe event names for analytics logging
 * All event names used across the consumer app must be defined here
 */
export enum EventName {
    // App Lifecycle Events
    NY_APP_STARTED = 'ny_app_started',
    APP_LAUNCHED = 'app_launched',
    NY_USER_ENTERED_APP = 'ny_user_entered_app',
    NY_HIDE_SPLASH = 'ny_hide_splash',
    APP_REMOVE = 'app_remove',

    // User Authentication & Onboarding
    NY_USER_ENTER_MOB_NUM_SCN_VIEW = 'ny_user_enter_mob_num_scn_view',
    NY_USER_MOBNUM_ENTRY = 'ny_user_mobnum_entry',
    NY_USER_OTP_TRIGGERED = 'ny_user_otp_triggered',
    NY_USER_VERIFY_TRUECALLER = 'ny_user_verify_truecaller',
    NY_USER_VERIFY_OTP = 'ny_user_verify_otp',
    NY_USER_ONBOARDED = 'ny_user_onboarded',
    NY_USER_GET_STARTED = 'ny_user_get_started',
    NY_USER_REFERRAL_CODE_APPLIED = 'ny_user_referral_code_applied',
    NY_USER_SIGNED_UP_WITH_REFERRAL = 'ny_user_signed_up_with_referral',
    NY_USER_LOGOUT = 'ny_user_logout',

    // Navigation & Tab Events
    USER_CLICKED_LIVE_TAB = 'User_clicked_live_tab',
    USER_CLICKED_TICKET_TAB = 'User_clicked_ticket_tab',
    USER_CLICKED_SERVICES_TAB = 'User_clicked_services_tab',
    USER_CLICKED_PASSES_TAB = 'User_clicked_passes_tab',
    LIVE_DASHBOARD_SELECTED = 'LIVE_DASHBOARD_SELECTED',

    // Location & Search Events
    NY_USER_LOCATION_LIST_ITEM = 'ny_user_location_list_item',
    NY_USER_CONFIRM_PICKUP = 'ny_user_confirm_pickup',
    NY_USER_PICKUP_SELECT = 'ny_user_pickup_select',
    NY_USER_DESTINATION_SELECT = 'ny_user_destination_select',
    NY_USER_GRANT_LOCATION_PERMISSION = 'ny_user_grant_location_permission',
    NY_USER_AUTO_COMPLETE_API_TRIGGER_SRC = 'ny_user_auto_complete_api_trigger_src',
    NY_USER_AUTO_COMPLETE_API_TRIGGER_DST = 'ny_user_auto_complete_api_trigger_dst',
    MT_HOME_PLAN_JOURNEY = 'mt_home_plan_journey',
    MT_HOME_PLAN_JOURNEY_SEARCH = 'mt_home_plan_journey_search',

    // Quote & Ride Request Events
    NY_USER_REQUEST_QUOTES = 'ny_user_request_quotes',
    NY_USER_REQUEST_QUOTES_7D = 'ny_user_request_quotes_7D',
    NY_USER_REQUEST_QUOTES_30D = 'ny_user_request_quotes_30D',
    NY_RIDER_REQUEST_QUOTE = 'ny_rider_request_quote',
    NY_RIDER_REQUEST_QUOTE_7D = 'ny_rider_request_quote_7D',
    NY_RIDER_REQUEST_QUOTE_30D = 'ny_rider_request_quote_30D',
    NY_USER_AUTO_CONFIRM = 'ny_user_auto_confirm',
    NY_USER_AUTO_CONFIRM_7D = 'ny_user_auto_confirm_7D',
    NY_USER_AUTO_CONFIRM_30D = 'ny_user_auto_confirm_30D',
    NY_USER_QUOTE_CONFIRM = 'ny_user_quote_confirm',
    NY_USER_QUOTE = 'ny_user_quote',
    NY_RIDER_RETRY_REQUEST_QUOTE = 'ny_rider_retry_request_quote',
    USER_QUOTE_REQUEST_NAMMA_TRANSIT = 'User_quote_request_Namma_Transit',
    USER_INTERCITY_SCHEDULED_RIDE_CONFIRMED = 'user_intercity_scheduled_ride_confirmed',

    // Boost Search Events
    TIP_CHANGE = 'tip_change',
    VARIANT_CHANGE = 'variant_change',
    NY_BOOST_SEARCH_ATTEMPT = 'ny_boost_search_attempt', // For dynamic boost events

    // Ride Cancellation Events
    NY_USER_CANCEL_TRIP_CLICKED = 'ny_user_cancel_trip_clicked',
    NY_USER_RIDE_CANCELLED_BY_USER = 'ny_user_ride_cancelled_by_user',
    NY_USER_CANCELLATION_REASON = 'ny_user_cancellation_reason',
    NY_USER_RIDER_CANCELLATION = 'ny_user_rider_cancellation',
    NY_USER_FIND_ANOTHER_DRIVER = 'ny_user_find_another_driver',
    NY_USER_FIND_ANOTHER_DRIVER_SEARCH_CROSS_CLICKED = 'ny_user_find_another_driver_search_cross_clicked',
    NY_USER_FIND_ANOTHER_DRIVER_SEARCH_CANCEL = 'ny_user_find_another_driver_search_cancel',
    NY_USER_CANCEL_WAITING_FOR_QUOTES = 'ny_user_cancel_waiting_for_quotes',
    NY_FS_CANCEL_ESTIMATE_BOOKING_EXISTS_RIGHT = 'ny_fs_cancel_estimate_booking_exists_right',
    NY_FS_CANCEL_ESTIMATE_BOOKING_EXISTS_LEFT = 'ny_fs_cancel_estimate_booking_exists_left',
    NY_FS_CANCEL_ESTIMATE_FAILED_LEFT = 'ny_fs_cancel_estimate_failed_left',
    NY_USER_ESTIMATE_CANCEL_SEARCH = 'ny_user_estimate_cancel_search',
    NY_USER_SEARCH_DROPOFF = 'ny_user_search_dropoff',
    NY_USER_AC_CAB_RIDE_SEARCH_DROPOFF = 'ny_user_ac_cab_ride_search_dropoff',
    NY_USER_BIKE_RIDE_SEARCH_DROPOFF = 'ny_user_bike_ride_search_dropoff',

    // Ride Status Events
    NY_ACTIVE_RIDE_WITH_IDLE_STATE = 'ny_active_ride_with_idle_state',
    NY_GOT_RIDE_OTP = 'ny_got_ride_otp',

    // Call Events
    NY_USER_ANONYMOUS_CALL_CLICK = 'ny_user_ANONYMOUS_call_click',
    NY_USER_DIRECT_CALL_CLICK = 'ny_user_DIRECT_call_click',

    // Safety Events
    NY_USER_NIGHT_SAFETY_MARK_I_FEEL_SAFE = 'ny_user_night_safety_mark_i_feel_safe',
    NY_USER_NIGHT_SAFETY_MARK_NEED_HELP = 'ny_user_night_safety_mark_need_help',
    NY_USER_SHARE_RIDE_VIA_LINK = 'ny_user_share_ride_via_link',
    NY_IC_SAFETY_CENTER_CLICKED = 'ny_ic_safety_center_clicked',
    NY_USER_RIDE_TRACK_GMAPS = 'ny_user_ride_track_gmaps',

    // Service Events
    NY_USER_METRO_TICKETS = 'ny_user_metro_tickets',

    // First Ride Events - NammaYatri
    NY_USER_FIRST_RIDE_COMPLETED = 'ny_user_first_ride_completed',
    NY_USER_FIRST_RIDE_COMPLETED_7D = 'ny_user_first_ride_completed_7D',
    NY_USER_FIRST_RIDE_COMPLETED_30D = 'ny_user_first_ride_completed_30D',
    NY_CAB_FIRSTRIDE = 'ny_cab_firstride',
    NY_AUTO_FIRSTRIDE = 'ny_auto_firstride',
    NY_BIKE_FIRSTRIDE = 'ny_bike_firstride',

    // First Ride Events - ManaYatri
    MY_USER_FIRST_RIDE_COMPLETED = 'my_user_first_ride_completed',
    MY_USER_FIRST_RIDE_COMPLETED_7D = 'my_user_first_ride_completed_7D',
    MY_USER_FIRST_RIDE_COMPLETED_30D = 'my_user_first_ride_completed_30D',
    MY_CAB_FIRSTRIDE = 'my_cab_firstride',
    MY_AUTO_FIRSTRIDE = 'my_auto_firstride',
    MY_BIKE_FIRSTRIDE = 'my_bike_firstride',

    // First Ride Events - Yatri
    Y_USER_FIRST_RIDE_COMPLETED = 'y_user_first_ride_completed',
    Y_USER_FIRST_RIDE_COMPLETED_7D = 'y_user_first_ride_completed_7D',
    Y_USER_FIRST_RIDE_COMPLETED_30D = 'y_user_first_ride_completed_30D',
    Y_CAB_FIRSTRIDE = 'y_cab_firstride',
    Y_AUTO_FIRSTRIDE = 'y_auto_firstride',
    Y_BIKE_FIRSTRIDE = 'y_bike_firstride',

    // First Ride Events - YatriSathi
    YS_CAB_FIRSTRIDE = 'ys_cab_firstride',
    YS_AUTO_FIRSTRIDE = 'ys_auto_firstride',
    YS_BIKE_FIRSTRIDE = 'ys_bike_firstride',

    // First Ride Events - Odisha
    ODISHAUSER_FIRST_RIDE_COMPLETED = 'Odishauser_first_ride_completed',
    ODISHA_USER_FIRST_RIDE_COMPLETED_7D = 'Odisha_user_first_ride_completed_7D',
    ODISHA_USER_FIRST_RIDE_COMPLETED_30D = 'Odisha_user_first_ride_completed_30D',

    // First Ride Events - Yatri (alternate prefix)
    YATRIUSER_FIRST_RIDE_COMPLETED = 'Yatriuser_first_ride_completed',
    YATRI_USER_FIRST_RIDE_COMPLETED_7D = 'Yatri_user_first_ride_completed_7D',
    YATRI_USER_FIRST_RIDE_COMPLETED_30D = 'Yatri_user_first_ride_completed_30D',

    // Debug & Development Events
    NY_USER_MOCK_LOCATION = 'ny_user_mock_location',
    HYPERSDK_LOG = 'hypersdk_log',
    HYPERSDK_PROCESS = 'hypersdk_process',
    HYPERSDK_INITIATE = 'hypersdk_initiate',

    // Multimodal & Metro Events
    NY_USER_REFERRAL_APPLIED_AFTER_SIGNUP = 'ny_user_referral_applied_after_signup',
    NY_USER_PAYMENT_IS_INITIALISED = 'ny_user_payment_is_initialised',
    NY_USER_INITIATED_PAYMENT_PAGE = 'ny_user_initiated_payment_page',
    NY_USER_NOT_INITIALISED = 'ny_user_not_initialised',
    NY_USER_PAYMENT_RE_INITIALISED = 'ny_user_payment_re_initialised',
    NY_USER_PAYMENT_PROCESS_PAYLOAD = 'ny_user_payment_process_payload',
    NY_USER_ENTERED_PAYMENT_PAGE = 'ny_user_entered_payment_page',
    NAMMA_TRANSIT_BOOKING_CANCELLED = 'Namma_transit_booking_cancelled',
    NAMMA_TRANSIT_RIDE_COMPLETED = 'Namma_transit_ride_completed',
    METRO_TICKET_RIDE_COMPLETED = 'Metro_ticket_Ride_completed',
    METRO_TICKET_PAYMENT_SUCCESSFUL = 'Metro_ticket_payment_successful',
    METRO_TICKET_PAYMENT_FAILED = 'Metro_ticket_Payment_failed',
    NY_BUS_OTP_SCANNED = 'ny_bus_otp_scanned',
    NY_BUS_OTP_TYPED = 'ny_bus_otp_typed',
    NY_BUS_OTP_BOOK_TICKET = 'ny_bus_otp_book_ticket',
    NY_BUS_OTP_DEST_SELECTED = 'ny_bus_otp_dest_selected',
    NY_BUS_SEARCH = 'ny_bus_search',
    NY_BUS_SEARCH_DEST_SELECTED = 'ny_bus_search_dest_selected',
    NY_BUS_CONFIRM_SOURCE_STOP = 'ny_bus_confirm_source_stop',
    METRO_INFO_TIMETABLE = 'metro_info_timetable',
    MT_JOURNEY_INFO_PAY = 'mt_journey_info_pay',
    MT_OFFER_AND_PAY = 'mt_view_offer_pay',
    MT_HOME_BUS_OTP = 'mt_home_bus_otp',
    METRO_SOURCE_DESTINATION_ENTERED = 'Metro_source_destination_entered',
    NAMMA_TRANSIT_BOOK_JOURNEY = 'Namma_transit_Book_journey',
    USER_CLICKED_SERVICES_BUS = 'User_clicked_services_BUS',
    USER_CLICKED_SERVICES_METRO = 'User_clicked_services_METRO',
    USER_CLICKED_SERVICES_SUBWAY = 'User_clicked_services_SUBWAY',
    USER_CLICKED_SERVICES_METRO_V2 = 'User_clicked_services_METRO_V2',
    NY_USER_LANG_SELEC = 'ny_user_lang_selec',
    USER_SELECTED_NAMMA_TRANSIT_ESTIMATE = 'User_selected_namma_transit_estimate',
    USER_GOT_NAMMA_TRANSIT_ESTIMATE = 'User_Got_Namma_Transit_Estimate',

    // Ride & Estimate Events
    NY_NO_ESTIMATES = 'ny_no_estimates',
    NY_USER_ESTIMATE = 'ny_user_estimate',
    NY_USER_SOURCE_AND_DESTINATION = 'ny_user_source_and_destination',
    NY_USER_SOURCE_AND_DESTINATION_7D = 'ny_user_source_and_destination_7D',
    NY_USER_SOURCE_AND_DESTINATION_30D = 'ny_user_source_and_destination_30D',
    NY_USER_FOLLOWING_RIDE = 'ny_user_following_ride',
    NY_USER_RIDE_ASSIGNED = 'ny_user_ride_assigned',
    NY_RIDE_ASSIGNED_SCREEN = 'ny_ride_assigned_screen',
    NY_USER_RIDE_STARTED = 'ny_user_ride_started',
    NY_USER_DRIVER_ARRIVED = 'ny_user_driver_arrived',
    NY_USER_INITIAL_DRIVER_PICKUP_ETA = 'ny_user_initial_driver_pickup_eta',
    NY_RIDER_RIDE_COMPLETED = 'ny_rider_ride_completed',
    NY_USER_NIGHT_RIDE_COMPLETED = 'ny_user_night_ride_completed',
    NY_FS_DRIVER_ASSIGNMENT = 'ny_fs_driver_assignment',
    RIDE_CANCELLED_BY_USER = 'ride_cancelled_by_user',
    DRIVER_ASSIGNED = 'driver_assigned',

    // Screen & Navigation Events
    NY_NO_RETRY = 'ny_no_retry',
    NY_HOME_SCREEN_RENDER = 'ny_home_screen_render',
    NY_USER_INVOICE_CLICKED = 'ny_user_invoice_clicked',
    NY_USER_ABOUT = 'ny_user_about',
    NY_USER_LANGUAGE = 'ny_user_language',
    NY_USER_MYRIDES_CLICK = 'ny_user_myrides_click',
    NY_USER_PROFILE_CLICK = 'ny_user_profile_click',
    NY_USER_MOCK_JOURNEY = 'ny_user_mock_journey',

    // Feedback & Rating Events
    NY_USER_RIDE_GIVE_FEEDBACK = 'ny_user_ride_give_feedback',
    NY_USER_FIVESTAR_RATING = 'ny_user_fivestar_rating',
    NY_USER_FOURSTAR_RATING = 'ny_user_fourstar_rating',
    NY_USER_THREESTAR_RATING = 'ny_user_threestar_rating',
    NY_USER_TWOSTAR_RATING = 'ny_user_twostar_rating',
    NY_USER_ONESTAR_RATING = 'ny_user_onestar_rating',
    NY_USER_STAR_RATING = 'ny_user_star_rating',

    // Referral Events
    NY_USER_REFERRAL_SHARED = 'ny_user_referral_shared',

    // Safety & SOS Events
    NY_USER_SOS_MARKED_SAFE = 'ny_user_sos_marked_safe',
    NY_USER_SOS_ACTIVATED = 'ny_user_sos_activated',
    NY_USER_CALL_POLICE_ACTIVATED = 'ny_user_call_police_activated',
    NY_USER_REPORT_SAFETY_ISSUE_ACTIVATED = 'ny_user_report_safety_issue_activated',

    // Map Location Events
    NY_USER_DEST_SET_LOCATION_ON_MAP = 'ny_user_dest_set_location_on_map',
    NY_USER_SRC_SET_LOCATION_ON_MAP = 'ny_user_src_set_location_on_map',

    // Profile Events
    PROFILE_GENDER_SELECTED = 'profile_gender_selected',

    // Ad Events
    AD_IMPRESSION = 'ad_impression',
    AD_CLICK = 'ad_click',

    // Screen Time Events
    SCREEN_DURATION = 'screen_duration',
    SCREEN_DURATION_APP_CLOSED = 'screen_duration_app_closed',
    USER_CLICKED_BUY_NOW = 'user_clicked_buy_now',
    USER_CONFIRMED_PASS = 'user_confirmed_pass',
    USER_CLICKED_TODAY_RENEWAL = 'user_clicked_today_renewal',
    USER_CLICKED_CUSTOM_RENEWAL = 'user_clicked_custom_renewal',
    USER_PASS_CONFIRMED = 'user_pass_confirmed',
    USER_PHOTO_SCREEN = 'user_photo_screen',
    USER_CAPTURE_PHOTO = 'user_capture_photo',
    USER_RETAKE_PHOTO = 'user_retake_photo',
    USER_BP_CONFIRM_AND_PAY = 'user_bp_confirm_and_pay',
    PAYMENT_SUCCESS_BUS_PASS = 'payment_success_bus_pass',
    USER_CLICKED_VERIFY_PASS = 'user_clicked_verify_pass',
    USER_CLICKED_RENEW_BUS_PASS = 'user_clicked_renew_bus_pass',
    NY_BUS_TRACK_BUS = 'ny_bus_track_bus',

    // TrueCaller Events
    TRUECALLER_INIT_SUCCESS = 'tc_init_success',
    TRUECALLER_INIT_FAILURE = 'tc_init_failure',
    TRUECALLER_PROFILE_FETCH_SUCCESS = 'tc_profile_fetch_success',
    TRUECALLER_PROFILE_FETCH_FAILURE = 'tc_profile_fetch_failure',
    TRUECALLER_AUTH_SIGNATURE_SUCCESS = 'tc_auth_signature_success',
    TRUECALLER_AUTH_SIGNATURE_FAILURE = 'tc_auth_signature_failure',
    TRUECALLER_SIGNATURE_GET_SUCCESS = 'tc_signature_get_success',
    TRUECALLER_SIGNATURE_GET_FAILURE = 'tc_signature_get_failure',

    // Business Profile Events
    BUSINESS_PROFILE_VERIFICATION_SUCCESS = 'business_profile_verification_success',
    BUSINESS_PROFILE_VERIFICATION_FAILED = 'business_profile_verification_failed',
    BUSINESS_PROFILE_VERIFICATION_TIMEOUT = 'business_profile_verification_timeout',
    BUSINESS_PROFILE_OTP_ENTERED = 'business_profile_otp_entered',

    // Notification Events
    NOTIFICATION_RECEIVE = 'notification_receive',
    NOTIFICATION_RECIEVE = 'notification_recieve',
    NOTIFICATION_OPEN = 'notification_open',

    // App Version Events
    NY_USER_APP_VERSION = 'ny_user_app_version',
}

/**
 * Type-safe screen routes for navigation tracking
 * Used with logScreenEvent for Clarity analytics
 * Organized by navigation tab sections for better maintainability
 */
export enum ScreenRoute {
    // ============== TAB HOME SCREENS ==============
    HOME_TAB_HOME_SCREEN = 'homeTab_homeScreen',
    SERVICE_TAB_HOME_SCREEN = 'serviceTab_homeScreen',
    LIVE_TAB_HOME_SCREEN = 'liveTab_homeScreen',
    TICKETS_TAB_HOME_SCREEN = 'ticketsTab_homeScreen',
    PROFILE_TAB_HOME_SCREEN = 'profileTab_homeScreen',
    PASSES_TAB_HOME_SCREEN = 'passesTab_homeScreen',

    // ============== HOME TAB ROUTES ==============
    FAVOURITES_SCREEN = 'favouritesScreen',
    JOURNEY_DETAILS = 'journeyDetails',
    JOURNEY_OPTIONS = 'journeyOptions',
    MULTIMODAL_TRANSIT_CHECKOUT = 'multimodalTransitCheckout',
    BASE_HYBRID_FLOW = 'baseHybridFlow',
    EXTENDED_BOOKING_NAVIGATOR = 'extendedBookingNavigator',
    MY_RIDES_NAVIGATOR = 'myRidesNavigator',
    REFERRAL_NAVIGATOR = 'referralNavigator',
    SINGLE_MODE_BOOKING_NAVIGATOR = 'singleModeBookingNavigator',
    REVIEW_AND_FEEDBACK = 'reviewAndFeedback',
    BUS_OTP_FLOW = 'busOtpFlow',
    BUS_OTP_VIA_TICKET_BOOKING_FLOW = 'busOTPViaTicketBookingFlow',

    // ============== LIVE TAB ROUTES ==============
    TAXI_RIDE_TRACKING = 'taxiRideTracking',
    PICKUP_INSTRUCTIONS = 'pickupInstructions',
    MULTI_TRANSIT_FEEDBACK = 'multiTransitFeedback',
    JOURNEY_PLAN_SCREEN = 'journeyPlanScreen',
    LIVE_JOURNEY_DETAIL = 'liveJourneyDetail',

    // ============== PROFILE TAB ROUTES ==============
    TRANSIT_PREFERENCES_SCREEN = 'transitPreferencesScreen',
    ABOUT_SCREEN = 'aboutScreen',
    MY_PROFILE = 'myProfile',
    APP_LANGUAGE_NAVIGATION = 'appLanguageNavigation',
    CHOOSE_THEME = 'chooseTheme',
    UPDATE_MY_PROFILE = 'updateMyProfile',
    MANAGE_FAVOURITES = 'manageFavourites',
    ADD_FAVOURITE = 'addFavourite',
    MOCK_CITY_SCREEN = 'mockCityScreen',
    MOCK_JOURNEY_SCREEN = 'mockJourneyScreen',
    MY_RIDES_SCREEN = 'myRidesScreen',
    PAYMENT_MANAGEMENT = 'paymentManagement',
    HELP_AND_SUPPORT_SCREEN = 'helpAndSupportScreen',
    NEARBY_BUS_TRACKING = 'nearbyBusTracking',
    BUSINESS_PROFILE_SCREEN = 'businessProfileScreen',

    // ============== PASSES TAB ROUTES ==============
    UPLOAD_PHOTO = 'uploadPhoto',
    TAKE_PHOTO = 'takePhoto',

    // ============== TICKETS TAB ROUTES ==============
    TICKET_HISTORY = 'ticketHistory',
    SHOW_TICKET_SCREEN = 'showTicketScreen',

    // ============== MAIN NAVIGATION ROUTES ==============
    SAFETY_SCREEN = 'safetyScreen',
    ADD_CONTACTS = 'addContacts',
    CONTINUE_BOOKING = 'continueBooking',
    DELIVERY_SCREEN = 'deliveryScreen',
    TRIP_DETAIL = 'tripDetail',
    HELP = 'help',
    REPORT_ISSUE = 'reportIssue',
    HELP_SCREEN = 'helpScreen',
    HYPER_VIEW_SCREEN = 'hyperViewScreen',
    EMERGENCY_CONTACT_SCREEN = 'emergencyContactScreen',
    FOLLOW_RIDE = 'followRide',
    DRIVER_PROFILE = 'driverProfile',
    WEB_VIEW = 'webView',
    SAFETY_TOOLS = 'safetyTools',
    MULTIMODAL_PAYMENT_STATUS = 'multimodalPaymentStatus',
    EDIT_PICKUP = 'editPickup',
    EDIT_DESTINATION = 'editDestination',
    LOCATE_ON_MAP = 'locateOnMap',
    BUS_TRACKING = 'busTracking',
    KAPTURE_WEB_VIEW_SCREEN = 'kaptureWebViewScreen',
    SAFETY_CARD = 'safetyCard',

    // ============== TICKETING ROUTES ==============
    TICKETING = 'Ticketing',
    EVENT_DETAILS = 'EventDetails',
    CHOOSE_CATEGORIES = 'ChooseCategories',
    REVIEW_BOOKING = 'ReviewBooking',
    PAYMENT_VIEW = 'PaymentView',
    MY_TICKET_SCREEN = 'MyTicketScreen',
    YATRI_SATHI_PAYMENT_STATUS_SCREEN = 'YatriSathiPaymentStatusScreen',

    // ============== ROOT NAVIGATION ROUTES ==============
    ONBOARDING_NAVIGATION = 'onboardingNavigation',
    MAIN_TAB_NAVIGATION = 'mainTabNavigation',
    MAIN_NAVIGATION = 'mainNavigation',

    // ============== ONBOARDING ROUTES ==============
    GETTING_STARTED_CAROUSEL = 'GettingStartedCarousel',
    LOGIN_SCREEN = 'LoginScreen',
    OTP_VERIFICATION = 'OTPVerification',
    UPDATE_PROFILE = 'UpdateProfile',
    HOME_SCREEN = 'HomeScreen',
    ENTER_MOBILE_NUMBER = 'EnterMobileNumber',

    // ============== ADDITIONAL COMMON ROUTES ==============
    BUS_ROUTE_DETAILS = 'BusRouteDetails',
    LIVE_JOURNEY_OVERVIEW = 'liveJourneyOverview',
    AMBULANCE_SCREEN = 'ambulanceScreen',
    PASS_PAYMENT_STATUS = 'passPaymentStatus',
    PAYMENT_SUCCESS_SCREEN = 'PaymentSuccessScreen',
}

/**
 * Logging interface enumeration
 * Defines all available analytics and logging platforms
 */
export enum LogInterface {
    CleverTap,
    Firebase,
    Meta,
    Clarity,
    NammaYatri,
    MoEngage,
}

/**
 * Type-safe event prefixes for prefix-based dynamic events
 * Used when events follow a pattern like "prefix_dynamicValue"
 */
export enum EventPrefix {
    MT_HOME = 'mt_home_',
    NY_BOOST_SEARCH = 'ny_boost_search_',
    PRESSABLE_CLICK = 'pressable_click_',
    TOUCHABLE_OPACITY_CLICK = 'touchable_opacity_click_',
    TOUCHABLE_WITHOUT_FEEDBACK_CLICK = 'touchable_without_feedback_click_',
    User_Clicked = 'user_clicked_',
    NY_BUS_OTP = 'ny_bus_otp_',
    PAYMENT_PAGE = 'payment_page_',
    NY_BUS_OTP_BOOK = 'ny_bus_otp_book_',
    NY_BUS_OTP_PASS = 'ny_bus_otp_pass_',
    USER_CAPTURE_PHOTO = 'user_capture_photo_',
    USER_CONFIRMED_PASS = 'user_confirmed_pass_',
    USER_BP_CONFIRM_AND_PAY = 'user_bp_confirm_and_pay_',
    NY_BUS_CONFIRM_SOURCE_STOP = 'ny_bus_confirm_source_stop_',
    NY_BUS_CONFIRM_DESTINATION_STOP = 'ny_bus_confirm_destination_stop_',
    NY_BUS_STOP_SELECTED = 'ny_bus_stop_selected_',
    MULTIMODAL_PAYMENT_SUCCESSFUL = 'multimodal_payment_successful_',
    PAYMENT_REFUNDED = 'payment_refunded_',
    PAYMENT_REFUND_PENDING = 'payment_refund_pending_',
}

export enum EventSuffix {
    REPEAT_BOOKING = 'repeat_booking',
    INFO_TIMETABLE = 'info_timetable',
    SOURCE_DESTINATION_ENTERED = 'source_destination_entered',
}
/**
 * Ad event payload structure for backend /ingest/ad-events endpoint
 * Note: screen is optional - if not provided, it will be auto-detected from screen context
 */
export interface AdEventPayload {
    event_id: string;
    campaign_id?: string | null;
    campaign_item_id?: string | null;
    view_unit_id?: string | null;
    platform: string;
    app_version: string;
    screen?: string;
    source?: string | null;
}
