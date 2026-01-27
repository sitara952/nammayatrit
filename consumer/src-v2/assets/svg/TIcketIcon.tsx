import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';

function TicketIcon({ fill: fillValue }: { fill: string }) {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const fill = fillValue || colors.Button_for_modes_text;

    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 17 21" fill="none">
            <Path
                d="M11.828 17.922s.045.047.06.047c0 0 .03 0 .046.015H14.439c.526 0 .948-.437.948-.983l-.135-13.002c0-.546-.436-.999-.963-.999h-2.43-.075s-.03 0-.046.016c0 0-.03.015-.06.046l-1.82 1.89a1.824 1.824 0 01-1.324.577A1.8 1.8 0 017.21 4.95L5.39 3.078s-.046-.047-.06-.047c0 0-.03 0-.046-.015H2.779c-.527 0-.948.437-.948.983l.135 13.002c0 .546.436.999.963.999H5.434s.03 0 .045-.016c0 0 .03-.015.06-.046l1.82-1.89a1.824 1.824 0 011.325-.577 1.8 1.8 0 011.324.578l1.82 1.889v-.016z"
                fill={fill}
            />
        </Svg>
    );
}

export default TicketIcon;
