import React from 'react';
import Svg, { G, Rect, Defs, ClipPath, Path } from 'react-native-svg';

export const ParkingIcon = ({ fill = '#8519FC' }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
            <G clipPath="url(#clip0_1645_1653)">
                <Rect x="13" y="1" width="1.5" height="14" fill={fill} />
                <G clipPath="url(#clip1_1645_1653)">
                    <Path
                        d="M7.96372 15.0026C8.88348 15.0026 9.62909 14.257 9.62909 13.3373C9.62909 12.4175 8.88348 11.6719 7.96372 11.6719C7.04395 11.6719 6.29834 12.4175 6.29834 13.3373C6.29834 14.257 7.04395 15.0026 7.96372 15.0026Z"
                        fill={fill}
                    />
                    <Path
                        d="M11.5633 8.45402L8.48646 8.02752L7.39482 7.92598L4.19608 3.99609L-3.47582 4.09256L-6.76596 7.9666L-9 8.43371V12.3585L-6.43085 13.6786L11.4872 13.8665L12 12.2976L11.5583 8.46418L11.5633 8.45402ZM0.316972 7.68734L-5.00919 7.90567L-2.831 5.29082L0.316972 5.26036V7.68734ZM1.47461 7.68734V5.24513L3.48525 5.22482L5.53651 7.75842L1.47461 7.68226V7.68734Z"
                        fill={fill}
                    />
                </G>
            </G>
            <Defs>
                <ClipPath id="clip0_1645_1653">
                    <Rect width="16" height="16" fill="white" />
                </ClipPath>
                <ClipPath id="clip1_1645_1653">
                    <Rect width="12" height="16" fill="white" transform="translate(1)" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
