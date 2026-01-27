import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function HomeIcon() {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 16 16" fill="none">
            <Path
                d="M13.462 5.682l-4.93-3.416a.931.931 0 00-1.07 0L2.538 5.682C2.2 5.914 2 6.302 2 6.708v5.944c0 .688.563 1.251 1.251 1.251H5.53a.627.627 0 00.625-.625v-3.204c0-.344.282-.625.626-.625h2.44c.344 0 .626.281.626.625v3.204c0 .344.281.625.625.625h2.278c.688 0 1.251-.563 1.251-1.251V6.708c0-.413-.2-.794-.538-1.026z"
                fill="#414042"
            />
        </Svg>
    );
}

export default HomeIcon;
