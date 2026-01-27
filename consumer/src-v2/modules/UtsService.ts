import { NativeModules } from 'react-native';
import {
    UTSModuleInterface,
    BookingRequestParams,
    UTSResponse,
    ShowTicketRequestParams,
    ReinitializationRequestParams,
} from './UtsModule';
import DeviceInfo from 'react-native-device-info';
import { utsError, getUTSData, logUTSRequest, logUTSResponse } from '@/src-v2/helpers/uts';
const { UTSModule } = NativeModules;

class UTSService implements UTSModuleInterface {
    private defaultBookingConfig: Partial<BookingRequestParams> = {
        mobileNumber: '',
        appCode: 'CUMTA',
        registrationID: '3700001',
        agentAccountID: 3700001,
        zone: 'SR',
        sourceCode: '',
        destinationCode: '',
        deviceID: '',
        mobileMake: DeviceInfo.getBrand(),
        mobileModel: DeviceInfo.getModel(),
        ticketTypeCode: 'J',
        routeID: '',
    };

    private defaultShowTicketConfig: Partial<ShowTicketRequestParams> = {
        mobileNumber: '',
        appCode: 'CUMTA',
        deviceID: '',
        agentAccountID: 3700001,
        zone: 'SR',
        ticketEncData: '',
        sourceStationName: '',
        destinationStationName: '',
        sourceStationNameHindi: '',
        destinationStationNameHindi: '',
        sourceStationNameRegional: '',
        destinationStationNameRegional: '',
        buttonColorHex: '#016ACD',
        buttonTextColorHex: '#ffffff',
    };

    private defaultReinitializationConfig: Partial<ReinitializationRequestParams> = {
        mobileNumber: '',
        appCode: 'CUMTA',
        deviceID: '',
        agentAccountID: 3700001,
        zone: 'SR',
    };

    public async requestBooking(
        params: Partial<BookingRequestParams> = {},
        accessToken: string,
        journeyId: string | undefined,
    ): Promise<UTSResponse> {
        const requestType = 'requestBooking';
        try {
            const utsData = await getUTSData();

            if (utsData.utsResponse) return utsData.utsResponse;

            const finalParams = {
                ...this.defaultBookingConfig,
                deviceID: utsData.deviceID,
                mobileNumber: utsData.mobileNumber,
                ...params,
            } as BookingRequestParams;

            logUTSRequest(finalParams, requestType, journeyId);
            const result = await UTSModule.requestBooking(finalParams, accessToken);
            logUTSResponse(result, requestType, journeyId);

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '';
            return utsError(errorMessage, requestType);
        }
    }

    public async showTicket(params: Partial<ShowTicketRequestParams> = {}): Promise<UTSResponse> {
        const requestType = 'showTicket';
        try {
            const utsData = await getUTSData();

            if (utsData.utsResponse) return utsData.utsResponse;

            const finalParams = {
                ...this.defaultShowTicketConfig,
                deviceID: utsData.deviceID,
                mobileNumber: utsData.mobileNumber,
                ...params,
            } as ShowTicketRequestParams;

            logUTSRequest(finalParams, requestType, undefined);
            const result = await UTSModule.showTicket(finalParams);
            logUTSResponse(result, requestType, undefined);

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '';
            return utsError(errorMessage, requestType);
        }
    }

    public async requestReinitialization(
        params: Partial<ReinitializationRequestParams> = {},
        accessToken: string,
    ): Promise<UTSResponse> {
        const requestType = 'requestReinitialization';
        try {
            const utsData = await getUTSData();

            if (utsData.utsResponse) return utsData.utsResponse;

            const finalParams = {
                ...this.defaultReinitializationConfig,
                deviceID: utsData.deviceID,
                mobileNumber: utsData.mobileNumber,
                ...params,
            } as ReinitializationRequestParams;

            logUTSRequest(finalParams, requestType, undefined);
            const result = await UTSModule.requestReinitialization(finalParams, accessToken);
            logUTSResponse(result, requestType, undefined);

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '';
            return utsError(errorMessage, requestType);
        }
    }
}

export const utsService = Object.freeze(new UTSService());
