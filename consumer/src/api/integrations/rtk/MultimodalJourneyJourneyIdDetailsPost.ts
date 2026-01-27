// open JourneyDetails
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyDetails } from '../../../readOnly/api/types/JourneyDetails.bs';
import { journeyDetails } from '../../../readOnly/api/types/JourneyDetails.gen';

export type multimodalJourneyJourneyIdDetailsPostWithParams = {
    journeyId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyJourneyIdDetailsPost: build.mutation<
                journeyDetails,
                multimodalJourneyJourneyIdDetailsPostWithParams
            >({
                query: ({ journeyId }) => ({
                    url: (function () {
                        const url = '/multimodal/journey' + '/' + journeyId + '/' + 'details' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: {},
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeJourneyDetails(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as journeyDetails;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyJourneyIdDetailsPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
