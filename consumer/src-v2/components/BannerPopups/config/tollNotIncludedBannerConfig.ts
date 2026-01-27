import { BannerConfig } from '../types';
import mtIcTollNotIncluded from '@/typescript/assets/ny-service/mt_ic_toll_excluded_banner.webp';
import { createBannerConfig } from '../../../utils/BannerPopup';

export const tollNotIncludedBannerConfig: BannerConfig = createBannerConfig({
    bannerId: 'tollNotIncludedBanner',
    visibility: true,

    title: 'Toll Charges are NOT included in your Final Fare',
    imageUrl: mtIcTollNotIncluded,

    primaryButton: {
        text: 'Got It',
    },

    secondaryButton: undefined,

    accessibility: {
        importanceLevel: 'normal',
        accessibilityLabel: 'Toll charges not included notification',
        accessibilityHint: 'Information about toll charges not being included in final fare',
    },
});
