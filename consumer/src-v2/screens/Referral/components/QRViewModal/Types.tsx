import { Action, Resolver } from '@/typescript/utils/common';
import { ImageSourcePropType } from 'react-native';

export type QRViewModalAction = Action<'GO_BACK_CLICKED'>;

export interface QRViewModalUIProps {
    appName: string;
    cityName: string;
    iconURL: string | ImageSourcePropType | undefined;
    customerReferralCode: string;
    qrDispatch: Resolver<QRViewModalAction>;
}
