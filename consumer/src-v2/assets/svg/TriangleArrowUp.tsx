import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

// eslint-disable-next-line myCustomPlugin/enforce-optional-params
const TriangleArrowUp = ({ fill = '#3B3A3C' }: { fill?: string }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 11 8" fill="none">
            <Path
                d="M.325 6.37L4.724.954a1 1 0 011.552 0l4.4 5.414A1 1 0 019.898 8H1.101a1 1 0 01-.776-1.63z"
                fill={fill}
            />
        </Svg>
    );
};

export default TriangleArrowUp;
