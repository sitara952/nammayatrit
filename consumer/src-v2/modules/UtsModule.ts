export interface BookingRequestParams {
    mobileNumber: string;
    appCode: string;
    registrationID: string;
    agentAccountID: number;
    zone: string;
    sourceCode: string;
    destinationCode: string;
    deviceID: string;
    mobileMake: string;
    mobileModel: string;
    ticketTypeCode: string;
    routeID: string;
}

export interface ShowTicketRequestParams {
    mobileNumber: string;
    appCode: string;
    deviceID: string;
    agentAccountID: number;
    zone: string;
    ticketEncData: string;
    sourceStationName: string;
    destinationStationName: string;
    sourceStationNameHindi: string;
    destinationStationNameHindi: string;
    sourceStationNameRegional: string;
    destinationStationNameRegional: string;
    buttonColorHex: string;
    buttonTextColorHex: string;
}

export interface ReinitializationRequestParams {
    mobileNumber: string;
    appCode: string;
    deviceID: string;
    agentAccountID: number;
    zone: string;
}

export enum UTSResponseStatus {
    SUCCESS = 'success',
    ERROR = 'error',
}

export interface UTSResponse {
    status: UTSResponseStatus;
    data: string;
}

export interface IOSErrorResponse {
    respCode: number;
    respMessage?: string;
}

export interface UTSModuleInterface {
    requestBooking(
        params: BookingRequestParams,
        accessToken: string,
        journeyId: string | undefined,
    ): Promise<UTSResponse>;
    showTicket(params: ShowTicketRequestParams): Promise<UTSResponse>;
    requestReinitialization(params: ReinitializationRequestParams, accessToken: string): Promise<UTSResponse>;
}

export interface UTSSDKData {
    bookAuthCode: string;
}
