import React from 'react';
import HomeSvg from '@/typescript/assets/svg/miscellaneous/HomeSvg';

export type SearchDataTypes = {
    id: number;
    title: string;
    description: string;
    icon: React.JSX.Element;
    time: number;
};

export const confirmPickupData: SearchDataTypes[] = [
    {
        id: 0,
        title: 'Brooklyn Botanic Garden Brooklyn Botanic Garden Botanic Garden',
        description: '990 Washington Ave, Brooklyn, NY 11225 990 Washington Ave, Brooklyn, NY 11225',
        icon: <HomeSvg fill={undefined} />,
        time: 3,
    },
    {
        id: 1,
        title: 'Brooklyn Botanic Garden Brooklyn Botanic Garden Botanic Garden',
        description: '990 Washington Ave, Brooklyn, NY 11225 990 Washington Ave, Brooklyn, NY 11225',
        icon: <HomeSvg fill={undefined} />,
        time: 3,
    },
];
