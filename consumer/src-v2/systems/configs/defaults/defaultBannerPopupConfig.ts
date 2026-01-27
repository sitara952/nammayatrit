import { BannerPopupsConfig } from '@/src-v2/systems/configs/types';

export const defaultBannerPopupsConfig: BannerPopupsConfig = {
    acPreferenceBannerConfig: { type: 'exclude', cities: [] },
    tollIncludedBannerConfig: { type: 'exclude', cities: [] },
    tollNotIncludedBannerConfig: { type: 'exclude', cities: [] },
    nonAcBannerConfig: { type: 'exclude', cities: [] },
    sorryActionBannerConfig: { type: 'exclude', cities: [] },
    thankyouRideBannerConfig: { type: 'exclude', cities: [] },
    tollAndParkingBannerConfig: { type: 'exclude', cities: [] },
    parkingBannerConfig: { type: 'exclude', cities: [] },
    driverDemandExtraBannerConfig: { type: 'include', cities: ['chennai', 'bangalore', 'kolkata'] },
    vehicleCleanlinessBannerConfig: {
        type: 'include',
        cities: [
            'delhi',
            'noida',
            'gurugram',
            'rajkot',
            'somnath',
            'dwarka',
            'ahmedabad',
            'surat',
            'vadodara',
            'jamnagar',
        ],
    },
    bannerTicketCreationConfig: {
        extraFareTicketCreation: { type: 'include', cities: ['bangalore'] },
        acPreferenceTicketCreation: { type: 'include', cities: ['bangalore'] },
    },
};
