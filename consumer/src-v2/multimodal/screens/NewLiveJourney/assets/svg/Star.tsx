import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

// eslint-disable-next-line myCustomPlugin/enforce-optional-params
export const Star = ({ fill }: { fill?: string }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 10 10" fill="none">
            <Path
                d="M9.643 3.477l-2.95-.45L5.375.224A.445.445 0 005.216.06a.418.418 0 00-.43 0 .445.445 0 00-.159.164l-1.32 2.803-2.95.45a.408.408 0 00-.209.098.458.458 0 00-.023.647l2.136 2.184-.504 3.083a.457.457 0 00.025.239c.029.075.078.14.14.189a.405.405 0 00.44.033L5 8.494 7.638 9.95a.4.4 0 00.44-.033.435.435 0 00.14-.19.457.457 0 00.025-.238l-.504-3.083 2.135-2.184a.458.458 0 00-.022-.647.408.408 0 00-.208-.098h-.001z"
                fill={fill}
            />
        </Svg>
    );
};
