import { BannerConfig } from '../types';
import mtIcTollIncluded from '@/typescript/assets/ny-service/mt_ic_parking.webp';
import { createBannerConfig } from '../../../utils/BannerPopup';

export const parkingBannerConfig: BannerConfig = createBannerConfig({
    bannerId: 'parkingBanner',

    title: 'Parking Charges are included in your Final Fare',
    imageUrl: mtIcTollIncluded,

    primaryButton: {
        text: 'Got It',
    },

    secondaryButton: undefined,

    accessibility: {
        importanceLevel: 'normal',
        accessibilityLabel: 'Parking charges information banner',
        accessibilityHint: 'Shows information about parking charges included in fare',
    },
});
