import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import ClockIcon from '@/src-v2/multimodal/components/svg/ClockIcon';
import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { Icon } from '../../../components/common/Icon';
import { AutoIcon, BusIcon, MetroIcon, TrainIcon, WalkIcon } from '../../../components/svg/transport';

export type TransitType = MultimodalTravelMode_multimodalTravelMode | 'Wait' | 'Tick';

export const Tick = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 14 14" fill="none">
            <Path
                d="M5.73512 10.7251C5.43006 10.7251 5.13244 10.5986 4.92411 10.3828L2 7.37686L3.06399 6.34263L5.72768 9.07329C6.65774 8.06882 8.62946 6.04501 11.0848 4.13281L12 5.30841C9.38095 7.3471 7.33482 9.51228 6.57589 10.3531C6.36756 10.5837 6.06994 10.7176 5.75744 10.7251H5.73512Z"
                fill="#09941E"
            />
        </Svg>
    );
};

const MetroWaiting = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 26 26" fill="none">
            <Path
                d="M12.5749 1.02344C15.3618 1.02344 18.046 1.51957 20.5593 2.37442C21.1748 2.5796 21.6028 3.12686 21.6883 3.75949V3.77609C21.979 5.8962 22.1672 9.05937 22.1672 12.5986C22.1672 12.6177 22.1672 12.6371 22.1672 12.6562H18.1684C18.234 12.5172 18.2916 12.373 18.3371 12.2228C18.7303 10.9063 19.1744 8.90575 19.5334 6.23863C19.5505 6.13611 19.4655 6.0334 19.363 6.03327H5.85577C5.75318 6.03327 5.68449 6.13604 5.68449 6.23863C6.02645 8.90577 6.48844 10.9063 6.88168 12.2228C7.2579 13.5221 8.42008 14.4281 9.77066 14.4966C10.5057 14.534 11.3045 14.5699 11.9483 14.5875V17.2833H10.4549C9.75387 17.2833 9.17206 17.8651 9.17206 18.5661C9.17214 19.2671 9.75392 19.8481 10.4549 19.8481H11.9483V22.8393H9.81435L7.68388 24.9698H4.05912L6.18958 22.8393H5.14794C4.29322 22.8391 3.55785 22.2234 3.45528 21.3686C3.19883 19.2655 3 15.9154 3 12.5986C3.00001 9.05937 3.18821 5.8962 3.47887 3.77609C3.56441 3.14356 4.00869 2.59621 4.60703 2.39103C7.12043 1.51903 9.7879 1.02344 12.5749 1.02344Z"
                fill="#1F2D3D"
            />
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.3685 14.4459C20.9162 14.4459 22.9998 16.5139 23 19.0765C23 21.6393 20.9313 23.7079 18.3685 23.7079C15.806 23.7077 13.738 21.6391 13.738 19.0765C13.7382 16.514 15.8061 14.4461 18.3685 14.4459ZM17.6048 16.3789V19.0468L17.6494 19.8411H20.6773V18.3424H19.1035V16.3789H17.6048Z"
                fill="#1F2D3D"
            />
        </Svg>
    );
};

const BusWaiting = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 26 26" fill="none">
            <G clipPath="url(#clip0_8361_28489)">
                <Path
                    d="M18.2924 13.8516C15.4285 13.8516 13.1172 16.1628 13.1172 19.0268C13.1172 21.8908 15.4285 24.202 18.2924 24.202C21.1564 24.202 23.4677 21.8908 23.4677 19.0268C23.4677 16.1628 21.1397 13.8516 18.2924 13.8516ZM20.8717 19.881H17.4885L17.4383 18.9933V16.0121H19.1131V18.2061H20.8717V19.881Z"
                    fill="#470F2D"
                />
                <Path
                    d="M5.76575 13.8492V6.59712H20.2698V12.0838H23.385V5.55872C23.385 3.26419 21.526 1.42188 19.2482 1.42188H6.80415C4.52637 1.42188 2.6673 3.28094 2.6673 5.55872V9.69556H1.62891V14.8708H2.6673V24.1996H6.80415V22.1228L11.1081 22.1858V13.8953L5.76575 13.8324V13.8492ZM9.91934 19.0411H5.7825V16.9644H9.91934V19.0411Z"
                    fill="#470F2D"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_8361_28489">
                    <Rect width="26" height="26" fill="white" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};

const TrainWaiting = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 26 26" fill="none">
            <Path
                d="M19.0635 15.5811C21.6579 15.5812 23.78 17.6872 23.7803 20.2969C23.7803 22.9068 21.6733 25.0135 19.0635 25.0137C16.4537 25.0135 14.3477 22.9067 14.3477 20.2969C14.3479 17.6873 16.4539 15.5813 19.0635 15.5811ZM12.7832 1C15.9881 1 18.9535 1.83983 21.4043 3.24512C22.4497 3.84496 23.0673 4.99373 23.0674 6.19336V13.7588H12.5244V22.5273H9.87012L7.55566 24.96H3.99121L6.30469 22.5273H5.92871C4.04361 22.5273 2.50033 20.9846 2.5 19.0996V6.19336C2.50009 4.99375 3.11774 3.84496 4.16309 3.24512C6.59664 1.82279 9.57856 1.00008 12.7832 1ZM18.2852 20.2666L18.3311 21.0762H21.4141V19.5498H19.8115V17.5498H18.2852V20.2666ZM6.78516 15.6025C5.84262 15.6026 5.07136 16.3739 5.07129 17.3164C5.0713 18.259 5.84258 19.0302 6.78516 19.0303C7.72764 19.0301 8.49804 18.2589 8.49805 17.3164C8.49798 16.3739 7.7276 15.6027 6.78516 15.6025ZM5.24219 6.07324C5.13967 6.07338 5.07149 6.14166 5.07129 6.24414V11.9346C5.07135 12.0372 5.13957 12.1053 5.24219 12.1055H11.3271C11.4297 12.1053 11.499 12.0372 11.499 11.9346V6.24414C11.4988 6.14168 11.4296 6.07341 11.3271 6.07324H5.24219ZM14.2402 6.07324C14.1377 6.07336 14.0686 6.14164 14.0684 6.24414V11.9346C14.0684 12.0372 14.1376 12.1054 14.2402 12.1055H20.3252C20.4278 12.1053 20.496 12.0372 20.4961 11.9346V6.24414C20.4959 6.14166 20.4277 6.07338 20.3252 6.07324H14.2402Z"
                fill="#17402F"
            />
        </Svg>
    );
};

export const getIconFromType = (type: TransitType, size: number, color: string | undefined, isWaiting: boolean) => {
    switch (type) {
        case 'Taxi':
            return <Icon icon={<AutoIcon fill={undefined} />} size={size} color={color} />;
        case 'Bus':
            return isWaiting ? (
                <Icon icon={<BusWaiting />} size={size} color={color} />
            ) : (
                <Icon icon={<BusIcon fill={undefined} />} size={size} color={color} />
            );
        case 'Metro':
            return isWaiting ? (
                <Icon icon={<MetroWaiting />} size={size} color={color} />
            ) : (
                <Icon icon={<MetroIcon fill={undefined} />} size={size} color={color} />
            );
        case 'Subway':
            return isWaiting ? (
                <Icon icon={<TrainWaiting />} size={size} color={color} />
            ) : (
                <Icon icon={<TrainIcon fill={undefined} />} size={size} color={color} />
            );
        case 'Walk':
            return <Icon icon={<WalkIcon fill={undefined} />} size={size} color={color} />;
        case 'Wait':
            return <Icon icon={<ClockIcon fill={undefined} />} size={size} color={color} />;
        case 'Tick':
            return <Icon icon={<Tick />} size={size} color={color} />;
        default:
            return null;
    }
};

export const getIconBGFromType = (type: MultimodalTravelMode_multimodalTravelMode | undefined) => {
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
            return '#828386';
        default:
            return '#E1E4E9';
    }
};

export const getIconSecondaryBGFromType = (type: MultimodalTravelMode_multimodalTravelMode | undefined) => {
    switch (type) {
        case 'Bus':
            return '#470F2D';
        case 'Metro':
            return '#1F2D3D';
        case 'Taxi':
            return '#470F2D';
        case 'Subway':
            return '#17402F';
        case 'Walk':
            return '#FFF';
        default:
            return '#E1E4E9';
    }
};
