import colors from '@/typescript/designSystem/colorPalette';
import React from 'react';
import Svg, {Path, G, Defs, ClipPath} from 'react-native-svg';

interface InfoIconProps {
  fill?: string;
}

export const InfoIcon: React.FC<InfoIconProps> = ({
  fill = colors?.recovered?.neutralMidHigh,
}) => {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_173_1730)" fill={fill}>
        <Path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8z" />
        <Path d="M13 9.9h-2v7.8h2V9.9zM13 6.3h-2v2h2v-2z" />
      </G>
      <Defs>
        <ClipPath id="clip0_173_1730">
          <Path fill="#fff" transform="translate(2 2)" d="M0 0H20V20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
