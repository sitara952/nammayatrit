import { Action, Resolver } from '@/typescript/utils/common.ts';

export type ScheduledRideProps = {
    scheduledRideList: {
        id: string;
        date: string;
        type: string;
        image: string;
        destination: string | undefined;
    }[];
    schRideDispatch: Resolver<ScheduledRideComponentAction>;
};

export type ScheduledRideItem = {
    schRideDispatch: Resolver<ScheduledRideComponentAction>;
    index: number;
    item: ScheduledRideProps['scheduledRideList'][number];
};

export type ScheduledRideComponentAction = Action<'CLOSE'> | Action<'CLICKED', { id: string }>;
