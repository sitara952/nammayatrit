import { FEEDBACK_EMOJI_MAP } from '@/src-v2/utils/common';
import { strings } from 'config-types';

export const calculateTimeWithNY = (
    dateString: string,
    userLanguageStrings: strings,
): { value: number; unit: string } => {
    const onboardedDate = new Date(dateString);
    const currentDate = new Date();
    const diffInYears = currentDate.getFullYear() - onboardedDate.getFullYear();
    const diffInMonths =
        (currentDate.getFullYear() - onboardedDate.getFullYear()) * 12 +
        (currentDate.getMonth() - onboardedDate.getMonth());

    // Adjust if not yet reached the onboarding month/day this year
    if (
        currentDate.getMonth() < onboardedDate.getMonth() ||
        (currentDate.getMonth() === onboardedDate.getMonth() && currentDate.getDate() < onboardedDate.getDate())
    ) {
        const adjustedYears = diffInYears - 1;
        const adjustedMonths = diffInMonths - 1;

        if (adjustedYears > 0) {
            return { value: adjustedYears, unit: userLanguageStrings.years };
        } else {
            return { value: adjustedMonths, unit: userLanguageStrings.months };
        }
    }

    if (diffInYears > 0) {
        return { value: diffInYears, unit: userLanguageStrings.years };
    } else {
        return { value: diffInMonths, unit: userLanguageStrings.months };
    }
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export function mapFeedbackPillsToTags(feedBackPills: string[]): { emoji: string; label: string }[] {
    return (feedBackPills || ['Skill Driver']).map((label: string) => ({
        emoji: FEEDBACK_EMOJI_MAP[label] || '⭐',
        label,
    }));
}

export const truncateDriverName = (driverName: string) => {
    if (!driverName) return '';
    return driverName.split(' ')[0];
};

export const isVehicleTypeCab = (vehicleServiceTierType: string | undefined | null): boolean => {
    return (
        vehicleServiceTierType !== 'AUTO_RICKSHAW' &&
        vehicleServiceTierType !== 'EV_AUTO_RICKSHAW' &&
        vehicleServiceTierType !== 'E_RICKSHAW' &&
        vehicleServiceTierType !== 'AUTO_PLUS' &&
        vehicleServiceTierType !== 'BIKE' &&
        vehicleServiceTierType !== 'BIKE_PLUS' &&
        vehicleServiceTierType !== 'DELIVERY_BIKE'
    );
};
