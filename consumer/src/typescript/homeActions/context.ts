import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Linking } from 'react-native';
import { capitalize } from 'lodash';

import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import {
    selectOperatingCity,
    selectBoatingPlaceConfig,
    BottomSheetStage,
    setBottomSheetStage,
    setRedbusWebviewUrl,
    clearRentalState,
    setFareProductType,
    setAmbulanceServiceClicked,
    updateSelectedSearchedStop,
    selectAppReadableName,
    selectAppConfig,
} from '@/typescript/state/client/session';
import {
    selectMbpermissionForRedbus,
    selectMobileNumber,
    selectUserProfile,
    RedBusState,
} from '@/typescript/state/client/user';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { shareApp } from '@/src-v2/utils/common';
import { useLazyTicketPlacePlaceIdGetQuery } from '@/api/integrations/rtk/TicketPlacePlaceIdGet';
import { strings } from 'config-types';

export interface ActionContext {
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    dispatch: ReturnType<typeof useAppDispatch>;
    refs: ReturnType<typeof useRefsContext>;
    state: {
        operatingCity: string;
        mbpermissionForRedbus: RedBusState;
        mobileNumber: string | null;
        boatingPlaceConfig: { boatingPlaceId: string | null };
        userProfile: { customerReferralCode: string | undefined } | null;
        appName: string;
        shareReferralLink: boolean;
    };
    utils: {
        hapticEffect: typeof hapticEffect;
        logEvent: typeof logEvent;
        capitalize: typeof capitalize;
        shareApp: typeof shareApp;
        Linking: typeof Linking;
        getTicketPlaces: ReturnType<typeof useLazyTicketPlacePlaceIdGetQuery>[0];
    };
    actions: {
        setBottomSheetStage: typeof setBottomSheetStage;
        setRedbusWebviewUrl: typeof setRedbusWebviewUrl;
        clearRentalState: typeof clearRentalState;
        setFareProductType: typeof setFareProductType;
        setAmbulanceServiceClicked: typeof setAmbulanceServiceClicked;
        updateSelectedSearchedStop: typeof updateSelectedSearchedStop;
    };
    constants: {
        BottomSheetStage: typeof BottomSheetStage;
        RedBusState: typeof RedBusState;
        EventName: typeof EventName;
    };
    userLanguageStrings: strings;
}

export function useActionContext(): ActionContext {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const dispatch = useAppDispatch();
    const refs = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const operatingCity = useAppSelector(selectOperatingCity);
    const mbpermissionForRedbus = useAppSelector(selectMbpermissionForRedbus);
    const mobileNumber = useAppSelector(selectMobileNumber);
    const boatingPlaceConfig = useAppSelector(selectBoatingPlaceConfig);
    const userProfile = useAppSelector(selectUserProfile);
    const appName = useAppSelector(selectAppReadableName);
    const appConfig = useAppSelector(selectAppConfig);

    const [getTicketPlaces] = useLazyTicketPlacePlaceIdGetQuery();

    const context: ActionContext = useMemo(
        () => ({
            navigation,
            dispatch,
            refs,
            state: {
                operatingCity,
                mbpermissionForRedbus,
                mobileNumber,
                boatingPlaceConfig,
                userProfile,
                appName,
                shareReferralLink: appConfig.flowConfig.shareReferralLink,
            },
            utils: {
                hapticEffect,
                logEvent,
                capitalize,
                shareApp,
                Linking,
                getTicketPlaces,
            },
            actions: {
                setBottomSheetStage,
                setRedbusWebviewUrl,
                clearRentalState,
                setFareProductType,
                setAmbulanceServiceClicked,
                updateSelectedSearchedStop,
            },
            constants: {
                BottomSheetStage,
                RedBusState,
                EventName,
            },
            userLanguageStrings,
        }),
        [
            navigation,
            dispatch,
            refs,
            operatingCity,
            mbpermissionForRedbus,
            mobileNumber,
            boatingPlaceConfig,
            userProfile,
            appName,
            getTicketPlaces,
            userLanguageStrings,
        ],
    );

    return context;
}
