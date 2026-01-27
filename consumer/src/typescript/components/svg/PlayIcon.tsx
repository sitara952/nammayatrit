import { Path, Rect, Svg } from 'react-native-svg';
import * as React from 'react';

export const PlayIcon = ({ fill = '#2C2F3A', width = 24, height = 25 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 25" fill="none">
            <Rect y="0.234375" width="24" height="24" rx="12" fill="#F1F2F7" />
            <Path
                d="M9.52109 18.2538C9.18776 18.4705 8.85009 18.4828 8.50809 18.2908C8.16676 18.0995 7.99609 17.8038 7.99609 17.4038V7.05384C7.99609 6.65384 8.16676 6.35784 8.50809 6.16584C8.85009 5.97451 9.18776 5.98717 9.52109 6.20384L17.6711 11.3788C17.9711 11.5788 18.1211 11.8622 18.1211 12.2288C18.1211 12.5955 17.9711 12.8788 17.6711 13.0788L9.52109 18.2538Z"
                fill={fill}
            />
        </Svg>
    );
};
