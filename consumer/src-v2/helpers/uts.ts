import { NativeModules } from 'react-native';
import {
    BookingRequestParams,
    IOSErrorResponse,
    ReinitializationRequestParams,
    ShowTicketRequestParams,
    UTSResponse,
    UTSResponseStatus,
} from '@/src-v2/modules/UtsModule';
import { getStringItem, MMKVKey, setStringItem } from '@/typescript/utils/MMKV';
import { logger } from '@/src-v2/systems/logger';
import { safeJsonParse } from '../components/SafeJsonParser';

const { AppInfoModule } = NativeModules;

export interface UTSData {
    deviceID: string;
    mobileNumber: string;
    utsResponse: UTSResponse | undefined;
}

export async function getUTSData(): Promise<UTSData> {
    let mutableDeviceId = getStringItem(MMKVKey.UTS_DEVICE_ID);
    if (!mutableDeviceId || mutableDeviceId === '') {
        mutableDeviceId = await AppInfoModule.getUTSId();
        if (mutableDeviceId && mutableDeviceId !== '' && mutableDeviceId !== 'NO_DEVICE_ID') {
            setStringItem(MMKVKey.UTS_DEVICE_ID, mutableDeviceId);
        }
    }

    const mobileNumber = getStringItem(MMKVKey.MOBILE_NUMBER);
    const utsResponse =
        !mutableDeviceId || mutableDeviceId === 'NO_DEVICE_ID'
            ? utsError(`Device ID not found ${mutableDeviceId}`, 'getUTSData')
            : !mobileNumber || mobileNumber === ''
              ? utsError(`Mobile number not found`, 'getUTSData')
              : undefined;

    return {
        deviceID: mutableDeviceId || '',
        mobileNumber: mobileNumber || '',
        utsResponse,
    };
}

export function utsError(message: string, requestType: string): UTSResponse {
    console.error(`UTS Error while calling ${requestType} : ${message}`);
    logger.logError(`UTS Error while calling ${requestType} : ${message}`, 'UTS');
    return {
        status: UTSResponseStatus.ERROR,
        data: `Error while calling ${requestType} : ${message}`,
    };
}

export function logUTSRequest(
    params: BookingRequestParams | ShowTicketRequestParams | ReinitializationRequestParams,
    requestType: string,
    journeyId: string | undefined,
) {
    const blackListedParams = ['ticketEncData', 'mobileNumber'];
    const safeParams = Object.fromEntries(Object.entries(params).filter(([key]) => !blackListedParams.includes(key)));
    logger.logInfo(
        `JourneyId: ${journeyId} - UTS Request: ${requestType} Params : ${JSON.stringify(safeParams)}`,
        'UTS',
    );
    console.info(`UTS ${requestType} Params : ${JSON.stringify(safeParams)}`);
}

export function logUTSResponse(response: UTSResponse, requestType: string, journeyId: string | undefined) {
    if (response.status === UTSResponseStatus.ERROR) {
        logger.logError(`JourneyId: ${journeyId} - UTS Error while calling ${requestType} : ${response.data}`, 'UTS');
        console.error(`UTS Error while calling ${requestType} : ${response.data}`);
    } else {
        logger.logInfo(`JourneyId: ${journeyId} - UTS Successfully called ${requestType} : ${response.data}`, 'UTS');
        console.info(`UTS Successfully called ${requestType} : ${response.data}`);
    }
}

export function logUTSError(error: string, requestType: string, journeyId: string | undefined) {
    logger.logError(`JourneyId: ${journeyId} - UTS Error while calling ${requestType} : ${error}`, 'UTS');
    console.error(`UTS Error while calling ${requestType} : ${error}`);
}

export function isReinitializationRequired(error: UTSResponse, journeyId: string | undefined): boolean {
    if (error.status !== UTSResponseStatus.ERROR) return false;
    if (
        typeof error.data === 'string' &&
        (error.data.includes('SDK_TOKEN_REQUIRED') || error.data.includes('initialization required'))
    ) {
        return true;
    }
    if (typeof error.data === 'string' && error.data !== null) {
        try {
            const iosError = safeJsonParse<IOSErrorResponse | undefined>(error.data, undefined, 'IOSErrorResponse UTS');
            if (iosError?.respCode === 7 || (iosError?.respMessage && iosError.respMessage.includes('Token Missing'))) {
                return true;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '';
            logUTSError(`${errorMessage}`, 'isReinitializationRequired', journeyId);
            return false;
        }
    }

    return false;
}
