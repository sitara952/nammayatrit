import * as React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

function BusInterior() {
    return (
        <Svg width={'100%'} height={198} viewBox="0 0 375 198" fill="none">
            <Path
                d="M356.33 197C356.939 182.52 356.584 79.6647 355.621 65.8748C354.704 52.8208 344.784 42.9281 331.848 42.2467C287.108 39.8667 241.169 38.7402 187.936 38.7402C134.702 38.7402 88.763 39.8667 44.0232 42.2467C31.0963 42.9372 21.1672 52.8208 20.2497 65.8748C19.2777 79.6647 18.9325 182.52 19.5412 197"
                stroke="url(#paint0_linear_2667_14378)"
                strokeWidth={1.53738}
                strokeMiterlimit={10}
            />
            <Path d="M22.1962 57.5965L-18.2559 20.9961" stroke="#969696" strokeWidth={1.53738} strokeMiterlimit={10} />
            <Path d="M53.667 41.7421V0" stroke="#969696" strokeWidth={1.53738} strokeMiterlimit={10} />
            <Path d="M353.414 57.5965L393.866 20.9961" stroke="#969696" strokeWidth={1.53738} strokeMiterlimit={10} />
            <Path d="M321.94 41.7421V0" stroke="#969696" strokeWidth={1.53738} strokeMiterlimit={10} />
            <Path d="M19.2497 111.067L-48.9365 98.4941" stroke="#969696" strokeWidth={1.53738} strokeMiterlimit={10} />
            <Path d="M356.636 111.067L424.822 98.4941" stroke="#969696" strokeWidth={1.53738} strokeMiterlimit={10} />
            <Defs>
                <LinearGradient
                    id="paint0_linear_2667_14378"
                    x1={19.2383}
                    y1={113.498}
                    x2={19.2383}
                    y2={190.498}
                    gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#969696" />
                    <Stop offset={1} stopColor="white" />
                </LinearGradient>
            </Defs>
        </Svg>
    );
}

export default BusInterior;
