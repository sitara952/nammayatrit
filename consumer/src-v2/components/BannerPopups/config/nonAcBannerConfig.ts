import { BannerConfig } from '../types';
import mtIcNonAc from '@/typescript/assets/ny-service/mt_ic_ac_ride.webp';
import { createBannerConfig } from '../../../utils/BannerPopup';

export const nonAcBannerConfig: BannerConfig = createBannerConfig({
    bannerId: 'nonAcBanner',

    title: 'Enjoy your budget friendly, Non AC ride!',
    imageUrl: mtIcNonAc,

    primaryButton: {
        text: 'Okay',
    },

    secondaryButton: undefined,

    accessibility: {
        importanceLevel: 'normal',
        accessibilityLabel: 'Non AC ride confirmation',
        accessibilityHint: 'Information about your non AC ride selection',
    },
});
