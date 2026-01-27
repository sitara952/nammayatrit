import React from 'react';
import { Path, Svg } from 'react-native-svg';

// disabling this as props need to be passed, its taken care of in the parent component
// eslint-disable-next-line myCustomPlugin/enforce-optional-params
export const TrashIcon = ({ fill = '#656565' }: { fill?: string }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 16 16" fill="none">
            <Path
                d="M4.213 13.009c.113.554.602.954 1.169.954h5.045c.567 0 1.056-.4 1.17-.954l1.317-6.49H2.894l1.319 6.49zM13.392 3.657h-.77a1.79 1.79 0 01-1.67-1.15.73.73 0 00-.686-.472H5.722a.738.738 0 00-.686.471 1.79 1.79 0 01-1.67 1.151h-.77A.598.598 0 002 4.254v.238c0 .328.268.597.596.597h10.808A.598.598 0 0014 4.492v-.238a.598.598 0 00-.596-.597h-.012z"
                fill={fill}
            />
        </Svg>
    );
};

// disabling this as props need to be passed, its taken care of in the parent component
// eslint-disable-next-line myCustomPlugin/enforce-optional-params
export const WarningIcon = ({ fill = '#656565' }: { fill?: string }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 17 16" fill="none">
            <Path
                d="M8.75 14.7C5.03 14.7 2 11.667 2 7.95 2 4.23 5.03 1.2 8.75 1.2s6.75 3.03 6.75 6.75c0 3.718-3.03 6.75-6.75 6.75zm0-1.351c2.977 0 5.4-2.423 5.4-5.4 0-2.977-2.423-5.4-5.4-5.4a5.408 5.408 0 00-5.4 5.4c0 2.977 2.423 5.4 5.4 5.4zm-.675-9.247h1.35v5.264h-1.35V4.102zm0 7.695v-1.35h1.35v1.35h-1.35z"
                fill={fill}
            />
        </Svg>
    );
};
