// Types for HelpAndSupport screen
import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen';
import { Action, Resolver } from '@/typescript/utils/common';
import { issueCategoryListRes } from '@/readOnly/api/types/IssueCategoryListRes.gen';
import { IssueScreenProps } from '../ActiveTickets/Types';
import { issueCategoryRes } from '@/readOnly/api/types/IssueCategoryRes.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';

export type IssueListModalType = 'HIDDEN' | 'ONGOING_ISSUES' | 'RESOLVED_ISSUES';

export type HelpAndSupportTopicItem = {
    testID: string;
    icon: React.ReactElement;
    iconSize: number;
    accessibilityLabel: string;
    text: string;
    onPress: () => void;
};

export type recentBooking =
    | {
          tag: 'Ride';
          source: locationAPIEntity | undefined;
          stops: locationAPIEntity[];
          rideStartTime: string | undefined;
          rideEndTime: string | undefined;
      }
    | {
          tag: 'Ticket';
          leg: legInfo;
      }
    | undefined;
export type HelpAndSupportUIProps = {
    recentBooking: recentBooking;

    activeTickets: IssueScreenProps[] | undefined;
    closedTicketIds: IssueScreenProps[] | undefined;
    issueCategories: issueCategoryListRes | undefined;

    isLoadingRecent: boolean;
    helpAndSupportDispatch: Resolver<HelpAndSupportAction>;
};

export type HelpAndSupportAction =
    | Action<'HANDLE_BACKPRESS'>
    | Action<'REPORT_ISSUE'>
    | Action<'VIEW_ALL_RIDES'>
    | Action<'APP_RELATED_ISSUES'>
    | Action<'RIDE_RELATED_ISSUES'>
    | Action<'BUSINESS_PROFILE_ISSUES'>
    | Action<'ACTIVE_TICKETS_CLICKED'>
    | Action<'HISTORY_CLICKED'>
    | Action<'METRO_ISSUE_FAQ_CLICKED', string>
    | Action<'SELECT_CATEGORY', issueCategoryRes>
    | Action<'SELECT_CATEGORY_WITH_RIDE', issueCategoryRes>
    | Action<'SELECT_CATEGORY_WITH_TICKET', issueCategoryRes>;
