export const AD_VIEW_UNIT_IDS = {
    RIDE_CONFIRMED_BANNER: 'ride_confirmed_banner',
    REVIEW_FEEDBACK_BANNER: 'review_feedback_banner',
    RIDE_COMPLETED_FEEDBACK_BANNER: 'ride_completed_feedback_banner',
} as const;

export type AdViewUnitId = (typeof AD_VIEW_UNIT_IDS)[keyof typeof AD_VIEW_UNIT_IDS];
