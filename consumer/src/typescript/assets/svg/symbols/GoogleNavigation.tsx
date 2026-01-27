import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";
const GoogleNavigation = ({ fill = '#004FB6' }: { fill: string | undefined }) => (
  <Svg
  width={20}
  height={20}
  viewBox="0 0 20 20"
  fill="none"

>
  <G clipPath="url(#clip0_17123_53659)">
    <Path
      d="M3.39 7.6l12.802-5.12A.85.85 0 0117.3 3.574L12.476 16.12c-.287.744-1.348.72-1.6-.036l-1.728-5.185a.425.425 0 00-.295-.276L3.49 9.21c-.793-.208-.86-1.306-.1-1.61z"
      fill={fill}
    />
  </G>
  <Defs>
    <ClipPath id="clip0_17123_53659">
      <Path fill="#fff" d="M0 0H20V20H0z" />
    </ClipPath>
  </Defs>
</Svg>
);
export default GoogleNavigation;
