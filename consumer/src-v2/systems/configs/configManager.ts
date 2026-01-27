import { ConfigProvider } from './configProvider';
import {
    Configs,
    TrackingMode,
    ConfigKeyByContext,
    BannerPopupsConfig,
    DynamicCancellationReasonsConfig,
    NearbyDriversConfig,
    AppConfigType,
    AppConfigCityType,
} from './types';
import { appName, City } from 'config-types';
import { defaultConfigs } from './defaults/defaultConfig';
import FirebaseRemoteConfigDataSource from './source/firebase';
import { deepMerge } from './configMerger';
import { deepNestedMerge } from './helpers';
import { getRemoteConfig, getAll, getString } from '@react-native-firebase/remote-config';
import { ConfigsSchema } from './configSchema';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { defaultAppConfigs } from './defaults/defaultAppSystemConfig';

const USE_LOCAL_CONFIGS = false;
/**
 * Currently this config is using Firebase Remote Config
 */
export class ConfigManager {
    private provider: ConfigProvider;

    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    private cache: { [key: string]: any };

    constructor(provider: ConfigProvider) {
        this.provider = provider;
        this.cache = {};
    }

    async initialize(): Promise<void> {
        await this.provider.initialize();
        await this.provider.fetchConfigs();
    }

    getAllConfigs(): Configs {
        const remoteConfigInstance = getRemoteConfig();
        const allParams = getAll(remoteConfigInstance);

        // Parse JSON from strings
        // Make sure these keys match what you have set in Remote Config
        const rawTrackingMode = safeJsonParse(allParams['tracking_mode']?.asString(), {
            fallback: {},
            context: 'trackingMode',
        });
        const rawFeatureFlags = safeJsonParse(allParams['feature_flags']?.asString(), {
            fallback: {},
            context: 'featureFlags',
        });
        const rawCarouselBannerConfig = safeJsonParse(allParams['carousel_banner_config']?.asString(), {
            fallback: {},
            context: 'carouselBannerConfig',
        });
        const rawSystemConfigs = safeJsonParse(allParams['system_configs']?.asString(), {
            fallback: {},
            context: 'systemConfigs',
        });
        const rawEnabledServices = safeJsonParse(allParams['enabled_services']?.asString(), {
            fallback: {},
            context: 'enabledServices',
        });
        const rawAllowedLanguages = safeJsonParse(allParams['allowed_languages']?.asString(), {
            fallback: {},
            context: 'allowedLanguages',
        });
        const rawExploreSection = safeJsonParse(allParams['explore_section']?.asString(), {
            fallback: {},
            context: 'exploreSection',
        });
        const rawSupportNumbers = safeJsonParse(allParams['support_number']?.asString(), {
            fallback: {},
            context: 'supportNumber',
        });
        const rawEnabledServicesV2 = safeJsonParse(allParams['enabled_services_v2']?.asString(), {
            fallback: {},
            context: 'enabledServicesV2',
        });
        const rawNewFeatureFlags = safeJsonParse(allParams['new_feature_flags']?.asString(), {
            fallback: {},
            context: 'newFeatureFlags',
        });
        const rawClarityConfig = safeJsonParse(allParams['clarity_config']?.asString(), {
            fallback: {},
            context: 'clarityConfig',
        });
        const rawContactSupport = safeJsonParse(allParams['contact_support']?.asString(), {
            fallback: {},
            context: 'contactSupport',
        });

        const rawAppBasedOnboarding = safeJsonParse(allParams['app_based_onboarding']?.asString(), {
            fallback: {},
            context: 'appBasedOnboarding',
        });

        const rawPersonalMailServicesNames = safeJsonParse(allParams['personal_mail_services_names']?.asString(), {
            fallback: {},
            context: 'personalMailServicesNames',
        });

        const rawCustomerCancellationThresholdConfig = safeJsonParse(
            allParams['customer_cancellation_banner_threshold']?.asString(),
            {
                fallback: {},
                context: 'customerCancellationThreshold',
            },
        );
        const hourlyRentals = safeJsonParse(allParams['hourly_rentals']?.asString(), {
            fallback: {},
            context: 'hourlyRentals',
        });
        const intercityRecommendations = safeJsonParse(allParams['intercity_recommendations']?.asString(), {
            fallback: {},
            context: 'intercityRecommendations',
        });
        const nearByEventsConfig = safeJsonParse(allParams['nearby_events']?.asString(), {
            fallback: {},
            context: 'nearbyEvents',
        });
        const nearbyDriversConfig = safeJsonParse(allParams['nearby_drivers']?.asString(), {
            fallback: {},
            context: 'nearbyDrivers',
        });
        const homescreenModulesConfig = safeJsonParse(allParams['homescreen_modules']?.asString(), {
            fallback: {},
            context: 'homescreenModules',
        });
        const rotatingText = safeJsonParse(allParams['rotating_text']?.asString(), {
            fallback: {},
            context: 'rotatingText',
        });
        const boostedRotatingText = safeJsonParse(allParams['boosted_rotating_text']?.asString(), {
            fallback: {},
            context: 'boostedRotatingText',
        });
        const useSliderOrPill = safeJsonParse(allParams['use_slider_or_pill']?.asString(), {
            fallback: {},
            context: 'useSliderOrPill',
        });
        const pledgeConfig = safeJsonParse(allParams['pledge_config']?.asString(), {
            fallback: {},
            context: 'pledgeConfig',
        });
        const bannerPopupsConfig = safeJsonParse(allParams['banner_popups_config']?.asString(), {
            fallback: {},
            context: 'bannerPopupsConfig',
        });
        const referralPayoutConfigV2 = safeJsonParse(allParams['referral_payout_config_v2']?.asString(), {
            fallback: {},
            context: 'referralPayoutConfigV2',
        });
        const filterAutocomplete = safeJsonParse(allParams['filter_autocomplete']?.asString(), {
            fallback: {},
            context: 'filterAutocomplete',
        });
        const driverHighlightConfig = safeJsonParse(allParams['driver_highlight_config']?.asString(), {
            fallback: {},
            context: 'driverHighlightConfig',
        });
        const dynamicCancellationReasons = safeJsonParse(allParams['dynamic_cancellation_reasons']?.asString(), {
            fallback: {},
            context: 'dynamicCancellationReasons',
        });
        const tabScreensConfig = safeJsonParse(allParams['tab_screens_config']?.asString(), {
            fallback: {},
            context: 'tabScreensConfig',
        });
        const rawEnabledServicesV3 = safeJsonParse(allParams['enabled_services_v3']?.asString(), {
            fallback: {},
            context: 'enabledServicesV3',
        });
        const boatingPlaceConfig = safeJsonParse(allParams['oy_boating_placeId']?.asString(), {
            fallback: {},
            context: 'boatingPlaceConfig',
        });
        const cityLottieConfig = safeJsonParse(allParams['city_lottie_config']?.asString(), {
            fallback: {},
            context: 'cityLottieConfig',
        });
        const kaptureConfig = safeJsonParse(allParams['kapture_config']?.asString(), {
            fallback: {},
            context: 'kaptureConfig',
        });
        const moviePromotionalConfig = safeJsonParse(allParams['movie_promotional_config']?.asString(), {
            fallback: {},
            context: 'moviePromotionalConfig',
        });
        const skipAndStartJourneyConfig = safeJsonParse(allParams['skip_and_start_journey']?.asString(), {
            fallback: {},
            context: 'skipAndStartJourneyConfig',
        });
        const cityBaseAdImageConfig = safeJsonParse(allParams['city_base_ad_image']?.asString(), {
            fallback: {},
            context: 'cityBaseAdImageConfig',
        });
        const appSystemConfig = safeJsonParse(allParams['app_system_config']?.asString(), {
            fallback: {},
            context: 'appSystemConfig',
        });
        const rawCancellationBannerTexts = safeJsonParse(allParams['cancellation_banner_texts']?.asString(), {
            fallback: {},
            context: 'cancellationBannerTexts',
        });
        // Validate each key separately and fallback if necessary
        const partialConfigs = {
            tracking_mode: this.validateOrDefault(
                ConfigsSchema.fields.tracking_mode,
                rawTrackingMode,
                defaultConfigs.tracking_mode,
            ),
            feature_flags: this.validateOrDefault(
                ConfigsSchema.fields.feature_flags,
                rawFeatureFlags,
                defaultConfigs.feature_flags,
            ),
            carousel_banner_config: this.validateOrDefault(
                ConfigsSchema.fields.carousel_banner_config,
                rawCarouselBannerConfig,
                defaultConfigs.carousel_banner_config,
            ),
            system_configs: this.validateOrDefault(
                ConfigsSchema.fields.system_configs,
                rawSystemConfigs,
                defaultConfigs.system_configs,
            ),
            enabled_services: this.validateOrDefault(
                ConfigsSchema.fields.enabled_services,
                rawEnabledServices,
                defaultConfigs.enabled_services,
            ),
            allowed_languages: this.validateOrDefault(
                ConfigsSchema.fields.allowed_languages,
                rawAllowedLanguages,
                defaultConfigs.allowed_languages,
            ),
            explore_section: this.validateOrDefault(
                ConfigsSchema.fields.explore_section,
                rawExploreSection,
                defaultConfigs.explore_section,
            ),
            support_number: this.validateOrDefault(
                ConfigsSchema.fields.support_number,
                rawSupportNumbers,
                defaultConfigs.support_number,
            ),
            hourly_rental: this.validateOrDefault(
                ConfigsSchema.fields.hourly_rental,
                hourlyRentals,
                defaultConfigs.hourly_rental,
            ),
            intercity_recommendations: this.validateOrDefault(
                ConfigsSchema.fields.intercity_recommendations,
                intercityRecommendations,
                defaultConfigs.intercity_recommendations,
            ),
            nearby_events: this.validateOrDefault(
                ConfigsSchema.fields.nearby_events,
                nearByEventsConfig,
                defaultConfigs.nearby_events,
            ),
            enabled_services_v2: this.validateOrDefault(
                ConfigsSchema.fields.enabled_services_v2,
                rawEnabledServicesV2,
                defaultConfigs.enabled_services_v2,
            ),
            new_feature_flags: this.validateOrDefault(
                ConfigsSchema.fields.new_feature_flags,
                rawNewFeatureFlags,
                defaultConfigs.new_feature_flags,
            ),
            customer_cancellation_banner_threshold: this.validateOrDefault(
                ConfigsSchema.fields.customer_cancellation_banner_threshold,
                rawCustomerCancellationThresholdConfig,
                defaultConfigs.customer_cancellation_banner_threshold,
            ),
            cancellation_banner_texts: this.validateOrDefault(
                ConfigsSchema.fields.cancellation_banner_texts,
                rawCancellationBannerTexts,
                defaultConfigs.cancellation_banner_texts,
            ),
            clarity_config: this.validateOrDefault(
                ConfigsSchema.fields.clarity_config,
                rawClarityConfig,
                defaultConfigs.clarity_config,
            ),
            contact_support: this.validateOrDefault(
                ConfigsSchema.fields.contact_support,
                rawContactSupport,
                defaultConfigs.contact_support,
            ),
            app_based_onboarding: this.validateOrDefault(
                ConfigsSchema.fields.app_based_onboarding,
                rawAppBasedOnboarding,
                defaultConfigs.app_based_onboarding,
            ),
            personal_mail_services_names: this.validateOrDefault(
                ConfigsSchema.fields.personal_mail_services_names,
                rawPersonalMailServicesNames,
                defaultConfigs.personal_mail_services_names,
            ),
            nearby_drivers: this.validateOrDefault(
                ConfigsSchema.fields.nearby_drivers,
                nearbyDriversConfig,
                defaultConfigs.nearby_drivers,
            ),
            homescreen_modules: this.validateOrDefault(
                ConfigsSchema.fields.homescreen_modules,
                homescreenModulesConfig,
                defaultConfigs.homescreen_modules,
            ),
            rotating_text: this.validateOrDefault(
                ConfigsSchema.fields.rotating_text,
                rotatingText,
                defaultConfigs.rotating_text,
            ),
            boosted_rotating_text: this.validateOrDefault(
                ConfigsSchema.fields.boosted_rotating_text,
                boostedRotatingText,
                defaultConfigs.boosted_rotating_text,
            ),
            use_slider_or_pill: this.validateOrDefault(
                ConfigsSchema.fields.use_slider_or_pill,
                useSliderOrPill,
                defaultConfigs.use_slider_or_pill,
            ),
            pledge_config: this.validateOrDefault(
                ConfigsSchema.fields.pledge_config,
                pledgeConfig,
                defaultConfigs.pledge_config,
            ),
            banner_popups_config: this.validateOrDefault(
                ConfigsSchema.fields.banner_popups_config,
                bannerPopupsConfig,
                defaultConfigs.banner_popups_config,
            ),
            filter_autocomplete: this.validateOrDefault(
                ConfigsSchema.fields.filter_autocomplete,
                filterAutocomplete,
                defaultConfigs.filter_autocomplete,
            ),
            city_lottie_config: this.validateOrDefault(
                ConfigsSchema.fields.city_lottie_config,
                cityLottieConfig,
                defaultConfigs.city_lottie_config,
            ),
            referral_payout_config_v2: this.validateOrDefault(
                ConfigsSchema.fields.referral_payout_config_v2,
                referralPayoutConfigV2,
                defaultConfigs.referral_payout_config_v2,
            ),

            driver_highlight_config: this.validateOrDefault(
                ConfigsSchema.fields.driver_highlight_config,
                driverHighlightConfig,
                defaultConfigs.driver_highlight_config,
            ),
            dynamic_cancellation_reasons: this.validateOrDefault(
                ConfigsSchema.fields.dynamic_cancellation_reasons,
                dynamicCancellationReasons,
                defaultConfigs.dynamic_cancellation_reasons,
            ),
            tab_screens_config: this.validateOrDefault(
                ConfigsSchema.fields.tab_screens_config,
                tabScreensConfig,
                defaultConfigs.tab_screens_config,
            ),
            enabled_services_v3: this.validateOrDefault(
                ConfigsSchema.fields.enabled_services_v3,
                rawEnabledServicesV3,
                defaultConfigs.enabled_services_v3,
            ),
            kapture_config: this.validateOrDefault(
                ConfigsSchema.fields.kapture_config,
                kaptureConfig,
                defaultConfigs.kapture_config,
            ),
            oy_boating_placeId: this.validateOrDefault(
                ConfigsSchema.fields.oy_boating_placeId,
                boatingPlaceConfig,
                defaultConfigs.oy_boating_placeId,
            ),
            skip_and_start_journey: this.validateOrDefault(
                ConfigsSchema.fields.skip_and_start_journey,
                skipAndStartJourneyConfig,
                defaultConfigs.skip_and_start_journey,
            ),
            movie_promotional_config: this.validateOrDefault(
                ConfigsSchema.fields.movie_promotional_config,
                moviePromotionalConfig,
                defaultConfigs.movie_promotional_config,
            ),
            city_base_ad_image: this.validateOrDefault(
                ConfigsSchema.fields.city_base_ad_image,
                cityBaseAdImageConfig,
                defaultConfigs.city_base_ad_image,
            ),
            app_system_config: this.validateOrDefault(
                ConfigsSchema.fields.app_system_config,
                appSystemConfig,
                defaultConfigs.app_system_config,
            ),
        };
        return partialConfigs;
    }

    /**
     * Fetch city-specific configurations
     */
    getCityConfig<K extends ConfigKeyByContext['city']>(key: K, city: City): Configs[K][City] {
        const cacheKey = `${key}_${city}`;

        if (!this.cache[cacheKey]) {
            const computedValue = (() => {
                const remoteConfigInstance = getRemoteConfig();
                const value = getString(remoteConfigInstance, key);

                if (!value || USE_LOCAL_CONFIGS) return defaultConfigs[key][city];

                try {
                    const parsed = safeJsonParse(value, defaultConfigs[key], `cityConfig_${key}`);
                    return deepMerge(defaultConfigs[key], parsed)[city];
                } catch (error) {
                    console.error(`Config parse error for "${key}":`, error);
                    return defaultConfigs[key].default;
                }
            })();

            this.cache = {
                ...this.cache,
                [cacheKey]: computedValue,
            };
        }

        return this.cache[cacheKey];
    }

    getAppSystemCityConfig = (city: City, fallback: AppConfigCityType): AppConfigCityType => {
        const cacheKey = `app_system_config_${city}`;

        if (!this.cache[cacheKey]) {
            const computedValue = (() => {
                const remoteConfigInstance = getRemoteConfig();
                const value = getString(remoteConfigInstance, 'app_system_config');

                if (!value || USE_LOCAL_CONFIGS) return fallback;

                try {
                    const data = safeJsonParse(value, undefined, `cityConfig_app_system_config`);
                    return data ? data[city] : fallback;
                } catch (error) {
                    console.error(`Config parse error for "app_system_config":`, error);
                    return fallback;
                }
            })();

            this.cache = {
                ...this.cache,
                [cacheKey]: computedValue,
            };
        }

        return this.cache[cacheKey];
    };

    getAppSystemConfig = (appName: appName, city: City): AppConfigType => {
        const cacheKey = `${appName}-${city}`;

        if (!this.cache[cacheKey]) {
            const appConfig = defaultConfigs['app_system_config'][appName]['default'] ?? {};
            const cityConfig = defaultConfigs['app_system_config'][appName][city] ?? {};
            const appRemoteConfig = this.getAppSystemCityConfig('default', {});
            const cityRemoteConfig = this.getAppSystemCityConfig(city, {});
            const finalAppConfig = deepNestedMerge(appConfig, appRemoteConfig);
            const finalCityConfig = deepNestedMerge(cityConfig, cityRemoteConfig);
            const finalConfig = deepNestedMerge(defaultAppConfigs, finalAppConfig, finalCityConfig);

            this.cache = {
                ...this.cache,
                [cacheKey]: finalConfig,
            };
        }

        return this.cache[cacheKey];
    };

    /**
     * Get config for app name (e.g. namma_yatri, juspay, beckn)
     */
    getTrackingModeConfig<K extends ConfigKeyByContext['tracking_mode']>(
        key: K,
        mode: TrackingMode,
    ): Configs[K][TrackingMode] {
        const cacheKey = `${key}_${mode}`;

        if (!this.cache[cacheKey]) {
            const computedValue = (() => {
                const remoteConfigInstance = getRemoteConfig();
                const value = getString(remoteConfigInstance, key);

                if (!value || USE_LOCAL_CONFIGS) return defaultConfigs[key][mode];

                try {
                    const parsed = safeJsonParse(value, defaultConfigs[key], `trackingModeConfig_${key}`);
                    return deepMerge(defaultConfigs[key], parsed)[mode];
                } catch (error) {
                    console.error(`Config parse error for "${key}":`, error);
                    return defaultConfigs[key][mode];
                }
            })();

            this.cache = {
                ...this.cache,
                [cacheKey]: computedValue,
            };
        }

        return this.cache[cacheKey];
    }

    getAppBasedConfig<K extends ConfigKeyByContext['app']>(key: K, appName: appName): Configs[K][appName] {
        const cacheKey = `${key}_${appName}`;

        if (!this.cache[cacheKey]) {
            const computedValue = (() => {
                const remoteConfigInstance = getRemoteConfig();
                const value = getString(remoteConfigInstance, key);

                if (!value || USE_LOCAL_CONFIGS) return defaultConfigs[key][appName];

                try {
                    const parsed = safeJsonParse(value, defaultConfigs[key], `appBasedConfig_${key}`);
                    return deepMerge(defaultConfigs[key], parsed)[appName];
                } catch (error) {
                    console.error(`Config parse error for "${key}":`, error);
                    return defaultConfigs[key].odishaYatri;
                }
            })();

            this.cache = {
                ...this.cache,
                [cacheKey]: computedValue,
            };
        }

        return this.cache[cacheKey];
    }

    /**
     * Helper to get feature flags based on city
     *
     * @Deprecated Function, we can directly call getTrackingModeConfig instead with the key
     *
     */
    getFeatureFlags(city: City): Configs['feature_flags'][TrackingMode] {
        const trackingMode = this.getCityConfig('tracking_mode', city);
        return this.getTrackingModeConfig('feature_flags', trackingMode);
    }
    getAllowedLanguages(city: City): Configs['allowed_languages'][City] {
        return this.getCityConfig('allowed_languages', city);
    }
    getSafetyHelplineNumber(city: City): Configs['support_number'][City] {
        return this.getCityConfig('support_number', city);
    }

    getHourlyRental(city: City): Configs['hourly_rental'][City] {
        return this.getCityConfig('hourly_rental', city);
    }

    getNearbyEvents(city: City): Configs['nearby_events'][City] {
        return this.getCityConfig('nearby_events', city);
    }

    getContactSupport(appName: appName): Configs['contact_support'][appName] {
        return this.getAppBasedConfig('contact_support', appName);
    }
    getAppBasedOnboarding(appName: appName): Configs['app_based_onboarding'][appName] {
        return this.getAppBasedConfig('app_based_onboarding', appName);
    }
    getPersonalMailServicesNames(city: City): Configs['personal_mail_services_names'][City] {
        return this.getCityConfig('personal_mail_services_names', city);
    }
    getNewFeatureFlags(city: City): Configs['new_feature_flags'][City] {
        return this.getCityConfig('new_feature_flags', city);
    }

    getReferralPayoutConfigV2(city: City): Configs['referral_payout_config_v2'][City] {
        return this.getCityConfig('referral_payout_config_v2', city);
    }

    getNearbyDriversConfig(): Configs['nearby_drivers'] {
        try {
            const remoteConfigInstance = getRemoteConfig();
            const value = getString(remoteConfigInstance, 'nearby_drivers');

            const parsedValue = safeJsonParse<NearbyDriversConfig>(
                value,
                defaultConfigs['nearby_drivers'],
                'nearbyDriversConfig',
            );
            return parsedValue;
        } catch (error) {
            console.error(`Failed to parse config for key "nearby_drivers":`, error);
            return defaultConfigs['nearby_drivers'];
        }
    }

    getBoatingPlaceConfig(city: City): Configs['oy_boating_placeId'][City] {
        return this.getCityConfig('oy_boating_placeId', city);
    }

    /**
     * Get banner popups config from remote config
     */
    getBannerPopupsConfig(): Configs['banner_popups_config'] {
        const cacheKey = 'banner_popups_config';

        if (!this.cache[cacheKey]) {
            const computedValue = (() => {
                const remoteConfigInstance = getRemoteConfig();
                const value = getString(remoteConfigInstance, 'banner_popups_config');

                if (!value || USE_LOCAL_CONFIGS) return defaultConfigs.banner_popups_config;

                try {
                    const parsed = safeJsonParse<BannerPopupsConfig>(
                        value,
                        defaultConfigs.banner_popups_config,
                        `banner_popups_config`,
                    );
                    return deepMerge(defaultConfigs.banner_popups_config, parsed);
                } catch (error) {
                    console.error(`Config parse error for "banner_popups_config":`, error);
                    return defaultConfigs.banner_popups_config;
                }
            })();

            this.cache = {
                ...this.cache,
                [cacheKey]: computedValue,
            };
        }

        return this.cache[cacheKey];
    }

    getDriverHighlightConfig(city: City): Configs['driver_highlight_config'][City] {
        const cacheKey = `driver_highlight_config_${city}`;

        if (!this.cache[cacheKey]) {
            const computedValue = (() => {
                const remoteConfigInstance = getRemoteConfig();
                const value = getString(remoteConfigInstance, 'driver_highlight_config');

                if (!value || USE_LOCAL_CONFIGS) {
                    return (
                        defaultConfigs.driver_highlight_config[city] || defaultConfigs.driver_highlight_config.default
                    );
                }

                try {
                    const parsed = safeJsonParse(
                        value,
                        defaultConfigs.driver_highlight_config.default,
                        `driver_highlight_config`,
                    );

                    if (!parsed) {
                        return (
                            defaultConfigs.driver_highlight_config[city] ||
                            defaultConfigs.driver_highlight_config.default
                        );
                    }

                    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                    const remoteConfig: any =
                        parsed && typeof parsed === 'object' && 'driver_highlight_config' in parsed
                            ? parsed.driver_highlight_config
                            : parsed;
                    if (remoteConfig && typeof remoteConfig === 'object') {
                        return (
                            remoteConfig[city] || remoteConfig.default || defaultConfigs.driver_highlight_config.default
                        );
                    }
                    return (
                        defaultConfigs.driver_highlight_config[city] || defaultConfigs.driver_highlight_config.default
                    );
                } catch {
                    return (
                        defaultConfigs.driver_highlight_config[city] || defaultConfigs.driver_highlight_config.default
                    );
                }
            })();

            this.cache = {
                ...this.cache,
                [cacheKey]: computedValue,
            };
        }

        return this.cache[cacheKey];
    }

    getKaptureConfig(city: City): Configs['kapture_config'][City] {
        try {
            const remoteConfigInstance = getRemoteConfig();
            const value = getString(remoteConfigInstance, 'kapture_config');
            const parsedValue: Configs['kapture_config'] = safeJsonParse(
                value,
                defaultConfigs['kapture_config'],
                'kaptureConfig',
            );
            return parsedValue[city] || defaultConfigs['kapture_config'][city];
        } catch (error) {
            console.error(`Failed to parse config for key "kapture_config":`, error);
            return defaultConfigs['kapture_config'][city];
        }
    }
    getMoviePromotionalConfig(city: City): Configs['movie_promotional_config'][City] {
        return this.getCityConfig('movie_promotional_config', city);
    }

    /**
     * Get dynamic cancellation reasons config from remote config
     */
    getDynamicCancellationReasonsConfig(): Configs['dynamic_cancellation_reasons'] {
        const cacheKey = 'dynamic_cancellation_reasons';

        if (!this.cache[cacheKey]) {
            const computedValue = (() => {
                const remoteConfigInstance = getRemoteConfig();
                const value = getString(remoteConfigInstance, 'dynamic_cancellation_reasons');

                if (!value || USE_LOCAL_CONFIGS) return defaultConfigs.dynamic_cancellation_reasons;

                try {
                    const parsed = safeJsonParse<DynamicCancellationReasonsConfig>(
                        value,
                        defaultConfigs.dynamic_cancellation_reasons,
                        `dynamic_cancellation_reasons`,
                    );
                    return deepMerge(defaultConfigs.dynamic_cancellation_reasons, parsed);
                } catch (error) {
                    console.error(`Config parse error for "dynamic_cancellation_reasons":`, error);
                    return defaultConfigs.dynamic_cancellation_reasons;
                }
            })();

            this.cache = {
                ...this.cache,
                [cacheKey]: computedValue,
            };
        }

        return this.cache[cacheKey];
    }

    /**
     * Get filtered dynamic cancellation reasons based on city
     */
    getFilteredDynamicCancellationReasons(city: City): Configs['dynamic_cancellation_reasons']['reasons'] {
        const config = this.getDynamicCancellationReasonsConfig();
        return config.reasons.filter(reason => {
            const { visibility } = reason;

            if (visibility.type === 'include') {
                return visibility.cities.includes(city);
            } else if (visibility.type === 'exclude') {
                return !visibility.cities.includes(city);
            }

            return false;
        });
    }

    getTabScreensConfig(city: City): Configs['tab_screens_config'][City] {
        return this.getCityConfig('tab_screens_config', city);
    }

    getCityBaseAdImageConfig(city: City): Configs['city_base_ad_image'][City] {
        return this.getCityConfig('city_base_ad_image', city);
    }

    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    validateOrDefault<T>(schema: any, data: unknown, fallback: T): T {
        if (JSON.stringify(data) === '{}') {
            console.error('falling back to default', data);
            return fallback;
        }
        const result = schema.validate(data);
        return result.success ? result.value : fallback;
    }

    clearCache(): undefined {
        this.cache = {};
    }
}

export const createConfigManager = (): ConfigManager => {
    const firebaseProvider = new FirebaseRemoteConfigDataSource();
    return new ConfigManager(firebaseProvider);
};

const firebaseProvider = new FirebaseRemoteConfigDataSource();
export const configManager = new ConfigManager(firebaseProvider);
