import React, { FC } from 'react';
import Svg, { Path } from 'react-native-svg';

type ArrowRightProps = {
  fill: string | undefined;
  bold: boolean | undefined;
}

const ArrowRight: FC<ArrowRightProps> = ({fill = 'white', bold = false}: ArrowRightProps) => {
  return (
    <Svg width={'100%'} height={'100%'} viewBox="0 0 13 13" fill="none">
      { bold ?
        <Path d="M6.24 12.9l-1.557-1.546L8.31 7.726H.125v-2.27h8.186L4.683 1.834 6.24.282l6.309 6.309-6.309 6.308z" fill={fill} />
        :
        <Path d="M6.24 11.5l-0.8-0.8L9.31 6.726H1.125v-1.27h8.186L5.44 1.6 6.24 0.8l5.309 5.309-5.309 5.39z" fill={fill} />
      }
    </Svg>
  );
};

export default ArrowRight;
