import { NativeModules } from 'react-native';
import { getUtcTimestamp } from '../utils/time';

export interface TrueCallerProfileResp {
    sub: string;
    given_name: string;
    picture: string | undefined;
    email: string | undefined;
    phone_number: string;
    phone_number_verified: boolean;
    gender: string | undefined;
    birthdate: string | undefined;
    phone_number_country_code: string;
}

interface signatureBody {
    mobileNumber: string;
    mobileCountryCode: string;
    merchantId: string;
    timestamp: string;
    userId: string | undefined;
}

interface getSignatureResp {
    signature: string;
}

interface TrueCallerModuleType {
    initTrueCallerSDK(): Promise<TrueCallerProfileResp>;
    getSignature(authReq: string): Promise<getSignatureResp>;
}

export const transformTrueCallerRespToAuthReq = (tcResp: TrueCallerProfileResp, merchantID: string): signatureBody => {
    const mobileNumberWithoutCC = tcResp.phone_number.slice(2);
    return {
        mobileNumber: mobileNumberWithoutCC,
        mobileCountryCode: countryCodeToMobileCountryCode(tcResp.phone_number_country_code),
        merchantId: merchantID,
        timestamp: getUtcTimestamp(),
        userId: undefined,
    };
};

const countryCodeToMobileCountryCode = (countryCode: string) => {
    switch (countryCode) {
        case 'IN':
            return '+91';
        case 'US':
            return '+1';
        default:
            return '+91';
    }
};
const TrueCallerModule = NativeModules['TrueCallerModule'] as TrueCallerModuleType;

export { TrueCallerModule };
