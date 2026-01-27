import React from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { AutoIcon, BusIcon, MetroIcon, TrainIcon, WalkIcon } from '../../../components/svg/transport';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import SearchIcon from '@/src-v2/multimodal/components/svg/Search';

export const getIconFromType = (
    type: MultimodalTravelMode_multimodalTravelMode,
    size: number,
    color: string | undefined,
) => {
    switch (type) {
        case 'Taxi':
            return <Icon icon={<AutoIcon fill={undefined} />} size={size} color={color} />;
        case 'Bus':
            return <Icon icon={<BusIcon fill={undefined} />} size={size} color={color} />;
        case 'Metro':
            return <Icon icon={<MetroIcon fill={undefined} />} size={size} color={color} />;
        case 'Subway':
            return <Icon icon={<TrainIcon fill={undefined} />} size={size} color={color} />;
        case 'Walk':
            return <Icon icon={<WalkIcon fill={undefined} />} size={size} color={color} />;
        default:
            return null;
    }
};

export const getIconFromSearch = () => {
    return <Icon icon={<SearchIcon />} size={20} color={'#FFFFFF'} />;
};

export const getIconBGFromType = (type: MultimodalTravelMode_multimodalTravelMode) => {
    switch (type) {
        case 'Bus':
            return '#FFDF75';
        case 'Metro':
            return '#A4DBFF';
        case 'Taxi':
            return '#E1D4F8';
        case 'Subway':
            return '#C4DCB8';
        case 'Walk':
            return '#E1E4E9';
        default:
            return '#E1E4E9';
    }
};

export const getIconSecondaryBGFromType = (type: MultimodalTravelMode_multimodalTravelMode) => {
    switch (type) {
        case 'Bus':
            return '#470F2D';
        case 'Metro':
            return '#1F2D3D';
        case 'Taxi':
            return '#E1D4F8';
        case 'Subway':
            return '#17402F';
        case 'Walk':
            return '#B5BAC5';
        default:
            return '#E1E4E9';
    }
};

type TransportIconWrapperProps = {
    journeyType: MultimodalTravelMode_multimodalTravelMode;
    containerStyle: ViewStyle;
    size: number;
};

export const TransitIconWrapper = (props: TransportIconWrapperProps) => {
    const { journeyType, containerStyle, size = 20 } = props;
    return (
        <Animated.View
            key={journeyType}
            style={[
                tailwind.style('items-center justify-center', `bg-[${getIconBGFromType(journeyType)}]`),
                containerStyle,
            ]}>
            <Animated.View style={tailwind.style('')}>{getIconFromType(journeyType, size, undefined)}</Animated.View>
        </Animated.View>
    );
};
