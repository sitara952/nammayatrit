import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export const SkipIcon = () => {
    return (
        <Svg width={14} height={17} viewBox="0 0 14 17" fill="none">
            <Path
                d="M13.225 13.025l-.568-3.932-3.271-.55-1.407-.136-4.102-5.051-2.186.034-.543-1.204H.377v2.78l2.585-.034 2.635 3.254-5.22-.101v6.822l6.297.068A2.125 2.125 0 008.716 16.5c.975 0 1.746-.627 2.026-1.483l1.83.017.661-2.017h-.008v.008z"
                fill="#14171F"
            />
            <Path transform="rotate(45 11.797 1.322)" fill="#14171F" d="M11.7974 1.32178H13.46407V6.32178H11.7974z" />
            <Path transform="rotate(60 12.761 5.1)" fill="#14171F" d="M12.7612 5.10034H14.42787V7.85912H12.7612z" />
            <Path transform="rotate(19.66 7.003 .855)" fill="#14171F" d="M7.00342 0.854553H8.67009V3.642233H7.00342z" />
        </Svg>
    );
};
