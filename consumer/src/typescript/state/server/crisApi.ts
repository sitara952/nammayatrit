import { getSDKDataRequest } from '@/readOnly/api/types/GetSDKDataRequest.gen';
import { crisChangeDeviceRequest } from '@/readOnly/api/types/CrisChangeDeviceRequest.gen';
import { api } from './../api';

export const crisApi = api.injectEndpoints({
    endpoints: build => ({
        crisGetSDKDataPost: build.mutation({
            query: (request: getSDKDataRequest) => ({
                url: '/cris/getSDKData',
                method: 'POST',
                body: request,
            }),
        }),
        crisTriggerOtpGeneration: build.query({
            query: () => ({
                url: '/cris/otp/generation',
                method: 'GET',
            }),
        }),
        crisChangeDevicePost: build.mutation({
            query: (request: crisChangeDeviceRequest) => ({
                url: '/cris/change/device',
                method: 'POST',
                body: request,
            }),
        }),
    }),
    overrideExisting: false,
});

export const { useCrisGetSDKDataPostMutation, useLazyCrisTriggerOtpGenerationQuery, useCrisChangeDevicePostMutation } =
    crisApi;
