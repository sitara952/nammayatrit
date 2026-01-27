import Svg, { Path, Rect } from 'react-native-svg';

export const StopIndicator = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
            <Path d="M5.5 11.5H10.5V13H5.5V11.5Z" fill="#7B8997" />
            <Path d="M5.5 3H10.5V4.5H5.5V3Z" fill="#7B8997" />
            <Rect x="3.5" y="7.25" width="9" height="1.5" fill="#7B8997" />
        </Svg>
    );
};
