import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';

type Props = {
    source: ImageSourcePropType;
    height: number;
    width: number;
};

const RouteStartMarker: React.FC<Props> = ({ source, height, width }) => {
    return (
        <Image
            source={source}
            style={[{ width, height }]}
            accessible={true}
            accessibilityLabel="route start marker image"
        />
    );
};
export default RouteStartMarker;
