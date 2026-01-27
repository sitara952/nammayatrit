/* eslint-disable myCustomPlugin/no-as-in-modified-files */
import React, { useState, useEffect } from 'react';
import Animated, { AnimateProps } from 'react-native-reanimated';
import { isValidUrl } from '../../utils/common';
import { getRemoteAssetPathWithCache } from '../../utils/assetCache';
import { ImageProps } from 'react-native';

type CustomReanimatedImageProps = AnimateProps<ImageProps> & {
    cacheKey: string | undefined;
    source: { uri: string } | undefined;
};

const CustomReanimatedImage: React.FC<CustomReanimatedImageProps> = ({ cacheKey, source, ...rest }) => {
    const [innerSource, setInnerState] = useState<undefined | { uri: string }>(undefined);

    useEffect(() => {
        if (source && isValidUrl(source.uri) && cacheKey != undefined) {
            // validated the type of source is object in the condition above condition above, so doing below is safe
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            getRemoteAssetPathWithCache(cacheKey, (source as { uri: string }).uri, (pathOrUrl, success) => {
                if (success) {
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    setInnerState({ uri: pathOrUrl, ...(source as object) });
                } else {
                    setInnerState(source);
                }
            });
        } else {
            setInnerState(source);
        }
    }, [source?.uri]);

    return <Animated.Image accessible={false} {...rest} source={innerSource} />;
};

export default CustomReanimatedImage;
