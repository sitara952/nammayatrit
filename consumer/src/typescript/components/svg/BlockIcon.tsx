import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function BlockIcon({ fill = '#fff' }) {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 16 16" fill="none">
            <G clipPath="url(#clip0_3167_28223)">
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.1 3.122a3.122 3.122 0 116.245 0 3.122 3.122 0 01-6.244 0zm5.074 8.976a2.732 2.732 0 014.205-2.301l-3.774 3.774a2.72 2.72 0 01-.43-1.473zm1.26 2.3a2.732 2.732 0 003.774-3.774L10.432 14.4zm1.472-6.203a3.902 3.902 0 100 7.805 3.902 3.902 0 000-7.805zm-4.682-.78a7.38 7.38 0 012.114.307 5.071 5.071 0 00-1.437 7.49 29.185 29.185 0 01-7.416-.787l-.286-.067v-.295c0-3.693 3.168-6.648 7.025-6.648z"
                    fill={fill}
                />
            </G>
            <Defs>
                <ClipPath id="clip0_3167_28223">
                    <Path fill={fill} d="M0 0H16V16H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
}

export default BlockIcon;
