import { Action, Resolver } from '@/typescript/utils/common';

export type BusinessIssueFaqItem = {
    id: string;
    title: string;
    description: string;
    bulletPoints: string[];
    nextDescription: string | undefined;
    buttonText: string | undefined;
    buttonOnPress: (() => void) | undefined;
};

export type BusinessIssueFaqAction = Action<'RAISE_TICKET', { itemId: string }> | Action<'HANDLE_BACKPRESS'>;

export type BusinessIssueFaqUIProps = {
    faqItems: BusinessIssueFaqItem[];
    businessIssueFaqDispatch: Resolver<BusinessIssueFaqAction>;
    heading: string;
};
