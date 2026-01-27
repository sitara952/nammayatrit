import { api } from './../api';

/**
 * Ad Config Response Type
 * Matches the backend AdConfigResponse structure
 */
export interface AdConfigResponse {
    campaign_id: string;
    campaign_item_id: string;
    asset_url: string;
    asset_type: string;
    targeting_segments: string[];
    max_impressions_per_user_per_day: number;
    priority: number;
    source: string;
    redirect_url: string;
}

export interface AdConfigApiResponse {
    placement_code: string;
    items: AdConfigResponse[];
}

/**
 * Wrapped API response format from backend
 */
export interface WrappedAdConfigResponse {
    success: boolean;
    data: AdConfigApiResponse[];
    statusCode: number;
}

/**
 * Type guard to check if response is wrapped format
 */
export function isWrappedResponse(
    response: WrappedAdConfigResponse | AdConfigApiResponse[],
): response is WrappedAdConfigResponse {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        'data' in response &&
        'statusCode' in response
    );
}

export const adConfigApi = api.injectEndpoints({
    endpoints: build => ({
        getAdConfig: build.query<WrappedAdConfigResponse | AdConfigApiResponse[], void>({
            query: () => ({
                url: '/api/ads/config',
                method: 'GET',
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
    }),
    overrideExisting: false,
});

export const { useGetAdConfigQuery, useLazyGetAdConfigQuery } = adConfigApi;
