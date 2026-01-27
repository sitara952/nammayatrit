import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';

function MagnifyingGlass({ fill }: { fill: string | undefined }) {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const fillColor = fill || colors.Button_for_modes_text;
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 18 18" fill="none">
            <Path
                d="M16.2 15.109l-2.504-2.504a6.64 6.64 0 001.448-4.137c0-3.674-2.997-6.671-6.672-6.671-3.674 0-6.671 2.997-6.671 6.671 0 3.675 2.997 6.672 6.671 6.672a6.64 6.64 0 004.136-1.447l2.505 2.504 1.088-1.088zM3.34 8.469c0-2.833 2.3-5.133 5.132-5.133 2.833 0 5.132 2.3 5.132 5.132 0 2.833-2.299 5.132-5.132 5.132A5.134 5.134 0 013.34 8.468z"
                fill={fillColor}
            />
        </Svg>
    );
}

export default MagnifyingGlass;
