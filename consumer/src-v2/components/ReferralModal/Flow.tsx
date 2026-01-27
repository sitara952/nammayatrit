import React, { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectUserProfile, setReferralApplied } from '@/typescript/state/client/user';
import { ReferralModalUI } from './UI';
import { ReferralModalAction, ReferralModalProps } from './types';
import { setStringItem } from '@/typescript/utils/MMKV';
import { selectToken } from '@/typescript/state/client/auth';
import { MMKVKey } from '@/typescript/utils/MMKV';
import { usePersonApplyReferralPostMutation } from '@/api/integrations/rtk/PersonApplyReferralPost';
import { applyCodeReq } from '@/readOnly/api/types/ApplyCodeReq.gen';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { useDeepLinking } from '@/typescript/screens/home/hooks/useDeepLinking';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const ReferralModalFlow: React.FC<ReferralModalProps> = ({
    setReferralApplied: setReferralAppliedProp,
    utmReferralCode,
}) => {
    const userProfile = useAppSelector(selectUserProfile);

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [applyReferral, { isError: applyReferralError }] = usePersonApplyReferralPostMutation();
    const [referralCode, setReferralCode] = React.useState(utmReferralCode ? utmReferralCode : '');
    const [validReferralCode, setValidReferralCode] = React.useState(true);
    const { referralModalRef } = useDeepLinking();

    const token = useAppSelector(selectToken);
    const dispatch = useAppDispatch();

    const handleApplyReferral = () => {
        if (referralCode.length >= 6) {
            const applyReferralReq: applyCodeReq = {
                androidId: userProfile?.androidId,
                code: referralCode,
                deviceId: userProfile?.deviceId,
                gps: undefined,
            };
            applyReferral({ body: applyReferralReq })
                .unwrap()
                .then(() => {
                    setReferralAppliedProp ? setReferralAppliedProp(true) : navigation.goBack();
                    setStringItem(MMKVKey.REFERRAL_STATUS, '200');
                    dispatch(setReferralApplied({ id: token, payload: true }));
                    referralModalRef?.current?.dismiss();
                    logEvent(EventName.NY_USER_REFERRAL_CODE_APPLIED);
                    logEvent(EventName.NY_USER_REFERRAL_APPLIED_AFTER_SIGNUP);
                });
        } else {
            setValidReferralCode(false);
        }
    };

    const resolver: Resolver<ReferralModalAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'APPLY_REFERRAL_CLICKED':
                    handleApplyReferral();
                    break;
                default:
                    throw new Error(`Unhandled action type: ${action}`);
            }
        },
        [handleApplyReferral],
    );

    const rmDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    return (
        <ReferralModalUI
            utmReferralCode={utmReferralCode}
            setReferralCode={setReferralCode}
            validReferralCode={validReferralCode}
            applyReferralError={applyReferralError}
            rmDispatch={rmDispatch}
        />
    );
};
