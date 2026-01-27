import { useCrisGetSDKDataPostMutation } from '@/typescript/state/server/crisApi';
import { ShowTicketRequestParams, UTSResponse } from '@/src-v2/modules/UtsModule';
import { utsService } from '@/src-v2/modules/UtsService';
import { getUTSData, utsError, isReinitializationRequired } from '@/src-v2/helpers/uts';
import { getSDKDataResponse } from '@/readOnly/api/types/GetSDKDataResponse.gen';
import { JourneyId } from '@/typescript/state/client/user';

export const useShowUTSTicket = ({ journeyId }: { journeyId: JourneyId | null }) => {
    const [getSDKData] = useCrisGetSDKDataPostMutation();

    const reinitializeSDK = async (): Promise<UTSResponse> => {
        const utsData = await getUTSData();
        if (utsData.utsResponse) return utsData.utsResponse;
        const sdkDataResp: getSDKDataResponse | undefined = await getSDKData({
            deviceID: utsData.deviceID,
            mobileNo: utsData.mobileNumber,
        }).unwrap();
        if (!sdkDataResp || !sdkDataResp.sdkData || sdkDataResp.respCode !== 0)
            return utsError(`/cris/getSDKData api call failed : ${sdkDataResp?.respMessage}`, 'reinitializeSDK');
        return await utsService.requestReinitialization({}, sdkDataResp.sdkData);
    };

    const showTicket = async (showTicketRequest: Partial<ShowTicketRequestParams>): Promise<UTSResponse> => {
        const result = await utsService.showTicket(showTicketRequest);
        const shouldReinitialize = isReinitializationRequired(result, journeyId?.toString());
        if (shouldReinitialize) {
            await reinitializeSDK();
            return await utsService.showTicket(showTicketRequest);
        }
        return result;
    };

    return {
        showTicket,
    };
};
