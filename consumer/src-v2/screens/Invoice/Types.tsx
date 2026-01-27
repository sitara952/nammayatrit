import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { Action, Resolver } from '@/typescript/utils/common.ts';
import { fareDetail } from '@/typescript/utils/fareEntityHelper';
export type InvoiceScreenAction = Action<'GO_BACK'> | Action<'DOWNLOAD_PDF'>;

export type stopsInfoType = {
    stopsTime: string;
    stopsLocation: string;
};

export type pdfProps = {
    sourceDate: string;
    userName: string;
    license: string;
    finalAmount: string;
    rideShortId: string;
    driverName: string;
    sourceAddress: string;
    destinationAddress: string | undefined;
    sourceTime: string;
    destinationTime: string;
    extraInfo: string;
    htmlFares: string;
    stopsInfo: stopsInfoType[] | undefined;
    height: number;
    appLogoImage: string;
};

export type InvoiceUIProps = {
    firstRideEntity: rideAPIEntity | undefined;
    invDispatch: Resolver<InvoiceScreenAction>;
    endDate: string | undefined;
    endTime: string | undefined;
    sourceAddress: string | undefined;
    destinationAddress: string | undefined;
    costData: fareDetail[];
    pdfProps: pdfProps;
    bookingId: string | undefined;
    bookingStatus: string | undefined;
};

export type CostDataType = {
    cost: string;
    name: string;
};
