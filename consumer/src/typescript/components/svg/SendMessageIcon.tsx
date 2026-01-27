import { Path, Svg } from 'react-native-svg';
import * as React from 'react';
interface SendMessageIconProps {
    fill: string;
}

export const SendMessageIcon: React.FC<SendMessageIconProps> = ({ fill }) => {
    return (
        <Svg width="21" height="18" viewBox="0 0 16 16" fill="none">
            <Path
                d="M2 1.53846L2.5 6.92308L9 8L2.5 9.07692L2 14.4615L3 15L15 8.53846V7.46154L3 1L2 1.53846Z"
                fill={fill ?? '#ffffff'}
            />
        </Svg>
    );
};
