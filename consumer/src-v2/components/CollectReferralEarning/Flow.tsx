import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectUserProfile, setPayoutVpa } from '@/typescript/state/client/user';
import { usePayoutVpaUpsertPostMutation } from '@/api/integrations/rtk/PayoutVpaUpsertPost';
import { useLazyReferralVerifyVpaGetQuery } from '@/api/integrations/rtk/ReferralVerifyVpaGet';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { CollectReferralEarningUI } from './UI';
import { CollectReferralEarningAction, StageType } from './Types';
import Tick from '@/typescript/components/svg/Tick';
import CloseIconWhite from '@/typescript/components/svg/CloseIconWhite';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { selectToken } from '@/typescript/state/client/auth';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { navigationRef } from '@/typescript/navigation/RootNavigation';
import { selectReferralYouGet } from '@/typescript/state/client/session';

export type CollectReferralEarningFlowProps = {
    setIsCollectEarningsPressed: React.Dispatch<React.SetStateAction<boolean>> | undefined;
};

export const CollectReferralEarningFlow: React.FC<CollectReferralEarningFlowProps> = ({
    setIsCollectEarningsPressed,
}) => {
    const currentScreenName = navigationRef.getCurrentRoute()?.name;
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const userProfile = useAppSelector(selectUserProfile);
    const { collectReferralEarningModalRef } = useRefsContext();
    const userToken = useAppSelector(selectToken);
    const dispatch = useAppDispatch();
    const [upiId, setUpiId] = useState('');
    const [stage, setStage] = useState<StageType>();
    const referralYouGet = useAppSelector(selectReferralYouGet);

    const [verifyVpaApi, { data: verifyVpaRes, isLoading }] = useLazyReferralVerifyVpaGetQuery();
    const [updateVpaApi] = usePayoutVpaUpsertPostMutation();

    const hideKeyboard = useCallback(() => Keyboard.dismiss(), []);

    const verifyData = useMemo(() => {
        switch (stage) {
            case 'isLoading':
                return {
                    icon: <ActivityIndicator color={themeColors.Text_neutralMax} size="small" />,
                    text: userLanguageStrings.Verifying,
                    textColor: themeColors.Text_neutralMax,
                    bgColor: themeColors.Fill_neutralMin,
                    borderColor: '#E1E3E7',
                    subtitleText: userLanguageStrings.EnterUpiIdInTheFormatNumberAtBankname,
                    subTitleTextColor: themeColors.Text_neutralHigh,
                };
            case 'success':
                return {
                    icon: <Tick fill="white" size={14} />,
                    text: userLanguageStrings.Verified,
                    textColor: themeColors.Fill_neutralMin,
                    bgColor: themeColors.Icon_positive,
                    borderColor: themeColors.Icon_positive,
                    subtitleText: userLanguageStrings.UpiIdVerified,
                    subTitleTextColor: themeColors.Icon_positive,
                };
            case 'failed':
                return {
                    icon: <CloseIconWhite />,
                    text: userLanguageStrings.Failed,
                    textColor: themeColors.Fill_neutralMin,
                    bgColor: themeColors.Text_negativeHigh,
                    borderColor: themeColors.Text_negativeHigh,
                    subtitleText: userLanguageStrings.UpiIdVerificationFailed,
                    subTitleTextColor: themeColors.Text_negativeHigh,
                };
            default:
                return {
                    icon: null,
                    text: userLanguageStrings.Verify,
                    textColor: themeColors.Fill_neutralMin,
                    bgColor: defaultColors.black600,
                    borderColor: '#A3A3A3',
                    subtitleText: userLanguageStrings.EnterUpiIdInTheFormatNumberAtBankname,
                    subTitleTextColor: themeColors.Text_neutralHigh,
                };
        }
    }, [stage, themeColors]);

    useEffect(() => {
        if (isLoading) {
            setStage('isLoading');
        } else if (userProfile?.payoutVpa === upiId) {
            setStage('success');
        }
    }, [isLoading, userProfile?.payoutVpa, upiId]);

    const verifyBtnOnPress = useCallback(async () => {
        await verifyVpaApi({ vpa: upiId })
            .unwrap()
            .then(resp => {
                if (resp.isValid) {
                    setStage('success');
                } else {
                    setStage('failed');
                }
                if (userProfile?.payoutVpa !== upiId) {
                    updateVpaApi({ body: { vpa: resp.vpa } })
                        .unwrap()
                        .then(() => {
                            dispatch(setPayoutVpa({ id: userToken, payload: resp.vpa }));
                        });
                }
            })
            .catch(() => {
                setStage('failed');
            });
    }, [upiId, verifyVpaApi]);

    const handleTextChange = (text: string) => {
        setUpiId(text);
        if (verifyVpaRes && text === verifyVpaRes?.vpa) {
            setStage('success');
        } else {
            setStage(undefined);
        }
    };

    const handleGotItPress = () => {
        if (setIsCollectEarningsPressed) {
            setIsCollectEarningsPressed(true);
        }
        if (currentScreenName === 'referralEarningsScreen') {
            collectReferralEarningModalRef.current?.dismiss();
        } else {
            collectReferralEarningModalRef.current?.dismiss();
            navigation.navigate('ProfileTab', {
                screen: 'referralNavigator',
                params: {
                    screen: 'referralPayment',
                    params: { fromReviewFeedback: currentScreenName === 'reviewAndFeedback' },
                },
            });
        }
    };

    const resolver: Resolver<CollectReferralEarningAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'HIDE_KEYBOARD':
                    hideKeyboard();
                    break;
                case 'VERIFY_VPA_CLICKED':
                    verifyBtnOnPress();
                    break;
                case 'GOT_IT_CLICKED':
                    handleGotItPress();
                    break;
                default:
                    throw new Error(`Unhandled action type: ${action}`);
            }
        },
        [hideKeyboard, verifyBtnOnPress, handleGotItPress],
    );

    const crDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    return (
        <CollectReferralEarningUI
            upiId={upiId}
            stage={stage}
            verifyData={verifyData}
            handleTextChange={handleTextChange}
            customerFirstRide={false}
            referralYouGet={referralYouGet}
            crDispatch={crDispatch}
        />
    );
};
