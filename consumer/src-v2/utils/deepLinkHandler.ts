import { useNavigation } from '@react-navigation/native';
import { RootNavigationParamList } from '@/typescript/navigation/globalParamList';
import { ParsedUrl, urlParser, extractUtmParams, getUtmLatLon } from './urlParser';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    BottomSheetStage,
    selectAppName,
    selectOperatingCity,
    setBottomSheetStage,
    setDeepLinkUrl,
    setUtmParams,
    updateSelectedSearchedStop,
    UtmParams,
} from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useFollowRideMutation } from '@/typescript/state/server/followRide';
import { useLazyFollowRideRideIdCustomerDetailsGetQuery } from '@/api/integrations/rtk/FollowRideRideIdCustomerDetailsGet';
import { followers } from '@/readOnly/api/types/Followers.gen';
import { setCurrentFollower } from '@/typescript/state/client/user';
import { selectToken } from '@/typescript/state/client/auth';
import { useEffect } from 'react';
import { recordCampaignMetric } from '@/typescript/utils/marketingTracking';
import { getInstallReferrerParams } from '@/typescript/utils/referrer';
import { Linking, Platform } from 'react-native';
import { capitalize } from 'lodash';
import { MMKVKey, setBoolItem } from '@/typescript/utils/MMKV';
import { initialUpdateProfileReq, useUpdateProfileMutation } from '@/typescript/state/server/userApi';
import { useProfileMarketingEventsPostMutation } from '@/api/integrations/rtk/ProfileMarketingEventsPost';
import { BusOtpActivateFlowProps } from '../multimodal/screens/BusOtpFlow/Types';
import { getAsyncSourceLocation } from './common';

type CustomLinkingEvent = {
    url: string;
};

export const useDeepLinkHandler = () => {
    const userToken = useAppSelector(selectToken);
    const navigation = useNavigation<NativeStackNavigationProp<RootNavigationParamList>>();
    const dispatch = useAppDispatch();
    const [followRideCall] = useFollowRideMutation();
    const [getFollowRideBooking] = useLazyFollowRideRideIdCustomerDetailsGetQuery();
    const operatingCity = useAppSelector(selectOperatingCity);
    const [updateProfile] = useUpdateProfileMutation();
    const appName = useAppSelector(selectAppName);

    const deepLinkListenerFunction = async (event: CustomLinkingEvent) => {
        const url = event.url;
        const cityInPascalCase = capitalize(operatingCity);
        if (url) {
            console.info('Received deep link:', url);

            const urlObject = new URL(url);
            const parsedUrlObject: ParsedUrl | null = urlParser(urlObject);

            // Extract UTM parameters
            const utmParams = extractUtmParams(urlObject);
            const { pandalLat, pandalLon } = getUtmLatLon(urlObject);

            getAsyncSourceLocation(pandalLat, pandalLon).then(destination => {
                dispatch(updateSelectedSearchedStop(destination?.location ?? null));
            });

            // Log UTM parameters to CleverTap if any are present
            if (Object.values(utmParams).some(value => value !== undefined)) {
                try {
                    await updateProfile({
                        ...initialUpdateProfileReq,
                        marketingParams: {
                            gclId: utmParams.gclid,
                            userType: 'OLD',
                            utmCampaign: utmParams.utm_campaign,
                            utmContent: utmParams.utm_content,
                            utmCreativeFormat: utmParams.utm_creative_format,
                            utmMedium: utmParams.utm_medium,
                            utmSource: utmParams.utm_source,
                            utmTerm: utmParams.utm_term,
                            appName: appName,
                        },
                    }).unwrap();
                } catch (err) {
                    console.error('sending MarketingParams failed in deepLinkHandler:', err);
                }
            }

            // Parsing issue during urlParser
            if (!parsedUrlObject) {
                console.error('Deep Link Parsing issue');
                return;
            }

            switch (parsedUrlObject?.pathname) {
                case '/bus-qr': {
                    const fleetId = parsedUrlObject?.queryParams['f'];
                    const navigationParams: BusOtpActivateFlowProps = {
                        legInfo: undefined,
                        journeyId: '',
                        legOrder: 0,
                        subLegOrder: 0,
                        autoFillOtp: fleetId,
                        type: 'Activate',
                    };
                    setTimeout(() => {
                        navigation.navigate('mainNavigation', {
                            screen: 'HomeTab',
                            params: {
                                screen: 'busOtpFlow',
                                params: {
                                    state: 'Booking',
                                    params: navigationParams,
                                    displaySearchBar: false,
                                    activePassId: undefined,
                                    locationData: undefined,
                                },
                            },
                        });
                    }, 500);
                    return;
                }
                case '/refer': {
                    dispatch(setDeepLinkUrl(parsedUrlObject));
                    navigation.navigate('mainNavigation', {
                        screen: 'mainTabNavigation',
                        params: {
                            screen: 'homeTab_homeScreen',
                        },
                    });
                    return;
                }
                case '/u': {
                    switch (parsedUrlObject.queryParams['vp']) {
                        case 'shareRide': {
                            const rideId = parsedUrlObject.queryParams['rideId'];
                            await getFollowRideBooking({ rideId: rideId ?? '' }).then(async followRideData => {
                                await followRideCall({}).then(follersData => {
                                    const maybeFollower = follersData.data.filter(
                                        (v: followers) => v.bookingId === followRideData.data?.bookingId,
                                    )[0];
                                    const follower: followers = maybeFollower ?? {
                                        bookingId: followRideData.data?.bookingId ?? '',
                                        mobileNumber: followRideData.data?.customerPhone ?? '',
                                        name: followRideData.data?.customerName,
                                        personId: '',
                                        priority: -1,
                                    };
                                    dispatch(setCurrentFollower({ id: userToken, payload: follower }));
                                    setTimeout(
                                        () =>
                                            navigation.navigate('mainNavigation', {
                                                screen: 'followRide',
                                                params: {
                                                    defaultFollower: follower,
                                                    shouldOpenChat: undefined,
                                                },
                                            }),
                                        200,
                                    );
                                });
                            });

                            break;
                        }
                        case 'pujaPandal': {
                            setTimeout(() => {
                                dispatch(
                                    setBottomSheetStage({
                                        stage: BottomSheetStage.ConfirmPickup,
                                        src: 'searchForRides_dest',
                                    }),
                                );
                                navigation.navigate('mainNavigation', {
                                    screen: 'HomeTab',
                                    params: {
                                        screen: 'baseHybridFlow',
                                        params: {
                                            viewParam: '',
                                            sharedPrefValues: {
                                                CUSTOMER_LOCATION: cityInPascalCase,
                                            },
                                        },
                                    },
                                });
                            }, 500);
                            break;
                        }
                        case 'refE': {
                            setTimeout(
                                () =>
                                    navigation.navigate('mainNavigation', {
                                        screen: 'ProfileTab',
                                        params: {
                                            screen: 'referralNavigator',
                                            params: {
                                                screen: 'referralScreen',
                                            },
                                        },
                                    }),
                                500,
                            );
                            break;
                        }
                        case 'tkts': {
                            // Opening the hybrid attraction ticketing flow
                            setTimeout(
                                () =>
                                    navigation.navigate('mainNavigation', {
                                        screen: 'HomeTab',
                                        params: {
                                            screen: 'baseHybridFlow',
                                            params: {
                                                viewParam: 'tkts',
                                                sharedPrefValues: {
                                                    CUSTOMER_LOCATION: cityInPascalCase,
                                                },
                                            },
                                        },
                                    }),
                                500,
                            );
                            break;
                        }
                        case 'bt': {
                            // Opening the hybrid bus tracking flow
                            setTimeout(
                                () =>
                                    navigation.navigate('mainNavigation', {
                                        screen: 'HomeTab',
                                        params: {
                                            screen: 'baseHybridFlow',
                                            params: {
                                                viewParam: 'bt',
                                                sharedPrefValues: {
                                                    LAST_KNOWN_LAT: MMKVKey.LAST_KNOWN_LAT,
                                                    LAST_KNOWN_LON: MMKVKey.LAST_KNOWN_LON,
                                                },
                                            },
                                        },
                                    }),
                                500,
                            );
                            break;
                        }
                        case 'delivery': {
                            // Opening the hybrid delivery flow
                            setTimeout(() => {
                                navigation.navigate('mainNavigation', {
                                    screen: 'HomeTab',
                                    params: {
                                        screen: 'baseHybridFlow',
                                        params: {
                                            viewParam: 'delivery',
                                            sharedPrefValues: {},
                                        },
                                    },
                                });
                            }, 500);
                            break;
                        }
                        default:
                            return;
                    }
                    break;
                }
                default:
                    return;
            }
        }
    };

    useEffect(() => {
        const deepLinkListener = Linking.addEventListener('url', deepLinkListenerFunction);
        // Handle initial app open via deep link
        Linking.getInitialURL().then(url => {
            if (url) deepLinkListenerFunction({ url });
        });

        return () => {
            deepLinkListener.remove();
        };
    }, []);
};

export const useOnboardingDeepLinkHandler = () => {
    const [postCall] = useProfileMarketingEventsPostMutation();
    const appName = useAppSelector(selectAppName);
    const dispatch = useAppDispatch();

    const processUtmParams = async (utmParams: UtmParams) => {
        console.info('[DeepLinkHandler] Processing UTM params:', utmParams);
        if (Object.values(utmParams).some(value => value !== undefined)) {
            try {
                console.info('[DeepLinkHandler] UTM params present, sending to backend...');
                setBoolItem(MMKVKey.UTM_DATA_SEND, true);
                postCall({
                    body: {
                        marketingParams: {
                            gclId: utmParams.gclid,
                            userType: 'OLD',
                            utmCampaign: utmParams.utm_campaign,
                            utmContent: utmParams.utm_content,
                            utmCreativeFormat: utmParams.utm_creative_format,
                            utmMedium: utmParams.utm_medium,
                            utmSource: utmParams.utm_source,
                            utmTerm: utmParams.utm_term,
                            appName: appName,
                        },
                        merchantName: appName,
                    },
                });
                dispatch(setUtmParams(utmParams));

                // Record install in Firestore if campaignId is present
                if (utmParams.campaignId) {
                    console.info('[DeepLinkHandler] Recording campaign metric (install) for:', utmParams.campaignId);
                    recordCampaignMetric(utmParams.campaignId, 'installs');
                } else {
                    console.info('[DeepLinkHandler] No campaignId present to record metric.');
                }
            } catch (err) {
                console.error('[DeepLinkHandler] Sending MarketingParams failed:', err);
            }
        } else {
            console.info('[DeepLinkHandler] No UTM params found to process.');
        }
    };

    const deepLinkListenerFunction = async (event: CustomLinkingEvent) => {
        const url = event.url;
        if (url) {
            console.info('[DeepLinkHandler] Received deep link in Onboarding:', url);

            const urlObject = new URL(url);
            const parsedUrlObject: ParsedUrl | null = urlParser(urlObject);

            const utmParams = extractUtmParams(urlObject);
            console.info('[DeepLinkHandler] Extracted UTM params from URL:', utmParams);
            await processUtmParams(utmParams);

            if (!parsedUrlObject) {
                console.error('[DeepLinkHandler] Deep Link Parsing issue');
                return;
            }
        }
    };

    useEffect(() => {
        const deepLinkListener = Linking.addEventListener('url', deepLinkListenerFunction);
        Linking.getInitialURL().then(async url => {
            if (url) {
                deepLinkListenerFunction({ url });
            } else if (Platform.OS === 'android') {
                // If no deep link, check for install referrer on Android
                const referrerParams = await getInstallReferrerParams();
                if (referrerParams) {
                    console.info('[DeepLinkHandler] Captured install referrer:', referrerParams);
                    await processUtmParams(referrerParams);
                }
            }
        });

        return () => {
            deepLinkListener.remove();
        };
    }, []);
};
