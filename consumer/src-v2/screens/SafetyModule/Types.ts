import { BookingId } from '@/typescript/state/client/user';
import { strings } from 'config-types';

export type ContactViewProps = {
    name: string;
    contactNumber: string;
};

export type InitialSOSViewProps = {
    bookingId: BookingId | null;
    userLanguageStrings: strings;
};

export type pointersViewProps = {
    pointerColor: string | undefined;
    pointerIcon: React.ReactElement;
    description: string;
};
