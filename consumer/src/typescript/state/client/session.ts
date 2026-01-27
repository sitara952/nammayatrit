import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState, store } from '../store';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { PURGE } from 'redux-persist';
import { RideChecksType } from '@/typescript/screens/SafetyModal';
import 'react-native-get-random-values';
import uuid from 'react-native-uuid';
import {
    BannerPopupsConfig,
    ConfigKeyByContext,
    Configs,
    LanguageObj,
    newFeatureFlags,
} from '@/src-v2/systems/configs/types';
import { City, Theme, appName } from 'config-types';
import { configManager, ConfigManager, createConfigManager } from '@/src-v2/systems/configs/configManager.ts';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';
import { isEqual, memoize } from 'lodash';
import { defaultConfigs } from '@/src-v2/systems/configs/defaults/defaultConfig';
import { ParsedUrl } from '@/src-v2/utils/urlParser.ts';
import { SNAP_POINT_TYPE } from '@gorhom/bottom-sheet';
import { savedReqLocationAPIEntity } from '@/readOnly/api/types/SavedReqLocationAPIEntity.gen';
import type { Language_language, Language_language as languages } from '@/readOnly/api/types/Enums.gen.tsx';
import { tripLocationObject } from '@/src-v2/helpers/location/types/LocationCachingObject';
import { GeolocationResponse } from '@/typescript/utils/location';
import { NearbyDriversConfig } from '@/src-v2/systems/configs/types';
import { TransformedContact } from '@/typescript/designSystem/components/LiveTrackingModal';
import { fareCacheResp } from '@/readOnly/api/types/FareCacheResp.gen';
import { clearAllJourneyState } from '@/typescript/state/client/journey';
import { clearAllRideState } from '@/typescript/state/client/ride';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { clearOfflineTickets } from '@/src-v2/multimodal/hooks/useOfflineTickets';
import { SubwayPopUpState } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/SubwayPopUps/types';
import { createMMKV } from '@/utils/mmkvUtils';
import { busLocation } from '@/readOnly/api/types/BusLocation.gen';
import { clearPurchasedPassesCache } from '@/src-v2/screens/Passes/BusPass/utils/passCache';
import { RideId } from '@/typescript/state/client/booking';
import { ptRestrictedHours } from '@/api/apiTypes/ServiceabilityApi.gen';

// Import UTM params type from urlParser
export type UtmParams = {
    gclid: string | undefined;
    utm_source: string | undefined;
    utm_medium: string | undefined;
    utm_campaign: string | undefined;
    utm_term: string | undefined;
    utm_content: string | undefined;
    utm_creative_format: string | undefined;
    campaignId: string | undefined;
};

type ToastButton = {
    title: string;
    color: string;
    logo: React.JSX.Element | undefined; //works only with bottomSpanType toast
    onPress: (() => void) | undefined;
};

export type AppStateHolder = 'active' | 'background' | 'inactive';

export const sessionId = uuid.v4();

export type ToastProps = {
    message: string;
    visible: boolean | undefined;
    useSpannedToast: boolean | undefined;
    bottomSpanDescription: string | undefined;
    spannerType: 'top' | 'bottom' | undefined;
    backgroundColor: string | undefined;
    logo: React.JSX.Element | undefined;
    dismissButton: (() => void) | undefined;
    onSpannedToastLoad: (() => void) | undefined;
    buttons: ToastButton[];
    autoDismissAfter: number | undefined;
    margin: string | undefined;
    customToast: React.JSX.Element | undefined;
};

type NetworkState = 'none' | 'slow' | 'okay';

const initialToastProps: ToastProps = {
    message: '',
    useSpannedToast: false,
    onSpannedToastLoad: undefined,
    bottomSpanDescription: undefined,
    spannerType: undefined,
    visible: false,
    backgroundColor: undefined,
    logo: undefined,
    dismissButton: undefined,
    buttons: [],
    autoDismissAfter: undefined,
    margin: undefined,
    customToast: undefined,
};

export type StatusBarProps = {
    backgroundColor: string;
    barStyle: 'default' | 'light-content' | 'dark-content';
    transparentStatusBarHeight: number | undefined;
};

const initialStatusBarProps: StatusBarProps = {
    backgroundColor: 'transparent', // Start with transparent to match translucent:true behavior
    barStyle: 'dark-content',
    transparentStatusBarHeight: undefined,
};

export enum SearchWarningType {
    TripDistanceTooShort,
    EstimatesNotAvailable,
    DriversNotAvailable,
    ApiError,
    None,
    Acknowledged,
}

export enum SearchInput {
    Source,
    Destination,
}

export enum BottomSheetStage {
    Home,
    Search,
    IntercitySearchDetails,
    ConfirmPickup,
    SearchErrorStates,
    LookingForRides,
    ChooseRide,
    RetryBoostedSearch,
}

export type BottomSheetModalStatus = {
    index: number;
    position: number;
    snapPointType: SNAP_POINT_TYPE;
};

export const PopupModalStatusKeys = {
    tryBoostedSearchModal: 'tryBoostedSearchModal',
    rateCardModal: 'rateCardModal',
    tripDetailsModal: 'tripDetailsModal',
    logoutModal: 'logoutModal',
    redBusModal: 'redBusModal',
    retryBoostedSearchModal: 'retryBoostedSearchModal',
    changeVehicleModal: 'changeVehicleModal',
    tipsBottomSheetModal: 'tipsBottomSheetModal',
    cancellationReasonModal: 'cancellationReason',
    cancelRideModal: 'cancelRideModal',
};

export type PopupModalStatusKey = keyof typeof PopupModalStatusKeys;

export type PopupModalStatus = {
    [key in PopupModalStatusKey]?: BottomSheetModalStatus;
};

const defaultBottomSheetModalStatus = {
    index: -1,
    position: 0,
    snapPointType: SNAP_POINT_TYPE.DYNAMIC,
};

const defaultPopupModalStatus = {
    tryBoostedSearchModal: defaultBottomSheetModalStatus,
    rateCardModal: defaultBottomSheetModalStatus,
    tripDetailsModal: defaultBottomSheetModalStatus,
    logoutModal: defaultBottomSheetModalStatus,
    redBusModal: defaultBottomSheetModalStatus,
    retryBoostedSearchModal: defaultBottomSheetModalStatus,
    changeVehicleModal: defaultBottomSheetModalStatus,
    tipsBottomSheetModal: defaultBottomSheetModalStatus,
    cancellationReasonModal: defaultBottomSheetModalStatus,
    cancelRideModal: defaultBottomSheetModalStatus,
};

export type Session = {
    sessionId: string | null;
    activeInput: SearchInput;
    isPickup: boolean;
    sourceSetUsingPin: boolean;
    isServiceable: boolean | undefined;
    isMetroServiceable: boolean;
    isSubwayServiceable: boolean;
    ptRestrictedHours: ptRestrictedHours | undefined;
    isCurrentLocationServiceable: boolean | undefined;
    ambulanceServiceClicked: boolean;
    searchedSource: location | null;
    searchedStops: Array<location | null>;
    currentLocation: location | null;
    searchFailed: boolean;
    retrySearch: boolean;
    searchWarning: SearchWarningType;
    toastProps: ToastProps;
    statusBarProps: StatusBarProps;
    bottomSheetStage: BottomSheetStage;
    popupModalsStatus: PopupModalStatus;
    currentLocationCoords: GeolocationResponse | null;
    busOtpLastClickLocation: { coords: { latitude: number; longitude: number }; ts: number } | null;
    stopLocationsTextInput: Array<string>;
    startLocationFromTextInput: string;
    selectedStopIndex: number;
    theme: Theme;
    pickupTime: string | null;
    dropTime: string | null;
    rideChecksType: RideChecksType;
    onRecenter: boolean;
    configManager: ConfigManager | undefined;
    remoteConfig: Configs;
    operatingCity: City;
    fareProductType: string | null;
    currentEmergencyContact: personDefaultEmergencyNumberAPIEntity | undefined;
    rentalDuration: number;
    rentalDistance: number;
    goBackToRental: boolean;
    redbusWebviewUrl: string | null | undefined;
    redbusBottomSheetVisible: boolean | undefined;
    deepLinkUrl: ParsedUrl | null;
    favouriteLocations: Array<savedReqLocationAPIEntity> | undefined;
    screenReaderEnabled: boolean;
    findAnotherDriver: boolean;
    findAnotherDriverContext: {
        rideId: RideId | null;
    } | null;
    appName: appName;
    selectedOneClickRide: tripLocationObject | undefined;
    appState: AppStateHolder | undefined;
    greetedUser: boolean;
    liveSharingEmergencyContacts: TransformedContact[] | undefined;
    rentalIntercityPackages: fareCacheResp | undefined;
    userLanguage: Language_language | undefined;
    lastKnownLocation: location | null;
    rideDuration: number | undefined;
    chooseRideGoBackStage: BottomSheetStage | null;
    chatEducationShownCount: number;
    chatEducationShownRideIds: string[];
    flowStatusValidated: boolean;
    recallFlowStatus: boolean;
    utmParams: UtmParams | null;
    isOneClickFetched: boolean;
    systemError: boolean;
    hideLoader: boolean;
    paymentRetryCounter: number;
    paymentRetryAfterFailureCounter: number;
    crisSDKToken: string | undefined;
    liveJourneyId: string | null;
    pickupInstructions: string | null;
    pickupInstructionsEditCount: number;
    subWayPopUpState: SubwayPopUpState | undefined;
    refetchJourneys: boolean;
    currentTab: string | null;
    suggestedBusDataCumulative: { buses: busLocation[] }[];
    hasPurchasedPasses: boolean;
    hasRequestedLocationPermission: boolean;
    networkState: NetworkState;
    hasRequestedForeGps: boolean;
};

const emptySession: Session = {
    activeInput: SearchInput.Destination,
    lastKnownLocation: null,
    isPickup: true,
    sourceSetUsingPin: false,
    isServiceable: undefined,
    isMetroServiceable: true,
    isSubwayServiceable: true,
    ptRestrictedHours: undefined,
    isCurrentLocationServiceable: undefined,
    ambulanceServiceClicked: false,
    searchedSource: null,
    searchedStops: [null],
    currentLocation: null,
    sessionId: null,
    searchFailed: false,
    retrySearch: false,
    searchWarning: SearchWarningType.None,
    toastProps: { ...initialToastProps },
    statusBarProps: { ...initialStatusBarProps },
    bottomSheetStage: BottomSheetStage.Home,
    popupModalsStatus: defaultPopupModalStatus,
    currentLocationCoords: null,
    busOtpLastClickLocation: null,
    startLocationFromTextInput: '',
    stopLocationsTextInput: [''],
    selectedStopIndex: 0,
    theme: 'light',
    pickupTime: null,
    dropTime: null,
    rideChecksType: RideChecksType.None,
    onRecenter: false,
    configManager: undefined,
    remoteConfig: defaultConfigs,
    operatingCity: 'default',
    fareProductType: null,
    currentEmergencyContact: undefined,
    rentalDuration: 3600,
    rentalDistance: 10000,
    goBackToRental: false,
    redbusWebviewUrl: null,
    redbusBottomSheetVisible: false,
    deepLinkUrl: null,
    favouriteLocations: undefined,
    screenReaderEnabled: false,
    findAnotherDriver: false,
    findAnotherDriverContext: null,
    appName: 'nammaYatri',
    selectedOneClickRide: undefined,
    appState: 'active',
    userLanguage: 'ENGLISH',
    greetedUser: false,
    liveSharingEmergencyContacts: undefined,
    rentalIntercityPackages: undefined,
    rideDuration: 3600,
    chooseRideGoBackStage: null,
    chatEducationShownCount: 0,
    chatEducationShownRideIds: [],
    flowStatusValidated: false,
    recallFlowStatus: false,
    utmParams: null,
    isOneClickFetched: false,
    systemError: false,
    hideLoader: false,
    paymentRetryCounter: 0,
    paymentRetryAfterFailureCounter: 0,
    crisSDKToken: undefined,
    liveJourneyId: null,
    pickupInstructions: null,
    pickupInstructionsEditCount: 0,
    subWayPopUpState: undefined,
    refetchJourneys: false,
    currentTab: null,
    suggestedBusDataCumulative: [],
    hasPurchasedPasses: false,
    hasRequestedLocationPermission: false,
    networkState: 'none',
    hasRequestedForeGps: false,
};
const REDUCER_NAME = 'session';

const INITIAL_STATE: Session = { ...emptySession };

// Helper function to check if two locations are the same
const isSameLocation = (loc1: location | null | undefined, loc2: location | null | undefined): boolean => {
    if (!loc1 || !loc2) return false;

    // Check by placeId first (most reliable)
    if (loc1.placeId && loc2.placeId && loc1.placeId === loc2.placeId) return true;

    // Fallback to lat/lng comparison (with small tolerance for floating point)
    if (loc1.lat && loc1.lng && loc2.lat && loc2.lng) {
        const latDiff = Math.abs(loc1.lat - loc2.lat);
        const lngDiff = Math.abs(loc1.lng - loc2.lng);
        return latDiff < 0.0001 && lngDiff < 0.0001; // ~10 meters tolerance
    }

    return false;
};

export const persistKeys = [
    'searchedSource',
    'theme',
    'operatingCity',
    'appName',
    'userLanguage',
    'searchedStops',
    'lastKnownLocation',
    'liveSharingEmergencyContacts',
    'chatEducationShownCount',
    'chatEducationShownRideIds',
    'isOneClickFetched',
    'pickupInstructions',
    'pickupInstructionsEditCount',
    'currentTab',
    // 'rentalIntercityPackages', // persist fare cache data
];

const storage = createMMKV();

export const sessionSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setLastKnownLocation: (state, action: PayloadAction<location | null>) => {
            if (!isEqual(state.lastKnownLocation, action.payload)) {
                state.lastKnownLocation = action.payload;
            } else {
                console.warn('Not setting location, state and new coord are same');
            }
        },
        setOperatingCity: (state, action: PayloadAction<City>) => {
            storage.set('USER_CITY_KEY', action.payload); // this will be deprecated once sidebar is migrated
            state.operatingCity = action.payload;
        },
        setAppState: (state, action: PayloadAction<AppStateHolder>) => {
            state.appState = action.payload;
        },
        setSearchFailed: (state, action: PayloadAction<boolean>) => {
            state.searchFailed = action.payload;
        },
        setRetrySearch: (state, action: PayloadAction<boolean>) => {
            state.retrySearch = action.payload;
        },
        setSearchWarning: (state, action: PayloadAction<SearchWarningType>) => {
            state.searchWarning = action.payload;
        },
        setToastProps: (state, action: PayloadAction<ToastProps>) => {
            state.toastProps = { ...state.toastProps, ...action.payload };
        },
        resetToastProps: (state, _action: PayloadAction<void>) => {
            state.toastProps = { ...state.toastProps, ...initialToastProps };
        },
        setToastVisible: (state, action: PayloadAction<boolean>) => {
            state.toastProps = { ...state.toastProps, visible: action.payload };
        },
        setStatusBarProps: (state, action: PayloadAction<Partial<StatusBarProps>>) => {
            state.statusBarProps = { ...state.statusBarProps, ...action.payload };
        },
        setActiveInput: (state, action: PayloadAction<SearchInput>) => {
            state.activeInput = action.payload;
        },
        setIsPickup: (state, action: PayloadAction<boolean>) => {
            state.isPickup = action.payload;
        },
        setSourceSetUsingPin: (state, action: PayloadAction<boolean>) => {
            state.sourceSetUsingPin = action.payload;
        },
        setIsServiceable: (state, action: PayloadAction<boolean>) => {
            state.isServiceable = action.payload;
        },
        setIsMetroServiceable: (state, action: PayloadAction<boolean>) => {
            state.isMetroServiceable = action.payload;
        },
        setIsSubwayServiceable: (state, action: PayloadAction<boolean>) => {
            state.isSubwayServiceable = action.payload;
        },
        setPtRestrictedHours: (state, action: PayloadAction<ptRestrictedHours | undefined>) => {
            state.ptRestrictedHours = action.payload;
        },
        setIsCurrentLocationServiceable: (state, action: PayloadAction<boolean>) => {
            state.isCurrentLocationServiceable = action.payload;
        },
        setRideCheckType: (state, action: PayloadAction<RideChecksType>) => {
            state.rideChecksType = action.payload;
        },
        setSearchedSource: (state, action: PayloadAction<location | null>) => {
            state.searchedSource = action.payload;
        },
        addSearchedStop: (state, action: PayloadAction<location | null>) => {
            const newStop = action.payload;
            const insertIndex = state.searchedStops.length - 1;
            const prevStop = state.searchedStops[insertIndex - 1];

            // Only add if not same as previous stop
            if (!isSameLocation(prevStop, newStop)) {
                state.searchedStops.splice(insertIndex, 0, newStop);
                state.stopLocationsTextInput.splice(insertIndex, 0, '');
            }
        },
        updateSearchedStop: (state, action: PayloadAction<{ index: number; location: location | null }>) => {
            const { index, location } = action.payload;
            const prevStop = state.searchedStops[index - 1];
            const nextStop = state.searchedStops[index + 1];

            // If same as adjacent stops, remove the current stop
            if (isSameLocation(prevStop, location) || isSameLocation(nextStop, location)) {
                state.searchedStops.splice(index, 1);
                state.stopLocationsTextInput.splice(index, 1);
            } else {
                state.searchedStops[index] = location;
            }
        },
        updateSelectedSearchedStop: (state, action: PayloadAction<location | null>) => {
            const index = state.selectedStopIndex;
            const location = action.payload;
            const prevStop = state.searchedStops[index - 1];
            const nextStop = state.searchedStops[index + 1];

            // If same as adjacent stops, remove the current stop
            if (isSameLocation(prevStop, location) || isSameLocation(nextStop, location)) {
                state.searchedStops.splice(index, 1);
                state.stopLocationsTextInput.splice(index, 1);
            } else {
                state.searchedStops[index] = location;
            }
        },
        updateStopLocationTextInput: (state, action: PayloadAction<{ index: number; text: string }>) => {
            state.stopLocationsTextInput[action.payload.index] = action.payload.text;
        },
        updateSelectedStopLocationTextInput: (state, action: PayloadAction<string>) => {
            state.stopLocationsTextInput[state.selectedStopIndex] = action.payload;
        },
        resetStopLocationTextInput: (state, _action: PayloadAction<{ index: number; text: string }>) => {
            state.stopLocationsTextInput = new Array(state.searchedStops.length).fill('');
        },
        removeSearchedStop: (state, action: PayloadAction<number>) => {
            state.searchedStops.splice(action.payload, 1);
            state.stopLocationsTextInput.splice(action.payload, 1);
        },
        removeAllSearchedStops: (state, _action: PayloadAction<void>) => {
            state.searchedStops = [null];
            state.stopLocationsTextInput = [''];
        },
        emptyAllSearchedStops: (state, _action: PayloadAction<void>) => {
            state.searchedStops = [];
            state.stopLocationsTextInput = [''];
        },
        reorderAllSearchedStops: (state, action: PayloadAction<(location | null)[]>) => {
            state.searchedStops = action.payload;
        },
        setSelectedSearchedStopIndex: (state, action: PayloadAction<number>) => {
            state.selectedStopIndex = action.payload;
        },
        setCurrentLocation: (state, action: PayloadAction<location | null>) => {
            if (!isEqual(state.currentLocation, action.payload)) {
                state.currentLocation = action.payload;
                state.lastKnownLocation = action.payload;
            } else {
                console.warn('Not setting location, state and new coord are same');
            }
        },
        setBottomSheetStage: (state, action: PayloadAction<{ stage: BottomSheetStage; src: string }>) => {
            if (
                state.bottomSheetStage === BottomSheetStage.LookingForRides &&
                action.payload.stage === BottomSheetStage.Home &&
                action.payload.src !== 'rc_onPressExitBtn' &&
                action.payload.src !== 'gotoLookingForRides_journey' &&
                action.payload.src !== 'tab_home'
            ) {
                state.recallFlowStatus = true;
            }
            state.bottomSheetStage = action.payload.stage;
        },
        setPopupModalStatus: (state, action: PayloadAction<PopupModalStatus>) => {
            state.popupModalsStatus = {
                ...state.popupModalsStatus,
                ...action.payload,
            };
        },
        setCurrentLocationCoords: (state, action: PayloadAction<GeolocationResponse | null>) => {
            state.currentLocationCoords = action.payload;
        },
        setBusOtpLastClickLocation: (state, action: PayloadAction<{ latitude: number; longitude: number } | null>) => {
            if (!action.payload) {
                state.busOtpLastClickLocation = null;
                return;
            }
            state.busOtpLastClickLocation = { coords: action.payload, ts: Date.now() };
        },
        setStartLocationFromTextInput: (state, action: PayloadAction<string>) => {
            state.startLocationFromTextInput = action.payload;
        },
        setTheme: (state, action: PayloadAction<Theme>) => {
            state.theme = action.payload;
        },
        setAppName: (state, action: PayloadAction<appName>) => {
            state.appName = action.payload;
        },
        setPickupTime: (state, action: PayloadAction<string>) => {
            state.pickupTime = action.payload;
        },
        setDropTime: (state, action: PayloadAction<string>) => {
            state.dropTime = action.payload;
        },
        setOnRecenter: (state, action: PayloadAction<boolean>) => {
            state.onRecenter = action.payload;
        },
        setHideLoader: (state, action: PayloadAction<boolean>) => {
            state.hideLoader = action.payload;
        },
        setPaymentRetryCounter: (state, action: PayloadAction<number>) => {
            state.paymentRetryCounter = action.payload;
        },
        setPaymentRetryAfterFailureCounter: (state, action: PayloadAction<number>) => {
            state.paymentRetryAfterFailureCounter = action.payload;
        },
        setFareProductType: (state, action: PayloadAction<string | null>) => {
            state.fareProductType = action.payload;
        },
        setRentalDuration: (state, action: PayloadAction<number>) => {
            state.rentalDuration = action.payload;
        },
        setRentalDistance: (state, action: PayloadAction<number>) => {
            state.rentalDistance = action.payload;
        },
        setGoBackToRental: (state, action: PayloadAction<boolean>) => {
            state.goBackToRental = action.payload;
        },
        setRideDuration: (state, action: PayloadAction<number>) => {
            state.rideDuration = action.payload;
        },
        setChooseRideGoBackStage: (state, action: PayloadAction<BottomSheetStage>) => {
            state.chooseRideGoBackStage = action.payload;
        },
        initSession: (state, _: PayloadAction<string | undefined>) => {
            state.sessionId = state.sessionId || sessionId;
            state.configManager = createConfigManager();
            state.remoteConfig = state.configManager.getAllConfigs();
        },
        clearSession: (state, action: PayloadAction<Array<keyof Session> | undefined>) => {
            const keysToRetain = action.payload || [];

            // Create a new state object with default retained keys
            const baseState = {
                ...INITIAL_STATE,
                appName: state.appName,
                operatingCity: state.operatingCity,
                searchedSource: state.searchedSource,
                isServiceable: state.isServiceable,
                isMetroServiceable: state.isMetroServiceable,
                isSubwayServiceable: state.isSubwayServiceable,
                ptRestrictedHours: state.ptRestrictedHours,
                isCurrentLocationServiceable: state.isCurrentLocationServiceable,
                theme: state.theme,
                greetedUser: state.greetedUser,
                rentalIntercityPackages: state.rentalIntercityPackages,
                lastKnownLocation: state.lastKnownLocation,
                flowStatusValidated: state.flowStatusValidated,
                recallFlowStatus: state.recallFlowStatus,
                chatEducationShownCount: state.chatEducationShownCount,
                isOneClickFetched: state.isOneClickFetched,
            };

            // Create a new object with additional retained keys using a functional approach
            const finalState = keysToRetain.reduce(
                (result, key) => ({
                    ...result,
                    ...(key in state ? { [key]: state[key] } : {}),
                }),
                baseState,
            );

            return finalState;
        },
        clearRentalState: (state, _action: PayloadAction<void>) => {
            state.rideDuration = undefined;
            state.rentalDistance = emptySession.rentalDistance;
            state.rentalDuration = emptySession.rentalDuration;
        },
        clearPickupTime: (state, _action: PayloadAction<void>) => {
            state.pickupTime = null;
        },
        clearDropTime: (state, _action: PayloadAction<void>) => {
            state.dropTime = null;
        },
        setCurrentEmergencyContact: (
            state,
            action: PayloadAction<personDefaultEmergencyNumberAPIEntity | undefined>,
        ) => {
            state.currentEmergencyContact = action.payload;
        },
        setRedbusWebviewUrl: (state, action: PayloadAction<string | null>) => {
            state.redbusWebviewUrl = action.payload;
        },
        setDeepLinkUrl: (state, action: PayloadAction<ParsedUrl | null>) => {
            state.deepLinkUrl = action.payload;
        },

        setScreenReaderEnabled: (state, action: PayloadAction<boolean>) => {
            state.screenReaderEnabled = action.payload;
        },
        setFindAnotherDriver: (state, action: PayloadAction<boolean>) => {
            state.findAnotherDriver = action.payload;
        },
        setFindAnotherDriverContext: (
            state,
            action: PayloadAction<{
                rideId: RideId | null;
            } | null>,
        ) => {
            state.findAnotherDriverContext = action.payload;
        },
        setSelectedOneClickRide: (state, action: PayloadAction<tripLocationObject>) => {
            state.selectedOneClickRide = action.payload;
        },
        setUserLanguage: (state, action: PayloadAction<Language_language>) => {
            state.userLanguage = action.payload;
        },
        setGreetedUser: (state, action: PayloadAction<boolean>) => {
            state.greetedUser = action.payload;
        },
        setRidePackages: (state, action: PayloadAction<fareCacheResp | undefined>) => {
            state.rentalIntercityPackages = action.payload;
        },
        setLiveSharingEmergencyContacts: (state, action: PayloadAction<TransformedContact[] | undefined>) => {
            state.liveSharingEmergencyContacts = action.payload;
        },
        clearRideDuration: (state, _action: PayloadAction<void>) => {
            state.rideDuration = undefined;
        },
        updateLiveSharingEmergencyContact: (state, action: PayloadAction<{ index: number; isRideShared: boolean }>) => {
            if (state.liveSharingEmergencyContacts) {
                const contact = state.liveSharingEmergencyContacts[action.payload.index];
                if (contact) {
                    // eslint-disable-next-line functional/immutable-data
                    contact.isRideShared = action.payload.isRideShared;
                }
            }
        },
        incrementChatEducationShownCount: (state, action: PayloadAction<string | null>) => {
            const rideId = action.payload;
            if (rideId && !state.chatEducationShownRideIds.includes(rideId)) {
                state.chatEducationShownRideIds.push(rideId);
                if (state.chatEducationShownCount < 3) {
                    state.chatEducationShownCount += 1;
                }
            }
        },
        setFlowStatusValidated: (state, action: PayloadAction<boolean>) => {
            state.flowStatusValidated = action.payload;
        },
        setRecallFlowStatus: (state, action: PayloadAction<boolean>) => {
            state.recallFlowStatus = action.payload;
        },
        setUtmParams: (state, action: PayloadAction<UtmParams | null>) => {
            state.utmParams = action.payload;
        },
        setIsOneClickFetched: (state, action: PayloadAction<boolean>) => {
            state.isOneClickFetched = action.payload;
        },
        setSystemError: (state, action: PayloadAction<boolean>) => {
            state.systemError = action.payload;
        },
        setCrisSDKToken: (state, action: PayloadAction<string | undefined>) => {
            state.crisSDKToken = action.payload;
        },
        setLiveJourneyId: (state, action: PayloadAction<string | null>) => {
            state.liveJourneyId = action.payload;
        },
        setPickupInstructions: (state, action: PayloadAction<string | null>) => {
            state.pickupInstructions = action.payload;
        },
        incrementPickupInstructionsEditCount: (state, action: PayloadAction<number | undefined>) => {
            if (action.payload !== undefined) {
                state.pickupInstructionsEditCount = action.payload;
                console.info('🚗 Session: Reset pickup instructions edit count to:', action.payload);
            } else {
                state.pickupInstructionsEditCount += 1;
                console.info(
                    '🚗 Session: Incremented pickup instructions edit count to:',
                    state.pickupInstructionsEditCount,
                );
            }
        },
        setSubwayPopUpState: (state, action: PayloadAction<SubwayPopUpState | undefined>) => {
            state.subWayPopUpState = action.payload;
        },
        setRefetchJourneys: (state, action: PayloadAction<boolean>) => {
            state.refetchJourneys = action.payload;
        },
        setCurrentTab: (state, action: PayloadAction<string | null>) => {
            state.currentTab = action.payload;
        },
        setHasRequestedLocationPermission: (state, action: PayloadAction<boolean>) => {
            state.hasRequestedLocationPermission = action.payload;
        },
        updateSuggestedBusDataCumulative: (state, action: PayloadAction<busLocation[]>) => {
            if (action.payload.length > 0) state.suggestedBusDataCumulative = [{ buses: action.payload }];
        },
        setHasPurchasedPasses: (state, action: PayloadAction<boolean>) => {
            state.hasPurchasedPasses = action.payload;
        },
        setAmbulanceServiceClicked: (state, action: PayloadAction<boolean>) => {
            state.ambulanceServiceClicked = action.payload;
        },
        setNetworkState: (state, action: PayloadAction<NetworkState>) => {
            state.networkState = action.payload;
        },
        setHasRequestedForeGps: (state, action: PayloadAction<boolean>) => {
            state.hasRequestedForeGps = action.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, state => {
            return {
                ...INITIAL_STATE,
                appName: state.appName,
                operatingCity: state.operatingCity,
                isServiceable: state.isServiceable,
                isMetroServiceable: state.isMetroServiceable,
                isSubwayServiceable: state.isSubwayServiceable,
                ptRestrictedHours: state.ptRestrictedHours,
                isCurrentLocationServiceable: state.isCurrentLocationServiceable,
                theme: state.theme,
                screenReaderEnabled: state.screenReaderEnabled,
                flowStatusValidated: state.flowStatusValidated,
                recallFlowStatus: state.recallFlowStatus,
                chatEducationShownCount: state.chatEducationShownCount,
                greetedUser: state.greetedUser,
                hasRequestedLocationPermission: state.hasRequestedLocationPermission,
                hasRequestedForeGps: state.hasRequestedForeGps,
            };
        });
    },
});

const selectSession = (state: RootState): Session => state.session || INITIAL_STATE;

export const selectSearchFailed = (state: RootState) => selectSession(state).searchFailed;
export const selectSessionId = (state: RootState) => selectSession(state).sessionId;
export const selectRetrySearch = (state: RootState) => selectSession(state).retrySearch;
export const selectSearchWarning = (state: RootState) => selectSession(state).searchWarning;
export const selectToastProps = (state: RootState) => selectSession(state).toastProps;
export const selectStatusBarProps = (state: RootState) => selectSession(state).statusBarProps;

export const selectActiveInput = (state: RootState) => selectSession(state).activeInput;

export const selectIsPickup = (state: RootState) => selectSession(state).isPickup;

export const selectRideChecksType = (state: RootState) => selectSession(state).rideChecksType;

export const selectSourceSetUsingPin = (state: RootState) => selectSession(state).sourceSetUsingPin;

export const selectIsServiceable = (state: RootState) => selectSession(state).isServiceable;

export const selectIsMetroServiceable = (state: RootState) => selectSession(state).isMetroServiceable;

export const selectIsSubwayServiceable = (state: RootState) => {
    return selectSession(state).isSubwayServiceable;
};

export const selectPtRestrictedHours = (state: RootState) => {
    return selectSession(state).ptRestrictedHours;
};

export const selectIsCurrentLocationServiceable = (state: RootState) =>
    selectSession(state).isCurrentLocationServiceable;

export const selectAppThemeName = (state: RootState) => selectSession(state).theme;

export const selectAppName = createSelector([selectSession], session => session.appName);

export const selectOperatingCity = createSelector([selectSession], session => session.operatingCity);

export const selectAppReadableName = (state: RootState) => {
    const appName = selectSession(state).appName;
    if (appName == 'anna') return 'Chennai One';
    const result = appName.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};

export const selectSearchedStops = (state: RootState) => selectSession(state).searchedStops;

export const selectSelectedSearchedStop = (state: RootState) => {
    const session = selectSession(state);
    return session.searchedStops[session.selectedStopIndex] ?? null;
};

export const selectDestination = (state: RootState): location | null => {
    const stops = selectSession(state).searchedStops.filter((stop): stop is location => stop != null);
    const dest = stops.length > 0 ? (stops[stops.length - 1] ?? null) : null;
    return dest;
};

export const selectStops = (state: RootState) => {
    const stops = selectSession(state).searchedStops.filter((stop): stop is location => stop != null);
    const result = stops.length > 1 ? stops.slice(0, -1) : [];
    return result;
};

export const selectDestinationIndex = (state: RootState) => {
    return selectSession(state).searchedStops.length - 1;
};

export const selectCurrentLocation = (state: RootState) => selectSession(state).currentLocation;

export const selectLastKnownLocation = (state: RootState) => selectSession(state).lastKnownLocation;

export const selectBottomSheetStage = (state: RootState) => selectSession(state).bottomSheetStage;

export const selectPopupModalsStatus = (state: RootState) => selectSession(state).popupModalsStatus;

export const selectCurrentLocationCoords = (state: RootState) => selectSession(state).currentLocationCoords;

export const selectBusOtpLastClickLocation = (state: RootState) => selectSession(state).busOtpLastClickLocation;

// Returns the bus OTP last-click location only if it is recent (less than 5 minutes old).
export const selectValidBusOtpLastClickLocation = createSelector([selectBusOtpLastClickLocation], loc => {
    if (!loc) return undefined;
    const now = Date.now();
    const TTL = 5 * 60 * 1000; // 5 minutes
    if (typeof loc.ts === 'number' && now - loc.ts <= TTL) {
        return loc;
    }
    return undefined;
});

export const selectAppState = (state: RootState) => selectSession(state).appState;

export const selectStartLocationFromTextInput = (state: RootState) => selectSession(state).startLocationFromTextInput;

export const selectPickupTime = (state: RootState) => selectSession(state).pickupTime;

export const selectFareProductType = (state: RootState) => selectSession(state).fareProductType;

export const selectRentalDuration = (state: RootState) => selectSession(state).rentalDuration;

export const selectRentalDistance = (state: RootState) => selectSession(state).rentalDistance;

export const selectGoBackToRental = (state: RootState) => selectSession(state).goBackToRental;

export const selectDropTime = (state: RootState) => selectSession(state).dropTime;

export const selectStopLocationsTextInput = (state: RootState, index: number) =>
    selectSession(state).stopLocationsTextInput[index] ? selectSession(state).stopLocationsTextInput[index] : '';

export const selectSeletedStopLocationsTextInput = (state: RootState) => {
    const session = selectSession(state);
    return session.stopLocationsTextInput[session.selectedStopIndex] ?? '';
};

export const selectSelectedStopIndex = (state: RootState) => selectSession(state).selectedStopIndex;

export const selectOnRecenter = (state: RootState) => selectSession(state).onRecenter;

export const selectHideLoader = (state: RootState) => selectSession(state).hideLoader;

export const selectPaymentRetryCounter = (state: RootState) => selectSession(state).paymentRetryCounter;

export const selectPaymentRetryAfterFailureCounter = (state: RootState) =>
    selectSession(state).paymentRetryAfterFailureCounter;

export const selectRemoteConfig = (state: RootState) => selectSession(state).remoteConfig;

export const selectSearchedSource = (state: RootState) => selectSession(state).searchedSource;

export const selectCityConfig = <K extends ConfigKeyByContext['city']>(state: RootState, key: K) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig(key, city);
};

const convertToLanguageType = (name: string): languages => {
    const upperName = name.toUpperCase();
    switch (upperName) {
        case 'ENGLISH':
            return 'ENGLISH';
        case 'HINDI':
            return 'HINDI';
        case 'KANNADA':
            return 'KANNADA';
        case 'TAMIL':
            return 'TAMIL';
        case 'MALAYALAM':
            return 'MALAYALAM';
        case 'BENGALI':
            return 'BENGALI';
        case 'FRENCH':
            return 'FRENCH';
        case 'TELUGU':
            return 'TELUGU';
        case 'ODIA':
            return 'ODIA';
        case 'DUTCH':
            return 'DUTCH';
        case 'GERMAN':
            return 'GERMAN';
        case 'FINNISH':
            return 'FINNISH';
        case 'SWEDISH':
            return 'SWEDISH';
        case 'GUJARATI':
            return 'GUJARATI';
        default:
            return 'ENGLISH';
    }
};

export const getAppLanguages = (state: RootState): LanguageObj[] => {
    const city = selectSession(state).operatingCity;
    const languages = configManager.getCityConfig('allowed_languages', city);
    return languages.map(language => ({
        ...language,
        name: convertToLanguageType(language.name),
    }));
};

export const selectTrackingModeConfig = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    const mode = configManager.getCityConfig('tracking_mode', city);
    return configManager.getTrackingModeConfig('feature_flags', mode);
};

export const selectAppConfig = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    const appName = selectSession(state).appName;
    return configManager.getAppSystemConfig(appName, city);
};

export const APP_CONFIG = {
    get value() {
        const state = store.getState();
        return configManager.getAppSystemConfig(state.session.appName, state.session.operatingCity);
    },
};

export const selectFeatureFlags = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getFeatureFlags(city);
};

export const selectNewFeatureFlags = (state: RootState): newFeatureFlags => {
    const city = selectSession(state).operatingCity;
    return configManager.getNewFeatureFlags(city);
};

export const selectAppBasedOnboarding = (state: RootState) => {
    const appName = selectSession(state).appName;
    return configManager.getAppBasedOnboarding(appName);
};

export const selectPersonalMailServicesNames = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getPersonalMailServicesNames(city);
};

export const selectBoatingPlaceConfig = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getBoatingPlaceConfig(city);
};

export const selectNearbyDriversConfig = memoize((): NearbyDriversConfig => configManager.getNearbyDriversConfig());

export const selectBannerPopusConfig = memoize((): BannerPopupsConfig => configManager.getBannerPopupsConfig());

export const selectReferralPayoutConfigV2 = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getReferralPayoutConfigV2(city);
};

export const selectReferralYouGet = (state: RootState) => {
    const config = selectReferralPayoutConfigV2(state);
    return config?.youGet;
};

export const selectAllowedLanguages = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getAllowedLanguages(city);
};

export const selectSafetyHelplineNo = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getSafetyHelplineNumber(city);
};

export const selectKaptureConfig = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getKaptureConfig(city);
};

export const selectContactSupport = (state: RootState) => {
    const appName = selectSession(state).appName;
    return configManager.getContactSupport(appName);
};

export const selectHourlyRentalConfig = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig('hourly_rental', city);
};

export const selectIntercityRecommendation = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig('intercity_recommendations', city);
};

export const selectNearbyEvents = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig('nearby_events', city);
};

export const selectHomeScreenModules = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig('homescreen_modules', city);
};

export const selectPledgeConfig = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig('pledge_config', city);
};

export const rotatingText = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig('rotating_text', city);
};
export const boostedRotatingText = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig('boosted_rotating_text', city);
};
export const useSliderOrPill = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig('use_slider_or_pill', city);
};
export const useFilterAutocomplete = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig('filter_autocomplete', city);
};
export const lottieConfigs = (state: RootState) => {
    const city = selectSession(state).operatingCity;
    return configManager.getCityConfig('city_lottie_config', city);
};
export const selectCurrentEmergencyContact = (state: RootState) => selectSession(state).currentEmergencyContact;

export const selectRedbusWebviewUrl = (state: RootState) => selectSession(state).redbusWebviewUrl;

export const selectRedbusBottomSheetVisible = (state: RootState) => selectSession(state).redbusBottomSheetVisible;

export const selectDeepLinkUrl = (state: RootState) => selectSession(state).deepLinkUrl;

export const selectUserLanguage = (state: RootState) => selectSession(state).userLanguage;

export const selectScreenReaderEnabled = (state: RootState) => selectSession(state).screenReaderEnabled;

export const selectFindAnotherDriver = (state: RootState) => {
    return selectSession(state).findAnotherDriver;
};

export const selectFindAnotherDriverContext = (state: RootState) => {
    return selectSession(state).findAnotherDriverContext;
};

export const selectSelectedOneClickRide = (state: RootState) => {
    return selectSession(state).selectedOneClickRide;
};

export const selectGreetedUser = (state: RootState) => {
    return selectSession(state).greetedUser;
};

export const selectLiveSharingEmergencyContacts = (state: RootState) =>
    selectSession(state).liveSharingEmergencyContacts;

export const selectRidePackages = (state: RootState) => selectSession(state).rentalIntercityPackages;

export const selectRideDuration = (state: RootState) => selectSession(state).rideDuration;

export const selectChooseRideGoBackStage = (state: RootState) => selectSession(state).chooseRideGoBackStage;

export const selectChatEducationShownCount = (state: RootState) => selectSession(state).chatEducationShownCount;
export const selectChatEducationShownRideIds = (state: RootState) => selectSession(state).chatEducationShownRideIds;
export const selectFlowStatusValidated = (state: RootState) => selectSession(state).flowStatusValidated;
export const selectRecallFlowStatus = (state: RootState) => selectSession(state).recallFlowStatus;

export const selectUtmParams = (state: RootState) => selectSession(state).utmParams;
export const selectIsOneClickFetched = (state: RootState) => selectSession(state).isOneClickFetched;

export const selectSystemError = (state: RootState) => selectSession(state).systemError;
export const selectCrisSDKToken = (state: RootState) => selectSession(state).crisSDKToken;
export const selectLiveJourneyId = (state: RootState) => selectSession(state).liveJourneyId;
export const selectSubwayPopUpState = (state: RootState) => selectSession(state).subWayPopUpState;
export const selectRefetchJourneys = (state: RootState) => selectSession(state).refetchJourneys;
export const selectHasRequestedForeGps = (state: RootState) => selectSession(state).hasRequestedForeGps;

// Constants for multimodal tabs that should be conditionally shown -- deprecated NOW USE tab_screens_config REMOTE_CONFIG to update
// const MULTIMODAL_TABS: BottomTabRoute[] = ['LiveTab', 'TicketsTab'];

// const convertToBottomTabRoute = (tab: string): BottomTabRoute => {
//     switch (tab) {
//         case 'HomeTab':
//             return 'HomeTab';
//         case 'ServicesTab':
//             return 'ServicesTab';
//         case 'LiveTab':
//             return 'LiveTab';
//         case 'TicketsTab':
//             return 'TicketsTab';
//         case 'ProfileTab':
//             return 'ProfileTab';
//         default:
//             return 'HomeTab';
//     }
// };

export const selectTabScreensConfig = createSelector([selectOperatingCity], city => {
    const baseTabConfig = configManager.getTabScreensConfig(city);
    return baseTabConfig;
});

export const clearAllUserData = createAsyncThunk('session/clearAllUserData', async (_, { dispatch }) => {
    dispatch(clearSession());
    dispatch(clearAllJourneyState());
    dispatch(clearAllRideState());
    clearOfflineTickets();
    clearPurchasedPassesCache();
});

export const selectPickupInstructions = (state: RootState) => selectSession(state).pickupInstructions;

export const selectPickupInstructionsEditCount = (state: RootState) => selectSession(state).pickupInstructionsEditCount;

export const selectCurrentTab = (state: RootState) => selectSession(state).currentTab;

export const selectSuggestedBusDataCumulative = (state: RootState): busLocation[] => {
    const busDataCumulative = selectSession(state).suggestedBusDataCumulative;
    return busDataCumulative.map(v => v.buses).reduce((acc, v) => [...acc, ...v], []);
};

export const selectHasPurchasedPasses = (state: RootState) => selectSession(state).hasPurchasedPasses;
export const selectAmbulanceServiceClicked = (state: RootState) => selectSession(state).ambulanceServiceClicked;

export const selectHasRequestedLocationPermission = (state: RootState) =>
    selectSession(state).hasRequestedLocationPermission;

export const selectNetworkState = (state: RootState) => selectSession(state).networkState;

export const {
    setSearchFailed,
    setRetrySearch,
    setSearchWarning,
    setToastProps,
    setToastVisible,
    resetToastProps,
    setStatusBarProps,
    setActiveInput,
    setIsPickup,
    setSourceSetUsingPin,
    setIsServiceable,
    setIsMetroServiceable,
    setIsSubwayServiceable,
    setPtRestrictedHours,
    setIsCurrentLocationServiceable,
    setSearchedSource,
    addSearchedStop,
    removeSearchedStop,
    removeAllSearchedStops,
    emptyAllSearchedStops,
    reorderAllSearchedStops,
    updateSearchedStop,
    updateSelectedSearchedStop,
    setSelectedSearchedStopIndex,
    resetStopLocationTextInput,
    setCurrentLocation,
    clearSession,
    setBottomSheetStage,
    setPopupModalStatus,
    setCurrentLocationCoords,
    setBusOtpLastClickLocation,
    setStartLocationFromTextInput,
    updateStopLocationTextInput,
    updateSelectedStopLocationTextInput,
    setTheme,
    setAppName,
    setPickupTime,
    setDropTime,
    setRideCheckType,
    setOnRecenter,
    setHideLoader,
    setPaymentRetryCounter,
    setPaymentRetryAfterFailureCounter,
    setOperatingCity,
    setAppState,
    initSession,
    clearDropTime,
    clearPickupTime,
    setFareProductType,
    setCurrentEmergencyContact,
    setRentalDuration,
    setRentalDistance,
    setRedbusWebviewUrl,
    setDeepLinkUrl,
    setScreenReaderEnabled,
    clearRentalState,
    setFindAnotherDriver,
    setFindAnotherDriverContext,
    setSelectedOneClickRide,
    setGoBackToRental,
    setUserLanguage,
    setGreetedUser,
    setLiveSharingEmergencyContacts,
    updateLiveSharingEmergencyContact,
    setRidePackages,
    setLastKnownLocation,
    setRideDuration,
    clearRideDuration,
    setChooseRideGoBackStage,
    incrementChatEducationShownCount,
    setFlowStatusValidated,
    setUtmParams,
    setRecallFlowStatus,
    setIsOneClickFetched,
    setSystemError,
    setCrisSDKToken,
    setLiveJourneyId,
    setPickupInstructions,
    incrementPickupInstructionsEditCount,
    setSubwayPopUpState,
    setRefetchJourneys,
    setCurrentTab,
    updateSuggestedBusDataCumulative,
    setHasPurchasedPasses,
    setHasRequestedLocationPermission,
    setAmbulanceServiceClicked,
    setNetworkState,
    setHasRequestedForeGps,
} = sessionSlice.actions;

export default sessionSlice;
