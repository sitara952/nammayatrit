/**
 * ts-expect-error in this file are necessary due to React Navigation's overload limitations.
 * TypeScript cannot match discriminated union types to function overloads.
 * Type safety is enforced at call sites via NavigationConfig.
 */

import { ActionContext } from './context';
import { getAddressFromComponents } from '@/helpers/utils/Location/LocationUtils.bs.js';
import type { location as LocationType } from '@/helpers/utils/Location/LocationTypes.gen';
import type { DestinationPayload } from '@/src-v2/systems/configs/types';
import { ActionIdentifier, ActionPayloadMap } from './types';
import { navigationRef } from '@/typescript/navigation/RootNavigation';
import { BottomSheetStage } from '@/typescript/state/client/session';
import type { ticketPlaceResp } from '@/readOnly/api/types/TicketPlaceResp.gen';

const bottomSheetStageMap: Record<string, BottomSheetStage> = {
    Home: BottomSheetStage.Home,
    Search: BottomSheetStage.Search,
    IntercitySearchDetails: BottomSheetStage.IntercitySearchDetails,
    ConfirmPickup: BottomSheetStage.ConfirmPickup,
    SearchErrorStates: BottomSheetStage.SearchErrorStates,
    LookingForRides: BottomSheetStage.LookingForRides,
    ChooseRide: BottomSheetStage.ChooseRide,
    RetryBoostedSearch: BottomSheetStage.RetryBoostedSearch,
};

const navigatorMap = {
    mainTab: 'mainTabNavigation',
    servicesTab: 'ServicesTab',
    homeTab: 'HomeTab',
    profileTab: 'ProfileTab',
    liveTab: 'LiveTab',
    ticketsTab: 'TicketsTab',
    passesTab: 'PassesTab',
};

const shouldNavigateToHomeTab = (): boolean => {
    const currentRoute = navigationRef.getCurrentRoute();
    const isOnHomeTab = currentRoute?.name?.includes('homeTab_homeScreen') ?? false;
    return !isOnHomeTab;
};

const buildLocationFromDestination = (raw: DestinationPayload): LocationType => ({
    title: raw.name,
    subtitle: raw.address ?? undefined,
    lat: raw.lat ?? undefined,
    lng: raw.lon ?? undefined,
    specialLocation: undefined,
    placeId: undefined,
    tag: 'AUTOCOMPLETE',
    addressComponents: getAddressFromComponents(raw.address ?? ',', undefined, undefined) ?? undefined,
    serviceable: true,
    serviceabilityCity: undefined,
    formattedAddress: undefined,
    locationType: undefined,
    distanceFromCurrentLocation: undefined,
    hotSpotInfo: undefined,
});

type ActionHandlerMap = {
    [K in ActionIdentifier]: (context: ActionContext, payload: ActionPayloadMap[K]) => void;
};

const baseHandlers: ActionHandlerMap = {
    navigateToScreen: (context, payload) => {
        const nav = payload.actionData;

        if (nav.navigator === 'servicesTab' && nav.screen === 'extendedBookingNavigator') {
            context.dispatch(context.actions.clearRentalState());
        }

        if (
            nav.navigator === 'homeTab' &&
            nav.screen === 'baseHybridFlow' &&
            nav.params &&
            'viewParam' in nav.params &&
            nav.params.viewParam === 'mt'
        ) {
            context.utils.logEvent(context.constants.EventName.NY_USER_METRO_TICKETS);
        }

        if (nav.navigator === 'root') {
            // @ts-expect-error - React Navigation type limitation with dynamic navigation
            context.navigation.navigate(nav.screen, nav.params);
            return;
        }

        const navigatorName = navigatorMap[nav.navigator];

        if (nav.navigator === 'mainTab') {
            // @ts-expect-error - React Navigation type limitation with dynamic navigation
            context.navigation.navigate(navigatorName, { screen: nav.screen }, { pop: nav.pop ?? false });
        } else {
            const params =
                nav.navigator === 'homeTab' &&
                nav.screen === 'baseHybridFlow' &&
                nav.params &&
                'sharedPrefValues' in nav.params
                    ? {
                          ...nav.params,
                          sharedPrefValues: {
                              ...nav.params.sharedPrefValues,
                              CUSTOMER_LOCATION: context.utils.capitalize(context.state.operatingCity),
                          },
                      }
                    : nav.params;

            // @ts-expect-error - React Navigation type limitation with dynamic navigation
            context.navigation.navigate(navigatorName, { screen: nav.screen, params }, { pop: nav.pop ?? false });
        }
    },

    navigateToStage: (context, payload) => {
        const stageValue = payload.actionData;
        const stage = bottomSheetStageMap[stageValue] ?? BottomSheetStage.Home;

        if (shouldNavigateToHomeTab()) {
            context.navigation.navigate('mainTabNavigation', { screen: 'homeTab_homeScreen' }, { pop: true });
        }

        if (stage === BottomSheetStage.Search && payload.source === 'AMBULANCE_SERVICE') {
            context.dispatch(context.actions.setAmbulanceServiceClicked(true));
            context.dispatch(context.actions.setFareProductType('AMBULANCE'));
        }

        context.dispatch(
            context.actions.setBottomSheetStage({
                stage,
                src: 'Home_action_navigateToStage',
            }),
        );
    },

    redbus: (context, payload) => {
        const url = payload.actionData ?? 'https://app-nammayatri.redbus.in/';

        context.dispatch(context.actions.setRedbusWebviewUrl(url));

        if (context.state.mbpermissionForRedbus === context.constants.RedBusState.Allow && context.state.mobileNumber) {
            context.navigation.navigate('webView', {
                url: `${url}?mobileNo=${context.state.mobileNumber}`,
                goBack: undefined,
            });
        } else if (context.state.mbpermissionForRedbus === context.constants.RedBusState.Deny) {
            context.navigation.navigate('webView', {
                url,
                goBack: undefined,
            });
        } else {
            context.refs.redbusWebviewRef.current?.present();
        }
    },

    openBoating: (context, _payload) => {
        const placeId = context.state.boatingPlaceConfig.boatingPlaceId;

        if (!placeId) return;

        context.utils
            .getTicketPlaces({ placeId })
            .unwrap()
            .then((ticketData: ticketPlaceResp) => {
                context.navigation.navigate('EventDetails', { place: ticketData });
            })
            .catch((error: Error) => {
                console.error('Error loading boating ticket places:', error);
            });
    },

    showNammaTransitPopup: (context, _payload) => {
        context.refs.nammaTransitVideoBottomSheetModalRef.current?.present();
    },

    shareApp: (context, _payload) => {
        context.utils.shareApp(
            context.state.operatingCity,
            context.state.userProfile?.customerReferralCode || '',
            context.state.appName,
            context.userLanguageStrings,
            context.state.shareReferralLink,
        );
    },

    openLink: (context, payload) => {
        const url = payload.actionData;
        context.utils.Linking.openURL(url);
    },

    destination: (context, payload) => {
        const rawLocation = payload.actionData;

        const location = buildLocationFromDestination(rawLocation);

        context.dispatch(context.actions.updateSelectedSearchedStop(location));

        if (shouldNavigateToHomeTab()) {
            context.navigation.navigate('mainTabNavigation', { screen: 'homeTab_homeScreen' }, { pop: true });
        }

        context.dispatch(
            context.actions.setBottomSheetStage({
                stage: context.constants.BottomSheetStage.ConfirmPickup,
                src: 'Home_action_destination',
            }),
        );
    },
    navigateTo: (context, payload) => {
        //retaining this for backward compatibility
        const screenName = payload.actionData;

        switch (screenName) {
            case 'safetyScreen':
                context.navigation.navigate('ProfileTab', { screen: 'safetyScreen' }, { pop: true });
                break;

            case 'extendedBookingNavigator':
                context.dispatch(context.actions.clearRentalState());
                context.navigation.navigate(
                    'ServicesTab',
                    {
                        screen: 'extendedBookingNavigator',
                        params: { screen: 'rentalsScreen' },
                    },
                    { pop: true },
                );
                break;

            default:
                console.error(
                    `[navigateTo] Unknown screen name: "${screenName}". Please add mapping or use navigateToScreen with proper navigationConfig.`,
                );
                break;
        }
    },
    navigateToHybridFlow: (context, payload) => {
        const viewParam = payload.actionData.viewParam;
        context.navigation.navigate(
            'HomeTab',
            {
                screen: 'baseHybridFlow',
                params: {
                    viewParam: viewParam,
                    sharedPrefValues: {},
                },
            },
            { pop: true },
        );
    },
};

export const ACTION_HANDLERS = baseHandlers;
