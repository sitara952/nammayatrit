/* eslint-disable myCustomPlugin/no-as-in-modified-files, myCustomPlugin/no-any-in-modified-files */
// open MultimodalSearchResp
// open SearchReq
import { mkRideSearchReq, searchReqTypeToJson } from '@/api/apiTypes/RideSearch.bs';
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeMultimodalSearchResp } from '@/readOnly/api/types/MultimodalSearchResp.bs';
import { multimodalSearchResp } from '@/readOnly/api/types/MultimodalSearchResp.gen';
import { selectToken } from '@/typescript/state/client/auth';
import { setJourneys, setSearchRequest, setSelectedJourney } from '@/typescript/state/client/search';
import { setRetrySearch, setSearchFailed } from '@/typescript/state/client/session';
import { setSearchId } from '@/typescript/state/client/user';
import { RootState } from '@/typescript/state/store';

export type multimodalSearchPostWithParams = {
    body: any;
};

const getCurrentTimePlusNmin = (n: number): string => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + n);
    return currentTime.toISOString();
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalSearchPost: build.mutation<multimodalSearchResp, multimodalSearchPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/multimodalSearch' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    headers: {
                        initateJourney: true,
                        'imei-number': body.deviceID,
                    },
                    body: (() => {
                        const currentTime = new Date().toISOString();
                        const startTime =
                            body.pickupTime && body.pickupTime < currentTime ? currentTime : body.pickupTime;
                        return searchReqTypeToJson(
                            mkRideSearchReq(
                                body.source,
                                body.stops[body.stops.length - 1],
                                body.stops.slice(0, -1),
                                body.isFareProductOneway,
                                startTime,
                                body.dropTime,
                                body.isIntercity,
                                getCurrentTimePlusNmin(1),
                                body.rentalDuration,
                                body.rentalDistance,
                                body.ptSearchData,
                                body.isAmbulance,
                            ),
                        );
                    })(),
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeMultimodalSearchResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as multimodalSearchResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalSearchPostMutation } = apiCall({
    onQueryStarted: async (_arg, { queryFulfilled, dispatch, getState }) => {
        try {
            const { data } = await queryFulfilled;
            const resp = data;
            const state = getState() as RootState;
            const userToken = selectToken(state);
            dispatch(
                setSearchRequest({ searchExpiry: resp.searchExpiry, searchId: resp.searchId, routeInfo: undefined }),
            );
            dispatch(setSearchId({ id: userToken, payload: resp.searchId }));
            dispatch(setRetrySearch(false));
            dispatch(setJourneys({ id: resp.searchId, payload: resp.journeys }));
            dispatch(setSelectedJourney({ id: resp.searchId, payload: resp.journeys[0] ?? null }));
            return resp;
        } catch (err) {
            console.error('Search API failed: ', err);
            dispatch(setSearchFailed(true));
        }
    },
    keepUnusedDataFor: undefined,
});
