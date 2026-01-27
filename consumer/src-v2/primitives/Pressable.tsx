import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Pressable as RNPressable, PressableProps } from 'react-native';
import { withLogEvent, EventPrefix } from '../../src/typescript/utils/logger';

const Pressable: React.FC<PressableProps & { testID: string }> = ({ onPress, testID, ...rest }) => {
    return (
        <RNPressable
            {...rest}
            onPress={onPress ? withLogEvent(onPress, EventPrefix.PRESSABLE_CLICK, testID) : undefined}
        />
    );
};

export { Pressable, RNPressable };
