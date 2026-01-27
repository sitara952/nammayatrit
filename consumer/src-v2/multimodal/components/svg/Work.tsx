import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function WorkIcon() {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 16 16" fill="none">
            <Path
                d="M12.901 5.24h-1.677V3.544c0-.848-.695-1.543-1.543-1.543H6.306c-.848 0-1.543.695-1.543 1.543v1.698H3.086c-.975 0-1.77.795-1.77 1.77v5.218c0 .97.795 1.77 1.77 1.77h9.828c.97 0 1.771-.794 1.771-1.77V7.011c0-.975-.795-1.77-1.77-1.77H12.9zM6.08 3.544c0-.127.1-.22.22-.22h3.375c.127 0 .22.1.22.22v1.698H6.08V3.543z"
                fill="#3F3E40"
            />
        </Svg>
    );
}

export default WorkIcon;
