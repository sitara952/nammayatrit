import { StyleSheet } from 'react-native';
import React from 'react';
import Typography from '@/typescript/designSystem/components/primitives/Typography';

const missionStr =
    '8.2 Billion people around the world are moving. We are enabling seamless moving because we know moving is progress.';

const MovingTechMission = () => {
    return (
        <Typography
            style={styles.text}
            numberOfLines={undefined}
            type={'callout-2'}
            isAnimate={false}
            accessible={true}
            accessibilityLabel={undefined}
            accessibilityRole={undefined}>
            {missionStr}
        </Typography>
    );
};

export default MovingTechMission;

const styles = StyleSheet.create({
    text: {
        color: '#78747C',
        marginHorizontal: 20,
        marginVertical: 10,
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22,
    },
});
