import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function InfoIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 16 17" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.504 10.962a.5.5 0 01-1 0V8.096a.5.5 0 011 0v2.866zM7.5 6.027a.5.5 0 011 0c0 .276-.224.521-.5.521a.483.483 0 01-.5-.479v-.042zm.5-3.86A6.34 6.34 0 001.667 8.5 6.34 6.34 0 008 14.833 6.34 6.34 0 0014.333 8.5 6.34 6.34 0 008 2.167z"
                fill="#14171F"
            />
        </Svg>
    );
}

export default InfoIcon;
