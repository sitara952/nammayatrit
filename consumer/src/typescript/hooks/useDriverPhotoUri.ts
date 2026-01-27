import { useMemo } from 'react';
import { useRideDriverPhotoMediaGetQuery } from '@/api/integrations/rtk/RideDriverPhotoMediaGet';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';

/**
 * Custom hook to fetch driver photo from API.
 * The driverImage from API is a URL containing a filePath parameter.
 * This hook extracts the filePath, fetches the base64 image data, and returns a usable image URI.
 *
 * @param driverImageUrl - The driver image URL from rideDetails (e.g., "https://...?filePath=xxx")
 * @returns The image URI to use (either fetched base64 data or default profile)
 */
export const useDriverPhotoUri = (driverImageUrl: string | undefined | null): string => {
    const appConfig = useAppSelector(selectAppConfig);

    const driverImageFilePath = useMemo(() => {
        if (!driverImageUrl) return null;
        try {
            const url = new URL(driverImageUrl);
            return url.searchParams.get('filePath');
        } catch {
            return driverImageUrl.includes('filePath=') ? null : driverImageUrl;
        }
    }, [driverImageUrl]);

    const { data: driverPhotoBase64 } = useRideDriverPhotoMediaGetQuery(
        { filePath: driverImageFilePath || '' },
        { skip: !driverImageFilePath },
    );

    const imageUri = useMemo(() => {
        if (driverPhotoBase64) {
            return `data:image/jpeg;base64,${driverPhotoBase64}`;
        }
        return appConfig.assets.driverDefaultProfileUri;
    }, [driverPhotoBase64, appConfig.assets.driverDefaultProfileUri]);

    return imageUri;
};
