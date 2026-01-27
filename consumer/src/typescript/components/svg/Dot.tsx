import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type DotProps = {
    color: string | undefined;
};

export function Dot({ color = '#14171F' }: DotProps) {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
                d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
                stroke={color}
                stroke-width="1.5"
            />
            <Path
                d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
                fill={color}
            />
        </Svg>
    );
}

// export Dot;
