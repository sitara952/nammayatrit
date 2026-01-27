import { Action, Resolver } from '@/typescript/utils/common';
import { message } from '@/readOnly/api/types/Message.gen';

export type MetroIssueFaqAction = Action<'RAISE_TICKET', { itemId: string }> | Action<'HANDLE_BACKPRESS'>;

export type MetroIssueFaqUIProps = {
    faqMessages: message[];
    metroIssueFaqDispatch: Resolver<MetroIssueFaqAction>;
    heading: string;
    isLoading: boolean;
};
