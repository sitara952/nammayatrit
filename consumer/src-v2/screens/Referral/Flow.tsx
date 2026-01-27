import { useCallback, useEffect, useMemo } from 'react';
import { BackHandler } from 'react-native';
import { bodyHeaderItem, bodyHeaderItemData, ReferralScreenAction, ReferralScreenUIProps } from './Types';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    selectUserProfile,
    selectReferralApplied,
    selectReferralAmountToCollect,
    setReferralAmountToCollect,
    selectPayoutVpa,
} from '@/typescript/state/client/user';
import {
    selectAppConfig,
    selectAppReadableName,
    selectOperatingCity,
    selectReferralPayoutConfigV2,
} from '@/typescript/state/client/session';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { useDeepLinking } from '@/typescript/screens/home/hooks/useDeepLinking';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { ReferralScreenUI } from './UI';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { shareApp } from '@/src-v2/utils/common';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { selectToken } from '@/typescript/state/client/auth';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

export const ReferralScreenFlow: React.FC = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const userToken = useAppSelector(selectToken);
    const userProfile = useAppSelector(selectUserProfile);
    const referralAmountToCollect = useAppSelector(selectReferralAmountToCollect);
    const currentCity = useAppSelector(selectOperatingCity);
    const appName = useAppSelector(selectAppReadableName);
    const appConfig = useAppSelector(selectAppConfig);
    const referralAppliedFromStore = useAppSelector(selectReferralApplied);
    const { referralModalRef, utmReferralCode } = useDeepLinking();
    const dispatch = useAppDispatch();
    const { collectReferralEarningModalRef, qrViewModalRef } = useRefsContext();
    const referralPayoutConfigV2 = useAppSelector(selectReferralPayoutConfigV2);
    const payoutVpa = useAppSelector(selectPayoutVpa);

    const handleFAQPress = () => {
        navigation.navigate('ProfileTab', { screen: 'referralNavigator', params: { screen: 'referralFaq' } });
    };

    const getBodyHeaderData = (): bodyHeaderItem => {
        const isSomePendingAmount = payoutVpa && payoutVpa !== '' && referralAmountToCollect !== 0;
        const currencySymbol = CURRENCY_SYMBOL.value;

        const dataItem: bodyHeaderItemData = isSomePendingAmount
            ? 'Pending Earnings'
            : referralAmountToCollect > 0
              ? 'Referral Earnings'
              : userProfile?.referralAmountPaid && userProfile.referralAmountPaid > 0
                ? 'Total Earnings'
                : undefined;

        switch (dataItem) {
            case 'Total Earnings':
                return {
                    title: userLanguageStrings.TotalEarningsReceived,
                    subTitle: '',
                    btnText: `${currencySymbol}${userProfile?.referralAmountPaid}  ➔`,
                    btnColor: colors.black900,
                    btnBorderColor: 'transparent',
                    btnAction: () => {
                        navigation.navigate('ProfileTab', {
                            screen: 'referralNavigator',
                            params: { screen: 'referralEarningsScreen' },
                        });
                    },
                    type: dataItem,
                };
            case 'Pending Earnings':
                return {
                    title: userLanguageStrings.TotalEarnings,
                    subTitle: userLanguageStrings.YouHaveSomePendingTransactions,
                    btnText: userLanguageStrings.Details,
                    btnColor: themeColors.Fill_neutralMax,
                    btnBorderColor: colors.neutral450,
                    btnAction: () => {
                        navigation.navigate('ProfileTab', {
                            screen: 'referralNavigator',
                            params: { screen: 'referralEarningsScreen' },
                        });
                    },
                    type: dataItem,
                };
            case 'Referral Earnings':
                return {
                    title: userLanguageStrings.YayReferralEarnings,
                    subTitle: '',
                    btnText: userLanguageStrings.CollectNow,
                    btnColor: colors.black900,
                    btnBorderColor: 'transparent',
                    btnAction: () => {
                        collectReferralEarningModalRef.current?.present();
                    },
                    type: dataItem,
                };
            default:
                return {
                    title: '',
                    subTitle: '',
                    btnText: '',
                    btnColor: themeColors.Fill_neutralMin,
                    btnBorderColor: colors.neutral450,
                    btnAction: () => {},
                    type: dataItem,
                };
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
        return true;
    };

    useEffect(() => {
        const amountToCollect =
            (userProfile?.referralEarnings ?? 0) +
            (userProfile?.referredByEarnings ?? 0) -
            (userProfile?.referralAmountPaid ?? 0);
        dispatch(setReferralAmountToCollect({ id: userToken, payload: amountToCollect }));
    }, [userProfile?.referralAmountPaid, userProfile?.referralEarnings, userProfile?.referredByEarnings]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, []);

    const resolver: Resolver<ReferralScreenAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'HEADER_BACK_PRESS':
                    navigation.goBack();
                    break;
                case 'COLLECT_NOW_CLICKED':
                    getBodyHeaderData().btnAction();
                    break;
                case 'FAQ_TEXT_PRESS':
                    handleFAQPress();
                    break;
                case 'SHARE_CLICKED':
                    logEvent(EventName.NY_USER_REFERRAL_SHARED);
                    shareApp(
                        currentCity,
                        userProfile?.customerReferralCode || '',
                        appName,
                        userLanguageStrings,
                        appConfig.flowConfig.shareReferralLink,
                    );
                    break;
                case 'QR_ICON_CLICKED':
                    logEvent(EventName.NY_USER_REFERRAL_SHARED);
                    qrViewModalRef.current?.present();
                    break;
                default:
                    throw new Error(`Unhandled action type: ${action}`);
            }
        },
        [
            navigation,
            shareApp,
            handleFAQPress,
            getBodyHeaderData().btnAction,
            qrViewModalRef,
            currentCity,
            userProfile?.customerReferralCode,
            appName,
            userLanguageStrings,
            appConfig,
        ],
    );

    const rfDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const referralScreenUIProps: ReferralScreenUIProps = {
        userProfile,
        referralAppliedFromStore,
        utmReferralCode,
        referralModalRef,
        collectReferralEarningModalRef,
        qrViewModalRef,
        getBodyHeaderData,
        referralPayoutConfigV2,
        rfDispatch,
    };
    return <ReferralScreenUI {...referralScreenUIProps} />;
};
