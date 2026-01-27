import React from 'react';
import { Icon } from '../common/Icon';
import ClockIcon from '../svg/ClockIcon';
import { AutoIcon, BikeIconJourney, BusIcon, TrainIcon, WalkIcon } from '../svg/transport';
import { TransitType } from './types';
import { TransitSummaryTypeEnum } from '../../screens/JourneyInfoScreen/components/TransitSummary';
import { CarIcon } from '../svg/transport/CarIcon';
import { MetroConditionalIcon } from './MetroConditionalIcon';
export const getIconFromType = (type: TransitType, size: number, color: string = '#636164') => {
    switch (type) {
        case 'auto':
            return <Icon color={color} icon={<AutoIcon fill={undefined} />} size={size} />;
        case 'bus':
            return <Icon color={color} icon={<BusIcon fill={undefined} />} size={size} />;
        case 'metro':
            return <MetroConditionalIcon noLeaf={true} color={color} size={size} />;
        case 'metroNoleaf':
            return <MetroConditionalIcon noLeaf={true} color={color} size={size} />;
        case 'walk':
            return <Icon color={color} icon={<WalkIcon fill={undefined} />} size={size} />;
        case 'train':
            return <Icon color={color} icon={<TrainIcon fill={undefined} />} size={size} />;
        case 'taxi':
            return <Icon color={color} icon={<CarIcon fill={undefined} />} size={size} />;
        case 'bike':
            return <Icon color={color} icon={<BikeIconJourney fill={undefined} />} size={size} />;
        default:
            return <Icon color={color} icon={<ClockIcon fill={undefined} />} size={16} />;
    }
};

export const getIconBGFromType = (type: TransitType) => {
    switch (type) {
        case 'auto':
        case 'taxi':
        case 'bike':
            return '#E1D4F8';
        case 'bus':
            return '#FFE58D';
        case 'metro':
            return '#CCE6F6';
        case 'metroNoleaf':
            return '#2C6ED4';
        case 'walk':
            return '#828386';
        case 'train':
            return '#C6E4B7';
        default:
            return '#E1E4E9';
    }
};

export const getIconColorFromType = (transitType: TransitType, type: TransitSummaryTypeEnum) => {
    if (type === 'alternate') {
        if (transitType === 'walk') return '#FFFFFF';
        return '#656565';
    }

    if (type === 'alternate-colored') {
        switch (transitType) {
            case 'auto':
            case 'taxi':
            case 'bike':
                return '#44178F';
            case 'bus':
                return '#470F2D';
            case 'metro':
                return '#1F2D3D';
            case 'train':
                return '#17402F';
            case 'walk':
                return '#FFFFFF';
        }
    }

    return '#656565';
};
