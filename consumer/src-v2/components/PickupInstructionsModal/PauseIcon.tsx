import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PauseIconProps {
    width?: number;
    height?: number;
    color?: string;
}

const PauseIcon: React.FC<PauseIconProps> = ({ width = 33, height = 32, color = '#454C55' }) => (
    <Svg width={width} height={height} viewBox="0 0 33 32" fill="none">
        <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.2417 20.522C21.2417 21.212 20.6817 21.772 19.9917 21.772C19.3017 21.772 18.7417 21.212 18.7417 20.522V11.4753C18.7417 10.7853 19.3017 10.2253 19.9917 10.2253C20.6817 10.2253 21.2417 10.7853 21.2417 11.4753V20.522ZM14.26 20.522C14.26 21.212 13.7 21.772 13.01 21.772C12.32 21.772 11.76 21.212 11.76 20.522V11.4753C11.76 10.7853 12.32 10.2253 13.01 10.2253C13.7 10.2253 14.26 10.7853 14.26 11.4753V20.522ZM16.5 0.166992C7.77002 0.166992 0.666687 7.26866 0.666687 16.0003C0.666687 24.7303 7.77002 31.8337 16.5 31.8337C25.2317 31.8337 32.3334 24.7303 32.3334 16.0003C32.3334 7.26866 25.2317 0.166992 16.5 0.166992Z"
            fill={color}
        />
    </Svg>
);

export default PauseIcon;
