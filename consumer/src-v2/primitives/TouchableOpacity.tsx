import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { TouchableOpacity as RNTouchableOpacity, TouchableOpacityProps } from 'react-native';
import { EventPrefix, withLogEvent } from '../../src/typescript/utils/logger';

const TouchableOpacity: React.FC<TouchableOpacityProps & { testID: string }> = ({ onPress, testID, ...rest }) => {
    return (
        <RNTouchableOpacity
            {...rest}
            onPress={onPress ? withLogEvent(onPress, EventPrefix.TOUCHABLE_OPACITY_CLICK, testID) : undefined}
        />
    );
};

export { TouchableOpacity };
