import { Configs } from '../types';
import { defaultFeatureFlagsConfig } from './featureFlags';
import { defaultTrackingModeConfig } from './trackingMode';
import { defaultBannerConfig } from './defaultBannerConfig';
import { defaultSystemConfigs } from './systemConfig';
import { defaultEnabledServices } from './enabledServices';
import { defaultEnabledServicesV2 } from './enabledServices';
import { defaultEnabledServicesV3 } from './enabledServices';
import { defaultAllowedLanguages } from './allowedLanguages';
import { defaultExploreItems } from './defaultExplore';
import { defaultSupportNumbers } from './defaultSupportNumbers';
import { defaultCancellationBannerConfig } from './defaultCancellationBannerConfig';
import { defaultCancellationBannerTexts } from './defaultCancellationBannerTexts';
import { defaultNewFeatureFlags } from './defaultNewFeatureFlags';
import { defaultClarityConfig } from './defaultClarityConfig';
import { defaultContactSupport } from './defaultContactSupport';
import { defultHourlyRentalConfig } from './defaultHourlyRentalsConfig';
import { defaultIntercityRecommendations } from './defaultIntercityRecommendations';
import { defultNearbyEventsConfig } from './defaultNearbyEventsConfig';
import { defaultNearbyDriversConfig } from './defaultNearbyDriverConfig';
import { defaultHomeScreenModulesConfig } from './defaultHomeScreenModulesConfig';
import { defaultBoostedRotatingTextConfig } from './defaultBoostedRotatingText';
import { defaultRotatingTextConfig } from './defaultRotatingText';
import { defaultSliderOrPillConfig } from './defaultUseSliderOrPill';
import { defaultPledgeConfig } from './defaultPledgeConfig';
import { defaultBannerPopupsConfig } from './defaultBannerPopupConfig';
import { defaultFilterAutocompleteConfig } from './defaultFilterAutocompleteConfig';
import { defaultReferralPayoutConfigV2 } from './defaultReferralPayoutConfigV2';
import { defaultDriverHighlightConfig } from './defaultDriverHighlightConfig';
import { defaultDynamicCancellationReasonsConfig } from './defaultDynamicCancellationReasonsConfig';
import { defaultTabScreensConfig } from './defaultTabScreensConfig';
import { defaultLottieConfigs } from './defaultLottieConfigs';
import { defaultKaptureConfig } from './defaultKaptureConfig';
import { defaultAppBasedOnboarding } from './defaultAppBasedOnboarding';
import { defaultPersonalMailServicesNames } from './defaultPersonalMailServicesNames';
import { defaultBoatingPlaceIdConfig } from './defaultBoatingPlaceIdConfig';
import { defaultMoviePromotionalConfig } from './defaultMoviePromotionalConfig';
import { defaultCityBaseAdImage } from './defaultCityBaseAdImageConfig';
import { defaultSkipAndStartJourneyConfig } from './defaultSkipAndStartJourneyConfig';
import { defaultAppSystemConfig } from './defaultAppSystemConfig';

export const defaultConfigs: Configs = {
    tracking_mode: defaultTrackingModeConfig,
    feature_flags: defaultFeatureFlagsConfig,
    carousel_banner_config: defaultBannerConfig,
    system_configs: defaultSystemConfigs,
    enabled_services: defaultEnabledServices,
    allowed_languages: defaultAllowedLanguages,
    explore_section: defaultExploreItems,
    support_number: defaultSupportNumbers,
    enabled_services_v2: defaultEnabledServicesV2,
    new_feature_flags: defaultNewFeatureFlags,
    customer_cancellation_banner_threshold: defaultCancellationBannerConfig,
    cancellation_banner_texts: defaultCancellationBannerTexts,
    clarity_config: defaultClarityConfig,
    contact_support: defaultContactSupport,
    hourly_rental: defultHourlyRentalConfig,
    intercity_recommendations: defaultIntercityRecommendations,
    nearby_events: defultNearbyEventsConfig,
    nearby_drivers: defaultNearbyDriversConfig,
    homescreen_modules: defaultHomeScreenModulesConfig,
    rotating_text: defaultRotatingTextConfig,
    boosted_rotating_text: defaultBoostedRotatingTextConfig,
    use_slider_or_pill: defaultSliderOrPillConfig,
    pledge_config: defaultPledgeConfig,
    banner_popups_config: defaultBannerPopupsConfig,
    referral_payout_config_v2: defaultReferralPayoutConfigV2,
    filter_autocomplete: defaultFilterAutocompleteConfig,
    driver_highlight_config: defaultDriverHighlightConfig,
    dynamic_cancellation_reasons: defaultDynamicCancellationReasonsConfig,
    tab_screens_config: defaultTabScreensConfig,
    enabled_services_v3: defaultEnabledServicesV3,
    city_lottie_config: defaultLottieConfigs,
    kapture_config: defaultKaptureConfig,
    app_based_onboarding: defaultAppBasedOnboarding,
    personal_mail_services_names: defaultPersonalMailServicesNames,
    oy_boating_placeId: defaultBoatingPlaceIdConfig,
    movie_promotional_config: defaultMoviePromotionalConfig,
    city_base_ad_image: defaultCityBaseAdImage,
    skip_and_start_journey: defaultSkipAndStartJourneyConfig,
    app_system_config: defaultAppSystemConfig,
};
