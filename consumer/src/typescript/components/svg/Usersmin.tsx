import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgUsersmin = (props: SvgProps) => (
    <Svg width={20} height={19} fill="none" {...props}>
        <Path
            fill="#14171F"
            fillRule="evenodd"
            d="M7.5 10.054c2.755 0 4.963-2.237 4.963-5.027S10.255 0 7.5 0 2.537 2.237 2.537 5.027s2.208 5.027 4.963 5.027m0 2.461c-4.046 0-7.5.647-7.5 3.231S3.433 19 7.5 19c4.045 0 7.5-.647 7.5-3.231 0-2.585-3.433-3.254-7.5-3.254m10.398-5.427H19.1c.495 0 .899.41.899.911a.907.907 0 0 1-.899.912h-1.203v1.177a.906.906 0 0 1-.899.912.907.907 0 0 1-.899-.912V8.911h-1.201A.906.906 0 0 1 14 8c0-.502.403-.911.899-.911H16.1V5.912c0-.503.404-.912.899-.912.496 0 .899.41.899.912z"
            clipRule="evenodd"
        />
    </Svg>
);
export default SvgUsersmin;
