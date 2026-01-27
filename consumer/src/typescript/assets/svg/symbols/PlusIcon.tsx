import * as React from 'react';
import colors from '../../../designSystem/colorPalette';
import Svg, { Path, Rect } from 'react-native-svg';

const PlusIcon = ({ fillColor }: { fillColor: string | undefined }) => {
    return (
        <Svg width="20" height="21" viewBox="0 0 20 20" fill="none">
            <Path
                d="M16.625 9.062h-5.688V3.375H9.063v5.687H3.375v1.875h5.688v5.688h1.874v-5.688h5.688V9.062z"
                fill={fillColor ?? colors?.primitive.black[2]}
            />
        </Svg>
    );
};
export const PlusIcon2 = ({ fillColor ,fillBoundary='#1363D2'}: { fillColor: string | undefined,fillBoundary:string|undefined }) => {
    return (
        <Svg width={18} height={17} viewBox="0 0 18 17" fill="none">
            <Rect x={1.25} y={0.75} width={15.5} height={15.5} rx={7.25} stroke={fillColor ?? colors?.primitive.black[2]} strokeWidth={1.5} />
            <Path fill={fillBoundary} d="M8.27246 4.86377H9.72701V12.1365H8.27246z" />
            <Path transform="rotate(90 12.636 7.773)" fill={fillBoundary} d="M12.6362 7.77295H14.09075V15.04568H12.6362z" />
        </Svg>
    );
};
export default PlusIcon;
