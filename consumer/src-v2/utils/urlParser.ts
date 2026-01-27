import { UtmParams } from '@/typescript/state/client/session';

export type ParsedUrl = {
    pathname: string;
    queryParams: Record<string, string>;
};

export const urlParser = (url: URL): ParsedUrl | null => {
    try {
        const queryParams = Object.fromEntries(
            Array.from(url.searchParams.entries()).map(([key, value]) => [key, decodeURIComponent(value)]),
        );

        return {
            pathname: url.pathname,
            queryParams,
        };
    } catch (error) {
        console.error('urlParser: Error parsing the URL', error);
        return null;
    }
};

export const parseValueInParams = (url: ParsedUrl, queryParam: string): Record<string, string> | undefined => {
    const queryParams = url.queryParams;
    if (queryParams[queryParam]) {
        return queryParams[queryParam]?.split('&').reduce((acc: Record<string, string>, pair: string) => {
            const [key, value] = pair.split('=');
            return key ? { ...acc, [key]: decodeURIComponent(value || '') } : acc;
        }, {});
    }
    console.warn(`${queryParam} is not present in ${JSON.stringify(url.queryParams)}`);
    return undefined;
};

export const extractUtmParams = (url: URL): UtmParams => {
    const searchParams = url.searchParams;
    const utmKeys = [
        'gclid',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'utm_creative_format',
        'id',
    ] as const;

    const params = utmKeys.reduce(
        (acc, key) => {
            const value = searchParams.get(key);
            return {
                ...acc,
                [key]: value ? decodeURIComponent(value) : undefined,
            };
        },
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        {} as Record<string, string | undefined>,
    );

    return {
        gclid: params['gclid'],
        utm_source: params['utm_source'],
        utm_medium: params['utm_medium'],
        utm_campaign: params['utm_campaign'],
        utm_term: params['utm_term'],
        utm_content: params['utm_content'],
        utm_creative_format: params['utm_creative_format'],
        campaignId: params['utm_campaign'] || params['id'],
    };
};

export const getUtmLatLon = (url: URL) => {
    const searchParams = url.searchParams;
    const pandalLat = searchParams.get('pandalLat');
    const pandalLon = searchParams.get('pandalLon');
    return { pandalLat, pandalLon };
};
