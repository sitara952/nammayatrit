import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export const InfoAuto = ({ fill = '#ABABAB' }: { fill: string | undefined }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 18 18" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 15.75C5.28075 15.75 2.25 12.7193 2.25 9C2.25 5.28075 5.28075 2.25 9 2.25C12.7193 2.25 15.75 5.28075 15.75 9C15.75 12.7193 12.7193 15.75 9 15.75ZM9 3.6C6.02325 3.6 3.6 6.02325 3.6 9C3.6 11.9768 6.02325 14.4 9 14.4C11.9768 14.4 14.4 11.9768 14.4 9C14.4 6.02325 11.9768 3.6 9 3.6ZM9.6752 7.58203H8.3252V12.847H9.6752V7.58203ZM8.325 5.1525H9.675V6.5025H8.325V5.1525Z"
                fill={fill}
            />
        </Svg>
    );
};
