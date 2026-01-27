import * as React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Path } from 'react-native-svg';

function SvgComponent({ color = colors?.recovered?.neutralUltraHigh }) {
    return (
        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path
                d="M9.79159 14.168C8.98642 14.168 8.33325 14.8211 8.33325 15.6263C8.33325 16.4315 8.98642 17.0846 9.79159 17.0846C10.5968 17.0846 11.2499 16.4315 11.2499 15.6263C11.2499 14.8211 10.5968 14.168 9.79159 14.168Z"
                fill={color}
            />
            <Path
                d="M9.79159 2.5C8.98642 2.5 8.33325 3.15316 8.33325 3.95833C8.33325 4.76352 8.98642 5.41667 9.79159 5.41667C10.5968 5.41667 11.2499 4.76352 11.2499 3.95833C11.2499 3.15316 10.5968 2.5 9.79159 2.5Z"
                fill={color}
            />
            <Path
                d="M9.79159 8.33203C8.98642 8.33203 8.33325 8.98519 8.33325 9.79036C8.33325 10.5955 8.98642 11.2487 9.79159 11.2487C10.5968 11.2487 11.2499 10.5955 11.2499 9.79036C11.2499 8.98519 10.5968 8.33203 9.79159 8.33203Z"
                fill={color}
            />
        </Svg>
    );
}

export default SvgComponent;
