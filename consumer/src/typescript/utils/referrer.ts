import { NativeModules, Platform } from 'react-native';
import { UtmParams } from '../state/client/session';

const { InstallReferrer } = NativeModules;

export interface ReferrerDetails {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    utm_creative_format?: string;
    gclid?: string;
    id?: string;
    campaignId?: string; // Mapped from 'id' if present
}

/**
 * Fetches the install referrer details on Android.
 * Returns a promise that resolves to UtmParams or null.
 */
export const getInstallReferrerParams = async (): Promise<UtmParams | null> => {
    if (Platform.OS !== 'android') {
        return null;
    }

    try {
        console.info('[InstallReferrer] Calling native getReferrerDetails...');
        const details: ReferrerDetails = await InstallReferrer.getReferrerDetails();
        console.info('[InstallReferrer] Received details from native:', details);

        if (Object.values(details).every(v => v === undefined || v === null)) {
            console.info('[InstallReferrer] No details found in referrer.');
            return null;
        }

        return {
            gclid: details.gclid,
            utm_source: details.utm_source,
            utm_medium: details.utm_medium,
            utm_campaign: details.utm_campaign,
            utm_term: details.utm_term,
            utm_content: details.utm_content,
            utm_creative_format: details.utm_creative_format,
            campaignId: details.utm_campaign || details.id || details.campaignId, // User requested utm_campaign for Play Store installs
        };
    } catch (error) {
        console.warn('[InstallReferrer] Failed to fetch referrer details:', error);
        return null;
    }
};
