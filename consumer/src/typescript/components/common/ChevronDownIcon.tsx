import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

const ChevronDownIcon = ({
    color = 'black',
    size = 20,
    paddingLeft = 0,
    paddingRight = 0,
    paddingBottom = 0,
    paddingTop = 0,
}) => {
    return (
        <View style={{ paddingLeft, paddingBottom, paddingTop, paddingRight }}>
            <Svg width={size} height={size} viewBox={'0 0 14 9'} fill="none">
                <Path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7.58925 8.00592C7.26381 8.33136 6.73617 8.33136 6.41074 8.00592L0.577402 2.17259C0.251964 1.84715 0.251964 1.31952 0.577401 0.994079C0.902838 0.668641 1.43048 0.668641 1.75591 0.994079L6.99999 6.23816L12.2441 0.994078C12.5695 0.66864 13.0971 0.66864 13.4226 0.994078C13.748 1.31951 13.748 1.84715 13.4226 2.17259L7.58925 8.00592Z"
                    fill={color}
                />
            </Svg>
        </View>
    );
};

export default ChevronDownIcon;
