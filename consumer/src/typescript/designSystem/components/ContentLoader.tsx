import * as React from 'react';
import { Circle, Path, Rect } from 'react-native-svg';
import Svg from './Svg';

import { SvgProps } from 'react-native-svg';

export interface IContentLoaderProps extends SvgProps {
    animate?: boolean;
    backgroundColor?: string;
    backgroundOpacity?: number;
    foregroundColor?: string;
    foregroundOpacity?: number;
    rtl?: boolean;
    speed?: number;
    interval?: number;
    uniqueKey?: string;
    beforeMask?: React.ReactElement;
}

const ContentLoader: React.FC<IContentLoaderProps> = props => <Svg {...props} />;

export { Circle, Rect, Path };

export default ContentLoader;
