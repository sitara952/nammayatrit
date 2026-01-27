import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type UnFilledProps = {
    color: string | undefined;
};

export function UnFilled({ color = '#B2B9C7' }: UnFilledProps) {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
                d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
                stroke={color}
                stroke-width="1.5"
            />
        </Svg>
    );
}

// export Dot;
