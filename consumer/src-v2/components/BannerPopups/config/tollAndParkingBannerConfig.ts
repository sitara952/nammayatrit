import { BannerConfig } from '../types';
import mtIcTollIncluded from '@/typescript/assets/ny-service/mt_ic_toll_parking.webp';
import { createBannerConfig } from '../../../utils/BannerPopup';

export const tollAndParkingBannerConfig: BannerConfig = createBannerConfig({
    bannerId: 'tollAndParkingIncludedBanner',

    title: 'Toll and parking charges included in your Final Fare',
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
