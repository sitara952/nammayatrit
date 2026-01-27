import { BannerConfig } from '../types';
import mtIcTollIncluded from '@/typescript/assets/ny-service/mt_ic_toll_included_banner.webp';
import { createBannerConfig } from '../../../utils/BannerPopup';

export const tollIncludedBannerConfig: BannerConfig = createBannerConfig({
    bannerId: 'tollIncludedBanner',

    title: 'Toll Charges are included in your Final Fare',
    imageUrl: mtIcTollIncluded,

    primaryButton: {
        text: 'Got It',
    },

    secondaryButton: undefined,

    accessibility: {
        importanceLevel: 'normal',
        accessibilityLabel: 'Toll charges information banner',
        accessibilityHint: 'Shows information about toll charges included in fare',
    },
});
