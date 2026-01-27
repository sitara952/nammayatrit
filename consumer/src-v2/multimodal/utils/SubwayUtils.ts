import {
    BookingRequestParams,
    ShowTicketRequestParams,
    UTSResponseStatus,
    UTSSDKData,
} from '@/src-v2/modules/UtsModule';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { canBookLeg } from '@/typescript/utils/LegStatusUtils';
import { isNull, isUndefined } from 'lodash';
import { journeyConfirmReqElement } from '@/readOnly/api/types/JourneyConfirmReqElement.gen';
import { SubwayErrorPopUpType } from '@/src-v2/multimodal/components/JourneyPayment/hooks/useSubwayErrors';
import { Platform } from 'react-native';
import { utsService } from '@/src-v2/modules/UtsService';
import { crisSdkResponse } from '@/readOnly/api/types/CrisSdkResponse.gen.tsx';
import { logger } from '@/src-v2/systems/logger';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { SubwayPopUpState } from '../screens/JourneyInfoScreen/components/SubwayPopUps/types';
import { createSubwayErrorConfigs } from '../screens/JourneyInfoScreen/components/SubwayPopUps/subwayErrorConfigs';
import { strings } from 'config-types';
import { DevSettingsDetails } from '@/typescript/hooks/useDevSettings';
import { store } from '@/typescript/state/store';
import { apiCall as metricsApiCall } from '@/api/integrations/rtk/MetricsIncrementPost';
import { getStringItem, MMKVKey } from '@/typescript/utils/MMKV';

interface UTSResponseWithError {
    crisResponse: crisSdkResponse | undefined;
    errorPopUpType: SubwayErrorPopUpType | undefined;
    shouldBreak: boolean;
    errorMessage: string | undefined;
}

export const getShowTicketRequest = (subwayLeg: legInfo | undefined): Partial<ShowTicketRequestParams> => {
    const subWayLegExtraInfo = subwayLeg?.legExtraInfo.TAG === 'Subway' ? subwayLeg?.legExtraInfo._0 : undefined;
    if (subWayLegExtraInfo === undefined) return {};
    const sourceStationName = subWayLegExtraInfo?.routeInfo[0]?.originStop.name;
    const sourceStationNameRegional = subWayLegExtraInfo?.routeInfo[0]?.originStop.regionalName ?? sourceStationName;
    const sourceStationNameHindi = subWayLegExtraInfo?.routeInfo[0]?.originStop.hindiName ?? sourceStationName;
    const destinationStop = subWayLegExtraInfo?.routeInfo[subWayLegExtraInfo?.routeInfo?.length - 1]?.destinationStop;
    const destinationStationName = destinationStop?.name;
    const destinationStationNameRegional = destinationStop?.regionalName ?? destinationStationName;
    const destinationStationNameHindi = destinationStop?.hindiName ?? destinationStationName;
    const encryptedTicketData = subWayLegExtraInfo?.tickets?.[0];

    const bookingParams: Partial<ShowTicketRequestParams> = {
        sourceStationName: sourceStationName,
        destinationStationName: destinationStationName,
        sourceStationNameHindi: sourceStationNameHindi,
        destinationStationNameHindi: destinationStationNameHindi,
        sourceStationNameRegional: sourceStationNameRegional,
        destinationStationNameRegional: destinationStationNameRegional,
        ticketEncData: encryptedTicketData,
    };

    return bookingParams;
};

export const hasSuburbanTicket = (journeyLegs: legInfo[]): boolean => {
    const subWayLegs = journeyLegs.filter(item => item?.travelMode === 'Subway' && item?.legExtraInfo.TAG === 'Subway');
    const subWayLegExtraInfos = subWayLegs.map(subWayLeg => subWayLeg.legExtraInfo._0);

    const encryptedTicketDatas = subWayLegExtraInfos.map(subWayLegExtraInfo => {
        // Type check to ensure we have a subway leg with tickets property
        if ('tickets' in subWayLegExtraInfo) {
            return subWayLegExtraInfo.tickets?.[0] && subWayLegExtraInfo;
        }
        return undefined;
    });
    return (
        encryptedTicketDatas.length > 0 &&
        encryptedTicketDatas.some(ticketData => {
            return !isUndefined(ticketData);
        })
    );
};

export const allTicketsLoaded = (journeyLegs: legInfo[]): boolean => {
    const bookingLegs = journeyLegs.filter(
        item => ['Subway', 'Metro', 'Bus'].includes(item?.travelMode) && item.bookingAllowed && canBookLeg(item),
    );
    return bookingLegs.length === 0
        ? true
        : bookingLegs.every(
              leg =>
                  (leg.legExtraInfo.TAG === 'Subway' ||
                      leg.legExtraInfo.TAG === 'Metro' ||
                      leg.legExtraInfo.TAG === 'Bus') &&
                  !isUndefined(leg.legExtraInfo._0.tickets) &&
                  leg.legExtraInfo._0.tickets?.length > 0,
          );
};

const getUTSResponse = async (
    subwayLeg: legInfo,
    accessToken: string | undefined,
    journeyId: string | undefined,
): Promise<UTSResponseWithError> => {
    const breakingUTSResponse = {
        crisResponse: undefined,
        errorPopUpType: SubwayErrorPopUpType.UnknownError,
        shouldBreak: true,
        errorMessage: undefined,
    };

    if (!subwayLeg) return breakingUTSResponse;

    const legExtraInfo = subwayLeg?.legExtraInfo.TAG === 'Subway' ? subwayLeg?.legExtraInfo._0 : undefined;
    const sourceStationCode = legExtraInfo?.routeInfo[0]?.originStop.code;
    const destinationStationCode = legExtraInfo?.routeInfo[legExtraInfo?.routeInfo?.length - 1]?.destinationStop?.code;
    const routeID = legExtraInfo?.providerRouteId;
    const bookingAllowed = subwayLeg?.bookingAllowed;
    const estimatedMinFare = subwayLeg?.estimatedMinFare?.amount;
    const estimatedMaxFare = subwayLeg?.estimatedMaxFare?.amount;

    const requiredFields = {
        sourceStationCode,
        destinationStationCode,
        accessToken,
        bookingAllowed,
        estimatedMinFare,
        estimatedMaxFare,
    };
    if (
        Object.values(requiredFields).every(field => !isUndefined(field) && !isNull(field) && field !== false) &&
        accessToken
    ) {
        const bookingParams: Partial<BookingRequestParams> = {
            sourceCode: sourceStationCode,
            destinationCode: destinationStationCode,
            routeID: routeID,
            ticketTypeCode: legExtraInfo?.ticketTypeCode,
        };

        const startTime = Date.now();
        const bookingResult = await utsService.requestBooking(bookingParams, accessToken, journeyId);
        const endTime = Date.now();
        const sdkLatency = endTime - startTime;

        if (bookingResult.status === UTSResponseStatus.ERROR) {
            store.dispatch(
                metricsApiCall({
                    onQueryStarted: undefined,
                    keepUnusedDataFor: undefined,
                }).endpoints.metricsIncrementPost.initiate({
                    body: {
                        metricName: 'uts_sdk_failure',
                        message: `${bookingResult?.data}#userId:${getStringItem(MMKVKey.USER_ID)}#JourneyId:${journeyId}`,
                    },
                }),
            );

            try {
                // eslint-disable-next-line myCustomPlugin/no-direct-json-parse
                const parsedData = JSON.parse(bookingResult?.data);

                const errorCode = parsedData?.respCode;
                if (errorCode == 30052) {
                    return { ...breakingUTSResponse, errorPopUpType: SubwayErrorPopUpType.DeviceChange };
                } else return { ...breakingUTSResponse, errorMessage: parsedData?.respMessage };
            } catch (e) {
                console.error('Error parsing booking result', e);
                return { ...breakingUTSResponse, errorMessage: bookingResult?.data };
            }
        }

        const bookingResultData = safeJsonParse<UTSSDKData | undefined>(bookingResult.data, undefined, 'uts sdk data');
        const authCode = bookingResultData?.bookAuthCode;
        if (bookingResult.status === UTSResponseStatus.SUCCESS && authCode) {
            return {
                crisResponse: {
                    osType: Platform.OS,
                    osBuildVersion: Platform.Version.toString(),
                    bookAuthCode: authCode,
                    latency: sdkLatency,
                },
                errorPopUpType: undefined,
                shouldBreak: false,
                errorMessage: undefined,
            };
        }
    } else {
        const missingFields = Object.entries(requiredFields)
            .filter(([, value]) => isUndefined(value) || isNull(value) || value === false)
            .map(([fieldName, value]) => `${fieldName}: ${value}`);
        if (missingFields.length > 0) {
            logger.logError(`Missing fields : ${missingFields.join(', ')}: JourneyId: ${journeyId}`, 'UTS');
        }
    }
    return breakingUTSResponse;
};

export const processSubwayLeg = async (
    leg: journeyConfirmReqElement,
    journeyId: string | undefined,
    legs: legInfo[],
    utsError: React.MutableRefObject<SubwayErrorPopUpType | undefined>,
    accessToken: string | undefined,
): Promise<{
    processedLeg: journeyConfirmReqElement | null;
    shouldBreak: boolean;
    errorMessage: string | undefined;
}> => {
    const subwayLeg = getSubwayDataByOrder(legs, leg.journeyLegOrder);
    if (subwayLeg === undefined) {
        return { processedLeg: leg, shouldBreak: true, errorMessage: undefined };
    }

    const utsResponse = await getUTSResponse(subwayLeg, accessToken, journeyId);

    if (utsResponse.shouldBreak) {
        utsError.current = utsResponse.errorPopUpType ?? SubwayErrorPopUpType.UnknownError;
        return { processedLeg: leg, shouldBreak: true, errorMessage: utsResponse.errorMessage };
    }

    if (utsResponse.crisResponse === undefined) {
        return { processedLeg: leg, shouldBreak: true, errorMessage: utsResponse.errorMessage };
    }

    return {
        processedLeg: {
            ...leg,
            crisSdkResponse: utsResponse.crisResponse,
        },
        shouldBreak: false,
        errorMessage: undefined,
    };
};

export const createSubwayPopUpState = (
    errorType: SubwayErrorPopUpType,
    userLanguageStrings: strings,
    onMoreOptions: (() => void) | undefined,
    errorMessage: string | undefined,
): SubwayPopUpState | undefined => {
    const configs = createSubwayErrorConfigs(userLanguageStrings, onMoreOptions, errorMessage);
    const config = configs[errorType];
    if (!config) return undefined;

    return {
        popUpProps: {
            title: config.title,
            body: config.body,
        },
        buttonProps: {
            title: config.buttonTitle,
            testId: config.testId,
            onPress: config.onPress,
        },
        visible: true,
    };
};

export const getSubwayDataByOrder = (legs: legInfo[], journeyLegOrder: number) => {
    return legs.find(jrnyLeg => jrnyLeg.order === journeyLegOrder);
};

export const getDevSettingsError = (devSettings: DevSettingsDetails) => {
    const enabledSettings = [];
    /* eslint-disable functional/immutable-data */
    if (devSettings.details?.developerMode) enabledSettings.push('Developer Mode');
    if (devSettings.details?.usbDebugging) enabledSettings.push('USB Debugging');
    if (devSettings.details?.wifiDebugging) enabledSettings.push('Wireless Debugging');

    const baseError = 'For security reasons, train booking is disabled when developer options are enabled.';
    const settingsMessage =
        enabledSettings.length > 0
            ? `${baseError} Disable the following: ${enabledSettings.join(', ')}`
            : `${baseError} Please disable developer options and try again.`;
    return settingsMessage;
};
