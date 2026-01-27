import { Rect, Svg } from 'react-native-svg';
import * as React from 'react';

export const PauseIcon = ({ fill = '#2C2F3A' }) => {
    return (
        <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
            <Rect y="0.234375" width="24" height="24" rx="12" fill="#F1F2F7" />
            <Rect x="7.5" y="7.73438" width="9" height="9" rx="0.75" fill={fill} />
        </Svg>
    );
};
