import * as React from 'react';
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg';

const ExpiredIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
        <G clipPath="url(#clip0_5026_15742)">
            <Path
                d="M2.20494 4.10772L1.00794 3.38672C0.727938 3.85572 0.496937 4.35272 0.335938 4.87772L1.67294 5.30472C1.80594 4.89172 1.98794 4.49272 2.21194 4.11472L2.20494 4.10772Z"
                fill="#969696"
            />
            <Path
                d="M4.69725 1.88923L4.12325 0.615234C3.39525 0.944234 2.73725 1.39223 2.15625 1.94523L3.12225 2.95323C3.58425 2.51223 4.11625 2.14823 4.69725 1.88923Z"
                fill="#969696"
            />
            <Path
                d="M7 0V1.4C10.087 1.4 12.6 3.913 12.6 7C12.6 10.087 10.087 12.6 7 12.6C3.913 12.6 1.4 10.087 1.4 7H0C0 10.857 3.143 14 7 14C10.857 14 14 10.857 14 7C14 3.143 10.857 0 7 0Z"
                fill="#969696"
            />
            <Path d="M10.3608 6.30063H7.70078V3.64062H6.30078V7.70062H10.3608V6.30063Z" fill="#969696" />
        </G>
        <Defs>
            <ClipPath id="clip0_5026_15742">
                <Rect width="14" height="14" fill="white" />
            </ClipPath>
        </Defs>
    </Svg>
);


export default ExpiredIcon;
