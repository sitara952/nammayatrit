import React from 'react';
import { Svg, Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

const CallSupport: React.FC<
    SvgProps & { fill: string | undefined; width: number | undefined; height: number | undefined }
> = ({ fill = '#C9C9C9', width = 18, height = 18, ...props }) => (
    <Svg width={width} height={height} viewBox="0 0 18 18" fill="none" {...props}>
        <Path
            d="M15.0453 11.1102L13.6083 10.536C13.1873 10.3719 12.7022 10.4721 12.3727 10.7912L11.192 11.9671C6.62492 11.4019 5.93847 6.80773 5.93847 6.80773L7.11915 5.63184C7.43949 5.3128 7.54017 4.82056 7.36627 4.40125L6.78966 2.97012C6.61576 2.53258 6.19475 2.25 5.73712 2.25H4.62966C3.31169 2.25 2.25 3.30739 2.25 4.62002C2.25 4.74764 2.26831 4.87525 2.28661 4.99375C2.29576 5.05756 2.30492 5.11226 2.32322 5.17606C3.10119 8.74021 5.52661 14.4191 12.7754 15.668C12.8853 15.6862 12.9951 15.7135 13.1049 15.7227C13.1964 15.7318 13.2788 15.75 13.3703 15.75C14.6883 15.75 15.75 14.6926 15.75 13.38V12.1494C15.75 11.6845 15.4663 11.2743 15.0361 11.1011L15.0453 11.1102Z"
            fill={fill}
        />
    </Svg>
);

export default CallSupport;
