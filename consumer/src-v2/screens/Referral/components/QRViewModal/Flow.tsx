import React, { useCallback, useMemo } from 'react';
import mtAppNammaYatriLogo from '@/typescript/assets/ny-service/mt_app_namma_yatri_logo.webp';
import mtAppYatriSathiLogo from '@/typescript/assets/ny-service/mt_app_yatri_sathi_logo.webp';
import mtAppOdishaLogo from '@/typescript/assets/ny-service/mt_app_odisha_logo.webp';
import mtIcKeralaSavaariLogo from '@/typescript/assets/ny-service/mt_ic_kerala_savaari_logo.webp';
import bridgeLogo from '@/typescript/assets/ny-service/mt_ic_bridge_logo.png';
import bharatTaxiLogo from '@/typescript/assets/ny-service/bharat_taxi_app_logo.webp';
import { QRViewModalAction } from './Types';
import { QRViewModalUI } from './UI';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserProfile } from '@/typescript/state/client/user';
import { selectAppReadableName } from '@/typescript/state/client/session';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { ImageSourcePropType } from 'react-native';
import mtAppAnnaLogo from '@/typescript/assets/ny-service/mt_app_anna_logo.webp';

export const QRViewModalFlow: React.FC = () => {
    const userProfile = useAppSelector(selectUserProfile);
    const appName = useAppSelector(selectAppReadableName);
    const { qrViewModalRef } = useRefsContext();

    const cityName = (() => {
        {
            if (appName.includes('Odisha Yatri')) return 'Bhubneshwar';
            else if (appName.includes('Yatri Sathi')) return 'Kolkata';
            else if (appName.includes('Namma Yatri')) return 'Bangalore';
            else if (appName.includes('Mana Yatri')) return 'Hyderabad';
            else if (appName.includes('Yatri')) return 'Delhi';
            else if (appName.includes('Kerala Savaari')) return 'Kerala';
            else if (appName.includes('Bharat Taxi')) return 'Delhi';
            else return 'Bangalore';
        }
    })();
    const iconURL: string | ImageSourcePropType | undefined = (() => {
        if (appName.includes('Odisha Yatri')) {
            return mtAppOdishaLogo;
        } else if (appName.includes('Yatri Sathi')) {
            return mtAppYatriSathiLogo;
        } else if (appName.includes('Kerala Savaari')) {
            return mtIcKeralaSavaariLogo;
        } else if (appName.includes('Bridge')) {
            return bridgeLogo;
        } else if (appName.includes('Chennai One')) {
            return mtAppAnnaLogo;
        } else if (appName.includes('Bharat Taxi')) {
            return bharatTaxiLogo;
        } else {
            return mtAppNammaYatriLogo;
        }
    })();

    const resolver: Resolver<QRViewModalAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'GO_BACK_CLICKED':
                    qrViewModalRef.current?.dismiss();
                    break;

                default:
                    throw new Error(`Unhandled action type: ${action}`);
            }
        },
        [qrViewModalRef],
    );

    const qrDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    return (
        <QRViewModalUI
            appName={appName}
            cityName={cityName}
            iconURL={iconURL}
            customerReferralCode={userProfile?.customerReferralCode || ''}
            qrDispatch={qrDispatch}
        />
    );
};
