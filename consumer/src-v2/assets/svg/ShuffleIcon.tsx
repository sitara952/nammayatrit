import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function ShuffleIcon() {
    return (
        <Svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <Path d="M1 2L6.06136 8.3933C7.7399 10.5136 10.2957 11.75 13 11.75V11.75" stroke="#656565" strokeWidth={3}/>
            <Path d="M1 11.75L6.06136 5.3567C7.7399 3.23644 10.2957 2 13 2V2" stroke="#656565" strokeWidth={3}/>
        </Svg>
    );
}

export default ShuffleIcon;