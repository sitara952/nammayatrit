import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { TouchableWithoutFeedback as RNTouchableWithoutFeedback, TouchableWithoutFeedbackProps } from 'react-native';
import { EventPrefix, withLogEvent } from '../../src/typescript/utils/logger';

const TouchableWithoutFeedback: React.FC<TouchableWithoutFeedbackProps & { testID: string }> = ({
    onPress,
    testID,
    ...rest
}) => {
    return (
        <RNTouchableWithoutFeedback
            {...rest}
            onPress={onPress ? withLogEvent(onPress, EventPrefix.TOUCHABLE_WITHOUT_FEEDBACK_CLICK, testID) : undefined}
        />
    );
};

export { TouchableWithoutFeedback };
