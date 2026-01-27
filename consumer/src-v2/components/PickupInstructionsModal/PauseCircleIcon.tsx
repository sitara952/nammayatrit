import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PauseCircleIconProps {
    width?: number;
    height?: number;
    color?: string;
}

export const PauseCircleIcon: React.FC<PauseCircleIconProps> = ({ width = 41, height = 40, color = '#454C55' }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 41 40" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M25.2415 24.522C25.2415 25.212 24.6815 25.772 23.9915 25.772C23.3015 25.772 22.7415 25.212 22.7415 24.522V15.4753C22.7415 14.7853 23.3015 14.2253 23.9915 14.2253C24.6815 14.2253 25.2415 14.7853 25.2415 15.4753V24.522ZM18.2598 24.522C18.2598 25.212 17.6998 25.772 17.0098 25.772C16.3198 25.772 15.7598 25.212 15.7598 24.522V15.4753C15.7598 14.7853 16.3198 14.2253 17.0098 14.2253C17.6998 14.2253 18.2598 14.7853 18.2598 15.4753V24.522ZM20.4998 4.16699C11.7698 4.16699 4.6665 11.2687 4.6665 20.0003C4.6665 28.7303 11.7698 35.8337 20.4998 35.8337C29.2315 35.8337 36.3332 28.7303 36.3332 20.0003C36.3332 11.2687 29.2315 4.16699 20.4998 4.16699Z"
                fill={color}
            />
        </Svg>
    );
};
