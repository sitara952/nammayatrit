import { strings } from 'config-types';
import { JourneyId } from '@/typescript/state/client/user';
import { Action, Resolver } from '@/typescript/utils/common';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { issueCategoryListRes } from '@/readOnly/api/types/IssueCategoryListRes.gen';
import { issueCategoryRes } from '@/readOnly/api/types/IssueCategoryRes.gen';

export type NoRidesMessageProps = {
    onBookYourFirstRideButton: () => void;
    userLanguageStrings: strings;
    isHelpAndSupportScreen: boolean | undefined;
    isAnyFilterApplied: boolean;
    issueCategory: issueCategoryRes | undefined;
};

export type MyRidesAction =
    | Action<'GET_FULL_JOURNEY_SUMMARY', { journeyId: JourneyId; journeyInfoResp: journeyInfoResp | undefined }>
    | Action<'TRACK_ACTIVE_JOURNEY', { journeyId: JourneyId; unifiedQR: string | undefined }>
    | Action<
          'NAVIGATE_TO_HELP_AND_SUPPORT',
          { rideId: string | undefined; driverNumber: string | undefined; currentActiveTicket: string | undefined }
      >;

export type MyRideScreenProps = {
    onBookYourFirstRideButton: () => void;
    mpDispatch: Resolver<MyRidesAction>;
    isActiveRide: (
        isActive: boolean,
        isExpired: boolean | undefined,
        journeyInfoResp: journeyInfoResp | null,
    ) => boolean;
    isHelpAndSupportScreen: boolean | undefined;
    issueCategory: issueCategoryRes | undefined;
    fetchedIssueCategories: issueCategoryListRes | undefined;
};
