import React from 'react';
import Animated from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const AutoInfoPopUp = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style('pt-5')}>
            <Animated.Text style={tailwind.style('text-[17px] font-areaNormal-extrabold text-[#8B8B8F] px-5')}>
                {userLanguageStrings.DirectPaymentForAuto}
            </Animated.Text>
            <>
                <Svg height={1} style={tailwind.style('mt-7 mb-4 px-5')}>
                    <Line x1={0} x2={SCREEN_WIDTH} y1={1} y2={1} stroke={'#E8EBEF'} strokeWidth={'2'} />
                </Svg>
                <Animated.Text
                    style={[
                        tailwind.style('text-[16px] px-5 leading-[22px] font-areaNormal text-[#78747C]'),
                        { fontWeight: '500' },
                    ]}>
                    {userLanguageStrings.Pleasepaythefareforautodirectlytothedriversaftercompletingtheride}
                </Animated.Text>
                <Animated.Text
                    style={[
                        tailwind.style('text-[16px] text-[#78747C] font-areaNormal px-5 mt-3 leading-[22px] mb-6'),
                        { fontWeight: '500' },
                    ]}>
                    {userLanguageStrings.One_Zero_Zero_faregoestothedrivers}
                </Animated.Text>
            </>
        </Animated.View>
    );
};

export default AutoInfoPopUp;
