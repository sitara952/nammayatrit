import React from 'react';
import FastImage, { FastImageProps } from '@d11/react-native-fast-image';

/**
 * ResizeMode options like React Native <Image>
 * - 'cover' – Scale the image uniformly, cropping if needed
 * - 'contain' – Scale the image to fit inside bounds
 * - 'stretch' – Stretch to fill bounds
 * - 'center' – Keep original size, centered
 */
export type ResizeModeString = 'cover' | 'contain' | 'stretch' | 'center';

/**
 * Cache control options for FastImage
 * - 'immutable' – Cache forever, never re-download
 * - 'web' – Respect HTTP headers
 * - 'cacheOnly' – Only show images from cache, do not make any network requests
 */
export type CacheControl = 'immutable' | 'web' | 'cacheOnly';

interface ImageProps extends Omit<FastImageProps, 'resizeMode' | 'cache'> {
    /** Resize mode for the image */
    resizeMode?: ResizeModeString;
    /** Cache control strategy for the image */
    cache?: CacheControl;
}

const Image: React.FC<ImageProps> = ({ resizeMode = 'cover', ...props }) => {
    const modeMap: Record<ResizeModeString, (typeof FastImage.resizeMode)[keyof typeof FastImage.resizeMode]> = {
        cover: FastImage.resizeMode.cover,
        contain: FastImage.resizeMode.contain,
        stretch: FastImage.resizeMode.stretch,
        center: FastImage.resizeMode.center,
    };

    return <FastImage {...props} resizeMode={modeMap[resizeMode]} />;
};

export default Image;
